import { Command } from 'commander';
import Joi from 'joi';
import consola from 'consola';
import Table from 'cli-table';
import { getContext } from '../core/Utils';
import { InputError } from '../core/Errors';

interface Options {
  service?: string;
  config: string;
  environment?: string;
}

const Options = {
  schema: Joi.object({
    service: Joi.string(),
    config: Joi.string().required(),
    environment: Joi.string(),
  }),
};

export const StatusCommand = async (service: string | undefined, command: Command): Promise<void> => {
  const options: Options = Options.schema.validate({
    service,
    config: command.config,
    environment: command.env,
  }).value;
  try {
    const { environment, variables } = await getContext(options.config, options.environment);

    if (options.service && !variables.services[options.service]) {
      throw new InputError(`The specified service does not exist: "${options.service}"`);
    }

    consola.info(`Configured ${Object.keys(variables.services).length} services for environment: "${environment}"`);
    const table = new Table({
      head: ['Service / Container', 'Image', 'Replicas', 'Containers', 'CPU', 'Memory'],
      // @see: https://github.com/Automattic/cli-table#custom-styles
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    });

    let serviceNames = Object.keys(variables.services);
    if (options.service) {
      serviceNames = serviceNames.filter(s => s === options.service);
    }

    serviceNames.forEach(serviceName => {
      const { replicas, containers } = variables.services[serviceName];
      table.push([serviceName, '', replicas, containers.length, '', '']);
      containers.forEach(({ name, image, resources }) => {
        table.push([
          `${serviceName}.${name}`,
          image,
          '',
          '',
          `${resources.requests.cpu} / ${resources.limits.cpu}`,
          `${resources.requests.memory} / ${resources.limits.memory}`,
        ]);
      });
    });
    consola.log(table.toString());
  } catch (err) {
    if (err.message) {
      consola.error(err.message);
    }
  }
};
