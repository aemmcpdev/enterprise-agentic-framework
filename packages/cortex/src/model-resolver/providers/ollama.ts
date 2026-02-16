import type { ModelProvider, ModelCallOptions, ModelResponse, ProviderConfig } from './base.js';
import { logger } from '@eaf/core';

export class OllamaProvider implements ModelProvider {
  name = 'ollama';
  private baseUrl: string;
  private config: ProviderConfig;

  constructor(config: ProviderConfig, baseUrl = 'http://localhost:11434') {
    this.config = config;
    this.baseUrl = baseUrl;
  }

  async call(options: ModelCallOptions): Promise<ModelResponse> {
    const startTime = Date.now();

    const messages = options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (options.systemPrompt) {
      messages.unshift({ role: 'system', content: options.systemPrompt });
    }

    const body: Record<string, unknown> = {
      model: options.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens,
        stop: options.stopSequences,
      },
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      message: { content: string };
      eval_count?: number;
      prompt_eval_count?: number;
      done_reason?: string;
    };

    return {
      content: data.message.content,
      toolCalls: [],
      usage: {
        inputTokens: data.prompt_eval_count || 0,
        outputTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
      stopReason: data.done_reason === 'length' ? 'max_tokens' : 'end_turn',
      model: options.model,
      latencyMs: Date.now() - startTime,
    };
  }

  listModels(): string[] {
    return this.config.models.length > 0
      ? this.config.models
      : ['llama3', 'mistral', 'codellama'];
  }

  estimateCost(): number {
    return 0; // Local models are free
  }
}
