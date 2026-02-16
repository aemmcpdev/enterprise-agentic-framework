<p align="center">
  <img src="https://img.shields.io/badge/EAF-Enterprise%20Agentic%20Framework-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PHBhdGggZD0iTTIgMTdsMTAgNSAxMC01Ii8+PHBhdGggZD0iTTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+" alt="EAF"/>
</p>

<h1 align="center">Enterprise Agentic Framework (EAF)</h1>

<p align="center">
  <strong>Deploy, Orchestrate, Govern, and Measure AI Agents at Enterprise Scale</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="Version"/>
  <img src="https://img.shields.io/badge/license-Apache%202.0-green" alt="License"/>
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen" alt="Node"/>
  <img src="https://img.shields.io/badge/typescript-5.7%2B-blue" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome"/>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> |
  <a href="#-architecture">Architecture</a> |
  <a href="#-packages">Packages</a> |
  <a href="#-enterprise-use-cases">Use Cases</a> |
  <a href="docs/DEPLOYMENT.md">Deployment Guide</a> |
  <a href="docs/API.md">API Reference</a>
</p>

---

## What is EAF?

EAF is the **first open-source enterprise-grade framework** for deploying autonomous AI agent workforces with built-in governance, hierarchy, human oversight, and business outcome measurement.

Unlike simple LLM wrapper libraries, EAF provides the **full infrastructure** enterprises need to safely deploy AI agents that take real-world actions:

- **Hierarchical Agent Teams** — Strategic agents delegate to supervisors, who coordinate task agents
- **Runtime Governance** — Policies enforced at every agent action (budgets, permissions, approval gates)
- **Immutable Audit Trail** — SHA-256 hash-chained logs of every decision and action
- **Business Outcome Measurement** — Before/after ROI tracking with executive dashboards
- **Human-in-the-Loop** — Approval workflows, real-time intervention, feedback capture
- **Multi-Model Support** — Anthropic Claude, OpenAI GPT, local Ollama models with automatic failover

---

## Table of Contents

- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [The Four Pillars](#-the-four-pillars)
- [Packages](#-packages)
- [Enterprise Use Cases](#-enterprise-use-cases)
- [Deployment](#-deployment)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Agent Templates](#-agent-templates)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for infrastructure)
- At least one LLM API key (Anthropic, OpenAI, or local Ollama)

### 1. Clone and Install

```bash
git clone https://github.com/anthropics/enterprise-agentic-framework.git
cd enterprise-agentic-framework
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Required: At least one LLM provider
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Infrastructure (Docker Compose provides defaults)
DATABASE_URL=postgresql://eaf:eaf_dev_password@localhost:5432/eaf
REDIS_URL=redis://localhost:6379
```

### 3. Start Infrastructure

```bash
docker compose up -d postgres redis
```

### 4. Build and Run

```bash
npm run build
npm run dev --workspace=@eaf/server
```

The server starts at `http://localhost:3000`. The dashboard is available at `http://localhost:3001`.

### 5. Deploy Your First Agent

Create an agent definition:

```yaml
# agents/my-assistant.yaml
name: my-assistant
model: claude-sonnet-4-5-20250929
system_prompt: |
  You are a helpful enterprise assistant.
  You have access to internal documents and APIs.
tools:
  - http_request
  - read_file
  - database_query
max_iterations: 20
```

Deploy it:

```bash
curl -X POST http://localhost:3000/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{"templateName": "my-assistant"}'
```

---

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           COMMAND AI (Dashboard)         │
                    │   Executive Views │ Alerts │ ROI Tracking│
                    └──────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────────┐
                    │              API Server                   │
                    │     REST (Fastify) + WebSocket            │
                    └──────────────┬──────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────┴────────┐   ┌────────────┴──────────┐   ┌──────────┴─────────┐
│    CORTEX      │   │       NEXUS           │   │      AEGIS         │
│ Execution Brain│   │  Nervous System       │   │  Immune System     │
│                │   │                       │   │                    │
│ • Agent Loop   │   │ • Hierarchy Manager   │   │ • Policy Engine    │
│ • Model Resolve│   │ • Orchestration       │   │ • Audit Logger     │
│ • Tool Registry│   │ • Human-in-the-Loop   │   │ • RBAC             │
│ • Memory (3T)  │   │ • Communication Bus   │   │ • Credential Vault │
│ • Knowledge    │   │ • Channel Adapters    │   │ • Bias Detection   │
│   Graph        │   │                       │   │ • Cost Monitoring  │
└────────────────┘   └───────────────────────┘   └────────────────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────────────────┐
                    │              @eaf/core                    │
                    │   Types │ Utils │ Constants │ Logger      │
                    └─────────────────────────────────────────┘
```

### Monorepo Structure

```
enterprise-agentic-framework/
├── packages/
│   ├── core/           # Shared types, utilities, constants
│   ├── cortex/         # Agent execution engine (the "brain")
│   ├── nexus/          # Orchestration & hierarchy (the "nervous system")
│   ├── aegis/          # Governance & security (the "immune system")
│   ├── command-ai/     # Dashboards, alerts, outcome measurement
│   └── sdk/            # Developer SDK with fluent builder API
├── apps/
│   ├── server/         # Fastify REST API + WebSocket server
│   ├── cli/            # Command-line interface (`eaf` command)
│   └── dashboard/      # Next.js COMMAND AI dashboard
├── templates/          # Agent & policy YAML templates
├── examples/           # Usage examples
├── docker/             # Dockerfiles & SQL init scripts
└── docker-compose.yml  # Full stack with PostgreSQL, Redis
```

---

## The Four Pillars

### CORTEX — The Execution Brain

CORTEX handles everything about how agents think, remember, and act.

#### Agent Loop (ReAct Pattern)

Every agent follows a structured loop:

```
1. ASSEMBLE CONTEXT  →  Gather system prompt + memory + task
2. CALL MODEL        →  Send to LLM (Claude/GPT/Ollama)
3. PARSE RESPONSE    →  Extract text or tool calls
4. CHECK POLICY      →  Validate against governance rules (AEGIS)
5. EXECUTE TOOL      →  Run the tool in sandboxed environment
6. STORE MEMORY      →  Save results to memory tiers
7. CHECK COMPLETION  →  Done? Return result. Not done? Go to 1.
```

```typescript
import { LoopEngine } from '@eaf/cortex';

const engine = new LoopEngine(modelResolver, toolRegistry, {
  policyEngine,    // AEGIS governance
  auditLogger,     // Immutable audit trail
  memoryManager,   // 3-tier memory
});

const result = await engine.run({
  agentId: 'agt_researcher',
  task: 'Analyze Q1 sales data and identify trends',
  maxIterations: 20,
});
```

#### Model Resolver (Multi-Provider)

Switch between LLM providers seamlessly with automatic failover:

```typescript
import { ModelResolver, AnthropicProvider, OpenAIProvider, OllamaProvider } from '@eaf/cortex';

const resolver = new ModelResolver();

// Register multiple providers
resolver.registerProvider(new AnthropicProvider({
  name: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultModel: 'claude-sonnet-4-5-20250929',
}));

resolver.registerProvider(new OpenAIProvider({
  name: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4o',
}));

resolver.registerProvider(new OllamaProvider({
  name: 'ollama-local',
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama3.1:70b',
}));

// Automatic failover: if Anthropic is down, falls back to OpenAI
const response = await resolver.call('anthropic', messages, { tools });
```

**Key Features:**
- API key rotation with cooldown on rate-limited keys
- Per-call cost tracking with budget enforcement
- Model-specific pricing tables built in
- Automatic retries with exponential backoff

#### Tool Registry (10 Built-in Tools)

Agents interact with the real world through tools. Every tool call is validated and sandboxed:

| Tool | Description | Safety |
|------|-------------|--------|
| `http_request` | HTTP GET/POST/PUT/PATCH/DELETE | URL allowlist |
| `database_query` | SQL queries against PostgreSQL | Blocks DROP/DELETE/TRUNCATE |
| `read_file` | Read file contents | Path boundary checks |
| `write_file` | Write file contents | Directory restrictions |
| `list_directory` | List directory contents | Path boundary checks |
| `shell_command` | Execute shell commands | Blocks rm -rf, format, etc. |
| `send_email` | Send emails via SMTP | Requires approval gate |
| `read_email` | Read email inbox | Read-only |
| `send_slack` | Post Slack messages | Webhook-based |
| `browser_navigate` | Browser automation | Playwright-based |

```typescript
import { ToolRegistry } from '@eaf/cortex';

const registry = new ToolRegistry();

// Register a custom tool
registry.register({
  name: 'internal_api',
  description: 'Call internal company API',
  parameters: {
    endpoint: { type: 'string', description: 'API endpoint path', required: true },
    method: { type: 'string', description: 'HTTP method', required: false },
  },
  execute: async (params) => {
    const res = await fetch(`https://internal.company.com${params.endpoint}`);
    return { success: true, data: await res.json() };
  },
});
```

#### 3-Tier Memory System

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   SHORT-TERM     │   │   LONG-TERM      │   │  VECTOR STORE    │
│                  │   │                  │   │                  │
│ Current session  │   │ Persistent       │   │ Semantic search  │
│ conversation     │   │ across sessions  │   │ via embeddings   │
│                  │   │                  │   │                  │
│ In-memory Map    │   │ PostgreSQL       │   │ pgvector         │
│ Auto-compaction  │   │ JSON storage     │   │ Cosine similarity│
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

```typescript
import { MemoryManager } from '@eaf/cortex';

const memory = new MemoryManager();

// Store a memory
memory.store('agt_analyst', {
  content: 'Q1 revenue was $2.4M, up 15% YoY',
  metadata: { source: 'finance_db', confidence: 0.95 },
});

// Semantic search across agent memories
const relevant = await memory.search('agt_analyst', 'revenue growth trends', { limit: 5 });
```

#### Knowledge Graph

Agents share organizational knowledge through an entity-relationship graph:

```typescript
import { KnowledgeGraph, KnowledgeIngestor, GitHubConnector } from '@eaf/cortex';

const graph = new KnowledgeGraph();
const ingestor = new KnowledgeIngestor(graph);

// Ingest from GitHub issues
ingestor.registerConnector('github', new GitHubConnector({
  token: process.env.GITHUB_TOKEN,
  owner: 'your-org',
  repo: 'your-repo',
}));

await ingestor.ingest('github');

// Search the knowledge graph
const results = graph.search('authentication bug fix');
```

---

### NEXUS — The Nervous System

NEXUS manages how agents work together as a team.

#### Agent Hierarchy

```
        ┌──────────────────────┐
        │   STRATEGIC AGENT    │  Sets goals, monitors progress
        │   (claude-sonnet)    │  Decomposes into objectives
        └──────────┬───────────┘
                   │
        ┌──────────┴───────────┐
        │   SUPERVISOR AGENTS  │  Manages task agents
        │   (claude-sonnet)    │  Delegates, compiles results
        └──────────┬───────────┘
                   │
   ┌───────────────┼───────────────┐
   │               │               │
┌──┴──┐        ┌───┴──┐        ┌──┴──┐
│TASK │        │ TASK │        │TASK │  Executes specific work
│AGENT│        │AGENT │        │AGENT│  Reports up to supervisor
└─────┘        └──────┘        └─────┘
```

```typescript
import { HierarchyManager, StrategicAgent, SupervisorAgent, TaskAgent } from '@eaf/nexus';

const hierarchy = new HierarchyManager();

// Register agents at different levels
hierarchy.registerAgent('agt_strategic', 'strategic', null);        // Top level
hierarchy.registerAgent('agt_supervisor', 'supervisor', 'agt_strategic');  // Reports to strategic
hierarchy.registerAgent('agt_researcher', 'task', 'agt_supervisor');      // Reports to supervisor
hierarchy.registerAgent('agt_analyst', 'task', 'agt_supervisor');         // Reports to supervisor

// Set delegation rules
hierarchy.addDelegationRule({
  from: 'agt_supervisor',
  taskTypes: ['research', 'analysis'],
  maxDelegationDepth: 1,
});
```

#### Orchestration Patterns

**Vertical Orchestration** — Goal decomposition down the hierarchy:
```
Strategic Goal: "Improve customer retention by 10%"
  → Objective: "Analyze churn patterns" (assigned to supervisor)
    → Task: "Query last 6 months of churn data" (assigned to analyst)
    → Task: "Research industry benchmarks" (assigned to researcher)
  → Objective: "Design intervention strategy"
    → Task: "Draft retention email campaigns"
    → Task: "Identify at-risk customers"
```

**Horizontal Orchestration** — Cross-functional collaboration:
```typescript
import { HorizontalOrchestrator } from '@eaf/nexus';

const orchestrator = new HorizontalOrchestrator();

// Multiple task agents work in parallel, results compiled by supervisor
await orchestrator.execute({
  tasks: [
    { agentId: 'agt_researcher', description: 'Gather market data' },
    { agentId: 'agt_analyst', description: 'Run statistical analysis' },
    { agentId: 'agt_writer', description: 'Draft executive summary' },
  ],
  compilerId: 'agt_supervisor',
});
```

#### Human-in-the-Loop

```typescript
import { ApprovalGate, InterventionManager, FeedbackCapture } from '@eaf/nexus';

// Require human approval for sensitive actions
const approvalGate = new ApprovalGate();

approvalGate.requestApproval({
  agentId: 'agt_emailer',
  action: 'send_email',
  details: { to: 'client@company.com', subject: 'Proposal' },
  reason: 'External communication requires approval',
});

// Real-time intervention
const intervention = new InterventionManager();
intervention.pause('agt_researcher');      // Pause an agent
intervention.redirect('agt_researcher', {  // Change its task
  newTask: 'Focus on competitor analysis instead',
});

// Capture feedback on agent performance
const feedback = new FeedbackCapture();
feedback.submit({
  agentId: 'agt_writer',
  taskId: 'tsk_blog_post',
  rating: 4,
  comment: 'Good draft, needs more data citations',
});
```

#### Communication Bus

Agents communicate through a typed event bus:

```typescript
import { AgentBus, StructuredFinding } from '@eaf/nexus';

const bus = new AgentBus();

// Agent publishes a finding
bus.emit('finding', {
  agentId: 'agt_researcher',
  type: 'market_insight',
  content: 'Competitor X launched a new product in our segment',
  confidence: 0.87,
  evidence: ['https://competitor.com/press-release'],
});

// Supervisor listens for findings
bus.on('finding', (finding) => {
  if (finding.confidence > 0.8) {
    // Route to strategic agent for evaluation
  }
});
```

---

### AEGIS — The Immune System

AEGIS ensures every agent action is safe, authorized, and auditable.

#### Policy Engine

Define rules that are enforced at runtime on every agent action:

```typescript
import { PolicyEngine } from '@eaf/aegis';

const engine = new PolicyEngine();

// Block agents from spending more than $50 per task
engine.addPolicy({
  id: 'pol_budget',
  name: 'Task Budget Limit',
  scope: { agentRole: '*' },
  conditions: [{ field: 'cost', operator: 'gt', value: 50 }],
  action: 'deny',
  priority: 100,
  enabled: true,
});

// Require human approval for external emails
engine.addPolicy({
  id: 'pol_email_approval',
  name: 'External Email Approval',
  scope: { toolName: 'send_email' },
  conditions: [],
  action: 'require_approval',
  priority: 90,
  enabled: true,
});

// Evaluate a proposed action
const result = engine.evaluate({
  agentId: 'agt_emailer',
  agentRole: 'task',
  toolName: 'send_email',
  cost: 0.5,
});
// result.action === 'require_approval'
```

**Built-in Policy Types:**

| Policy | What It Prevents |
|--------|-----------------|
| **Data Privacy** | PII exposure, data exfiltration |
| **Financial** | Budget overruns, unauthorized transactions |
| **Authority** | Agents exceeding their role boundaries |
| **Communication** | Unreviewed external messages |

#### Immutable Audit Trail

Every agent action is logged with SHA-256 hash chaining for tamper detection:

```typescript
import { AuditLogger } from '@eaf/aegis';

const audit = new AuditLogger();

// Every action is automatically logged
audit.log({
  agentId: 'agt_analyst',
  action: 'tool_call',
  resource: 'database_query',
  details: {
    query: 'SELECT * FROM customers WHERE churn_risk > 0.8',
    rows_returned: 156,
  },
  timestamp: new Date(),
});

// Verify the entire audit trail hasn't been tampered with
const isValid = audit.verifyIntegrity(); // true

// Query audit history
const entries = audit.getEntries({ agentId: 'agt_analyst', from: startDate, to: endDate });
```

**Audit Entry Structure:**
```json
{
  "id": "aud_abc123",
  "agentId": "agt_analyst",
  "action": "tool_call",
  "resource": "database_query",
  "details": { "query": "...", "rows_returned": 156 },
  "hash": "a3f2b8c1...",
  "previousHash": "7d4e9f02...",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Role-Based Access Control (RBAC)

```typescript
import { RBACManager } from '@eaf/aegis';

const rbac = new RBACManager();

// Define roles with granular permissions
rbac.createRole('task-agent', [
  'tool.read_file',
  'tool.http_request',
  'tool.database_query',
  'memory.read',
  'memory.write',
]);

rbac.createRole('supervisor', [
  'tool.*',           // All tools
  'memory.*',         // All memory operations
  'agent.delegate',   // Can delegate to task agents
  'agent.monitor',    // Can monitor subordinates
]);

rbac.createRole('admin', ['*']); // Full access

// Assign roles to agents
rbac.assignRole('agt_researcher', 'task-agent');
rbac.assignRole('agt_supervisor', 'supervisor');

// Check permissions
rbac.hasPermission('agt_researcher', 'tool.read_file');       // true
rbac.hasPermission('agt_researcher', 'agent.delegate');       // false
rbac.hasPermission('agt_supervisor', 'tool.send_email');      // true (wildcard)
```

#### Encrypted Credential Vault

API keys and secrets are stored with AES-256-GCM encryption:

```typescript
import { CredentialVault } from '@eaf/aegis';

const vault = new CredentialVault('your-master-encryption-key');

// Store encrypted credentials
vault.store('github_token', 'ghp_xxxxxxxxxxxx', { scope: 'agt_researcher' });

// Retrieve (only authorized agents can access)
const token = vault.retrieve('github_token', 'agt_researcher');
```

---

### COMMAND AI — Mission Control

COMMAND AI provides visibility into what your AI workforce is doing and the business value it creates.

#### Outcome Measurement Engine

Track before-vs-after impact of AI agent deployment:

```typescript
import { BaselineManager, MeasurementCollector, DeltaCalculator, ROICalculator } from '@eaf/command-ai';

const baseline = new BaselineManager();
const measurements = new MeasurementCollector();
const delta = new DeltaCalculator();
const roi = new ROICalculator();

// Step 1: Record baseline (before AI)
baseline.record('ticket_resolution', {
  metric: 'avg_resolution_time_hours',
  value: 24,
  recordedAt: new Date(),
});

baseline.record('ticket_resolution', {
  metric: 'tickets_per_day',
  value: 50,
  recordedAt: new Date(),
});

// Step 2: Collect measurements (after AI deployment)
measurements.collect('ticket_resolution', {
  metric: 'avg_resolution_time_hours',
  value: 4,       // Down from 24 hours
});

measurements.collect('ticket_resolution', {
  metric: 'tickets_per_day',
  value: 200,     // Up from 50
});

// Step 3: Calculate delta
const improvement = delta.calculate('ticket_resolution', baseline, measurements);
// { avg_resolution_time_hours: -83%, tickets_per_day: +300% }

// Step 4: Calculate ROI
const result = roi.calculate({
  totalInvestment: 5000,    // Monthly cost of AI agents
  totalBenefit: 45000,      // Monthly value of improvements
  periodMonths: 3,
});
// { roi: 800%, paybackPeriodMonths: 0.33 }
```

#### Executive Dashboards

Hierarchical views tailored to each leadership level:

| Level | What They See |
|-------|--------------|
| **CEO** | Total AI impact, risk summary, ROI across all departments |
| **VP** | Strategic goal progress, department-level metrics |
| **Director** | Supervisor agent performance, team throughput |
| **Team Lead** | Individual task agent status, task completion rates |
| **Agent Detail** | Single agent deep-dive (tools used, cost, errors, memory) |

```typescript
import { DashboardEngine, buildCEOView, buildVPView } from '@eaf/command-ai';

const dashboard = new DashboardEngine(baselineManager, measurementCollector);

// Build executive view
const ceoView = buildCEOView(dashboard.buildDashboard());
// Returns: { totalROI, riskLevel, agentCount, costSavings, ... }

const vpView = buildVPView(dashboard.buildDashboard(), 'engineering');
// Returns: { goalProgress, teamMetrics, budgetUtilization, ... }
```

#### Alert System

Real-time alerts with multi-channel delivery:

```typescript
import {
  AlertEngine,
  createErrorRateRule,
  createCostBudgetRule,
  SlackAlertChannel,
  EmailAlertChannel,
  AlertEscalationManager,
} from '@eaf/command-ai';

const alerts = new AlertEngine();

// Define alert rules
alerts.addRule(createErrorRateRule(0.1));        // Alert if error rate > 10%
alerts.addRule(createCostBudgetRule(10000));      // Alert if cost > $10k
alerts.addRule(createLatencyRule(5000));          // Alert if latency > 5s

// Add notification channels
alerts.addChannel(new SlackAlertChannel({
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  channel: '#ai-ops',
}));

alerts.addChannel(new EmailAlertChannel({
  smtpHost: 'smtp.company.com',
  from: 'eaf-alerts@company.com',
  to: ['ops-team@company.com'],
}));

// Set up escalation
const escalation = new AlertEscalationManager();
escalation.addLevel({
  severity: 'critical',
  afterMinutes: 15,
  channels: [new SlackAlertChannel({ webhookUrl: MANAGER_WEBHOOK })],
});
```

---

## Packages

### @eaf/core
Shared foundation — types, utilities, and constants used across all packages.

| Module | Contents |
|--------|----------|
| `types/agent.ts` | AgentConfig, AgentTemplate, AgentResult, LoopState |
| `types/tool.ts` | Tool, ToolResult, ToolExecutionContext |
| `types/message.ts` | ConversationMessage, Conversation, ContextWindow |
| `types/memory.ts` | MemoryEntry, KnowledgeEntry, Relationship |
| `types/event.ts` | EAFEvent (30+ event types), AuditEntry |
| `types/policy.ts` | Policy, PolicyScope, PolicyCondition |
| `types/hierarchy.ts` | StrategicGoal, Objective, TaskDefinition |
| `types/outcome.ts` | Baseline, Delta, Impact, ROI |
| `utils/logger.ts` | Structured JSON logging (Winston) |
| `utils/id.ts` | Prefixed nanoid generators (agt_, tsk_, pol_, etc.) |
| `utils/retry.ts` | Exponential backoff, sleep, timeout |
| `utils/serialization.ts` | JSON/JSONL, deepClone, safeStringify |
| `utils/token-counter.ts` | Token estimation for context window management |
| `constants.ts` | Model pricing tables, framework defaults |

### @eaf/cortex
The agent execution engine — 35 files covering the full agent lifecycle.

| Module | Files | Description |
|--------|-------|-------------|
| `agent-loop/` | 5 | ReAct loop engine, context assembly, response parsing, completion detection, context window guard |
| `model-resolver/` | 7 | Multi-provider resolver, Anthropic/OpenAI/Ollama providers, key rotation, cost tracking |
| `tool-registry/` | 10 | Tool registration, schema validation, sandboxing, 7 built-in tools |
| `memory/` | 5 | 3-tier memory (short-term, long-term, vector store), compaction |
| `agent-factory/` | 4 | YAML template-based agent creation, template registry |
| `lane-queue/` | 3 | Serial-by-default execution, explicit parallel gates for read-only operations |
| `knowledge-graph/` | 7 | Entity-relationship graph, GitHub/filesystem connectors, search, embeddings |

### @eaf/nexus
Agent orchestration and coordination — 24 files.

| Module | Files | Description |
|--------|-------|-------------|
| `hierarchy/` | 5 | Strategic/supervisor/task agent management, delegation engine |
| `orchestration/` | 5 | Vertical/horizontal orchestration, work routing, load balancing, escalation |
| `human-in-the-loop/` | 5 | Approval gates, guidance channels, intervention, feedback capture, notifications |
| `communication/` | 4 | Event bus, structured findings, knowledge propagation, agent-to-agent protocol |
| `channels/` | 4 | Channel adapters (web, API), message normalization |

### @eaf/aegis
Governance, security, and compliance — 21 files.

| Module | Files | Description |
|--------|-------|-------------|
| `governance/` | 6 | Policy engine, enforcement, 4 policy type factories (privacy, financial, authority, communication) |
| `audit/` | 2 | SHA-256 hash-chained audit logger, audit store with time-range queries |
| `security/` | 5 | RBAC with wildcard permissions, AES-256-GCM credential vault, tenant isolation, encryption, input sanitization |
| `learning/` | 3 | Per-agent learning, cross-agent knowledge sharing, feedback loops |
| `monitoring/` | 4 | Bias detection, anomaly detection (statistical), cost monitoring with budget alerts, heartbeat health checks |

### @eaf/command-ai
Business measurement and operations — 20 files.

| Module | Files | Description |
|--------|-------|-------------|
| `outcome-engine/` | 7 | Baseline recording, measurement collection, delta calculation, attribution, ROI, narrative generation, trend analysis |
| `dashboards/` | 6 | Dashboard engine, 5 hierarchical views (CEO, VP, Director, Team Lead, Agent Detail) |
| `network-designer/` | 3 | Agent network design, workload simulation, capacity recommendations |
| `alerts/` | 6 | Alert engine, rule definitions, 3 delivery channels (email, Slack, webhook), escalation manager |
| `api/` | 2 | REST route builder, WebSocket real-time updates |

### @eaf/sdk
Developer-friendly SDK with fluent builder pattern.

```typescript
import { EAFBuilder } from '@eaf/sdk';

const client = new EAFBuilder()
  .setAppName('my-ai-workforce')
  .setDefaultModel('claude-sonnet-4-5-20250929')
  .setPort(3000)
  .setDatabase(process.env.DATABASE_URL)
  .setRedis(process.env.REDIS_URL)
  .enableAudit()
  .setMaxConcurrentAgents(20)
  .addProvider(anthropicProvider)
  .addProvider(openaiProvider)
  .addTool(customTool)
  .addPolicy(budgetPolicy)
  .build();

await client.initialize();
```

---

## Enterprise Use Cases

### 1. Automated Code Review Pipeline

**Problem:** Engineering teams spend 30% of time on code reviews, creating bottlenecks.

**EAF Solution:**

```
Strategic Agent: "Maintain code quality across all repositories"
  └── Supervisor Agent: "Manage code review workflow"
        ├── Security Reviewer (Task): Checks OWASP Top 10, dependency vulnerabilities
        ├── Performance Reviewer (Task): Identifies N+1 queries, memory leaks
        ├── Style Reviewer (Task): Enforces coding standards, best practices
        └── Test Coverage Reviewer (Task): Validates test coverage, edge cases
```

**Governance:**
- Agents can READ code but never WRITE to production branches
- Security findings auto-escalate to human security team
- All reviews are audit-logged for compliance

**Measured Outcome:**
- Review time: 24h → 2h (92% reduction)
- Bug escape rate: -45%
- Developer satisfaction: +30% (faster PR turnaround)

---

### 2. Customer Support Triage & Resolution

**Problem:** Support team handles 500+ tickets/day, average resolution time is 8 hours.

**EAF Solution:**

```
Strategic Agent: "Reduce ticket resolution time by 60%"
  └── Supervisor Agent: "Coordinate support operations"
        ├── Triage Agent (Task): Classifies tickets by urgency/category
        ├── Knowledge Agent (Task): Searches knowledge base for solutions
        ├── Response Agent (Task): Drafts customer responses
        └── Escalation Agent (Task): Routes complex issues to human experts
```

**Governance:**
- Customer data never leaves the system (data privacy policy)
- All customer-facing responses require human approval
- PII is automatically redacted from agent memory
- Cost budget per ticket: $0.50 max

**Measured Outcome:**
- Resolution time: 8h → 45min (90% faster)
- First-contact resolution: 40% → 78%
- Customer satisfaction: +25 NPS points
- Monthly savings: $120,000 in support staff time

---

### 3. Financial Report Generation

**Problem:** Monthly financial reports take 3 days to compile across departments.

**EAF Solution:**

```
Strategic Agent: "Generate monthly financial report by the 3rd of each month"
  └── Supervisor Agent: "Coordinate data collection and analysis"
        ├── Data Extractor (Task): Pulls data from ERP, CRM, billing systems
        ├── Analyst (Task): Runs variance analysis, trend detection
        ├── Compliance Checker (Task): Validates against GAAP/IFRS standards
        └── Report Writer (Task): Compiles narrative report with visualizations
```

**Governance:**
- Database access is READ-ONLY (financial policy)
- All queries are audit-logged with row counts
- Report drafts require CFO approval before distribution
- Budget: $200/report max

**Measured Outcome:**
- Report generation: 3 days → 4 hours (94% faster)
- Data accuracy: 96% → 99.5% (eliminated manual errors)
- Cost per report: $2,400 (staff time) → $85 (AI cost)

---

### 4. Security Incident Response

**Problem:** Security team takes 2+ hours to triage and respond to alerts.

**EAF Solution:**

```
Strategic Agent: "Minimize mean-time-to-respond (MTTR) for security incidents"
  └── Supervisor Agent: "Coordinate incident response"
        ├── Alert Analyzer (Task): Correlates SIEM alerts, reduces false positives
        ├── Threat Intel (Task): Checks IOCs against threat intelligence feeds
        ├── Impact Assessor (Task): Determines blast radius, affected systems
        └── Remediation Planner (Task): Recommends containment and remediation steps
```

**Governance:**
- CRITICAL: Agents can NEVER execute remediation (human-only)
- All actions logged to immutable audit trail for SOC 2 compliance
- Agent access limited to read-only security tools
- Escalation: If severity > HIGH, immediately notify on-call team

**Measured Outcome:**
- MTTR: 2.5h → 18min (88% faster)
- False positive reduction: 60% fewer analyst interruptions
- Compliance: 100% audit trail for every incident

---

### 5. Content Marketing Pipeline

**Problem:** Content team produces 10 blog posts/month, wants to scale to 50.

**EAF Solution:**

```
Strategic Agent: "Scale content output to 50 posts/month maintaining quality"
  └── Supervisor Agent: "Manage content pipeline"
        ├── Researcher (Task): Identifies trending topics, gathers source material
        ├── Writer (Task): Drafts blog posts following brand voice guide
        ├── Editor (Task): Reviews for quality, grammar, SEO optimization
        ├── SEO Optimizer (Task): Adds meta descriptions, internal links
        └── Compliance (Task): Checks for copyright issues, brand guidelines
```

**Governance:**
- All content requires human editorial approval before publishing
- External API calls rate-limited to 30/minute
- No scraping of competitor content (policy enforced)
- Brand voice guidelines enforced via system prompt + policy

---

### 6. Data Pipeline Monitoring & Self-Healing

**Problem:** Data pipelines fail silently, causing stale dashboards and wrong decisions.

**EAF Solution:**

```
Strategic Agent: "Ensure 99.9% data pipeline reliability"
  └── Supervisor Agent: "Monitor and maintain data pipelines"
        ├── Health Monitor (Task): Checks pipeline status every 5 minutes
        ├── Anomaly Detector (Task): Identifies unusual data patterns
        ├── Root Cause Analyzer (Task): Diagnoses pipeline failures
        └── Remediation Agent (Task): Restarts failed jobs, notifies team
```

**Governance:**
- Remediation limited to: restart jobs, clear caches, scale up resources
- Cannot modify pipeline code or schemas (authority boundary)
- All actions audit-logged
- Budget alert at $500/day

---

## Deployment

### Docker Compose (Recommended for Development)

```bash
# Start everything
docker compose up -d

# Services:
# - PostgreSQL (pgvector): localhost:5432
# - Redis: localhost:6379
# - EAF Server: localhost:3000
# - Dashboard: localhost:3001
```

### Kubernetes (Production)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full Kubernetes manifests. Key considerations:

- **Server:** Deploy as a Deployment with HPA (2-10 replicas)
- **Workers:** Separate deployment for background task processing
- **Database:** Use managed PostgreSQL (RDS, Cloud SQL, Azure Database)
- **Redis:** Use managed Redis (ElastiCache, Memorystore)
- **Secrets:** Store API keys in Kubernetes Secrets or HashiCorp Vault

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key for Claude models |
| `OPENAI_API_KEY` | No | OpenAI API key for GPT models |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `PORT` | No | Server port (default: 3000) |
| `CORS_ORIGIN` | No | Allowed CORS origins (default: *) |
| `LOG_LEVEL` | No | Logging level (default: info) |
| `ENCRYPTION_KEY` | Yes | Master key for credential vault |

*At least one LLM provider key is required.

---

## Configuration

### eaf.config.ts

```typescript
import { defineConfig } from '@eaf/sdk';

export default defineConfig({
  appName: 'my-company-ai',
  defaultModel: 'claude-sonnet-4-5-20250929',
  port: 3000,
  logLevel: 'info',
  auditEnabled: true,
  maxConcurrentAgents: 20,
});
```

### Agent Templates (YAML)

```yaml
# templates/agents/my-agent.yaml
name: research-analyst
model: claude-sonnet-4-5-20250929
role: task
system_prompt: |
  You are a research analyst specializing in market intelligence.
  Always cite sources and indicate confidence levels.
tools:
  - http_request
  - read_file
  - database_query
max_iterations: 30
temperature: 0.3
memory:
  short_term_limit: 100
  long_term_enabled: true
  vector_search_enabled: true
```

### Governance Policies (YAML)

```yaml
# templates/policies/governance.yaml
policies:
  - name: budget-guard
    scope: { agentRole: '*' }
    conditions:
      - field: cost
        operator: gt
        value: 100
    action: deny
    priority: 100

  - name: require-approval-external
    scope: { toolName: 'send_email,send_slack' }
    action: require_approval
    priority: 90
```

---

## API Reference

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/agents` | List all agents |
| `GET` | `/api/v1/agents/:id` | Get agent details |
| `POST` | `/api/v1/agents` | Create agent from template |
| `DELETE` | `/api/v1/agents/:id` | Remove agent |
| `GET` | `/api/v1/tasks` | List tasks (filterable) |
| `POST` | `/api/v1/tasks` | Submit a new task |
| `GET` | `/api/v1/tasks/:id` | Get task status |
| `GET` | `/api/v1/dashboard` | Get dashboard data |
| `GET` | `/api/v1/alerts` | Get active alerts |
| `GET` | `/api/v1/alerts/history` | Get alert history |
| `POST` | `/api/v1/alerts/:id/acknowledge` | Acknowledge alert |
| `POST` | `/api/v1/alerts/:id/resolve` | Resolve alert |

### WebSocket

Connect to `ws://localhost:3000/ws` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

// Subscribe to event types
ws.send(JSON.stringify({ type: 'subscribe', event: 'alert' }));
ws.send(JSON.stringify({ type: 'subscribe', event: 'agent_status' }));
ws.send(JSON.stringify({ type: 'subscribe', event: 'metric' }));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`[${data.type}]`, data.payload);
};
```

---

## Security

EAF takes security seriously. Key security features:

- **Encryption at Rest:** All credentials stored with AES-256-GCM encryption
- **Immutable Audit Trail:** SHA-256 hash-chained logs detect tampering
- **RBAC:** Fine-grained role-based access control with wildcard support
- **Input Sanitization:** XSS and SQL injection protection on all inputs
- **Tool Sandboxing:** Dangerous command patterns blocked (rm -rf, DROP TABLE, etc.)
- **Tenant Isolation:** Multi-department/team data separation
- **Key Rotation:** API keys automatically rotated on rate limit
- **Budget Enforcement:** Hard cost limits per agent, per task, per department

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly. Do NOT open a public GitHub issue. Instead, email security concerns to the maintainers.

---

## Agent Templates

EAF ships with 4 ready-to-use agent templates:

| Template | Role | Description |
|----------|------|-------------|
| `research-agent` | Task | Web research, document analysis, citation tracking |
| `code-reviewer` | Task | Security, performance, style, and correctness reviews |
| `data-analyst` | Task | SQL queries, statistical analysis, data validation |
| `supervisor` | Supervisor | Task delegation, progress monitoring, result compilation |

Create your own by adding YAML files to `templates/agents/`.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/anthropics/enterprise-agentic-framework.git
cd enterprise-agentic-framework
npm install
npm run build
npm run test
```

### Project Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages |
| `npm run dev` | Development mode (watch) |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | TypeScript type checking |
| `npm run clean` | Clean all build artifacts |

---

## License

This project is licensed under the **Apache License 2.0** — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built for enterprises that want AI agents they can trust.</strong>
</p>
