import { Command } from 'commander';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new EAF project')
    .argument('[name]', 'Project name', 'my-eaf-project')
    .option('--template <template>', 'Project template', 'basic')
    .action(async (name: string, opts: { template: string }) => {
      const dir = join(process.cwd(), name);

      if (existsSync(dir)) {
        console.error(`Directory ${name} already exists`);
        process.exit(1);
      }

      mkdirSync(dir, { recursive: true });
      mkdirSync(join(dir, 'agents'), { recursive: true });
      mkdirSync(join(dir, 'tools'), { recursive: true });
      mkdirSync(join(dir, 'policies'), { recursive: true });

      writeFileSync(
        join(dir, 'package.json'),
        JSON.stringify(
          {
            name,
            version: '0.1.0',
            type: 'module',
            scripts: {
              start: 'eaf run',
              dev: 'eaf run --watch',
            },
            dependencies: {
              '@eaf/sdk': '^0.1.0',
            },
          },
          null,
          2,
        ),
      );

      writeFileSync(
        join(dir, 'eaf.config.ts'),
        [
          "import { defineConfig } from '@eaf/sdk';",
          '',
          'export default defineConfig({',
          `  appName: '${name}',`,
          "  defaultModel: 'claude-sonnet-4-5-20250929',",
          '  port: 3000,',
          '  auditEnabled: true,',
          '});',
          '',
        ].join('\n'),
      );

      writeFileSync(
        join(dir, 'agents', 'assistant.yaml'),
        [
          'name: assistant',
          'model: claude-sonnet-4-5-20250929',
          'system_prompt: |',
          '  You are a helpful AI assistant.',
          'tools:',
          '  - http_request',
          '  - read_file',
          'max_iterations: 10',
          '',
        ].join('\n'),
      );

      writeFileSync(
        join(dir, '.env'),
        [
          '# API Keys',
          'ANTHROPIC_API_KEY=',
          'OPENAI_API_KEY=',
          '',
          '# Database',
          'DATABASE_URL=postgresql://localhost:5432/eaf',
          '',
          '# Redis',
          'REDIS_URL=redis://localhost:6379',
          '',
        ].join('\n'),
      );

      console.log(`\nProject "${name}" created with template "${opts.template}"\n`);
      console.log('Next steps:');
      console.log(`  cd ${name}`);
      console.log('  npm install');
      console.log('  eaf run');
    });
}
