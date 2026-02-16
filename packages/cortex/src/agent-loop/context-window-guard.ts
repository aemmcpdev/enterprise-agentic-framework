import { estimateMessagesTokens, CONTEXT_COMPACTION_THRESHOLD } from '@eaf/core';
import type { Message } from '@eaf/core';
import { ContextCompactor } from '../memory/compaction.js';

export class ContextWindowGuard {
  private maxTokens: number;
  private compactor: ContextCompactor;
  private threshold: number;

  constructor(maxTokens: number, threshold = CONTEXT_COMPACTION_THRESHOLD) {
    this.maxTokens = maxTokens;
    this.threshold = threshold;
    this.compactor = new ContextCompactor();
  }

  exceedsBudget(messages: Message[]): boolean {
    const tokenCount = estimateMessagesTokens(messages);
    return tokenCount > this.maxTokens * this.threshold;
  }

  getUtilization(messages: Message[]): number {
    const tokenCount = estimateMessagesTokens(messages);
    return tokenCount / this.maxTokens;
  }

  async compact(messages: Message[]): Promise<Message[]> {
    const { messages: compacted } = await this.compactor.compactMessages(
      messages,
      this.maxTokens
    );
    return compacted;
  }

  getTokenCount(messages: Message[]): number {
    return estimateMessagesTokens(messages);
  }

  getRemainingTokens(messages: Message[]): number {
    return this.maxTokens - estimateMessagesTokens(messages);
  }
}
