export const EAF_VERSION = '0.1.0';
export const API_VERSION = 'v1';

export const DEFAULT_MAX_ITERATIONS = 50;
export const DEFAULT_MAX_TOKENS = 128000;
export const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
export const DEFAULT_PROVIDER = 'anthropic';

export const CONTEXT_COMPACTION_THRESHOLD = 0.8; // Compact at 80% utilization
export const MEMORY_SHORT_TERM_MAX = 100;
export const MEMORY_COMPACTION_THRESHOLD = 50;

export const LANE_QUEUE_MAX_SIZE = 1000;
export const LANE_QUEUE_DEFAULT_PRIORITY = 5;

export const AUDIT_HASH_ALGORITHM = 'sha256';
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

export const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
export const APPROVAL_TIMEOUT_MS = 3600000; // 1 hour

export const HTTP_TIMEOUT_MS = 30000;
export const MAX_RETRY_ATTEMPTS = 3;
export const KEY_COOLING_PERIOD_MS = 60000; // 1 minute

export const COST_PER_1K_INPUT: Record<string, number> = {
  'claude-sonnet-4-20250514': 0.003,
  'claude-opus-4-5-20250918': 0.015,
  'claude-haiku-4-5-20251001': 0.00025,
  'gpt-4o': 0.005,
  'gpt-4o-mini': 0.00015,
  'gemini-1.5-pro': 0.00125,
  'gemini-1.5-flash': 0.000075,
};

export const COST_PER_1K_OUTPUT: Record<string, number> = {
  'claude-sonnet-4-20250514': 0.015,
  'claude-opus-4-5-20250918': 0.075,
  'claude-haiku-4-5-20251001': 0.00125,
  'gpt-4o': 0.015,
  'gpt-4o-mini': 0.0006,
  'gemini-1.5-pro': 0.005,
  'gemini-1.5-flash': 0.0003,
};
