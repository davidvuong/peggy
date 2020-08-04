import { Command } from 'commander';
import Joi from 'joi';
import consola from 'consola';
import { loadAndParseVariables } from '../services/VariablesParser';

interface Options {
  path: string;
  environment?: string;
}

const Options = {
  schema: Joi.object({
    path: Joi.string(),
    environment: Joi.string(),
  }),
};

export const ValidateCommand = async (path: string, command: Command): Promise<void> => {
  const options: Options = Options.schema.validate({
    path,
    environment: command.env,
  }).value;
  try {
    await loadAndParseVariables(options.path);
    consola.success(`Ok! "${options.path}" is valid`);
  } catch (err) {
    if (command.debug && err) {
      consola.error(err.stack);
    } else if (err.message) {
      consola.error(err.message);
    }
  }
};
