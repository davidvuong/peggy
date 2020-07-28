import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { Variables } from '../typed/Variables';
import { encodeJson } from '../vendor/Joi';

export const loadAndParseVariables = async (path: string): Promise<Variables> => {
  const buffer = await promisify(readFile)(path);
  const data = buffer.toString();
  const json = JSON.parse(data);
  return encodeJson<Variables>(json, Variables.schema);
};

export const persistVariables = async (path: string, variables: Variables): Promise<void> =>
  promisify(writeFile)(path, JSON.stringify(variables, null, 2));
