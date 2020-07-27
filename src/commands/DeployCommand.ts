import { Command } from 'commander';
import Joi from 'joi';
import { ECR, SharedIniFileCredentials } from 'aws-sdk';
import consola from 'consola';
import { find } from 'lodash';
import Table from 'cli-table';
import { loadAndParseVariables } from '../services/VariablesParser';
import { loadAndParseConfig } from '../services/ConfigParser';
import { AwsEcrRegistryService } from '../services/AwsEcrRegistryService';
import { Repository } from '../typed/core/Repository';
import { Image } from '../typed/core/Image';

interface Options {
  service: string;
  config: string;
  environment?: string;
  push: boolean;
}

const Options = {
  schema: Joi.object({
    service: Joi.string().required(),
    config: Joi.string().required(),
    environment: Joi.string(),
    push: Joi.boolean().required(),
  }),
};

// @see: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
const getHumanFileSize = (bytes: number, si = false, dp = 1): string => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    // eslint-disable-next-line no-param-reassign
    bytes /= thresh;
    // eslint-disable-next-line no-plusplus
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return `${bytes.toExponential(dp)} ${units[u]}`;
};

const normalizeServiceName = (text: string): string => text.toLowerCase().replace(/[^\w\s]|_/g, '');

const getServiceRepository = (serviceName: string, repositories: Repository[]): Repository | undefined =>
  find(repositories, ({ name }) => normalizeServiceName(name) === serviceName);

const promptImageSelection = (repository: Repository, images: Image[]): any => {
  const table = new Table({
    head: ['Id', 'Tag', 'Pushed At', 'Size'],
    colWidths: [5, 70, 60, 15],
  });
  images.forEach((image, imageIndex) =>
    image.tags.forEach((t, tagIndex) =>
      table.push([imageIndex + tagIndex, t, image.pushedAt, getHumanFileSize(image.sizeInBytes)]),
    ),
  );
  consola.log(table.toString());
};

export const DeployCommand = async (service: string, command: Command): Promise<void> => {
  const options: Options = Options.schema.validate({
    service,
    config: command.config,
    environment: command.env,
    push: command.push ?? false,
  }).value;
  const config = await loadAndParseConfig(options.config);
  const environment = options.environment ?? config.defaultEnvironment;

  const variablesPath = `${config.variablesPath}/${environment}.json`;
  consola.info(`Loading Terraform project variables: "${variablesPath}"`);
  const variables = await loadAndParseVariables(variablesPath);

  const awsCredentials = new SharedIniFileCredentials({ profile: 'default' });
  const awsEcrClient = new ECR({ credentials: awsCredentials, region: 'ap-southeast-2' });
  const awsEcrRegistry = new AwsEcrRegistryService(awsEcrClient);

  const repositories = await awsEcrRegistry.getRepositories();
  const repository = getServiceRepository(options.service, repositories);

  if (!repository) {
    consola.error(`"${options.service}" does not exist in your registry`);
  } else {
    consola.success(`Found your service: "${options.service}"! Fetching images...`);
    const images = await awsEcrRegistry.getImagesByRepository(repository);

    consola.info(`Found ${images.length} image(s) for "${repository.uri}"`);
    promptImageSelection(repository, images);
  }
};
