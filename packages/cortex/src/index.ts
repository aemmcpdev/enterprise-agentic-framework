// === Agent Loop ===
export { LoopEngine } from './agent-loop/loop-engine.js';
export type { LoopEngineConfig } from './agent-loop/loop-engine.js';
export { ContextAssembler } from './agent-loop/context-assembler.js';
export { ResponseParser } from './agent-loop/response-parser.js';
export type { ParsedResponse } from './agent-loop/response-parser.js';
export { CompletionDetector } from './agent-loop/completion-detector.js';
export { ContextWindowGuard } from './agent-loop/context-window-guard.js';

// === Model Resolver ===
export { ModelResolver } from './model-resolver/resolver.js';
export { AnthropicProvider } from './model-resolver/providers/anthropic.js';
export { OpenAIProvider } from './model-resolver/providers/openai.js';
export { OllamaProvider } from './model-resolver/providers/ollama.js';
export { KeyManager } from './model-resolver/key-manager.js';
export { CostTracker } from './model-resolver/cost-tracker.js';
export type { ModelProvider, ModelCallOptions, ModelResponse, ModelToolDefinition, TokenUsage } from './model-resolver/providers/base.js';

// === Tool Registry ===
export { ToolRegistry } from './tool-registry/registry.js';
export { ToolSandbox } from './tool-registry/sandbox.js';
export { buildZodSchema, validateToolParams } from './tool-registry/schema-validator.js';
export { httpTool } from './tool-registry/built-in/http.js';
export { databaseQueryTool } from './tool-registry/built-in/database.js';
export { readFileTool, writeFileTool, listDirectoryTool } from './tool-registry/built-in/filesystem.js';
export { shellTool } from './tool-registry/built-in/shell.js';
export { sendEmailTool, readEmailTool } from './tool-registry/built-in/email.js';
export { slackSendTool } from './tool-registry/built-in/slack.js';
export { browserNavigateTool } from './tool-registry/built-in/browser.js';

// === Agent Factory ===
export { AgentFactory } from './agent-factory/factory.js';
export type { AgentFactoryDeps } from './agent-factory/factory.js';
export { TemplateRegistry } from './agent-factory/template-registry.js';
export { TemplateParser } from './agent-factory/template-parser.js';
export { ConfigPath } from './agent-factory/config-path.js';

// === Memory ===
export { MemoryManager } from './memory/memory-manager.js';
export type { MemoryManagerConfig } from './memory/memory-manager.js';
export { ShortTermMemory } from './memory/short-term.js';
export { LongTermMemory } from './memory/long-term.js';
export { VectorStore } from './memory/vector-store.js';
export { ContextCompactor } from './memory/compaction.js';

// === Lane Queue ===
export { LaneQueue } from './lane-queue/queue.js';
export type { QueuedTask } from './lane-queue/queue.js';
export { LaneManager } from './lane-queue/lane-manager.js';
export { ParallelGate } from './lane-queue/parallel-gate.js';

// === Knowledge Graph ===
export { KnowledgeGraph } from './knowledge-graph/graph.js';
export { KnowledgeIngestor } from './knowledge-graph/ingestion/ingestor.js';
export { IngestionScheduler } from './knowledge-graph/ingestion/scheduler.js';
export { HybridSearch } from './knowledge-graph/search.js';
export { SimpleEmbeddingProvider } from './knowledge-graph/embeddings.js';
export { GitHubConnector } from './knowledge-graph/ingestion/connectors/github.js';
export { FilesystemConnector } from './knowledge-graph/ingestion/connectors/filesystem.js';
