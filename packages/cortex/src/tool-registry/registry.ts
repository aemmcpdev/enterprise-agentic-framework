import { logger } from '@eaf/core';
import type { Tool, ToolResult, ToolExecutionContext } from '@eaf/core';
import { validateToolParams } from './schema-validator.js';
import { ToolSandbox } from './sandbox.js';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private sandbox: ToolSandbox;

  constructor() {
    this.sandbox = new ToolSandbox();
  }

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
    logger.info('Tool registered', { name: tool.name, category: tool.category });
  }

  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  listByCategory(category: string): Tool[] {
    return this.list().filter((t) => t.category === category);
  }

  async execute(
    toolName: string,
    params: Record<string, unknown>,
    context?: ToolExecutionContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { success: false, error: `Tool not found: ${toolName}` };
    }

    // Validate parameters
    const validation = validateToolParams(tool.parameters, params);
    if (!validation.valid) {
      return { success: false, error: `Invalid parameters: ${validation.errors.join(', ')}` };
    }

    // Check sandbox restrictions
    if (!this.sandbox.isAllowed(toolName, params)) {
      return { success: false, error: `Tool execution blocked by sandbox policy` };
    }

    try {
      const result = await this.sandbox.executeWithTimeout(
        () => tool.execute(params, context),
        tool.timeout || 30000
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Tool execution failed', { tool: toolName, error: message });
      return { success: false, error: message };
    }
  }

  getToolDefinitions(): Array<{ name: string; description: string; inputSchema: unknown }> {
    return this.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.parameters,
    }));
  }
}
