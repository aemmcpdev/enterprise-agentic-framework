#!/usr/bin/env node

import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAgentCommands } from './commands/agent.js';
import { registerRunCommand } from './commands/run.js';
import { registerStatusCommand } from './commands/status.js';
import { registerDeployCommand } from './commands/deploy.js';

const program = new Command();

program
  .name('eaf')
  .description('Enterprise Agentic Framework CLI')
  .version('0.1.0');

registerInitCommand(program);
registerAgentCommands(program);
registerRunCommand(program);
registerStatusCommand(program);
registerDeployCommand(program);

program.parse();
