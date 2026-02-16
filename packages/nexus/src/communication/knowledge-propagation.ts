import { logger } from '@eaf/core';
import { AgentBus } from './agent-bus.js';

export interface KnowledgeUpdate {
  sourceAgentId: string;
  key: string;
  value: unknown;
  confidence: number;
  timestamp: Date;
}

export class KnowledgePropagation {
  private bus: AgentBus;
  private shared: Map<string, KnowledgeUpdate> = new Map();

  constructor(bus: AgentBus) {
    this.bus = bus;
  }

  async share(sourceAgentId: string, key: string, value: unknown, confidence = 0.8): Promise<void> {
    const update: KnowledgeUpdate = {
      sourceAgentId,
      key,
      value,
      confidence,
      timestamp: new Date(),
    };

    this.shared.set(key, update);

    await this.bus.emit({
      type: 'knowledge.shared',
      agentId: sourceAgentId,
      data: { key, value, confidence },
    });

    logger.debug('Knowledge shared', { source: sourceAgentId, key });
  }

  get(key: string): KnowledgeUpdate | undefined {
    return this.shared.get(key);
  }

  getAll(): Map<string, KnowledgeUpdate> {
    return new Map(this.shared);
  }
}
