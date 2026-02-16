# Changelog

All notable changes to the Enterprise Agentic Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-15

### Added

#### Core (@eaf/core)
- Type system for agents, tools, messages, memory, events, policies, hierarchy, and outcomes
- Utility functions: structured logging (Winston), ID generation (nanoid), retry with exponential backoff, serialization
- Token counter for context window management
- Model pricing tables and framework constants

#### CORTEX (@eaf/cortex) — Execution Brain
- **Agent Loop**: Full ReAct pattern implementation with context assembly, model calling, response parsing, tool execution, completion detection, and context window management
- **Model Resolver**: Multi-provider support (Anthropic Claude, OpenAI GPT, Ollama) with automatic failover, API key rotation, and per-call cost tracking
- **Tool Registry**: Tool registration with Zod-based schema validation and sandboxed execution
- **Built-in Tools**: HTTP request, database query, filesystem (read/write/list), shell command, email, Slack, browser navigation
- **Memory Manager**: 3-tier memory system (short-term in-memory, long-term persistent, vector store for semantic search) with automatic compaction
- **Agent Factory**: YAML template-based declarative agent creation with hierarchical config path resolution
- **Lane Queue**: Serial-by-default execution with explicit parallel gates for read-only operations
- **Knowledge Graph**: Entity-relationship graph with ingestion connectors (GitHub, filesystem), hybrid search, and embedding support

#### NEXUS (@eaf/nexus) — Nervous System
- **Hierarchy Manager**: Strategic > Supervisor > Task agent hierarchy with registration, delegation rules, and escalation
- **Orchestration**: Vertical (goal decomposition) and horizontal (cross-functional) orchestration patterns, work routing, load balancing
- **Human-in-the-Loop**: Approval gates, guidance channels, real-time intervention (pause/stop/redirect/override), feedback capture with ratings, notification system
- **Communication Bus**: Typed event bus for agent-to-agent messaging, structured findings with confidence levels, knowledge propagation
- **Channel Adapters**: Web and API channel adapters with message normalization

#### AEGIS (@eaf/aegis) — Immune System
- **Policy Engine**: Runtime policy enforcement with condition evaluation (eq, ne, gt, lt, in, contains, matches, exists), scope matching, priority ordering
- **Policy Types**: Data privacy (PII protection), financial (budget limits), authority (role boundaries), communication (external message approval)
- **Audit Logger**: SHA-256 hash-chained immutable audit trail with integrity verification
- **RBAC**: Role-based access control with wildcard permission matching
- **Credential Vault**: AES-256-GCM encrypted credential storage with scrypt key derivation
- **Tenant Isolation**: Multi-team/department data separation
- **Security**: Input sanitization (XSS, SQL injection), generic encryption service
- **Learning**: Per-agent learning from success/failure patterns, cross-agent knowledge sharing, feedback loops
- **Monitoring**: Bias detection (distribution deviation), anomaly detection (statistical), cost monitoring with budget alerts, heartbeat health checks

#### COMMAND AI (@eaf/command-ai) — Mission Control
- **Outcome Engine**: Baseline recording, measurement collection, delta calculation, attribution scoring, ROI calculation with payback period, narrative generation, trend analysis
- **Dashboards**: Hierarchical executive views (CEO, VP, Director, Team Lead, Agent Detail)
- **Network Designer**: Agent network design tool with workload simulation and capacity recommendations
- **Alert System**: Alert engine with configurable rules, multi-channel delivery (email, Slack, webhook), escalation management
- **API Layer**: REST route builder and WebSocket real-time update manager

#### SDK (@eaf/sdk)
- Fluent builder API for client construction
- Configuration helpers with `defineConfig()`
- Re-exported common types for convenience

#### Server (@eaf/server)
- Fastify REST API with CORS support
- Routes: health, agents (CRUD), tasks (submit/list/status), dashboard, alerts
- WebSocket gateway with event subscriptions
- Application context with all service instances

#### CLI (@eaf/cli)
- `eaf init` — Initialize new EAF project with templates
- `eaf agent create/list/info` — Manage agent definitions
- `eaf run` — Start the EAF server
- `eaf status` — Check running instance status
- `eaf deploy` — Deploy agents to server

#### Dashboard (@eaf/dashboard)
- Next.js 14 App Router with Tailwind CSS
- Pages: Dashboard (home), Agents, Alerts
- Components: Sidebar, Stats Grid, Agent List, Alert Panel, Activity Feed
- API client for server communication

#### Infrastructure
- Docker Compose with PostgreSQL (pgvector), Redis, Server, Dashboard
- Database init script with tables for agents, tasks, audit log, memory, policies, metrics
- Multi-stage Dockerfiles for server and dashboard

#### Templates & Examples
- Agent templates: research-agent, code-reviewer, data-analyst, supervisor
- Policy templates: default governance (budget, communication, SQL, filesystem, rate limiting)
- Examples: basic agent, multi-agent team, governance setup
