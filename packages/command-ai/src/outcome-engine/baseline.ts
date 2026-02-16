import { logger } from '@eaf/core';

export interface Baseline {
  id: string;
  agentId: string;
  metricName: string;
  value: number;
  unit: string;
  measuredAt: Date;
  source: string;
}

export class BaselineManager {
  private baselines: Map<string, Baseline> = new Map();

  record(agentId: string, metricName: string, value: number, unit: string, source = 'manual'): Baseline {
    const key = `${agentId}:${metricName}`;
    const baseline: Baseline = {
      id: `bl_${Date.now()}`,
      agentId,
      metricName,
      value,
      unit,
      measuredAt: new Date(),
      source,
    };
    this.baselines.set(key, baseline);
    logger.info('Baseline recorded', { agentId, metricName, value });
    return baseline;
  }

  get(agentId: string, metricName: string): Baseline | undefined {
    return this.baselines.get(`${agentId}:${metricName}`);
  }

  getAll(): Baseline[] {
    return Array.from(this.baselines.values());
  }

  getForAgent(agentId: string): Baseline[] {
    return this.getAll().filter((b) => b.agentId === agentId);
  }
}
