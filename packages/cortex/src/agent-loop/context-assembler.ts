import type { AgentConfig, Message } from '@eaf/core';
import { MemoryManager } from '../memory/memory-manager.js';
import { ToolRegistry } from '../tool-registry/registry.js';

export class ContextAssembler {
  async assembleInitial(
    agentConfig: AgentConfig,
    task: string,
    memoryManager: MemoryManager,
    toolRegistry: ToolRegistry
  ): Promise<Message[]> {
    const messages: Message[] = [];

    // System prompt
    const systemPrompt = this.buildSystemPrompt(agentConfig, toolRegistry);
    messages.push({ role: 'system', content: systemPrompt });

    // Recall relevant memories
    const memories = await memoryManager.recall({
      agentId: agentConfig.agentId,
      query: task,
      limit: 5,
    });

    if (memories.length > 0) {
      const memoryContext = memories
        .map((m) => `- ${m.entry.content}`)
        .join('\n');
      messages.push({
        role: 'system',
        content: `Relevant context from memory:\n${memoryContext}`,
      });
    }

    // User task
    messages.push({ role: 'user', content: task });

    return messages;
  }

  private buildSystemPrompt(
    agentConfig: AgentConfig,
    toolRegistry: ToolRegistry
  ): string {
    const parts: string[] = [];

    // Main system prompt from config
    parts.push(agentConfig.systemPrompt);

    // Add tool descriptions
    const tools = toolRegistry.list().filter(
      (t) => agentConfig.tools.length === 0 || agentConfig.tools.includes(t.name)
    );
    if (tools.length > 0) {
      parts.push('\n## Available Tools\n');
      for (const tool of tools) {
        parts.push(`- **${tool.name}**: ${tool.description}`);
      }
    }

    // Add behavioral guidelines
    parts.push('\n## Guidelines');
    parts.push('- Think step-by-step before taking action.');
    parts.push('- Use tools when you need external information or to perform actions.');
    parts.push('- If a tool call fails, consider alternative approaches.');
    parts.push('- When the task is complete, provide a clear final response.');
    parts.push(`- You have a maximum of ${agentConfig.maxIterations} iterations.`);

    return parts.join('\n');
  }

  appendToolResult(
    context: Message[],
    toolCallId: string,
    toolName: string,
    result: unknown
  ): Message[] {
    return [
      ...context,
      {
        role: 'tool' as const,
        content: typeof result === 'string' ? result : JSON.stringify(result),
        toolCallId,
        name: toolName,
      },
    ];
  }

  appendAssistantMessage(context: Message[], content: string): Message[] {
    return [...context, { role: 'assistant' as const, content }];
  }

  appendSystemMessage(context: Message[], content: string): Message[] {
    return [...context, { role: 'system' as const, content }];
  }
}
