import { find } from 'lodash';
import consola from 'consola';
import { Repository } from '../typed/core/Repository';
import { loadAndParseConfig } from '../services/ConfigParser';
import { loadAndParseVariables } from '../services/VariablesParser';
import { AppContext } from '../typed/core/AppContext';

// @see: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
export const getHumanFileSize = (bytes: number, dp = 1): string => {
  const threshold = 1024;

  if (Math.abs(bytes) < threshold) {
    return `${bytes} B`;
  }

  const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    // eslint-disable-next-line no-param-reassign
    bytes /= threshold;
    // eslint-disable-next-line no-plusplus
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= threshold && u < units.length - 1);

  return `${bytes.toFixed(dp)} ${units[u]}`;
};

export const normalizeAppName = (text: string): string => text.toLowerCase().replace(/[^\w\s]|_/g, '');

export const getAppRepository = (appName: string, repositories: Repository[]): Repository | undefined =>
  find(repositories, ({ name }) => normalizeAppName(name) === appName);

export const getContext = async (configPath: string, explicitEnvironment?: string): Promise<AppContext> => {
  const config = await loadAndParseConfig(configPath);
  const environment = explicitEnvironment ?? config.defaultEnvironment;

  const variablesPath = `${config.variablesPath}/${environment}.json`;
  consola.info(`Loading Terraform project variables: "${variablesPath}"`);
  const variables = await loadAndParseVariables(variablesPath);

  return { environment, config, variables, variablesPath };
};
