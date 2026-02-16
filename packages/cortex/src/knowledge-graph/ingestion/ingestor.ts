import { logger } from '@eaf/core';
import type { KnowledgeEntry, EntityType } from '@eaf/core';
import { KnowledgeGraph } from '../graph.js';

export interface DataSource {
  type: string;
  name: string;
  config: Record<string, unknown>;
}

export interface IngestResult {
  entitiesCreated: number;
  relationshipsCreated: number;
  errors: string[];
  duration: number;
}

export abstract class BaseConnector {
  abstract readonly type: string;
  abstract connect(config: Record<string, unknown>): Promise<void>;
  abstract fetch(): Promise<RawDocument[]>;
  abstract disconnect(): Promise<void>;
}

export interface RawDocument {
  id: string;
  title: string;
  content: string;
  type: EntityType;
  source: string;
  metadata: Record<string, unknown>;
  relationships?: { targetId: string; type: string }[];
}

export class KnowledgeIngestor {
  private graph: KnowledgeGraph;
  private connectors: Map<string, BaseConnector> = new Map();

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
  }

  registerConnector(connector: BaseConnector): void {
    this.connectors.set(connector.type, connector);
    logger.info('Knowledge connector registered', { type: connector.type });
  }

  async ingest(source: DataSource): Promise<IngestResult> {
    const startTime = Date.now();
    const connector = this.connectors.get(source.type);

    if (!connector) {
      return {
        entitiesCreated: 0,
        relationshipsCreated: 0,
        errors: [`No connector for source type: ${source.type}`],
        duration: Date.now() - startTime,
      };
    }

    const errors: string[] = [];
    let entitiesCreated = 0;
    let relationshipsCreated = 0;

    try {
      await connector.connect(source.config);
      const documents = await connector.fetch();

      for (const doc of documents) {
        try {
          await this.graph.addEntity({
            entityType: doc.type,
            name: doc.title,
            content: doc.content,
            source: doc.source,
            confidence: 0.8,
          });
          entitiesCreated++;
        } catch (error) {
          errors.push(`Failed to ingest ${doc.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      await connector.disconnect();
    } catch (error) {
      errors.push(`Connector error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const result: IngestResult = { entitiesCreated, relationshipsCreated, errors, duration: Date.now() - startTime };
    logger.info('Knowledge ingestion complete', result);
    return result;
  }
}
