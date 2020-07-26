import { Command } from 'commander';
import Joi from 'joi';
import consola from 'consola';

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

export const StatusCommand = (service: string, command: Command): void => {
  const options: Options = Options.schema.validate({
    service,
    config: command.config,
    environment: command.env,
  }).value;

  consola.success(options);
  consola.success('At the status command.');
};
