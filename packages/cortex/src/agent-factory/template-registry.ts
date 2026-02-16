import { logger } from '@eaf/core';
import type { AgentTemplate } from '@eaf/core';
import { TemplateParser } from './template-parser.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class TemplateRegistry {
  private templates: Map<string, AgentTemplate> = new Map();
  private versions: Map<string, AgentTemplate[]> = new Map();
  private parser: TemplateParser;

  constructor() {
    this.parser = new TemplateParser();
  }

  register(template: AgentTemplate): void {
    const key = template.metadata.name;
    this.templates.set(key, template);

    // Track versions
    if (!this.versions.has(key)) {
      this.versions.set(key, []);
    }
    this.versions.get(key)!.push(template);

    logger.info('Template registered', {
      name: key,
      version: template.metadata.version,
    });
  }

  get(name: string): AgentTemplate | undefined {
    return this.templates.get(name);
  }

  list(): string[] {
    return Array.from(this.templates.keys());
  }

  listAll(): AgentTemplate[] {
    return Array.from(this.templates.values());
  }

  getVersions(name: string): AgentTemplate[] {
    return this.versions.get(name) || [];
  }

  unregister(name: string): boolean {
    const existed = this.templates.delete(name);
    this.versions.delete(name);
    return existed;
  }

  async loadFromDirectory(dirPath: string): Promise<number> {
    let count = 0;
    try {
      const entries = await fs.readdir(dirPath);
      for (const entry of entries) {
        if (entry.endsWith('.yaml') || entry.endsWith('.yml') || entry.endsWith('.json')) {
          const filePath = path.join(dirPath, entry);
          const content = await fs.readFile(filePath, 'utf-8');
          try {
            const template = this.parser.parse(content);
            this.register(template);
            count++;
          } catch (error) {
            logger.warn(`Failed to parse template: ${entry}`, {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to load templates from directory: ${dirPath}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return count;
  }
}
