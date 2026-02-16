import { logger } from '@eaf/core';

export interface HumanFeedback {
  id: string;
  agentId: string;
  taskId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  feedbackType: 'quality' | 'accuracy' | 'speed' | 'general';
  timestamp: Date;
}

export class FeedbackCapture {
  private feedback: HumanFeedback[] = [];

  capture(agentId: string, rating: HumanFeedback['rating'], feedbackType: HumanFeedback['feedbackType'], comment?: string, taskId?: string): HumanFeedback {
    const entry: HumanFeedback = {
      id: `fb_${Date.now()}`,
      agentId,
      taskId,
      rating,
      comment,
      feedbackType,
      timestamp: new Date(),
    };

    this.feedback.push(entry);
    logger.info('Feedback captured', { agentId, rating, type: feedbackType });
    return entry;
  }

  getAgentFeedback(agentId: string): HumanFeedback[] {
    return this.feedback.filter((f) => f.agentId === agentId);
  }

  getAverageRating(agentId: string): number {
    const agentFeedback = this.getAgentFeedback(agentId);
    if (agentFeedback.length === 0) return 0;
    return agentFeedback.reduce((sum, f) => sum + f.rating, 0) / agentFeedback.length;
  }

  getAllFeedback(): HumanFeedback[] {
    return [...this.feedback];
  }
}
