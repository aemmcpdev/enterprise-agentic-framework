import type { Tool, Policy } from '@eaf/core';
import type { ModelProvider } from '@eaf/cortex';

export interface EAFConfig {
  /** Application name */
  appName?: string;

  /** Model providers to register */
  providers?: ModelProvider[];

  /** Tools to make available to agents */
  tools?: Tool[];

  /** Governance policies */
  policies?: Policy[];

  /** Database connection string (PostgreSQL) */
  databaseUrl?: string;

  /** Redis connection string */
  redisUrl?: string;

  /** Server port for REST API */
  port?: number;

  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /** Enable audit logging */
  auditEnabled?: boolean;

  /** Default model for agents */
  defaultModel?: string;

  /** Maximum concurrent agents */
  maxConcurrentAgents?: number;
}

export function defineConfig(config: EAFConfig): EAFConfig {
  return {
    appName: config.appName ?? 'eaf-app',
    logLevel: config.logLevel ?? 'info',
    auditEnabled: config.auditEnabled ?? true,
    defaultModel: config.defaultModel ?? 'claude-sonnet-4-5-20250929',
    maxConcurrentAgents: config.maxConcurrentAgents ?? 10,
    port: config.port ?? 3000,
    ...config,
  };
}
