import { Command } from 'commander';

export function registerDeployCommand(program: Command): void {
  program
    .command('deploy')
    .description('Deploy agents to the EAF server')
    .option('--url <url>', 'Server URL', 'http://localhost:3000')
    .option('--agent <agent>', 'Specific agent to deploy')
    .option('--all', 'Deploy all agents')
    .option('--dry-run', 'Show what would be deployed without actually deploying')
    .action(async (opts: { url: string; agent?: string; all?: boolean; dryRun?: boolean }) => {
      if (!opts.agent && !opts.all) {
        console.error('Specify --agent <name> or --all');
        process.exit(1);
      }

      const { readdirSync, readFileSync } = await import('node:fs');
      const { join } = await import('node:path');

      const agentDir = join(process.cwd(), 'agents');
      let files: string[];

      if (opts.all) {
        files = readdirSync(agentDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
      } else {
        files = [`${opts.agent}.yaml`];
      }

      for (const file of files) {
        const content = readFileSync(join(agentDir, file), 'utf-8');
        const nameMatch = content.match(/^name:\s*(.+)$/m);
        const agentName = nameMatch?.[1] ?? file.replace(/\.(yaml|yml)$/, '');

        if (opts.dryRun) {
          console.log(`[dry-run] Would deploy agent: ${agentName}`);
          continue;
        }

        try {
          const res = await fetch(`${opts.url}/api/v1/agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateName: agentName }),
          });

          if (res.ok) {
            console.log(`Deployed: ${agentName}`);
          } else {
            const err = await res.text();
            console.error(`Failed to deploy ${agentName}: ${err}`);
          }
        } catch {
          console.error(`Cannot connect to server at ${opts.url}`);
          process.exit(1);
        }
      }
    });
}
