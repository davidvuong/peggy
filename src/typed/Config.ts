import Joi from 'joi';

export interface Config {
  defaultEnvironment: string;
  defaultAwsProfile?: string;
  defaultAwsRegion?: string;
  variablesPath: string;
}

export const Config = {
  schema: Joi.object({
    defaultEnvironment: Joi.string().required(),
    defaultAwsProfile: Joi.string(),
    defaultAwsRegion: Joi.string(),
    variablesPath: Joi.string(),
  }),
};
