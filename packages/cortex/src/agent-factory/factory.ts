import {
  logger,
  generateAgentId,
  DEFAULT_MAX_ITERATIONS,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_TEMPERATURE,
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
} from '@eaf/core';
import type { AgentConfig, AgentTemplate, AgentTemplateSpec } from '@eaf/core';
import { LoopEngine, LoopEngineConfig } from '../agent-loop/loop-engine.js';
import { ModelResolver } from '../model-resolver/resolver.js';
import { ToolRegistry } from '../tool-registry/registry.js';
import { MemoryManager } from '../memory/memory-manager.js';
import { TemplateRegistry } from './template-registry.js';
import { TemplateParser } from './template-parser.js';

export interface AgentFactoryDeps {
  modelResolver: ModelResolver;
  toolRegistry: ToolRegistry;
  memoryManager: MemoryManager;
  templateRegistry: TemplateRegistry;
  policyEvaluator?: LoopEngineConfig['policyEvaluator'];
  approvalRequester?: LoopEngineConfig['approvalRequester'];
}

export class AgentFactory {
  private deps: AgentFactoryDeps;
  private activeAgents: Map<string, LoopEngine> = new Map();

  constructor(deps: AgentFactoryDeps) {
    this.deps = deps;
  }

  async createFromTemplate(
    templateName: string,
    overrides: Partial<AgentConfig> = {}
  ): Promise<{ agentId: string; engine: LoopEngine }> {
    const template = this.deps.templateRegistry.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}. Available: ${this.deps.templateRegistry.list().join(', ')}`);
    }

    const agentId = overrides.agentId || generateAgentId();
    const config = this.templateToConfig(template, agentId, overrides);

    return this.createFromConfig(config);
  }

  async createFromYaml(
    yamlContent: string,
    overrides: Partial<AgentConfig> = {}
  ): Promise<{ agentId: string; engine: LoopEngine }> {
    const parser = new TemplateParser();
    const template = parser.parse(yamlContent);

    const agentId = overrides.agentId || generateAgentId();
    const config = this.templateToConfig(template, agentId, overrides);

    return this.createFromConfig(config);
  }

  createFromConfig(config: AgentConfig): { agentId: string; engine: LoopEngine } {
    const engineConfig: LoopEngineConfig = {
      agentConfig: config,
      modelResolver: this.deps.modelResolver,
      toolRegistry: this.deps.toolRegistry,
      memoryManager: this.deps.memoryManager,
      policyEvaluator: this.deps.policyEvaluator,
      approvalRequester: this.deps.approvalRequester,
    };

    const engine = new LoopEngine(engineConfig);
    this.activeAgents.set(config.agentId, engine);

    logger.info('Agent created', {
      agentId: config.agentId,
      name: config.name,
      model: config.model.model,
      tools: config.tools,
    });

    return { agentId: config.agentId, engine };
  }

  getAgent(agentId: string): LoopEngine | undefined {
    return this.activeAgents.get(agentId);
  }

  listAgents(): { agentId: string; state: unknown }[] {
    return Array.from(this.activeAgents.entries()).map(([id, engine]) => ({
      agentId: id,
      state: engine.getState(),
    }));
  }

  destroyAgent(agentId: string): boolean {
    const engine = this.activeAgents.get(agentId);
    if (engine) {
      engine.abort();
      this.activeAgents.delete(agentId);
      logger.info('Agent destroyed', { agentId });
      return true;
    }
    return false;
  }

  private templateToConfig(
    template: AgentTemplate,
    agentId: string,
    overrides: Partial<AgentConfig>
  ): AgentConfig {
    return {
      agentId,
      name: overrides.name || template.metadata.name,
      role: (template.spec.role as AgentConfig['role']) || 'task',
      model: overrides.model || {
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE,
      },
      tools: overrides.tools || template.spec.tools.map((t) => t.name),
      systemPrompt: overrides.systemPrompt || this.buildSystemPromptFromTemplate(template),
      policies: overrides.policies || [],
      memory: overrides.memory || {
        shortTermMaxEntries: 100,
        longTermEnabled: true,
        vectorSearchEnabled: false,
        compactionThreshold: 50,
      },
      maxIterations: overrides.maxIterations || DEFAULT_MAX_ITERATIONS,
      maxTokens: overrides.maxTokens || DEFAULT_MAX_TOKENS,
      timeout: overrides.timeout || DEFAULT_TIMEOUT_MS,
      tags: overrides.tags || template.metadata.tags,
      configOverrides: overrides.configOverrides || {},
    };
  }

  private buildSystemPromptFromTemplate(template: AgentTemplate): string {
    const parts: string[] = [];
    parts.push(`You are ${template.metadata.name} — ${template.metadata.description}.`);
    parts.push(`Role: ${template.spec.role}`);

    if (template.spec.tools.length > 0) {
      parts.push('\nAvailable tools:');
      for (const tool of template.spec.tools) {
        const marker = tool.required ? '(required)' : '(optional)';
        parts.push(`- ${tool.name}: ${tool.description} ${marker}`);
      }
    }

    return parts.join('\n');
  }
}
