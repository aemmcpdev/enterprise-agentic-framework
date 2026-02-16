export type MemoryType = 'short_term' | 'long_term' | 'episodic' | 'semantic';

export interface MemoryEntry {
  id: string;
  agentId: string;
  type: MemoryType;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  importance: number;
  accessCount: number;
  lastAccessedAt: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface MemoryQuery {
  agentId?: string;
  query: string;
  type?: MemoryType;
  limit?: number;
  minImportance?: number;
  timeRange?: { start: Date; end: Date };
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  score: number;
  matchType: 'exact' | 'semantic' | 'keyword';
}

export interface KnowledgeEntry {
  id: string;
  entityType: EntityType;
  name: string;
  content: string;
  embedding?: number[];
  relationships: Relationship[];
  source: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EntityType =
  | 'project'
  | 'person'
  | 'document'
  | 'decision'
  | 'process'
  | 'system'
  | 'metric'
  | 'incident';

export interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: RelationshipType;
  metadata?: Record<string, unknown>;
  weight: number;
}

export type RelationshipType =
  | 'owns'
  | 'belongs_to'
  | 'depends_on'
  | 'related_to'
  | 'decided_by'
  | 'affects'
  | 'produced_by'
  | 'blocked_by'
  | 'caused_by'
  | 'resolved_by';

export interface EmbeddingConfig {
  provider: 'openai' | 'local';
  model: string;
  dimensions: number;
}
