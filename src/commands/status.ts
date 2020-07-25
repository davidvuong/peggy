import { Command } from 'commander';
import Joi from 'joi';

interface Options {
  service?: string;
  config: string;
  environment?: string;
}

const Schema = Joi.object({
  service: Joi.string(),
  config: Joi.string().required(),
  environment: Joi.string(),
});

export const StatusCommand = (service: string, command: Command): void => {
  const options: Options = Schema.validate({
    service,
    config: command.config,
    environment: command.env,
  }).value;

  console.log(options);
  console.log('At the status command.');
};
