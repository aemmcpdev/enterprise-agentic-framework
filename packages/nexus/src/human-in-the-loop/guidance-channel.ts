import { logger } from '@eaf/core';

export interface GuidanceMessage {
  id: string;
  fromHuman: string;
  toAgent: string;
  message: string;
  type: 'instruction' | 'correction' | 'feedback' | 'clarification';
  timestamp: Date;
}

export class GuidanceChannel {
  private messages: GuidanceMessage[] = [];
  private listeners: Map<string, ((msg: GuidanceMessage) => void)[]> = new Map();

  sendGuidance(fromHuman: string, toAgent: string, message: string, type: GuidanceMessage['type'] = 'instruction'): GuidanceMessage {
    const guidance: GuidanceMessage = {
      id: `guide_${Date.now()}`,
      fromHuman,
      toAgent,
      message,
      type,
      timestamp: new Date(),
    };

    this.messages.push(guidance);

    const agentListeners = this.listeners.get(toAgent) || [];
    for (const listener of agentListeners) {
      listener(guidance);
    }

    logger.info('Guidance sent', { from: fromHuman, to: toAgent, type });
    return guidance;
  }

  onGuidance(agentId: string, handler: (msg: GuidanceMessage) => void): void {
    const existing = this.listeners.get(agentId) || [];
    existing.push(handler);
    this.listeners.set(agentId, existing);
  }

  getGuidanceHistory(agentId: string): GuidanceMessage[] {
    return this.messages.filter((m) => m.toAgent === agentId);
  }
}
