import { Command } from 'commander';
import Joi from 'joi';
import consola from 'consola';

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

export const DeployCommand = (service: string, command: Command): void => {
  const options: Options = Options.schema.validate({
    service,
    config: command.config,
    environment: command.env,
    push: command.push ?? false,
  }).value;

  consola.success(options);
  consola.success('At the deploy command.');
};
