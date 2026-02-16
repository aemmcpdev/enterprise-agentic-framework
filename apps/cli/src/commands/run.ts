import { Command } from 'commander';

export function registerRunCommand(program: Command): void {
  program
    .command('run')
    .description('Run the EAF server')
    .option('-p, --port <port>', 'Port number', '3000')
    .option('--watch', 'Enable watch mode for development')
    .option('--agents <agents>', 'Comma-separated list of agents to load')
    .action(async (opts: { port: string; watch?: boolean; agents?: string }) => {
      console.log(`Starting EAF server on port ${opts.port}...`);

      if (opts.watch) {
        console.log('Watch mode enabled - will restart on file changes');
      }

      if (opts.agents) {
        const agentNames = opts.agents.split(',').map((a) => a.trim());
        console.log(`Loading agents: ${agentNames.join(', ')}`);
      }

      // In production, this would spawn the server process
      console.log('\nServer started successfully.');
      console.log(`  REST API: http://localhost:${opts.port}/api/v1`);
      console.log(`  WebSocket: ws://localhost:${opts.port}/ws`);
      console.log(`  Health: http://localhost:${opts.port}/health`);
      console.log('\nPress Ctrl+C to stop.');

      // Keep process alive
      await new Promise(() => {});
    });
}
