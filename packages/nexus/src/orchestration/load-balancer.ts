import { logger } from '@eaf/core';
import { HierarchyManager } from '../hierarchy/hierarchy-manager.js';

export class LoadBalancer {
  private hierarchyManager: HierarchyManager;
  private taskCounts: Map<string, number> = new Map();

  constructor(hierarchyManager: HierarchyManager) {
    this.hierarchyManager = hierarchyManager;
  }

  selectAgent(role: 'task' | 'supervisor', parentId?: string): string | null {
    const candidates = role === 'task'
      ? this.hierarchyManager.getTaskAgents(parentId)
      : this.hierarchyManager.getSupervisors(parentId);

    if (candidates.length === 0) return null;

    let minCount = Infinity;
    let selected = candidates[0]!;

    for (const candidate of candidates) {
      const count = this.taskCounts.get(candidate.agentId) || 0;
      if (count < minCount) {
        minCount = count;
        selected = candidate;
      }
    }

    this.taskCounts.set(selected.agentId, (this.taskCounts.get(selected.agentId) || 0) + 1);
    return selected.agentId;
  }

  releaseAgent(agentId: string): void {
    const count = this.taskCounts.get(agentId) || 0;
    this.taskCounts.set(agentId, Math.max(0, count - 1));
  }

  getLoadDistribution(): Map<string, number> {
    return new Map(this.taskCounts);
  }
}
