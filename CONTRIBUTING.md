# Contributing to EAF

Thank you for your interest in contributing to the Enterprise Agentic Framework! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows a standard Code of Conduct. By participating, you are expected to uphold respectful, inclusive behavior.

## How to Contribute

### Types of Contributions

- **Bug Fixes:** Fix issues and submit a PR
- **Features:** Propose via GitHub issue first, then implement
- **Documentation:** Improve docs, add examples, fix typos
- **Agent Templates:** Add new agent templates for common use cases
- **Policy Templates:** Add governance policy templates
- **Tool Implementations:** Add new built-in tools
- **Tests:** Improve test coverage

### First-Time Contributors

Look for issues labeled `good first issue` or `help wanted`.

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose
- Git

### Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/enterprise-agentic-framework.git
cd enterprise-agentic-framework

# Install dependencies
npm install

# Start infrastructure
docker compose up -d postgres redis

# Build all packages
npm run build

# Run tests
npm run test
```

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes...

# Build and test
npm run build
npm run test

# Lint
npm run lint

# Type check
npm run typecheck
```

## Project Structure

```
packages/
  core/       → Shared types and utilities (edit here for new types)
  cortex/     → Agent execution engine
  nexus/      → Orchestration and hierarchy
  aegis/      → Governance and security
  command-ai/ → Dashboards and measurement
  sdk/        → Developer SDK
apps/
  server/     → REST API server
  cli/        → CLI tool
  dashboard/  → Next.js dashboard
templates/    → Agent and policy YAML templates
examples/     → Usage examples
docs/         → Documentation
```

### Key Files

| File | Purpose |
|------|---------|
| `packages/core/src/types/*.ts` | All shared TypeScript types |
| `packages/cortex/src/agent-loop/loop-engine.ts` | Core agent execution loop |
| `packages/aegis/src/governance/policy-engine.ts` | Policy evaluation engine |
| `packages/nexus/src/hierarchy/hierarchy-manager.ts` | Agent hierarchy management |

## Coding Standards

### TypeScript

- **Strict mode** — All packages use `strict: true`
- **Module system** — ESM with `.js` extensions in imports
- **No `any`** — Use `unknown` or proper generic types
- **Interfaces over types** — For object shapes that may be extended
- **Explicit return types** — On all exported functions

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `policy-engine.ts` |
| Classes | PascalCase | `PolicyEngine` |
| Functions | camelCase | `evaluatePolicy` |
| Constants | UPPER_SNAKE | `MAX_ITERATIONS` |
| Types/Interfaces | PascalCase | `AgentConfig` |
| IDs | prefixed | `agt_`, `tsk_`, `pol_` |

### File Structure

```typescript
// 1. Imports (external first, then internal)
import { something } from 'external-lib';
import { logger } from '@eaf/core';

// 2. Types/Interfaces
export interface MyConfig {
  name: string;
}

// 3. Constants
const DEFAULT_VALUE = 10;

// 4. Main class/function
export class MyService {
  // ...
}
```

### Commit Messages

Use conventional commits:

```
feat: add new tool for database query
fix: resolve memory leak in agent loop
docs: update deployment guide
refactor: simplify policy engine evaluation
test: add tests for RBAC manager
chore: update dependencies
```

## Pull Request Process

1. **Create an issue** first for significant changes
2. **Fork and branch** from `main`
3. **Write code** following the coding standards
4. **Add tests** for new functionality
5. **Update docs** if behavior changes
6. **Submit PR** with a clear description

### PR Template

```markdown
## Summary
Brief description of changes.

## Changes
- List of specific changes

## Testing
How was this tested?

## Checklist
- [ ] Code follows project coding standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. No merge conflicts
4. Documentation updated for user-facing changes

## Reporting Issues

### Bug Reports

Include:
- EAF version
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error logs/stack traces

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

---

Thank you for contributing to EAF!
