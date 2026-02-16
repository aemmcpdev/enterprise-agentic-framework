import {
  logger,
  generateSessionId,
  generateToolCallId,
  estimateMessagesTokens,
} from '@eaf/core';
import type {
  AgentConfig,
  AgentResult,
  LoopState,
  Message,
  ToolCallRecord,
  ToolCallRequest,
  AgentStatus,
} from '@eaf/core';
import type { PolicyEvaluationResult } from '@eaf/core';
import type { ModelResponse } from '../model-resolver/providers/base.js';
import { ModelResolver } from '../model-resolver/resolver.js';
import { ToolRegistry } from '../tool-registry/registry.js';
import { MemoryManager } from '../memory/memory-manager.js';
import { ContextAssembler } from './context-assembler.js';
import { ResponseParser, ParsedResponse } from './response-parser.js';
import { CompletionDetector } from './completion-detector.js';
import { ContextWindowGuard } from './context-window-guard.js';

export interface LoopEngineConfig {
  agentConfig: AgentConfig;
  modelResolver: ModelResolver;
  toolRegistry: ToolRegistry;
  memoryManager: MemoryManager;
  policyEvaluator?: (toolName: string, input: Record<string, unknown>, agentId: string) => Promise<PolicyEvaluationResult>;
  approvalRequester?: (toolName: string, input: Record<string, unknown>, agentId: string, reason: string) => Promise<boolean>;
  onToolCall?: (record: ToolCallRecord) => Promise<void>;
  onIteration?: (state: LoopState) => Promise<void>;
  onComplete?: (result: AgentResult) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

export class LoopEngine {
  private config: LoopEngineConfig;
  private contextAssembler: ContextAssembler;
  private responseParser: ResponseParser;
  private completionDetector: CompletionDetector;
  private contextGuard: ContextWindowGuard;
  private aborted = false;
  private paused = false;
  private currentState: LoopState | null = null;

  constructor(config: LoopEngineConfig) {
    this.config = config;
    this.contextAssembler = new ContextAssembler();
    this.responseParser = new ResponseParser();
    this.completionDetector = new CompletionDetector();
    this.contextGuard = new ContextWindowGuard(config.agentConfig.maxTokens);
  }

  async run(task: string): Promise<AgentResult> {
    const sessionId = generateSessionId();
    const { agentConfig } = this.config;
    const startTime = Date.now();

    const state: LoopState = {
      iteration: 0,
      totalTokensUsed: 0,
      toolCallsExecuted: [],
      currentContext: [],
      startTime,
      status: 'running',
    };
    this.currentState = state;

    logger.info('Agent loop starting', {
      agentId: agentConfig.agentId,
      sessionId,
      task: task.substring(0, 200),
      maxIterations: agentConfig.maxIterations,
    });

    try {
      // 1. ASSEMBLE INITIAL CONTEXT
      state.currentContext = await this.contextAssembler.assembleInitial(
        agentConfig,
        task,
        this.config.memoryManager,
        this.config.toolRegistry
      );

      // Store task in memory
      await this.config.memoryManager.remember(
        agentConfig.agentId,
        `Task: ${task}`,
        'short_term',
        1.0,
        { sessionId }
      );

      // === THE LOOP ===
      while (state.iteration < agentConfig.maxIterations) {
        // Check abort/pause
        if (this.aborted) {
          state.status = 'terminated';
          break;
        }
        if (this.paused) {
          state.status = 'paused';
          await this.waitForResume();
          state.status = 'running';
        }

        // Check timeout
        if (Date.now() - startTime > agentConfig.timeout) {
          logger.warn('Agent loop timed out', { agentId: agentConfig.agentId, sessionId });
          return this.createResult(sessionId, state, 'timeout', 'Task timed out');
        }

        state.iteration++;

        // 2. CHECK CONTEXT WINDOW
        if (this.contextGuard.exceedsBudget(state.currentContext)) {
          logger.info('Context window exceeded, compacting', {
            agentId: agentConfig.agentId,
            tokens: estimateMessagesTokens(state.currentContext),
          });
          state.currentContext = await this.contextGuard.compact(state.currentContext);
        }

        // 3. CALL MODEL
        const toolDefs = this.config.toolRegistry.getModelDefinitions(agentConfig.tools);
        let response: ModelResponse;

        try {
          response = await this.config.modelResolver.call(
            agentConfig.model.provider,
            {
              model: agentConfig.model.model,
              messages: state.currentContext,
              tools: toolDefs.length > 0 ? toolDefs : undefined,
              temperature: agentConfig.model.temperature,
              maxTokens: agentConfig.model.maxOutputTokens,
            }
          );
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          logger.error('Model call failed', { error: errMsg, iteration: state.iteration });
          state.currentContext.push({
            role: 'system',
            content: `Model call failed: ${errMsg}. Please try a different approach.`,
          });
          continue;
        }

        state.totalTokensUsed += response.usage.totalTokens;

        // 4. PARSE RESPONSE
        const parsed = this.responseParser.parse(response);

        if (parsed.type === 'text') {
          // Add assistant response to context
          state.currentContext.push({
            role: 'assistant',
            content: parsed.text,
          });

          // 5. CHECK IF DONE
          if (this.completionDetector.isComplete(parsed, state)) {
            state.status = 'completed';
            await this.config.onIteration?.(state);
            return this.createResult(sessionId, state, 'completed', parsed.text);
          }

          // Not done yet — model may need to think more
          await this.config.onIteration?.(state);
          continue;
        }

        if (parsed.type === 'tool_calls') {
          // Add assistant message with tool calls to context
          state.currentContext.push({
            role: 'assistant',
            content: parsed.text || '',
            toolCalls: parsed.toolCalls,
          });

          // Process each tool call
          for (const toolCall of parsed.toolCalls) {
            const record = await this.executeToolCall(
              toolCall,
              agentConfig.agentId,
              sessionId,
              state
            );
            state.toolCallsExecuted.push(record);

            // Add tool result to context
            state.currentContext.push({
              role: 'tool',
              content: JSON.stringify(record.output),
              toolCallId: toolCall.id,
              name: toolCall.name,
            });

            // Store in memory
            await this.config.memoryManager.remember(
              agentConfig.agentId,
              `Tool: ${toolCall.name} -> ${JSON.stringify(record.output).substring(0, 500)}`,
              'short_term',
              0.6,
              { sessionId, toolCallId: toolCall.id }
            );

            await this.config.onToolCall?.(record);
          }
        }

        await this.config.onIteration?.(state);
      }

      // Max iterations reached
      const lastMessage = state.currentContext
        .filter((m) => m.role === 'assistant')
        .pop();

      return this.createResult(
        sessionId,
        state,
        'max_iterations',
        lastMessage?.content || 'Max iterations reached without completing the task.'
      );
    } catch (error) {
      state.status = 'errored';
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.error('Agent loop error', {
        agentId: agentConfig.agentId,
        sessionId,
        error: errMsg,
        iteration: state.iteration,
      });
      await this.config.onError?.(error instanceof Error ? error : new Error(errMsg));
      return this.createResult(sessionId, state, 'error', errMsg);
    }
  }

  private async executeToolCall(
    toolCall: ToolCallRequest,
    agentId: string,
    sessionId: string,
    state: LoopState
  ): Promise<ToolCallRecord> {
    const startTime = Date.now();

    // 6. CHECK POLICY (AEGIS enforcement)
    if (this.config.policyEvaluator) {
      const policyResult = await this.config.policyEvaluator(
        toolCall.name,
        toolCall.input,
        agentId
      );

      if (policyResult.denied) {
        logger.warn('Tool call denied by policy', {
          tool: toolCall.name,
          reason: policyResult.reason,
        });
        return {
          id: toolCall.id,
          toolName: toolCall.name,
          input: toolCall.input,
          output: { success: false, error: `Denied by policy: ${policyResult.reason}` },
          duration: Date.now() - startTime,
          policyResult: 'denied',
          timestamp: new Date(),
        };
      }

      if (policyResult.requiresApproval && this.config.approvalRequester) {
        state.status = 'waiting_approval';
        const approved = await this.config.approvalRequester(
          toolCall.name,
          toolCall.input,
          agentId,
          policyResult.reason || 'Action requires approval'
        );
        state.status = 'running';

        if (!approved) {
          return {
            id: toolCall.id,
            toolName: toolCall.name,
            input: toolCall.input,
            output: { success: false, error: 'Action rejected by human reviewer' },
            duration: Date.now() - startTime,
            policyResult: 'rejected',
            timestamp: new Date(),
          };
        }
      }
    }

    // 7. EXECUTE TOOL
    const result = await this.config.toolRegistry.execute(
      toolCall.name,
      toolCall.input,
      { agentId, sessionId }
    );

    return {
      id: toolCall.id,
      toolName: toolCall.name,
      input: toolCall.input,
      output: result,
      duration: Date.now() - startTime,
      policyResult: 'allowed',
      timestamp: new Date(),
    };
  }

  private createResult(
    sessionId: string,
    state: LoopState,
    status: AgentResult['status'],
    responseOrError: string
  ): AgentResult {
    const result: AgentResult = {
      agentId: this.config.agentConfig.agentId,
      sessionId,
      response: status === 'error' ? '' : responseOrError,
      toolCalls: state.toolCallsExecuted,
      iterations: state.iteration,
      totalTokens: state.totalTokensUsed,
      cost: this.config.modelResolver.getTotalCost(),
      duration: Date.now() - state.startTime,
      status,
      error: status === 'error' ? responseOrError : undefined,
    };

    logger.info('Agent loop completed', {
      agentId: result.agentId,
      sessionId,
      status,
      iterations: result.iterations,
      toolCalls: result.toolCalls.length,
      tokens: result.totalTokens,
      cost: result.cost.toFixed(6),
      duration: result.duration,
    });

    this.config.onComplete?.(result);
    this.currentState = null;
    return result;
  }

  abort(): void {
    this.aborted = true;
    logger.info('Agent loop abort requested', {
      agentId: this.config.agentConfig.agentId,
    });
  }

  pause(): void {
    this.paused = true;
    logger.info('Agent loop pause requested', {
      agentId: this.config.agentConfig.agentId,
    });
  }

  resume(): void {
    this.paused = false;
    logger.info('Agent loop resumed', {
      agentId: this.config.agentConfig.agentId,
    });
  }

  getState(): LoopState | null {
    return this.currentState;
  }

  private waitForResume(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.paused) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  }
}
