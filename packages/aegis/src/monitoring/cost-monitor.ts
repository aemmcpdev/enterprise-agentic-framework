import { logger } from '@eaf/core';

export interface CostAlert {
  agentId: string;
  currentCost: number;
  budgetLimit: number;
  percentUsed: number;
  severity: 'warning' | 'critical';
  timestamp: Date;
}

export class CostMonitor {
  private agentCosts: Map<string, number> = new Map();
  private budgets: Map<string, number> = new Map();
  private alerts: CostAlert[] = [];

  setBudget(agentId: string, budget: number): void {
    this.budgets.set(agentId, budget);
  }

  recordCost(agentId: string, cost: number): CostAlert | null {
    const current = (this.agentCosts.get(agentId) || 0) + cost;
    this.agentCosts.set(agentId, current);

    const budget = this.budgets.get(agentId);
    if (!budget) return null;

    const percentUsed = (current / budget) * 100;

    if (percentUsed >= 90) {
      const alert: CostAlert = {
        agentId,
        currentCost: current,
        budgetLimit: budget,
        percentUsed,
        severity: percentUsed >= 100 ? 'critical' : 'warning',
        timestamp: new Date(),
      };
      this.alerts.push(alert);
      logger.warn('Cost alert', { agentId, percentUsed, severity: alert.severity });
      return alert;
    }

    return null;
  }

  getAgentCost(agentId: string): number {
    return this.agentCosts.get(agentId) || 0;
  }

  getTotalCost(): number {
    let total = 0;
    for (const cost of this.agentCosts.values()) total += cost;
    return total;
  }

  getAlerts(): CostAlert[] {
    return [...this.alerts];
  }

  resetCosts(): void {
    this.agentCosts.clear();
  }
}
