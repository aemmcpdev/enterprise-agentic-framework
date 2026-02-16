import { logger } from '@eaf/core';
import type { TokenUsage } from './providers/base.js';

interface CostEntry {
  model: string;
  cost: number;
  usage: TokenUsage;
  timestamp: Date;
}

export class CostTracker {
  private entries: CostEntry[] = [];
  private budgetLimit?: number;

  setBudgetLimit(limit: number): void {
    this.budgetLimit = limit;
  }

  recordCost(model: string, cost: number, usage: TokenUsage): void {
    this.entries.push({ model, cost, usage, timestamp: new Date() });
  }

  getTotalCost(): number {
    return this.entries.reduce((sum, e) => sum + e.cost, 0);
  }

  getCostByModel(): Record<string, number> {
    const byModel: Record<string, number> = {};
    for (const entry of this.entries) {
      byModel[entry.model] = (byModel[entry.model] || 0) + entry.cost;
    }
    return byModel;
  }

  getTotalTokens(): TokenUsage {
    return this.entries.reduce(
      (acc, e) => ({
        inputTokens: acc.inputTokens + e.usage.inputTokens,
        outputTokens: acc.outputTokens + e.usage.outputTokens,
        totalTokens: acc.totalTokens + e.usage.totalTokens,
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    );
  }

  isWithinBudget(): boolean {
    if (!this.budgetLimit) return true;
    return this.getTotalCost() < this.budgetLimit;
  }

  getRemainingBudget(): number | null {
    if (!this.budgetLimit) return null;
    return Math.max(0, this.budgetLimit - this.getTotalCost());
  }

  getCostSince(since: Date): number {
    return this.entries
      .filter((e) => e.timestamp >= since)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  getEntryCount(): number {
    return this.entries.length;
  }
}
