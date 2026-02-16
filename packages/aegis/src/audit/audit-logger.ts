import { createHash } from 'crypto';
import { logger, generateAuditId } from '@eaf/core';
import type { AuditEntry } from '@eaf/core';

export class AuditLogger {
  private entries: AuditEntry[] = [];
  private lastHash = '';

  log(agentId: string, action: string, details: Record<string, unknown>, outcome: 'success' | 'failure' | 'blocked' = 'success'): AuditEntry {
    const entry: AuditEntry = {
      id: generateAuditId(),
      timestamp: new Date(),
      agentId,
      action,
      details,
      outcome,
      previousHash: this.lastHash,
      hash: '',
    };

    entry.hash = this.computeHash(entry);
    this.lastHash = entry.hash;
    this.entries.push(entry);

    logger.debug('Audit entry recorded', { id: entry.id, agentId, action, outcome });
    return entry;
  }

  private computeHash(entry: AuditEntry): string {
    const data = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      agentId: entry.agentId,
      action: entry.action,
      details: entry.details,
      outcome: entry.outcome,
      previousHash: entry.previousHash,
    });
    return createHash('sha256').update(data).digest('hex');
  }

  verifyIntegrity(): boolean {
    let previousHash = '';
    for (const entry of this.entries) {
      if (entry.previousHash !== previousHash) return false;
      const expected = this.computeHash({ ...entry, hash: '' });
      if (entry.hash !== expected) return false;
      previousHash = entry.hash;
    }
    return true;
  }

  getEntries(filter?: { agentId?: string; action?: string; limit?: number }): AuditEntry[] {
    let results = [...this.entries];
    if (filter?.agentId) results = results.filter((e) => e.agentId === filter.agentId);
    if (filter?.action) results = results.filter((e) => e.action === filter.action);
    if (filter?.limit) results = results.slice(-filter.limit);
    return results;
  }

  getEntryCount(): number {
    return this.entries.length;
  }
}
