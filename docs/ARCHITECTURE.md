# Architecture Deep Dive

This document provides a detailed technical overview of the Enterprise Agentic Framework architecture.

## System Overview

EAF follows a **modular monorepo** architecture with clear separation of concerns across four pillars:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────────┐ │
│  │   CLI   │  │  Server   │  │       Dashboard (Next.js)  │ │
│  └────┬────┘  └─────┬─────┘  └────────────┬───────────────┘ │
│       │             │                      │                 │
│       └─────────────┼──────────────────────┘                 │
│                     │                                        │
│              ┌──────┴───────┐                                │
│              │     SDK      │  ← Fluent Builder API          │
│              └──────┬───────┘                                │
│                     │                                        │
├─────────────────────┼────────────────────────────────────────┤
│                     │          Framework Layer                │
│  ┌─────────┐  ┌────┴────┐  ┌──────────┐  ┌──────────────┐  │
│  │ CORTEX  │  │  NEXUS  │  │  AEGIS   │  │ COMMAND AI   │  │
│  │ (Brain) │  │ (Nerves)│  │ (Immune) │  │ (Dashboard)  │  │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └──────┬───────┘  │
│       └─────────────┼───────────┼────────────────┘          │
│                     │           │                            │
│              ┌──────┴───────────┴──────┐                     │
│              │        @eaf/core        │  ← Foundation       │
│              └─────────────────────────┘                     │
├──────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                       │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  PostgreSQL   │  │  Redis   │  │   LLM Providers        │ │
│  │  + pgvector   │  │          │  │ (Claude, GPT, Ollama)  │ │
│  └──────────────┘  └──────────┘  └────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Agent Task Execution

```
1. User submits task via REST API or SDK
         │
2. Server routes to appropriate agent
         │
3. CORTEX Agent Loop starts:
         │
    ┌─────┴─────┐
    │  Assemble  │ ← Memory Manager provides context
    │  Context   │ ← Knowledge Graph provides relevant knowledge
    └─────┬─────┘
          │
    ┌─────┴─────┐
    │   Call     │ ← Model Resolver selects provider
    │   Model    │ ← Key Manager handles rotation
    └─────┬─────┘ ← Cost Tracker records usage
          │
    ┌─────┴─────┐
    │   Parse    │ ← Response Parser extracts tool calls
    │  Response  │ ← Completion Detector checks if done
    └─────┬─────┘
          │
    ┌─────┴──────┐
    │   Check    │ ← AEGIS Policy Engine evaluates
    │   Policy   │ ← RBAC checks permissions
    └─────┬──────┘ ← May trigger Approval Gate (NEXUS HITL)
          │
    ┌─────┴─────┐
    │  Execute   │ ← Tool Registry validates parameters
    │   Tool     │ ← Sandbox enforces safety boundaries
    └─────┬─────┘ ← Audit Logger records action
          │
    ┌─────┴─────┐
    │   Store    │ ← Short-term memory updated
    │  Memory    │ ← Long-term storage if configured
    └─────┬─────┘ ← Vector embeddings for semantic search
          │
    ┌─────┴──────┐
    │  Complete? │ ─── No ──→ Loop back to "Assemble Context"
    └─────┬──────┘
          │ Yes
          │
4. Result returned via API/WebSocket
5. COMMAND AI records metrics for outcome measurement
```

### Hierarchical Delegation

```
Strategic Agent receives goal
         │
         ├── Decomposes into objectives
         │
Supervisor Agent receives objective
         │
         ├── Breaks into tasks
         ├── Selects best task agents (Load Balancer)
         │
Task Agents execute in parallel (Lane Queue)
         │
         ├── Report results up to Supervisor
         │   (via Communication Bus)
         │
Supervisor compiles results
         │
         ├── Reports to Strategic Agent
         │   or escalates if blocked
         │
Strategic Agent evaluates goal completion
```

## Module Dependencies

```
@eaf/core ──────────────────────────────── Foundation (zero dependencies)
     │
     ├── @eaf/cortex ──────────────────── depends on: core
     │
     ├── @eaf/nexus ───────────────────── depends on: core
     │
     ├── @eaf/aegis ───────────────────── depends on: core
     │
     ├── @eaf/command-ai ──────────────── depends on: core, aegis
     │
     └── @eaf/sdk ─────────────────────── depends on: core, cortex, nexus, aegis, command-ai
              │
              ├── @eaf/server ─────────── depends on: all packages
              ├── @eaf/cli ────────────── depends on: core, sdk
              └── @eaf/dashboard ──────── standalone (fetches via REST API)
```

## Key Design Decisions

### 1. Serial-by-Default Execution (Lane Queue)

Agents execute tool calls serially by default. Parallel execution requires an explicit parallel gate and is only allowed for read-only operations. This prevents race conditions and unintended side effects.

### 2. Policy-First Architecture

Every tool call passes through the AEGIS Policy Engine before execution. This is not optional or bypassable. The agent loop hard-codes the policy check step.

### 3. Hash-Chained Audit Trail

Audit entries are linked with SHA-256 hashes of the previous entry, similar to a blockchain. This makes it possible to detect if any entry has been modified or deleted.

### 4. 3-Tier Memory

Short-term memory (current session) is always available and fast. Long-term memory and vector search are opt-in per agent, allowing cost optimization for simple tasks that don't need persistence.

### 5. Multi-Provider with Failover

The Model Resolver supports multiple LLM providers simultaneously. If one provider is down or rate-limited, it automatically fails over to the next. API keys are rotated to avoid hitting per-key rate limits.

### 6. YAML-Based Agent Templates

Agents are defined declaratively in YAML files rather than code. This allows non-developers (operations teams, managers) to configure agent behavior without touching TypeScript.

## Security Architecture

```
┌─────────────────────────────────────────┐
│            External Boundary             │
│  ┌───────────────────────────────────┐  │
│  │         Input Sanitization        │  │  ← XSS, SQL injection prevention
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────┴───────────────────┐  │
│  │            RBAC Check             │  │  ← Role-based permission check
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────┴───────────────────┐  │
│  │          Policy Engine            │  │  ← Runtime policy enforcement
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────┴───────────────────┐  │
│  │         Tool Sandbox              │  │  ← Dangerous pattern blocking
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────┴───────────────────┐  │
│  │       Credential Vault            │  │  ← AES-256-GCM encryption
│  └───────────────┬───────────────────┘  │
│                  │                       │
│  ┌───────────────┴───────────────────┐  │
│  │       Audit Logger                │  │  ← SHA-256 hash chain
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │       Tenant Isolation            │  │  ← Multi-team data separation
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript 5.7+ (strict) | Type safety, developer experience |
| Runtime | Node.js 20+ | LTS, native ESM, performance |
| Monorepo | Turborepo + npm workspaces | Fast builds, dependency management |
| Server | Fastify | Fastest Node.js framework, schema validation |
| WebSocket | @fastify/websocket | Integrated with Fastify lifecycle |
| Database | PostgreSQL 16 + pgvector | Relational + vector search in one DB |
| Cache/Queue | Redis 7 | Fast, reliable, BullMQ compatible |
| Dashboard | Next.js 14 + Tailwind CSS | React SSR, modern styling |
| Logging | Winston | Structured JSON, multiple transports |
| IDs | nanoid | URL-safe, collision-resistant |
| Encryption | Node.js crypto (AES-256-GCM) | No external dependencies |
