import { logger, generateId } from '@eaf/core';

export interface ApprovalRequest {
  id: string;
  agentId: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  respondedBy?: string;
  reason?: string;
}

export class ApprovalGate {
  private requests: Map<string, ApprovalRequest> = new Map();
  private handlers: ((request: ApprovalRequest) => void)[] = [];

  requestApproval(agentId: string, action: string, description: string, metadata: Record<string, unknown> = {}): ApprovalRequest {
    const request: ApprovalRequest = {
      id: generateId(),
      agentId,
      action,
      description,
      metadata,
      status: 'pending',
      requestedAt: new Date(),
    };

    this.requests.set(request.id, request);
    logger.info('Approval requested', { id: request.id, agentId, action });

    for (const handler of this.handlers) {
      handler(request);
    }

    return request;
  }

  approve(requestId: string, respondedBy: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') return false;

    request.status = 'approved';
    request.respondedAt = new Date();
    request.respondedBy = respondedBy;

    logger.info('Approval granted', { id: requestId, by: respondedBy });
    return true;
  }

  reject(requestId: string, respondedBy: string, reason?: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') return false;

    request.status = 'rejected';
    request.respondedAt = new Date();
    request.respondedBy = respondedBy;
    request.reason = reason;

    logger.info('Approval rejected', { id: requestId, by: respondedBy, reason });
    return true;
  }

  getRequest(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  getPending(): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === 'pending');
  }

  onRequest(handler: (request: ApprovalRequest) => void): void {
    this.handlers.push(handler);
  }
}
