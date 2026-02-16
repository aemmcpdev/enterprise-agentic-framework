import { logger } from '@eaf/core';

export class TenantIsolation {
  private tenantAgents: Map<string, Set<string>> = new Map();

  registerAgent(tenantId: string, agentId: string): void {
    const agents = this.tenantAgents.get(tenantId) || new Set();
    agents.add(agentId);
    this.tenantAgents.set(tenantId, agents);
  }

  isAgentInTenant(tenantId: string, agentId: string): boolean {
    const agents = this.tenantAgents.get(tenantId);
    return agents?.has(agentId) || false;
  }

  canAccess(requestingAgentId: string, targetTenantId: string): boolean {
    for (const [tenantId, agents] of this.tenantAgents) {
      if (agents.has(requestingAgentId)) {
        return tenantId === targetTenantId;
      }
    }
    return false;
  }

  getTenantAgents(tenantId: string): string[] {
    return Array.from(this.tenantAgents.get(tenantId) || []);
  }

  getAgentTenant(agentId: string): string | undefined {
    for (const [tenantId, agents] of this.tenantAgents) {
      if (agents.has(agentId)) return tenantId;
    }
    return undefined;
  }
}
