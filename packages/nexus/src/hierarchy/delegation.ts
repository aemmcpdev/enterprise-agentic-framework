import { logger } from '@eaf/core';
import type { TaskDefinition, AgentHierarchyNode } from '@eaf/core';
import { HierarchyManager } from './hierarchy-manager.js';

export interface DelegationResult {
  success: boolean;
  assignedTo?: string;
  reason?: string;
}

export class DelegationEngine {
  private hierarchyManager: HierarchyManager;

  constructor(hierarchyManager: HierarchyManager) {
    this.hierarchyManager = hierarchyManager;
  }

  delegate(task: TaskDefinition, fromAgentId: string): DelegationResult {
    const fromNode = this.hierarchyManager.getNode(fromAgentId);
    if (!fromNode) {
      return { success: false, reason: 'Source agent not found in hierarchy' };
    }

    // Find suitable child agent
    const children = this.hierarchyManager.getChildren(fromAgentId);
    const available = children.filter((c) => c.status === 'idle');

    if (available.length === 0) {
      // Try rule-based delegation
      const target = this.hierarchyManager.findDelegationTarget(fromNode.role, task.title);
      if (target) {
        task.assignedAgentId = target.agentId;
        task.status = 'queued';
        logger.info('Task delegated via rule', {
          taskId: task.id,
          from: fromAgentId,
          to: target.agentId,
        });
        return { success: true, assignedTo: target.agentId };
      }
      return { success: false, reason: 'No available agents for delegation' };
    }

    // Simple round-robin: assign to first available
    const target = available[0]!;
    task.assignedAgentId = target.agentId;
    task.status = 'queued';

    logger.info('Task delegated', {
      taskId: task.id,
      from: fromAgentId,
      to: target.agentId,
    });

    return { success: true, assignedTo: target.agentId };
  }

  escalate(task: TaskDefinition, fromAgentId: string, reason: string): DelegationResult {
    const parent = this.hierarchyManager.getParent(fromAgentId);
    if (!parent) {
      return { success: false, reason: 'No parent agent to escalate to' };
    }

    task.assignedAgentId = parent.agentId;
    task.status = 'queued';

    logger.info('Task escalated', {
      taskId: task.id,
      from: fromAgentId,
      to: parent.agentId,
      reason,
    });

    return { success: true, assignedTo: parent.agentId };
  }
}
