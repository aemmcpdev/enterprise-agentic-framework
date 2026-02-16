export { EAFClient } from './client.js';
export { EAFBuilder } from './builder.js';
export { defineConfig } from './config.js';
export type { EAFConfig } from './config.js';

// Re-export commonly used types for convenience
export type {
  AgentConfig,
  AgentResult,
  Tool,
  ToolResult,
  Policy,
  EAFEvent,
  AuditEntry,
} from '@eaf/core';
