import { Command } from 'commander';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show the status of the running EAF instance')
    .option('--url <url>', 'Server URL', 'http://localhost:3000')
    .action(async (opts: { url: string }) => {
      try {
        const res = await fetch(`${opts.url}/health`);
        if (!res.ok) {
          console.error(`Server returned ${res.status}`);
          process.exit(1);
        }
        const data = await res.json();
        console.log('EAF Status:');
        console.log(`  Status:    ${(data as Record<string, string>).status}`);
        console.log(`  Version:   ${(data as Record<string, string>).version}`);
        console.log(`  Timestamp: ${(data as Record<string, string>).timestamp}`);

        // Try to get more details
        const dashRes = await fetch(`${opts.url}/api/v1/dashboard/summary`);
        if (dashRes.ok) {
          const dash = (await dashRes.json()) as Record<string, number>;
          console.log(`  Agents:    ${dash.totalAgents}`);
          console.log(`  Alerts:    ${dash.activeAlerts}`);
        }
      } catch {
        console.error('Cannot connect to EAF server. Is it running?');
        console.error(`Tried: ${opts.url}`);
        process.exit(1);
      }
    });
}
