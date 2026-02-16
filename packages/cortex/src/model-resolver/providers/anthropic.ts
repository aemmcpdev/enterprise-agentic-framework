import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, ModelCallOptions, ModelResponse, ProviderConfig } from './base.js';
import { logger } from '@eaf/core';

export class AnthropicProvider implements ModelProvider {
  name = 'anthropic';
  private client: Anthropic;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.client = new Anthropic({ apiKey: config.apiKeys[0] });
  }

  async call(options: ModelCallOptions): Promise<ModelResponse> {
    const startTime = Date.now();

    const messages = options.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const params: Anthropic.MessageCreateParams = {
      model: options.model,
      max_tokens: options.maxTokens || 4096,
      messages,
      temperature: options.temperature,
      stop_sequences: options.stopSequences,
    };

    if (options.systemPrompt) {
      params.system = options.systemPrompt;
    }

    if (options.tools && options.tools.length > 0) {
      params.tools = options.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Tool['input_schema'],
      }));
    }

    const response = await this.client.messages.create(params);

    const toolCalls = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        arguments: block.input as Record<string, unknown>,
      }));

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const stopReasonMap: Record<string, ModelResponse['stopReason']> = {
      end_turn: 'end_turn',
      max_tokens: 'max_tokens',
      tool_use: 'tool_use',
      stop_sequence: 'stop_sequence',
    };

    return {
      content: textContent,
      toolCalls,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      stopReason: stopReasonMap[response.stop_reason] || 'end_turn',
      model: response.model,
      latencyMs: Date.now() - startTime,
    };
  }

  listModels(): string[] {
    return this.config.models.length > 0
      ? this.config.models
      : ['claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001', 'claude-opus-4-6'];
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    const inputCost = this.config.costPerInputToken[model] || 0.000003;
    const outputCost = this.config.costPerOutputToken[model] || 0.000015;
    return inputTokens * inputCost + outputTokens * outputCost;
  }
}
