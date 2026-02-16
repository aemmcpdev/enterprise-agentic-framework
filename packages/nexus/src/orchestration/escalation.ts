import { logger } from '@eaf/core';
import { HierarchyManager } from '../hierarchy/hierarchy-manager.js';

export interface EscalationRule {
  condition: string;
  targetRole: 'supervisor' | 'strategic';
  reason: string;
}

export class EscalationManager {
  private hierarchyManager: HierarchyManager;
  private rules: EscalationRule[] = [];

  constructor(hierarchyManager: HierarchyManager) {
    this.hierarchyManager = hierarchyManager;
  }

  addRule(rule: EscalationRule): void {
    this.rules.push(rule);
  }

  escalate(fromAgentId: string, reason: string): string | null {
    const parent = this.hierarchyManager.getParent(fromAgentId);
    if (!parent) {
      logger.warn('Cannot escalate: no parent agent', { fromAgentId });
      return null;
    }

    logger.info('Task escalated', { from: fromAgentId, to: parent.agentId, reason });
    return parent.agentId;
  }

  shouldEscalate(agentId: string, context: Record<string, unknown>): boolean {
    for (const rule of this.rules) {
      if (context[rule.condition]) {
        return true;
      }
    }
    return false;
  }
}
