import type { Message, ToolCallRequest } from '@eaf/core';

export interface ModelCallOptions {
  model: string;
  messages: Message[];
  tools?: ModelToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface ModelResponse {
  content: string;
  toolCalls: ToolCallRequest[];
  usage: TokenUsage;
  stopReason: 'end_turn' | 'max_tokens' | 'tool_use' | 'stop_sequence';
  model: string;
  latencyMs: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ModelToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ModelProvider {
  name: string;
  call(options: ModelCallOptions): Promise<ModelResponse>;
  listModels(): string[];
  estimateCost(inputTokens: number, outputTokens: number, model: string): number;
}

export interface ProviderConfig {
  name: string;
  models: string[];
  apiKeys: string[];
  priority: number;
  maxConcurrent: number;
  costPerInputToken: Record<string, number>;
  costPerOutputToken: Record<string, number>;
}
