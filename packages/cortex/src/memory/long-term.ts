import { logger } from '@eaf/core';
import type { MemoryEntry, MemoryQuery, MemorySearchResult } from '@eaf/core';

/**
 * Long-term memory backed by Markdown files and optionally PostgreSQL.
 * In-memory implementation for now; persistence hooks for DB integration.
 */
export class LongTermMemory {
  private entries: Map<string, MemoryEntry> = new Map();

  async add(entry: MemoryEntry): Promise<void> {
    this.entries.set(entry.id, entry);
    logger.debug('Long-term memory stored', {
      id: entry.id,
      agentId: entry.agentId,
      type: entry.type,
    });
  }

  async search(query: MemoryQuery): Promise<MemorySearchResult[]> {
    const results: MemorySearchResult[] = [];
    const queryLower = query.query.toLowerCase();

    for (const entry of this.entries.values()) {
      if (query.agentId && entry.agentId !== query.agentId) continue;
      if (query.type && entry.type !== query.type) continue;
      if (query.minImportance && entry.importance < query.minImportance) continue;

      const contentLower = entry.content.toLowerCase();
      if (contentLower.includes(queryLower)) {
        const score = entry.importance * 0.5 + 0.5;
        results.push({ entry, score, matchType: 'keyword' });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.limit || 10);
  }

  async get(id: string): Promise<MemoryEntry | null> {
    return this.entries.get(id) || null;
  }

  async update(id: string, content: string): Promise<void> {
    const entry = this.entries.get(id);
    if (entry) {
      entry.content = content;
      entry.lastAccessedAt = new Date();
    }
  }

  async count(agentId: string): Promise<number> {
    return Array.from(this.entries.values()).filter((e) => e.agentId === agentId).length;
  }

  async delete(id: string): Promise<void> {
    this.entries.delete(id);
  }

  async clear(agentId: string): Promise<void> {
    for (const [id, entry] of this.entries) {
      if (entry.agentId === agentId) {
        this.entries.delete(id);
      }
    }
  }

  async getAll(agentId: string): Promise<MemoryEntry[]> {
    return Array.from(this.entries.values())
      .filter((e) => e.agentId === agentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
