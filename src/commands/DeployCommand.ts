import { Command } from 'commander';
import Joi from 'joi';
import { loadAndParseVariables } from '../services/VariablesParser';
import { loadAndParseConfig } from '../services/ConfigParser';

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

export const DeployCommand = async (service: string, command: Command): Promise<void> => {
  const options: Options = Options.schema.validate({
    service,
    config: command.config,
    environment: command.env,
    push: command.push ?? false,
  }).value;
  const config = await loadAndParseConfig(options.config);

  const environment = options.environment ?? config.defaultEnvironment;
  const variables = await loadAndParseVariables(`${config.variablesPath}/${environment}.json`);
};
