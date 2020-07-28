import { find } from 'lodash';
import consola from 'consola';
import { Repository } from '../typed/core/Repository';
import { loadAndParseConfig } from '../services/ConfigParser';
import { loadAndParseVariables } from '../services/VariablesParser';
import { AppContext } from '../typed/core/AppContext';

// @see: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
export const getHumanFileSize = (bytes: number, si = false, dp = 1): string => {
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

export const normalizeServiceName = (text: string): string => text.toLowerCase().replace(/[^\w\s]|_/g, '');

export const getServiceRepository = (serviceName: string, repositories: Repository[]): Repository | undefined =>
  find(repositories, ({ name }) => normalizeServiceName(name) === serviceName);

export const getContext = async (configPath: string, explicitEnvironment?: string): Promise<AppContext> => {
  const config = await loadAndParseConfig(configPath);
  const environment = explicitEnvironment ?? config.defaultEnvironment;

  const variablesPath = `${config.variablesPath}/${environment}.json`;
  consola.info(`Loading Terraform project variables: "${variablesPath}"`);
  const variables = await loadAndParseVariables(variablesPath);

  return { environment, config, variables, variablesPath };
};
