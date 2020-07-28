import { Config } from '../Config';
import { Variables } from '../Variables';

export interface AppContext {
  environment: string;
  config: Config;
  variables: Variables;
  variablesPath: string;
}
