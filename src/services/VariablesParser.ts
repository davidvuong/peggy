import { readFile } from 'fs';
import { promisify } from 'util';
import { Variables } from '../typed/Variables';
import { encodeJson } from '../vendor/Joi';

export class VariablesParser {
  loadAndParse = async (path: string): Promise<Variables> => {
    const data = await promisify(readFile)(path, { encoding: 'utf-8' });
    const json = JSON.parse(data);
    return encodeJson(json, Variables.schema);
  };
}
