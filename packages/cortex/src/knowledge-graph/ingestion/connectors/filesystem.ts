import * as fs from 'fs/promises';
import * as path from 'path';
import type { RawDocument } from '../ingestor.js';
import { BaseConnector } from '../ingestor.js';

export class FilesystemConnector extends BaseConnector {
  readonly type = 'filesystem';
  private rootPath?: string;
  private extensions: string[] = ['.md', '.txt', '.json', '.yaml', '.yml'];

  async connect(config: Record<string, unknown>): Promise<void> {
    this.rootPath = config.path as string;
    if (config.extensions) {
      this.extensions = config.extensions as string[];
    }
  }

  async fetch(): Promise<RawDocument[]> {
    if (!this.rootPath) return [];
    const docs: RawDocument[] = [];
    await this.walkDirectory(this.rootPath, docs);
    return docs;
  }

  private async walkDirectory(dirPath: string, docs: RawDocument[]): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.walkDirectory(fullPath, docs);
        } else if (entry.isFile() && this.extensions.some((ext) => entry.name.endsWith(ext))) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            docs.push({
              id: `fs-${fullPath.replace(/[\\/]/g, '-')}`,
              title: entry.name,
              content: content.substring(0, 10000),
              type: 'document',
              source: `filesystem:${fullPath}`,
              metadata: { path: fullPath, extension: path.extname(entry.name) },
            });
          } catch {
            // Skip unreadable files
          }
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  async disconnect(): Promise<void> {}
}
