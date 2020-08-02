import { Command } from 'commander';
import Joi from 'joi';
import consola from 'consola';
import Table from 'cli-table';
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
    const appsTable = new Table({
      head: ['App', 'Replicas', 'Containers'],
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    });
    const containersTable = new Table({
      head: ['App', 'Container', 'Image', 'CPU', 'Memory'],
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    });

    let appNames = Object.keys(variables.apps);
    if (options.app) {
      appNames = appNames.filter(s => s === options.app);
    }

    appNames.forEach(appName => {
      const { replicas, containers } = variables.apps[appName];
      if (isContainer(containers)) {
        appsTable.push([appName, replicas, 1]);
        containersTable.push([
          appName,
          '-',
          containers.image,
          `${containers.resources.requests.cpu} / (limit) ${containers.resources.limits.cpu}`,
          `${containers.resources.requests.memory} / (limit) ${containers.resources.limits.memory}`,
        ]);
      } else {
        appsTable.push([appName, replicas, containers.length]);
        Object.keys(containers).forEach(containerName => {
          const { image, resources } = containers[containerName];
          containersTable.push([
            appName,
            containerName,
            image,
            `${resources.requests.cpu} / (limit) ${resources.limits.cpu}`,
            `${resources.requests.memory} / (limit) ${resources.limits.memory}`,
          ]);
        });
      }
    });
    consola.log(appsTable.toString());
    consola.log(containersTable.toString());
  } catch (err) {
    if (command.debug) {
      consola.error(err.stack);
    } else if (err.message) {
      consola.error(err.message);
    } else {
      consola.error('An error occurred while processing your command --debug for more info');
    }
  }
};
