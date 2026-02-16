import { logger } from '@eaf/core';

/**
 * Hierarchical configuration path: Corp → Region → Department → Team
 * Allows organizations to override agent configs at any level.
 */
export interface ConfigPathSegment {
  level: 'corp' | 'region' | 'department' | 'team' | 'agent';
  name: string;
  overrides: Record<string, unknown>;
}

export class ConfigPath {
  private segments: ConfigPathSegment[] = [];

  addSegment(segment: ConfigPathSegment): void {
    this.segments.push(segment);
  }

  resolve(baseConfig: Record<string, unknown>): Record<string, unknown> {
    let resolved = { ...baseConfig };

    // Apply overrides from most general to most specific
    const order: ConfigPathSegment['level'][] = ['corp', 'region', 'department', 'team', 'agent'];

    for (const level of order) {
      const segment = this.segments.find((s) => s.level === level);
      if (segment) {
        resolved = this.deepMerge(resolved, segment.overrides);
        logger.debug(`Config override applied`, { level, name: segment.name });
      }
    }

    return resolved;
  }

  getPath(): string {
    return this.segments.map((s) => `${s.level}:${s.name}`).join('/');
  }

  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const sourceVal = source[key];
      const targetVal = result[key];
      if (
        sourceVal &&
        typeof sourceVal === 'object' &&
        !Array.isArray(sourceVal) &&
        targetVal &&
        typeof targetVal === 'object' &&
        !Array.isArray(targetVal)
      ) {
        result[key] = this.deepMerge(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>
        );
      } else {
        result[key] = sourceVal;
      }
    }
    return result;
  }
}
