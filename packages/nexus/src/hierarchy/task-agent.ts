import { logger } from '@eaf/core';
import type { TaskDefinition } from '@eaf/core';

export interface TaskExecutionResult {
  taskId: string;
  success: boolean;
  output: Record<string, unknown>;
  error?: string;
  duration: number;
}

export class TaskAgent {
  private currentTask: TaskDefinition | null = null;

  assignTask(task: TaskDefinition): void {
    this.currentTask = task;
    task.status = 'in_progress';
    logger.info('Task assigned to agent', { taskId: task.id, title: task.title });
  }

  getCurrentTask(): TaskDefinition | null {
    return this.currentTask;
  }

  completeTask(output: Record<string, unknown>): TaskExecutionResult {
    if (!this.currentTask) throw new Error('No task assigned');

    this.currentTask.status = 'completed';
    this.currentTask.output = output;
    this.currentTask.completedAt = new Date();

    const result: TaskExecutionResult = {
      taskId: this.currentTask.id,
      success: true,
      output,
      duration: Date.now() - this.currentTask.createdAt.getTime(),
    };

    logger.info('Task completed', { taskId: result.taskId, duration: result.duration });
    this.currentTask = null;
    return result;
  }

  failTask(error: string): TaskExecutionResult {
    if (!this.currentTask) throw new Error('No task assigned');

    this.currentTask.status = 'failed';

    const result: TaskExecutionResult = {
      taskId: this.currentTask.id,
      success: false,
      output: {},
      error,
      duration: Date.now() - this.currentTask.createdAt.getTime(),
    };

    logger.error('Task failed', { taskId: result.taskId, error });
    this.currentTask = null;
    return result;
  }
}
