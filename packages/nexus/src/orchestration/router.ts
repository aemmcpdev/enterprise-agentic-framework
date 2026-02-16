import { logger } from '@eaf/core';
import { HierarchyManager } from '../hierarchy/hierarchy-manager.js';

export class WorkRouter {
  private hierarchyManager: HierarchyManager;

  constructor(hierarchyManager: HierarchyManager) {
    this.hierarchyManager = hierarchyManager;
  }

  routeTask(taskDescription: string, requiredCapabilities: string[] = []): string | null {
    const taskAgents = this.hierarchyManager.getTaskAgents();
    const available = taskAgents.filter((a) => a.status === 'idle');

    if (available.length === 0) {
      logger.warn('No available agents for routing');
      return null;
    }

    const selected = available[0]!;
    logger.info('Task routed', { to: selected.agentId, task: taskDescription.substring(0, 100) });
    return selected.agentId;
  }
}
