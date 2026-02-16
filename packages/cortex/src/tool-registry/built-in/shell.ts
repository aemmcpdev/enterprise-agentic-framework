import { exec } from 'child_process';
import { promisify } from 'util';
import type { Tool, ToolResult } from '@eaf/core';

const execAsync = promisify(exec);

export const shellTool: Tool = {
  name: 'shell_execute',
  description: 'Executes a shell command. Subject to policy enforcement.',
  category: 'system',
  parameters: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'Shell command to execute' },
      cwd: { type: 'string', description: 'Working directory' },
      timeout: { type: 'number', description: 'Timeout in ms (default: 30000)' },
    },
    required: ['command'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const command = params.command as string;
    const cwd = params.cwd as string | undefined;
    const timeout = (params.timeout as number) || 30000;

    const blocked = [
      /rm\s+-rf\s+\//,
      /mkfs/,
      /dd\s+if=/,
      /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;/,
      /chmod\s+-R\s+777\s+\//,
      /shutdown/,
      /reboot/,
    ];

    for (const pattern of blocked) {
      if (pattern.test(command)) {
        return { success: false, error: 'Command blocked by security policy' };
      }
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024,
      });

      return { success: true, data: { stdout: stdout.trim(), stderr: stderr.trim(), command } };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      return {
        success: false,
        error: execError.stderr || execError.message || String(error),
        data: { stdout: execError.stdout || '', stderr: execError.stderr || '' },
      };
    }
  },
};
