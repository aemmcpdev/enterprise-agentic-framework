import type { KnowledgeEntry } from '@eaf/core';
import type { SearchOptions } from './graph.js';
import { KnowledgeGraph } from './graph.js';

export interface HybridSearchOptions extends SearchOptions {
  vectorWeight?: number;
  keywordWeight?: number;
}

export class HybridSearch {
  private graph: KnowledgeGraph;

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
  }

  async search(query: string, options: HybridSearchOptions = {}): Promise<KnowledgeEntry[]> {
    return this.graph.search(query, options);
  }
}
