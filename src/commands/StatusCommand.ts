import { Command } from 'commander';
import Joi from 'joi';
import consola from 'consola';
import { getContext } from '../core/Utils';
import { InputError } from '../core/Errors';
import { isContainer } from '../typed/Variables';

interface Options {
  app?: string;
  config: string;
  environment?: string;
}

const Options = {
  schema: Joi.object({
    app: Joi.string(),
    config: Joi.string().required(),
    environment: Joi.string(),
  }),
};

export const StatusCommand = async (app: string | undefined, command: Command): Promise<void> => {
  const options: Options = Options.schema.validate({
    app,
    config: command.config,
    environment: command.env,
  }).value;
  try {
    const { environment, variables } = await getContext(options.config, options.environment);

    if (options.app && !variables.apps[options.app]) {
      throw new InputError(`The specified app does not exist: "${options.app}"`);
    }

    consola.info(`Configured ${Object.keys(variables.apps).length} apps for environment: "${environment}"`);

    const appsTable = [] as Record<string, any>[];
    const containersTable = [] as Record<string, any>[];

    let appNames = Object.keys(variables.apps);
    if (options.app) {
      appNames = appNames.filter(s => s === options.app);
    }

    appNames.forEach(appName => {
      const { replicas, containers } = variables.apps[appName];
      if (isContainer(containers)) {
        appsTable.push({ App: appName, Replicas: replicas, Containers: 1 });
        containersTable.push({
          App: appName,
          Container: appName,
          Image: containers.image,
          CPU: `${containers.resources.requests.cpu} / (limit) ${containers.resources.limits.cpu}`,
          Memory: `${containers.resources.requests.memory} / (limit) ${containers.resources.limits.memory}`,
        });
      } else {
        appsTable.push({ App: appName, Replicas: replicas, Containers: Object.keys(containers).length });
        Object.keys(containers).forEach(containerName => {
          const { image, resources } = containers[containerName];
          containersTable.push({
            App: appName,
            Container: containerName,
            Image: image,
            CPU: `${resources.requests.cpu} / (limit) ${resources.limits.cpu}`,
            Memory: `${resources.requests.memory} / (limit) ${resources.limits.memory}`,
          });
        });
      }
    });

    /* eslint-disable no-console */
    console.table(appsTable);
    console.table(containersTable);
    /* eslint-enable */
  } catch (err) {
    if (command.debug && err) {
      consola.error(err.stack);
    } else if (err.message) {
      consola.error(err.message);
    }
  }
};
