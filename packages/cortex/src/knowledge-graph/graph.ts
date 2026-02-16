import { logger, generateMemoryId } from '@eaf/core';
import type { KnowledgeEntry, EntityType, Relationship } from '@eaf/core';

export interface SearchOptions {
  limit?: number;
  entityType?: EntityType;
  minConfidence?: number;
}

export class KnowledgeGraph {
  private entities: Map<string, KnowledgeEntry> = new Map();
  private relationships: Relationship[] = [];

  async addEntity(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'embedding'>): Promise<string> {
    const id = generateMemoryId();
    const full: KnowledgeEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      embedding: [],
    };
    this.entities.set(id, full);
    logger.debug('Entity added to knowledge graph', { id, type: entry.entityType, name: entry.name });
    return id;
  }

  getEntity(id: string): KnowledgeEntry | undefined {
    return this.entities.get(id);
  }

  removeEntity(id: string): boolean {
    this.relationships = this.relationships.filter(
      (r) => r.sourceId !== id && r.targetId !== id
    );
    return this.entities.delete(id);
  }

  addRelationship(relationship: Omit<Relationship, 'id'>): string {
    const id = generateMemoryId();
    const full: Relationship = { ...relationship, id };
    this.relationships.push(full);
    return id;
  }

  getRelationships(entityId: string): Relationship[] {
    return this.relationships.filter(
      (r) => r.sourceId === entityId || r.targetId === entityId
    );
  }

  search(query: string, options: SearchOptions = {}): KnowledgeEntry[] {
    const limit = options.limit || 10;
    const queryLower = query.toLowerCase();

    let results = Array.from(this.entities.values());

    if (options.entityType) {
      results = results.filter((e) => e.entityType === options.entityType);
    }

    if (options.minConfidence) {
      results = results.filter((e) => e.confidence >= options.minConfidence!);
    }

    // Simple keyword search with scoring
    const scored = results.map((entry) => {
      const nameMatch = entry.name.toLowerCase().includes(queryLower) ? 3 : 0;
      const contentMatch = entry.content.toLowerCase().includes(queryLower) ? 1 : 0;
      return { entry, score: nameMatch + contentMatch };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.entry);
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  getRelationshipCount(): number {
    return this.relationships.length;
  }

  getAllEntities(): KnowledgeEntry[] {
    return Array.from(this.entities.values());
  }
}
