import { logger, generateMemoryId } from '@eaf/core';
import type { MemoryEntry, MemoryQuery, MemorySearchResult, MemoryType } from '@eaf/core';
import { ShortTermMemory } from './short-term.js';
import { LongTermMemory } from './long-term.js';
import { VectorStore } from './vector-store.js';
import { ContextCompactor } from './compaction.js';

export interface MemoryManagerConfig {
  shortTermMaxEntries: number;
  longTermEnabled: boolean;
  vectorSearchEnabled: boolean;
  compactionThreshold: number;
  databaseUrl?: string;
}

const DEFAULT_CONFIG: MemoryManagerConfig = {
  shortTermMaxEntries: 100,
  longTermEnabled: false,
  vectorSearchEnabled: false,
  compactionThreshold: 50,
};

export class MemoryManager {
  private shortTerm: ShortTermMemory;
  private longTerm: LongTermMemory;
  private vectorStore: VectorStore;
  private compactor: ContextCompactor;
  private config: MemoryManagerConfig;

  constructor(config: Partial<MemoryManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.shortTerm = new ShortTermMemory(this.config.shortTermMaxEntries);
    this.longTerm = new LongTermMemory();
    this.vectorStore = new VectorStore();
    this.compactor = new ContextCompactor();
  }

  async remember(
    agentId: string,
    content: string,
    type: MemoryType = 'short_term',
    importance = 0.5,
    metadata: Record<string, unknown> = {}
  ): Promise<string> {
    const entry: MemoryEntry = {
      id: generateMemoryId(),
      agentId,
      type,
      content,
      metadata,
      importance,
      accessCount: 0,
      lastAccessedAt: new Date(),
      createdAt: new Date(),
    };

    switch (type) {
      case 'short_term':
        await this.shortTerm.add(entry);
        break;
      case 'long_term':
        await this.longTerm.add(entry);
        if (this.config.vectorSearchEnabled) {
          await this.vectorStore.index(entry);
        }
        break;
      case 'episodic':
      case 'semantic':
        await this.longTerm.add(entry);
        if (this.config.vectorSearchEnabled) {
          await this.vectorStore.index(entry);
        }
        break;
    }

    logger.debug('Memory stored', {
      id: entry.id,
      agentId,
      type,
      importance,
      contentLength: content.length,
    });

    return entry.id;
  }

  async recall(query: MemoryQuery): Promise<MemorySearchResult[]> {
    const results: MemorySearchResult[] = [];

    // Search short-term memory
    const shortResults = await this.shortTerm.search(query);
    results.push(...shortResults);

    // Search long-term memory
    if (this.config.longTermEnabled) {
      const longResults = await this.longTerm.search(query);
      results.push(...longResults);
    }

    // Vector search for semantic similarity
    if (this.config.vectorSearchEnabled) {
      const vectorResults = await this.vectorStore.search(query.query, query.limit || 10);
      results.push(...vectorResults);
    }

    // Deduplicate and sort by score
    const seen = new Set<string>();
    const unique = results.filter((r) => {
      if (seen.has(r.entry.id)) return false;
      seen.add(r.entry.id);
      return true;
    });

    unique.sort((a, b) => b.score - a.score);

    // Update access counts
    for (const result of unique.slice(0, query.limit || 10)) {
      result.entry.accessCount++;
      result.entry.lastAccessedAt = new Date();
    }

    return unique.slice(0, query.limit || 10);
  }

  async getSessionMemory(agentId: string, sessionId: string): Promise<MemoryEntry[]> {
    return this.shortTerm.getBySession(agentId, sessionId);
  }

  async compact(agentId: string): Promise<string> {
    const entries = await this.shortTerm.getAll(agentId);
    if (entries.length < this.config.compactionThreshold) {
      return '';
    }

    const summary = await this.compactor.compact(entries);

    // Store summary as long-term memory
    await this.remember(agentId, summary, 'long_term', 0.8, {
      compactedFrom: entries.length,
      compactedAt: new Date().toISOString(),
    });

    // Clear compacted short-term entries
    await this.shortTerm.clear(agentId);

    logger.info('Memory compacted', {
      agentId,
      entriesCompacted: entries.length,
      summaryLength: summary.length,
    });

    return summary;
  }

  async forget(agentId: string, type?: MemoryType): Promise<void> {
    if (!type || type === 'short_term') {
      await this.shortTerm.clear(agentId);
    }
    if (!type || type === 'long_term') {
      await this.longTerm.clear(agentId);
    }
    logger.info('Memory cleared', { agentId, type: type || 'all' });
  }

  async getStats(agentId: string): Promise<{
    shortTermCount: number;
    longTermCount: number;
    vectorCount: number;
  }> {
    return {
      shortTermCount: await this.shortTerm.count(agentId),
      longTermCount: await this.longTerm.count(agentId),
      vectorCount: await this.vectorStore.count(agentId),
    };
  }
}
