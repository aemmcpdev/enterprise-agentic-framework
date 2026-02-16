import type { Delta } from './delta.js';

export interface Attribution {
  agentId: string;
  metricName: string;
  contributionPercent: number;
  delta: Delta;
}

export class AttributionEngine {
  attribute(agentId: string, deltas: Delta[]): Attribution[] {
    return deltas.map((delta) => ({
      agentId,
      metricName: delta.metricName,
      contributionPercent: delta.improved ? Math.min(100, Math.abs(delta.changePercent)) : 0,
      delta,
    }));
  }

  getTopContributors(attributions: Attribution[], limit = 5): Attribution[] {
    return attributions
      .sort((a, b) => b.contributionPercent - a.contributionPercent)
      .slice(0, limit);
  }
}
