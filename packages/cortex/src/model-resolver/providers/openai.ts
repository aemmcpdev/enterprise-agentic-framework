import OpenAI from 'openai';
import type { ModelProvider, ModelCallOptions, ModelResponse, ProviderConfig } from './base.js';
import { logger } from '@eaf/core';

export class OpenAIProvider implements ModelProvider {
  name = 'openai';
  private client: OpenAI;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.client = new OpenAI({ apiKey: config.apiKeys[0] });
  }

  async call(options: ModelCallOptions): Promise<ModelResponse> {
    const startTime = Date.now();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    for (const m of options.messages) {
      messages.push({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      });
    }

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: options.model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature,
      stop: options.stopSequences,
    };

    if (options.tools && options.tools.length > 0) {
      params.tools = options.tools.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema,
        },
      }));
    }

    const response = await this.client.chat.completions.create(params);
    const choice = response.choices[0]!;

    const toolCalls = (choice.message.tool_calls || []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
    }));

    const stopReasonMap: Record<string, ModelResponse['stopReason']> = {
      stop: 'end_turn',
      length: 'max_tokens',
      tool_calls: 'tool_use',
    };

    return {
      content: choice.message.content || '',
      toolCalls,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      stopReason: stopReasonMap[choice.finish_reason] || 'end_turn',
      model: response.model,
      latencyMs: Date.now() - startTime,
    };
  }

  listModels(): string[] {
    return this.config.models.length > 0
      ? this.config.models
      : ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
  }

  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    const inputCost = this.config.costPerInputToken[model] || 0.000005;
    const outputCost = this.config.costPerOutputToken[model] || 0.000015;
    return inputTokens * inputCost + outputTokens * outputCost;
  }
}
