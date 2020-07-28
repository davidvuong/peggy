import { Command } from 'commander';
import Joi from 'joi';
import { ECR, SharedIniFileCredentials } from 'aws-sdk';
import consola from 'consola';
import { find, includes } from 'lodash';
import Table from 'cli-table';
import { NumberPrompt, Select } from 'enquirer';
import { loadAndParseVariables, persistVariables } from '../services/VariablesParser';
import { loadAndParseConfig } from '../services/ConfigParser';
import { AwsEcrRegistryService } from '../services/AwsEcrRegistryService';
import { Repository } from '../typed/core/Repository';
import { Image } from '../typed/core/Image';
import { InputError } from '../core/Errors';
import { Container } from '../typed/Variables';

interface Options {
  service: string;
  repository: string;
  config: string;
  environment?: string;
  push: boolean;
}

const Options = {
  schema: Joi.object({
    service: Joi.string().required(),
    repository: Joi.string().required(),
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

const promptImageSelection = async (
  repository: Repository,
  images: Image[],
): Promise<{ image: Image; tag: string }> => {
  const table = new Table({
    head: ['Idx', 'Tag', 'Pushed At', 'Size'],
    // @see: https://github.com/Automattic/cli-table#custom-styles
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    colWidths: [5, 70, 60, 15],
  });

  images.forEach((image, imageIndex) =>
    image.tags.forEach((t, tagIndex) =>
      table.push([imageIndex + tagIndex, t, image.pushedAt, getHumanFileSize(image.sizeInBytes)]),
    ),
  );
  consola.log(table.toString());

  const prompt = new NumberPrompt({
    name: 'number',
    message: `Select the "Idx" you want to deploy (${repository.name})`,
  });

  try {
    const index = (await prompt.run()) as number;
    if (index < 0 || index >= table.length) {
      throw new InputError(`The "Idx" you specified was invalid. Choose between "0-${table.length - 1}": ${index}`);
    }

    const tag = table[index][1];
    return { tag, image: find(images, ({ tags }) => includes(tags, tag)) as Image };
  } catch (err) {
    throw err instanceof InputError ? new InputError(err.message) : err;
  }
};

const promptContainerSelection = async (serviceName: string, containers: Container[]): Promise<Container> => {
  const promptMapping = containers.reduce((acc, container) => {
    acc[container.name] = container;
    return acc;
  }, {} as Record<string, Container>);

  const prompt = new Select({
    name: 'container',
    message: `Found ${containers.length} containers in specified service: "${serviceName}". Choose one`,
    choices: Object.keys(promptMapping),
  });
  return promptMapping[await prompt.run()];
};

export const BumpCommand = async (
  serviceName: string,
  repositoryName: string | undefined,
  command: Command,
): Promise<void> => {
  try {
    const options: Options = Options.schema.validate({
      service: serviceName,
      repository: repositoryName ?? serviceName,
      config: command.config,
      environment: command.env,
      push: command.push ?? false,
    }).value;
    const config = await loadAndParseConfig(options.config);
    const environment = options.environment ?? config.defaultEnvironment;

    const variablesPath = `${config.variablesPath}/${environment}.json`;
    consola.info(`Loading Terraform project variables: "${variablesPath}"`);
    const variables = await loadAndParseVariables(variablesPath);

    const awsCredentials = new SharedIniFileCredentials({ profile: config.defaultAwsProfile });
    const awsEcrClient = new ECR({ credentials: awsCredentials, region: config.defaultAwsRegion });
    const awsEcrRegistry = new AwsEcrRegistryService(awsEcrClient);

    if (!variables.services[options.service]) {
      throw new InputError(`The specified service does not exist: "${options.service}"`);
    }

    const repositories = await awsEcrRegistry.getRepositories();
    const repository = getServiceRepository(options.repository, repositories);

    if (!repository) {
      throw new InputError(`"${options.repository}" does not exist in your registry`);
    }

    consola.success(`Found your repository: "${options.repository}"! Fetching images and tags...`);
    const images = await awsEcrRegistry.getImagesByRepository(repository);

    if (images.length === 0) {
      consola.info(`There were no images found for repository: "${repository.name}"`);
    } else {
      consola.info(`Found ${images.length} image(s) for "${repository.uri}"`);
      const { tag } = await promptImageSelection(repository, images);
      const fqin = `${repository.uri}:${tag}`;

      consola.info(`Performing update: ${fqin}`);
      const { containers } = variables.services[options.service];
      const container =
        containers.length === 1 ? containers[0] : await promptContainerSelection(options.service, containers);

      consola.info(`Previous image: ${container.image}`);
      container.image = fqin;
      await persistVariables(variablesPath, variables);

      consola.success(`Updated! ${options.service}.${container.name}.image:${fqin}`);
    }
  } catch (err) {
    if (err.message) {
      consola.error(err.message);
    }
  }
};
