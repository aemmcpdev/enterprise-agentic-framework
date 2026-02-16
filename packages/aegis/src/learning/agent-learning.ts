import { logger } from '@eaf/core';

export interface LearningEntry {
  id: string;
  agentId: string;
  type: 'success_pattern' | 'failure_pattern' | 'optimization' | 'preference';
  description: string;
  context: Record<string, unknown>;
  confidence: number;
  timestamp: Date;
}

export class AgentLearning {
  private entries: Map<string, LearningEntry[]> = new Map();

  record(agentId: string, type: LearningEntry['type'], description: string, context: Record<string, unknown> = {}, confidence = 0.7): LearningEntry {
    const entry: LearningEntry = {
      id: `learn_${Date.now()}`,
      agentId,
      type,
      description,
      context,
      confidence,
      timestamp: new Date(),
    };

    const existing = this.entries.get(agentId) || [];
    existing.push(entry);
    this.entries.set(agentId, existing);

    logger.debug('Learning entry recorded', { agentId, type, description });
    return entry;
  }

  getAgentLearnings(agentId: string, type?: LearningEntry['type']): LearningEntry[] {
    const entries = this.entries.get(agentId) || [];
    if (type) return entries.filter((e) => e.type === type);
    return entries;
  }

  getTopPatterns(agentId: string, limit = 10): LearningEntry[] {
    const entries = this.entries.get(agentId) || [];
    return entries
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }
}
