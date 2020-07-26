import Joi from 'joi';

export interface Config {
  defaultEnvironment: string;
  defaultAwsProfile?: string;
  variablesPath: string;
}

export const Config = {
  schema: Joi.object({
    defaultEnvironment: Joi.string().required(),
    defaultAwsProfile: Joi.string(),
    variablesPath: Joi.string(),
  }),
};
