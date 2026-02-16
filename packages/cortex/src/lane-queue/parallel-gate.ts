import { logger } from '@eaf/core';

/**
 * Controls parallel execution for safe (read-only) operations.
 * Default is serial execution; parallel must be explicitly opted into.
 */
export class ParallelGate {
  private activeTasks: Map<string, number> = new Map();
  private maxParallel: number;

  constructor(maxParallel = 5) {
    this.maxParallel = maxParallel;
  }

  canExecuteParallel(laneId: string): boolean {
    const active = this.activeTasks.get(laneId) || 0;
    return active < this.maxParallel;
  }

  acquire(laneId: string): boolean {
    const active = this.activeTasks.get(laneId) || 0;
    if (active >= this.maxParallel) {
      return false;
    }
    this.activeTasks.set(laneId, active + 1);
    return true;
  }

  release(laneId: string): void {
    const active = this.activeTasks.get(laneId) || 0;
    this.activeTasks.set(laneId, Math.max(0, active - 1));
  }

  getActiveCount(laneId: string): number {
    return this.activeTasks.get(laneId) || 0;
  }

  /** Tools that are safe to execute in parallel (read-only) */
  static readonly SAFE_PARALLEL_TOOLS = new Set([
    'read_file',
    'list_directory',
    'http_request', // GET only
    'search_kb',
    'web_search',
    'database_query', // SELECT only
    'calculator',
  ]);

  isSafeForParallel(toolName: string, params: Record<string, unknown>): boolean {
    if (!ParallelGate.SAFE_PARALLEL_TOOLS.has(toolName)) {
      return false;
    }

    // HTTP is only safe for GET
    if (toolName === 'http_request' && params.method !== 'GET') {
      return false;
    }

    // Database is only safe for SELECT
    if (toolName === 'database_query') {
      const query = (params.query as string || '').trim().toUpperCase();
      if (!query.startsWith('SELECT')) return false;
    }

    return true;
  }
}
