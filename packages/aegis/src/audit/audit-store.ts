import type { AuditEntry } from '@eaf/core';

export class AuditStore {
  private entries: AuditEntry[] = [];

  save(entry: AuditEntry): void {
    this.entries.push(entry);
  }

  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  getByAgent(agentId: string): AuditEntry[] {
    return this.entries.filter((e) => e.agentId === agentId);
  }

  getByAction(action: string): AuditEntry[] {
    return this.entries.filter((e) => e.action === action);
  }

  getByTimeRange(start: Date, end: Date): AuditEntry[] {
    return this.entries.filter((e) => e.timestamp >= start && e.timestamp <= end);
  }

  count(): number {
    return this.entries.length;
  }
}
