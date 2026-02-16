import { logger } from '@eaf/core';
import type { ToolResult } from '@eaf/core';

export class ToolSandbox {
  private denyPatterns: RegExp[] = [];

  addDenyPattern(pattern: RegExp): void {
    this.denyPatterns.push(pattern);
  }

  isAllowed(toolName: string, params: Record<string, unknown>): boolean {
    const paramStr = JSON.stringify(params);

    for (const pattern of this.denyPatterns) {
      if (pattern.test(paramStr)) {
        logger.warn('Tool call blocked by sandbox', { tool: toolName, pattern: pattern.source });
        return false;
      }
    }

    return true;
  }

  async executeWithTimeout(
    fn: () => Promise<ToolResult>,
    timeoutMs: number
  ): Promise<ToolResult> {
    return new Promise<ToolResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Tool execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
