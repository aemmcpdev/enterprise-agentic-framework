-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  system_prompt TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  agent_id TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  hash TEXT NOT NULL,
  previous_hash TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_agent ON audit_log(agent_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- Memory entries table
CREATE TABLE IF NOT EXISTS memory_entries (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_agent ON memory_entries(agent_id);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  scope JSONB NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  action TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT,
  metric_name TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  tags JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metrics_agent ON metrics(agent_id);
CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
