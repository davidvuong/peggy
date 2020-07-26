import { readFile } from 'fs';
import { promisify } from 'util';
import { Variables } from '../typed/Variables';
import { encodeJson } from '../vendor/Joi';

export const loadAndParseVariables = async (path: string): Promise<Variables> => {
  const buffer = await promisify(readFile)(path);
  const data = buffer.toString();
  const json = JSON.parse(data);
  return encodeJson<Variables>(json, Variables.schema);
};
