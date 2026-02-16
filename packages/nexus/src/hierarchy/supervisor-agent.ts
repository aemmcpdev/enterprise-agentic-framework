import { logger, generateTaskId } from '@eaf/core';
import type { Objective, TaskDefinition } from '@eaf/core';

export class SupervisorAgent {
  private objectives: Map<string, Objective> = new Map();

  assignObjective(objective: Objective): void {
    this.objectives.set(objective.id, objective);
    logger.info('Objective assigned to supervisor', {
      objectiveId: objective.id,
      name: objective.name,
    });
  }

  async decompose(objectiveId: string): Promise<TaskDefinition[]> {
    const objective = this.objectives.get(objectiveId);
    if (!objective) throw new Error(`Objective not found: ${objectiveId}`);
    return objective.tasks;
  }

  addTask(
    objectiveId: string,
    task: Omit<TaskDefinition, 'id' | 'objectiveId' | 'createdAt'>
  ): TaskDefinition {
    const objective = this.objectives.get(objectiveId);
    if (!objective) throw new Error(`Objective not found: ${objectiveId}`);

    const taskDef: TaskDefinition = {
      ...task,
      id: generateTaskId(),
      objectiveId,
      createdAt: new Date(),
    };

    objective.tasks.push(taskDef);
    objective.updatedAt = new Date();
    logger.info('Task added', { objectiveId, taskId: taskDef.id, title: taskDef.title });
    return taskDef;
  }

  getObjectiveProgress(objectiveId: string): number {
    const objective = this.objectives.get(objectiveId);
    if (!objective || objective.tasks.length === 0) return 0;

    const completed = objective.tasks.filter((t) => t.status === 'completed').length;
    return completed / objective.tasks.length;
  }

  updateTaskStatus(objectiveId: string, taskId: string, status: TaskDefinition['status']): void {
    const objective = this.objectives.get(objectiveId);
    if (!objective) return;

    const task = objective.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') task.completedAt = new Date();
      objective.progress = this.getObjectiveProgress(objectiveId);
      objective.updatedAt = new Date();
    }
  }

  getObjective(objectiveId: string): Objective | undefined {
    return this.objectives.get(objectiveId);
  }

  listObjectives(): Objective[] {
    return Array.from(this.objectives.values());
  }
}
