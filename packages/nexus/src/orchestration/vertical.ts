import { logger } from '@eaf/core';
import type { StrategicGoal, Objective } from '@eaf/core';

export class VerticalOrchestrator {
  private goals: Map<string, StrategicGoal> = new Map();

  async processGoal(goal: StrategicGoal): Promise<Objective[]> {
    logger.info('Processing goal vertically', { goalId: goal.id, name: goal.name });
    this.goals.set(goal.id, goal);

    // In production, uses LLM to decompose goals into objectives
    const objectives: Objective[] = goal.objectives || [];
    return objectives;
  }

  async reportProgress(goalId: string): Promise<{ goalId: string; progress: number }> {
    const goal = this.goals.get(goalId);
    if (!goal) return { goalId, progress: 0 };

    const total = goal.objectives?.length || 0;
    const completed = goal.objectives?.filter((o) => o.status === 'completed').length || 0;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return { goalId, progress };
  }

  getGoal(goalId: string): StrategicGoal | undefined {
    return this.goals.get(goalId);
  }
}
