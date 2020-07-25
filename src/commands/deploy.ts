import { Command } from 'commander';
import Joi from 'joi';

interface Options {
  service: string;
  config: string;
  environment?: string;
  push: boolean;
}

const Schema = Joi.object({
  service: Joi.string().required(),
  config: Joi.string().required(),
  environment: Joi.string(),
  push: Joi.boolean().required(),
});

export const DeployCommand = (service: string, command: Command): void => {
  const options: Options = Schema.validate({
    service,
    config: command.config,
    environment: command.environment,
    push: command.push ?? false,
  }).value;

  console.log(options);
  console.log('At the deploy command.');
};
