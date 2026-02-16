import { logger, generateId, LANE_QUEUE_DEFAULT_PRIORITY } from '@eaf/core';

export interface QueuedTask {
  id: string;
  laneId: string;
  agentId: string;
  task: string;
  priority: number;
  parallel: boolean;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: unknown;
  error?: string;
}

export type TaskExecutor = (task: QueuedTask) => Promise<unknown>;

export class LaneQueue {
  private queues: Map<string, QueuedTask[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private executor: TaskExecutor;

  constructor(executor: TaskExecutor) {
    this.executor = executor;
  }

  submit(
    laneId: string,
    agentId: string,
    task: string,
    options: { priority?: number; parallel?: boolean } = {}
  ): string {
    const queuedTask: QueuedTask = {
      id: generateId('qtsk'),
      laneId,
      agentId,
      task,
      priority: options.priority ?? LANE_QUEUE_DEFAULT_PRIORITY,
      parallel: options.parallel ?? false,
      queuedAt: new Date(),
      status: 'queued',
    };

    if (!this.queues.has(laneId)) {
      this.queues.set(laneId, []);
    }

    const queue = this.queues.get(laneId)!;
    queue.push(queuedTask);

    // Sort by priority (higher = first)
    queue.sort((a, b) => b.priority - a.priority);

    logger.info('Task queued', {
      taskId: queuedTask.id,
      laneId,
      agentId,
      priority: queuedTask.priority,
      queueSize: queue.length,
    });

    // Start processing if not already running
    if (!this.processing.get(laneId)) {
      this.processLane(laneId);
    }

    return queuedTask.id;
  }

  private async processLane(laneId: string): Promise<void> {
    this.processing.set(laneId, true);
    const queue = this.queues.get(laneId);

    while (queue && queue.length > 0) {
      const task = queue[0]!;

      // Skip cancelled tasks
      if (task.status === 'cancelled') {
        queue.shift();
        continue;
      }

      task.status = 'running';
      task.startedAt = new Date();

      try {
        const result = await this.executor(task);
        task.status = 'completed';
        task.result = result;
        task.completedAt = new Date();

        logger.info('Lane task completed', {
          taskId: task.id,
          laneId,
          duration: task.completedAt.getTime() - task.startedAt.getTime(),
        });
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : String(error);
        task.completedAt = new Date();

        logger.error('Lane task failed', {
          taskId: task.id,
          laneId,
          error: task.error,
        });
      }

      queue.shift();
    }

    this.processing.set(laneId, false);
  }

  interrupt(laneId: string, reason: string): void {
    logger.info('Lane interrupted', { laneId, reason });
    const queue = this.queues.get(laneId);
    if (queue) {
      for (const task of queue) {
        if (task.status === 'queued') {
          task.status = 'cancelled';
        }
      }
    }
  }

  prioritize(laneId: string, taskId: string): boolean {
    const queue = this.queues.get(laneId);
    if (!queue) return false;

    const taskIndex = queue.findIndex((t) => t.id === taskId);
    if (taskIndex <= 0) return false;

    const task = queue[taskIndex]!;
    task.priority = 999; // Max priority
    queue.sort((a, b) => b.priority - a.priority);

    logger.info('Task prioritized', { taskId, laneId });
    return true;
  }

  getStatus(laneId: string): {
    queueSize: number;
    processing: boolean;
    currentTask?: QueuedTask;
    pendingTasks: number;
  } {
    const queue = this.queues.get(laneId) || [];
    return {
      queueSize: queue.length,
      processing: this.processing.get(laneId) || false,
      currentTask: queue.find((t) => t.status === 'running'),
      pendingTasks: queue.filter((t) => t.status === 'queued').length,
    };
  }

  getAllLaneStatuses(): Map<string, ReturnType<LaneQueue['getStatus']>> {
    const statuses = new Map<string, ReturnType<LaneQueue['getStatus']>>();
    for (const laneId of this.queues.keys()) {
      statuses.set(laneId, this.getStatus(laneId));
    }
    return statuses;
  }
}
