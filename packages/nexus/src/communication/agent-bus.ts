import { logger, generateEventId } from '@eaf/core';
import type { EAFEvent } from '@eaf/core';

export type EventHandler = (event: EAFEvent) => void | Promise<void>;

export class AgentBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private allHandlers: EventHandler[] = [];
  private eventLog: EAFEvent[] = [];

  on(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  onAll(handler: EventHandler): void {
    this.allHandlers.push(handler);
  }

  async emit(event: Omit<EAFEvent, 'id' | 'timestamp'>): Promise<void> {
    const full: EAFEvent = {
      ...event,
      id: generateEventId(),
      timestamp: new Date(),
    } as EAFEvent;

    this.eventLog.push(full);

    const typeHandlers = this.handlers.get(event.type) || [];
    const allPromises = [
      ...typeHandlers.map((h) => Promise.resolve(h(full))),
      ...this.allHandlers.map((h) => Promise.resolve(h(full))),
    ];

    await Promise.allSettled(allPromises);
  }

  getEventLog(limit = 100): EAFEvent[] {
    return this.eventLog.slice(-limit);
  }

  getEventsByType(type: string): EAFEvent[] {
    return this.eventLog.filter((e) => e.type === type);
  }

  clearLog(): void {
    this.eventLog = [];
  }
}
