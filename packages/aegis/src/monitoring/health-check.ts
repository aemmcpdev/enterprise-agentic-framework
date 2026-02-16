import { logger } from '@eaf/core';

export interface HealthStatus {
  agentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastHeartbeat: Date;
  uptime: number;
  errorRate: number;
  avgResponseTime: number;
}

export class HealthCheck {
  private statuses: Map<string, HealthStatus> = new Map();
  private heartbeatTimeout = 60_000;

  recordHeartbeat(agentId: string, metrics: { errorRate: number; avgResponseTime: number }): void {
    const existing = this.statuses.get(agentId);
    const now = new Date();

    let status: HealthStatus['status'] = 'healthy';
    if (metrics.errorRate > 0.1) status = 'degraded';
    if (metrics.errorRate > 0.5 || metrics.avgResponseTime > 30000) status = 'unhealthy';

    this.statuses.set(agentId, {
      agentId,
      status,
      lastHeartbeat: now,
      uptime: existing ? now.getTime() - existing.lastHeartbeat.getTime() + existing.uptime : 0,
      errorRate: metrics.errorRate,
      avgResponseTime: metrics.avgResponseTime,
    });
  }

  getStatus(agentId: string): HealthStatus | undefined {
    return this.statuses.get(agentId);
  }

  getAllStatuses(): HealthStatus[] {
    return Array.from(this.statuses.values());
  }

  getUnhealthy(): HealthStatus[] {
    const now = Date.now();
    return this.getAllStatuses().filter((s) => {
      if (s.status === 'unhealthy') return true;
      if (now - s.lastHeartbeat.getTime() > this.heartbeatTimeout) return true;
      return false;
    });
  }

  isHealthy(agentId: string): boolean {
    const status = this.statuses.get(agentId);
    if (!status) return false;
    return status.status === 'healthy' && (Date.now() - status.lastHeartbeat.getTime()) < this.heartbeatTimeout;
  }
}
