import { logger } from '@eaf/core';
import type { AgentConfig, Tool } from '@eaf/core';
import { AgentFactory, TemplateRegistry } from '@eaf/cortex';
import { ModelResolver } from '@eaf/cortex';
import { ToolRegistry } from '@eaf/cortex';
import { MemoryManager } from '@eaf/cortex';
import { HierarchyManager } from '@eaf/nexus';
import { PolicyEngine } from '@eaf/aegis';
import { AuditLogger } from '@eaf/aegis';
import type { EAFConfig } from './config.js';

export class EAFClient {
  private config: EAFConfig;
  private modelResolver: ModelResolver;
  private toolRegistry: ToolRegistry;
  private memoryManager: MemoryManager;
  private agentFactory: AgentFactory;
  private templateRegistry: TemplateRegistry;
  private hierarchyManager: HierarchyManager;
  private policyEngine: PolicyEngine;
  private auditLogger: AuditLogger;
  private initialized = false;

  constructor(config: EAFConfig) {
    this.config = config;
    this.modelResolver = new ModelResolver();
    this.toolRegistry = new ToolRegistry();
    this.memoryManager = new MemoryManager();
    this.templateRegistry = new TemplateRegistry();
    this.agentFactory = new AgentFactory(this.templateRegistry);
    this.hierarchyManager = new HierarchyManager();
    this.policyEngine = new PolicyEngine();
    this.auditLogger = new AuditLogger();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Register model providers
    for (const provider of this.config.providers ?? []) {
      this.modelResolver.registerProvider(provider);
    }

    // Register tools
    for (const tool of this.config.tools ?? []) {
      this.toolRegistry.register(tool);
    }

    // Load policies
    for (const policy of this.config.policies ?? []) {
      this.policyEngine.addPolicy(policy);
    }

    this.initialized = true;
    logger.info('EAF Client initialized', { providers: this.config.providers?.length ?? 0 });
  }

  getModelResolver(): ModelResolver {
    return this.modelResolver;
  }

  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  getMemoryManager(): MemoryManager {
    return this.memoryManager;
  }

  getAgentFactory(): AgentFactory {
    return this.agentFactory;
  }

  getHierarchyManager(): HierarchyManager {
    return this.hierarchyManager;
  }

  getPolicyEngine(): PolicyEngine {
    return this.policyEngine;
  }

  getAuditLogger(): AuditLogger {
    return this.auditLogger;
  }

  registerTool(tool: Tool): void {
    this.toolRegistry.register(tool);
  }

  async createAgent(config: Partial<AgentConfig> & { name: string; model: string }): Promise<string> {
    await this.initialize();
    const fullConfig: AgentConfig = {
      id: `agt_${Date.now()}`,
      name: config.name,
      model: config.model,
      systemPrompt: config.systemPrompt ?? `You are ${config.name}, an AI assistant.`,
      tools: config.tools ?? [],
      maxIterations: config.maxIterations ?? 20,
      temperature: config.temperature ?? 0.7,
      memoryConfig: config.memoryConfig ?? { shortTermLimit: 50, longTermEnabled: false, vectorSearchEnabled: false },
    };
    logger.info('Agent created via SDK', { agentId: fullConfig.id, name: fullConfig.name });
    return fullConfig.id;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('EAF Client shut down');
  }
}
