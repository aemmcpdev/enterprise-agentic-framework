import { logger, generateGoalId, generateObjectiveId } from '@eaf/core';
import type { StrategicGoal, GoalMetric, Objective } from '@eaf/core';

export class StrategicAgent {
  private goals: Map<string, StrategicGoal> = new Map();

  async setGoal(
    name: string,
    description: string,
    metrics: GoalMetric[],
    timeframe: { start: Date; end: Date }
  ): Promise<StrategicGoal> {
    const goal: StrategicGoal = {
      id: generateGoalId(),
      name,
      description,
      targetMetrics: metrics,
      timeframe,
      status: 'active',
      objectives: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.goals.set(goal.id, goal);
    logger.info('Strategic goal set', { goalId: goal.id, name });
    return goal;
  }

  async decomposeGoal(goalId: string): Promise<Objective[]> {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error(`Goal not found: ${goalId}`);

    // In production, the LLM would decompose goals into objectives
    // For now, return existing objectives
    return goal.objectives;
  }

  addObjective(goalId: string, objective: Omit<Objective, 'id' | 'goalId' | 'createdAt' | 'updatedAt'>): Objective {
    const goal = this.goals.get(goalId);
    if (!goal) throw new Error(`Goal not found: ${goalId}`);

    const obj: Objective = {
      ...objective,
      id: generateObjectiveId(),
      goalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    goal.objectives.push(obj);
    goal.updatedAt = new Date();
    logger.info('Objective added', { goalId, objectiveId: obj.id, name: obj.name });
    return obj;
  }

  getGoal(goalId: string): StrategicGoal | undefined {
    return this.goals.get(goalId);
  }

  listGoals(): StrategicGoal[] {
    return Array.from(this.goals.values());
  }

  updateGoalStatus(goalId: string, status: StrategicGoal['status']): void {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.status = status;
      goal.updatedAt = new Date();
    }
  }

  getGoalProgress(goalId: string): number {
    const goal = this.goals.get(goalId);
    if (!goal || goal.objectives.length === 0) return 0;

    const completed = goal.objectives.filter((o) => o.status === 'completed').length;
    return completed / goal.objectives.length;
  }
}
