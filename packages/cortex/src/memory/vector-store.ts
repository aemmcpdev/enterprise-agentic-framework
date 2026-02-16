import { logger } from '@eaf/core';
import type { MemoryEntry, MemorySearchResult } from '@eaf/core';

/**
 * Vector store for semantic search.
 * In-memory cosine similarity implementation.
 * In production, use pgvector or Qdrant.
 */
export class VectorStore {
  private entries: Map<string, { entry: MemoryEntry; embedding: number[] }> = new Map();

  async index(entry: MemoryEntry): Promise<void> {
    // Generate a simple bag-of-words embedding (placeholder)
    const embedding = entry.embedding || this.simpleEmbed(entry.content);
    this.entries.set(entry.id, { entry, embedding });
  }

  async search(query: string, topK = 10, agentId?: string): Promise<MemorySearchResult[]> {
    const queryEmbedding = this.simpleEmbed(query);
    const results: MemorySearchResult[] = [];

    for (const { entry, embedding } of this.entries.values()) {
      if (agentId && entry.agentId !== agentId) continue;

      const score = this.cosineSimilarity(queryEmbedding, embedding);
      if (score > 0.1) {
        results.push({ entry, score, matchType: 'semantic' });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async count(agentId: string): Promise<number> {
    let count = 0;
    for (const { entry } of this.entries.values()) {
      if (entry.agentId === agentId) count++;
    }
    return count;
  }

  async remove(id: string): Promise<void> {
    this.entries.delete(id);
  }

  /**
   * Simple bag-of-words embedding (placeholder).
   * In production, use OpenAI ada-002 or sentence-transformers.
   */
  private simpleEmbed(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);
    const vocab = new Map<string, number>();
    let idx = 0;

    for (const word of words) {
      if (!vocab.has(word)) {
        vocab.set(word, idx++);
      }
    }

    // Create a fixed-size embedding using hash-based feature hashing
    const dimensions = 128;
    const embedding = new Array(dimensions).fill(0);

    for (const word of words) {
      const hash = this.hashString(word);
      const index = Math.abs(hash) % dimensions;
      embedding[index] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const minLen = Math.min(a.length, b.length);
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < minLen; i++) {
      dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
      magnitudeA += (a[i] ?? 0) * (a[i] ?? 0);
      magnitudeB += (b[i] ?? 0) * (b[i] ?? 0);
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }
}
