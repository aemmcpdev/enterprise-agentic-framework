import type { MemoryEntry, MemoryQuery, MemorySearchResult } from '@eaf/core';

export class ShortTermMemory {
  private entries: Map<string, MemoryEntry> = new Map();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  async add(entry: MemoryEntry): Promise<void> {
    this.entries.set(entry.id, entry);
    this.evictIfNeeded();
  }

  async search(query: MemoryQuery): Promise<MemorySearchResult[]> {
    const results: MemorySearchResult[] = [];
    const queryLower = query.query.toLowerCase();

    for (const entry of this.entries.values()) {
      if (query.agentId && entry.agentId !== query.agentId) continue;
      if (query.type && entry.type !== query.type) continue;
      if (query.minImportance && entry.importance < query.minImportance) continue;
      if (query.timeRange) {
        if (entry.createdAt < query.timeRange.start || entry.createdAt > query.timeRange.end) continue;
      }

      const contentLower = entry.content.toLowerCase();
      if (contentLower.includes(queryLower)) {
        // Simple relevance scoring based on position and frequency
        const firstIndex = contentLower.indexOf(queryLower);
        const occurrences = contentLower.split(queryLower).length - 1;
        const positionScore = 1 - firstIndex / contentLower.length;
        const frequencyScore = Math.min(occurrences / 5, 1);
        const recencyScore = 1 / (1 + (Date.now() - entry.createdAt.getTime()) / 3600000);

        const score = (positionScore * 0.3 + frequencyScore * 0.3 + recencyScore * 0.2 + entry.importance * 0.2);

        results.push({ entry, score, matchType: 'keyword' });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.limit || 10);
  }

  async get(id: string): Promise<MemoryEntry | null> {
    return this.entries.get(id) || null;
  }

  async getBySession(agentId: string, sessionId: string): Promise<MemoryEntry[]> {
    return Array.from(this.entries.values()).filter(
      (e) => e.agentId === agentId && e.metadata.sessionId === sessionId
    );
  }

  async getAll(agentId: string): Promise<MemoryEntry[]> {
    return Array.from(this.entries.values())
      .filter((e) => e.agentId === agentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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

  private evictIfNeeded(): void {
    if (this.entries.size <= this.maxSize) return;

    // Evict least important and oldest entries
    const sorted = Array.from(this.entries.values()).sort((a, b) => {
      const importanceDiff = a.importance - b.importance;
      if (importanceDiff !== 0) return importanceDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const toRemove = sorted.slice(0, this.entries.size - this.maxSize);
    for (const entry of toRemove) {
      this.entries.delete(entry.id);
    }
  }
}
