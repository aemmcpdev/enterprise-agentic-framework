import type { LoopState } from '@eaf/core';
import type { ParsedResponse } from './response-parser.js';

export class CompletionDetector {
  /**
   * Determines if the agent has completed its task.
   * The agent is done when:
   * 1. Model returns a text response (no tool calls) — this means the model
   *    has decided it's done and is providing a final answer.
   * 2. Model returns empty content with no tool calls.
   */
  isComplete(parsed: ParsedResponse, state: LoopState): boolean {
    // If the model made tool calls, it's still working
    if (parsed.type === 'tool_calls') {
      return false;
    }

    // Text response with content means the model is providing its final answer
    if (parsed.type === 'text' && parsed.text.trim().length > 0) {
      return true;
    }

    // Empty text response — unusual, but treat as complete
    if (parsed.type === 'text' && parsed.text.trim().length === 0) {
      return true;
    }

    return false;
  }

  /**
   * Checks if the loop should stop due to resource constraints.
   */
  shouldStop(state: LoopState, maxIterations: number, timeoutMs: number): {
    stop: boolean;
    reason?: string;
  } {
    if (state.iteration >= maxIterations) {
      return { stop: true, reason: 'max_iterations' };
    }

    if (Date.now() - state.startTime > timeoutMs) {
      return { stop: true, reason: 'timeout' };
    }

    return { stop: false };
  }
}
