import { Command } from 'commander';
import consola from 'consola';

export const SetCommand = (service: string, command: Command): void => {
  consola.success('At the set command.');
};