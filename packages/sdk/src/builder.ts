import type { Tool, Policy } from '@eaf/core';
import type { ModelProvider } from '@eaf/cortex';
import { EAFClient } from './client.js';
import type { EAFConfig } from './config.js';

/**
 * Fluent builder for constructing an EAF client.
 */
export class EAFBuilder {
  private config: EAFConfig = {};
  private providerList: ModelProvider[] = [];
  private toolList: Tool[] = [];
  private policyList: Policy[] = [];

  setAppName(name: string): this {
    this.config.appName = name;
    return this;
  }

  setDefaultModel(model: string): this {
    this.config.defaultModel = model;
    return this;
  }

  setPort(port: number): this {
    this.config.port = port;
    return this;
  }

  setDatabase(url: string): this {
    this.config.databaseUrl = url;
    return this;
  }

  setRedis(url: string): this {
    this.config.redisUrl = url;
    return this;
  }

  setLogLevel(level: EAFConfig['logLevel']): this {
    this.config.logLevel = level;
    return this;
  }

  enableAudit(enabled = true): this {
    this.config.auditEnabled = enabled;
    return this;
  }

  setMaxConcurrentAgents(max: number): this {
    this.config.maxConcurrentAgents = max;
    return this;
  }

  addProvider(provider: ModelProvider): this {
    this.providerList.push(provider);
    return this;
  }

  addTool(tool: Tool): this {
    this.toolList.push(tool);
    return this;
  }

  addPolicy(policy: Policy): this {
    this.policyList.push(policy);
    return this;
  }

  build(): EAFClient {
    const finalConfig: EAFConfig = {
      ...this.config,
      providers: this.providerList,
      tools: this.toolList,
      policies: this.policyList,
    };
    return new EAFClient(finalConfig);
  }
}
