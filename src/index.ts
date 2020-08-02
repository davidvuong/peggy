import { program } from 'commander';
import pkg from '../package.json';
import { BumpCommand } from './commands/BumpCommand';
import { StatusCommand } from './commands/StatusCommand';
import { SetCommand } from './commands/SetCommand';

program.version(`Peggy v${pkg.version}`);

program
  .command('status [app]')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--debug', 'displays stacktrace when errors occur', false)
  .description('display the status of all apps in your cluster')
  .action(StatusCommand);

program
  .command('bump <app> [repository]')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--push', 'pushes the generated commit the configured remote')
  .option('--debug', 'displays stacktrace when errors occur', false)
  .description('bumps an image in your repository to a container in your app')
  .alias('b')
  .action(BumpCommand);

program
  .command('set <app> <key> <value>')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--push', 'pushes the generated commit the configured remote')
  .option('--debug', 'displays stacktrace when errors occur', false)
  .description('set the value of the given object path key')
  .action(SetCommand);

program.parse(process.argv);
