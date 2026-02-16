import { logger } from '@eaf/core';
import type { KnowledgeIngestor, DataSource } from './ingestor.js';

export interface ScheduledIngestion {
  id: string;
  source: DataSource;
  intervalMs: number;
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
}

export class IngestionScheduler {
  private schedules: Map<string, ScheduledIngestion> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private ingestor: KnowledgeIngestor;

  constructor(ingestor: KnowledgeIngestor) {
    this.ingestor = ingestor;
  }

  schedule(id: string, source: DataSource, intervalMs: number): void {
    const schedule: ScheduledIngestion = {
      id,
      source,
      intervalMs,
      nextRun: new Date(Date.now() + intervalMs),
      enabled: true,
    };
    this.schedules.set(id, schedule);

    const timer = setInterval(async () => {
      if (!schedule.enabled) return;
      schedule.lastRun = new Date();
      schedule.nextRun = new Date(Date.now() + intervalMs);
      logger.info('Running scheduled ingestion', { id, source: source.name });
      await this.ingestor.ingest(source);
    }, intervalMs);

    this.timers.set(id, timer);
    logger.info('Ingestion scheduled', { id, intervalMs });
  }

  unschedule(id: string): void {
    const timer = this.timers.get(id);
    if (timer) clearInterval(timer);
    this.timers.delete(id);
    this.schedules.delete(id);
  }

  pause(id: string): void {
    const schedule = this.schedules.get(id);
    if (schedule) schedule.enabled = false;
  }

  resume(id: string): void {
    const schedule = this.schedules.get(id);
    if (schedule) schedule.enabled = true;
  }

  listSchedules(): ScheduledIngestion[] {
    return Array.from(this.schedules.values());
  }

  stopAll(): void {
    for (const [, timer] of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}
