import { logger } from '@eaf/core';
import type { LearningEntry } from './agent-learning.js';

export class CrossAgentLearning {
  private sharedLearnings: LearningEntry[] = [];

  share(entry: LearningEntry): void {
    this.sharedLearnings.push(entry);
    logger.debug('Learning shared cross-agent', { agentId: entry.agentId, type: entry.type });
  }

  getRelevant(context: Record<string, unknown>, limit = 5): LearningEntry[] {
    return this.sharedLearnings
      .filter((e) => e.confidence >= 0.7)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  getByType(type: LearningEntry['type']): LearningEntry[] {
    return this.sharedLearnings.filter((e) => e.type === type);
  }

  getAllShared(): LearningEntry[] {
    return [...this.sharedLearnings];
  }
}
