import { logger } from '@eaf/core';

export interface Intervention {
  id: string;
  agentId: string;
  type: 'pause' | 'stop' | 'redirect' | 'override';
  reason: string;
  initiatedBy: string;
  timestamp: Date;
  resolved: boolean;
}

export class InterventionManager {
  private interventions: Intervention[] = [];
  private pausedAgents: Set<string> = new Set();

  intervene(agentId: string, type: Intervention['type'], reason: string, initiatedBy: string): Intervention {
    const intervention: Intervention = {
      id: `intv_${Date.now()}`,
      agentId,
      type,
      reason,
      initiatedBy,
      timestamp: new Date(),
      resolved: false,
    };

    this.interventions.push(intervention);

    if (type === 'pause' || type === 'stop') {
      this.pausedAgents.add(agentId);
    }

    logger.info('Intervention initiated', { agentId, type, reason, by: initiatedBy });
    return intervention;
  }

  resolve(interventionId: string): void {
    const intervention = this.interventions.find((i) => i.id === interventionId);
    if (intervention) {
      intervention.resolved = true;
      this.pausedAgents.delete(intervention.agentId);
      logger.info('Intervention resolved', { id: interventionId });
    }
  }

  isAgentPaused(agentId: string): boolean {
    return this.pausedAgents.has(agentId);
  }

  getActiveInterventions(): Intervention[] {
    return this.interventions.filter((i) => !i.resolved);
  }
}
