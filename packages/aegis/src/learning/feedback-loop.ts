import { logger } from '@eaf/core';

export interface FeedbackSignal {
  agentId: string;
  taskId: string;
  signal: 'positive' | 'negative' | 'neutral';
  source: 'human' | 'metric' | 'policy';
  detail?: string;
  timestamp: Date;
}

export class FeedbackLoop {
  private signals: FeedbackSignal[] = [];

  addSignal(agentId: string, taskId: string, signal: FeedbackSignal['signal'], source: FeedbackSignal['source'], detail?: string): void {
    this.signals.push({ agentId, taskId, signal, source, detail, timestamp: new Date() });
    logger.debug('Feedback signal added', { agentId, taskId, signal, source });
  }

  getAgentSignals(agentId: string): FeedbackSignal[] {
    return this.signals.filter((s) => s.agentId === agentId);
  }

  getPositiveRate(agentId: string): number {
    const agentSignals = this.getAgentSignals(agentId);
    if (agentSignals.length === 0) return 0;
    const positive = agentSignals.filter((s) => s.signal === 'positive').length;
    return positive / agentSignals.length;
  }

  getRecent(limit = 100): FeedbackSignal[] {
    return this.signals.slice(-limit);
  }
}
