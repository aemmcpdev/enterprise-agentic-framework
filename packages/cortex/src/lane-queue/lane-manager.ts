import { logger, generateId } from '@eaf/core';
import { LaneQueue, QueuedTask, TaskExecutor } from './queue.js';

export interface Lane {
  id: string;
  agentId: string;
  sessionId: string;
  createdAt: Date;
  status: 'active' | 'paused' | 'closed';
}

export class LaneManager {
  private lanes: Map<string, Lane> = new Map();
  private queue: LaneQueue;

  constructor(executor: TaskExecutor) {
    this.queue = new LaneQueue(executor);
  }

  createLane(agentId: string, sessionId: string): Lane {
    const lane: Lane = {
      id: generateId('lane'),
      agentId,
      sessionId,
      createdAt: new Date(),
      status: 'active',
    };

    this.lanes.set(lane.id, lane);
    logger.info('Lane created', { laneId: lane.id, agentId, sessionId });
    return lane;
  }

  submitTask(
    laneId: string,
    task: string,
    options?: { priority?: number; parallel?: boolean }
  ): string {
    const lane = this.lanes.get(laneId);
    if (!lane) throw new Error(`Lane not found: ${laneId}`);
    if (lane.status !== 'active') throw new Error(`Lane is ${lane.status}: ${laneId}`);

    return this.queue.submit(laneId, lane.agentId, task, options);
  }

  pauseLane(laneId: string): void {
    const lane = this.lanes.get(laneId);
    if (lane) {
      lane.status = 'paused';
      this.queue.interrupt(laneId, 'Lane paused');
    }
  }

  resumeLane(laneId: string): void {
    const lane = this.lanes.get(laneId);
    if (lane) {
      lane.status = 'active';
    }
  }

  closeLane(laneId: string): void {
    const lane = this.lanes.get(laneId);
    if (lane) {
      lane.status = 'closed';
      this.queue.interrupt(laneId, 'Lane closed');
      logger.info('Lane closed', { laneId: lane.id });
    }
  }

  getLane(laneId: string): Lane | undefined {
    return this.lanes.get(laneId);
  }

  getActiveLanes(): Lane[] {
    return Array.from(this.lanes.values()).filter((l) => l.status === 'active');
  }

  getLaneStatus(laneId: string) {
    return this.queue.getStatus(laneId);
  }
}
