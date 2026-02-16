import { logger } from '@eaf/core';
import type { ModelProvider, ModelCallOptions, ModelResponse, ProviderConfig } from './providers/base.js';
import { KeyManager } from './key-manager.js';
import { CostTracker } from './cost-tracker.js';

export class ModelResolver {
  private providers: Map<string, ModelProvider> = new Map();
  private modelToProvider: Map<string, string> = new Map();
  private failoverOrder: string[] = [];
  private keyManager: KeyManager;
  private costTracker: CostTracker;

  constructor() {
    this.keyManager = new KeyManager();
    this.costTracker = new CostTracker();
  }

  registerProvider(provider: ModelProvider, config: ProviderConfig): void {
    this.providers.set(provider.name, provider);
    this.failoverOrder.push(provider.name);

    for (const model of provider.listModels()) {
      this.modelToProvider.set(model, provider.name);
    }

    for (const key of config.apiKeys) {
      this.keyManager.addKey(provider.name, key);
    }

    logger.info('Provider registered', { name: provider.name, models: provider.listModels() });
  }

  async resolve(options: ModelCallOptions): Promise<ModelResponse> {
    const providerName = this.modelToProvider.get(options.model);

    if (providerName) {
      const provider = this.providers.get(providerName);
      if (provider) {
        return this.callWithTracking(provider, options);
      }
    }

    // Failover: try providers in order
    for (const name of this.failoverOrder) {
      const provider = this.providers.get(name);
      if (!provider) continue;

      try {
        return await this.callWithTracking(provider, options);
      } catch (error) {
        logger.warn('Provider failed, trying next', {
          provider: name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    throw new Error(`No provider available for model: ${options.model}`);
  }

  private async callWithTracking(provider: ModelProvider, options: ModelCallOptions): Promise<ModelResponse> {
    const response = await provider.call(options);

    const cost = provider.estimateCost(response.usage.inputTokens, response.usage.outputTokens, options.model);
    this.costTracker.recordCost(options.model, cost, response.usage);

    logger.debug('Model call completed', {
      provider: provider.name,
      model: options.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      cost,
      latencyMs: response.latencyMs,
    });

    return response;
  }

  getProvider(name: string): ModelProvider | undefined {
    return this.providers.get(name);
  }

  getCostTracker(): CostTracker {
    return this.costTracker;
  }

  getKeyManager(): KeyManager {
    return this.keyManager;
  }
}
