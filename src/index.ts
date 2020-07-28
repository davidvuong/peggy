import { program } from 'commander';
import pkg from '../package.json';
import { BumpCommand } from './commands/BumpCommand';
import { StatusCommand } from './commands/StatusCommand';
import { SetCommand } from './commands/SetCommand';

program.version(`Peggy v${pkg.version}`);

program
  .command('status [service]')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .description('display the status of services in your cluster')
  .action(StatusCommand);

program
  .command('bump <service> [repository]')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--push', 'pushes the generated commit the configured remote')
  .description('bumps an image in your repository to a container in your service')
  .alias('b')
  .action(BumpCommand);

program
  .command('set <service> <key> <value>')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--push', 'pushes the generated commit the configured remote')
  .description('set the value of the given object path key')
  .action(SetCommand);

program.parse(process.argv);
