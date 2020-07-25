import { program } from 'commander';
import pkg from '../package.json';
import { DeployCommand } from './commands/deploy';
import { StatusCommand } from './commands/status';
import { SetCommand } from './commands/set';

program.version(`Peggy v${pkg.version}`);

program
  .command('status [service]')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .description('display the status of services in your cluster')
  .action(StatusCommand);

program
  .command('deploy <service>')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--push', 'pushes the generated commit the configured remote')
  .description('deploys a specific version of your specified service')
  .alias('d')
  .action(DeployCommand);

program
  .command('set <service> <key> <value>')
  .option('-c --config <path>', 'set the config', '.peggy')
  .option('-e --env <environment>', 'override the default environment in the config')
  .option('--push', 'pushes the generated commit the configured remote')
  .description('set the value of the given object path key')
  .action(SetCommand);

program.parse(process.argv);
