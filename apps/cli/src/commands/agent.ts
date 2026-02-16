import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function registerAgentCommands(program: Command): void {
  const agent = program.command('agent').description('Manage agents');

  agent
    .command('create')
    .description('Create a new agent definition')
    .argument('<name>', 'Agent name')
    .option('-m, --model <model>', 'Model to use', 'claude-sonnet-4-5-20250929')
    .option('-t, --tools <tools>', 'Comma-separated tool names', '')
    .action((name: string, opts: { model: string; tools: string }) => {
      const dir = join(process.cwd(), 'agents');
      const filePath = join(dir, `${name}.yaml`);

      if (existsSync(filePath)) {
        console.error(`Agent "${name}" already exists`);
        process.exit(1);
      }

      const tools = opts.tools ? opts.tools.split(',').map((t) => `  - ${t.trim()}`).join('\n') : '  - http_request';

      const yaml = [
        `name: ${name}`,
        `model: ${opts.model}`,
        'system_prompt: |',
        `  You are ${name}, an AI agent.`,
        'tools:',
        tools,
        'max_iterations: 20',
        '',
      ].join('\n');

      writeFileSync(filePath, yaml);
      console.log(`Agent "${name}" created at agents/${name}.yaml`);
    });

  agent
    .command('list')
    .description('List all agent definitions')
    .action(() => {
      const dir = join(process.cwd(), 'agents');
      if (!existsSync(dir)) {
        console.log('No agents directory found. Run "eaf init" first.');
        return;
      }

      const { readdirSync } = require('node:fs');
      const files = readdirSync(dir).filter((f: string) => f.endsWith('.yaml') || f.endsWith('.yml'));

      if (files.length === 0) {
        console.log('No agents found.');
        return;
      }

      console.log('Agents:');
      for (const file of files) {
        const content = readFileSync(join(dir, file), 'utf-8');
        const nameMatch = content.match(/^name:\s*(.+)$/m);
        const modelMatch = content.match(/^model:\s*(.+)$/m);
        console.log(`  ${nameMatch?.[1] ?? file} (${modelMatch?.[1] ?? 'unknown model'})`);
      }
    });

  agent
    .command('info')
    .description('Show agent details')
    .argument('<name>', 'Agent name')
    .action((name: string) => {
      const filePath = join(process.cwd(), 'agents', `${name}.yaml`);
      if (!existsSync(filePath)) {
        console.error(`Agent "${name}" not found`);
        process.exit(1);
      }
      console.log(readFileSync(filePath, 'utf-8'));
    });
}
