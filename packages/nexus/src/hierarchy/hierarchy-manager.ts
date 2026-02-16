import { logger } from '@eaf/core';
import type { AgentHierarchyNode, DelegationRule } from '@eaf/core';

export class HierarchyManager {
  private nodes: Map<string, AgentHierarchyNode> = new Map();
  private delegationRules: DelegationRule[] = [];

  registerAgent(
    agentId: string,
    name: string,
    role: 'strategic' | 'supervisor' | 'task',
    parentId?: string
  ): void {
    const node: AgentHierarchyNode = {
      agentId,
      name,
      role,
      parentId,
      children: [],
      status: 'idle',
    };

    this.nodes.set(agentId, node);

    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        parent.children.push(agentId);
      }
    }

    logger.info('Agent registered in hierarchy', { agentId, name, role, parentId });
  }

  unregisterAgent(agentId: string): void {
    const node = this.nodes.get(agentId);
    if (!node) return;

    // Remove from parent's children
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter((id) => id !== agentId);
      }
    }

    // Re-parent children to grandparent
    for (const childId of node.children) {
      const child = this.nodes.get(childId);
      if (child) {
        child.parentId = node.parentId;
      }
    }

    this.nodes.delete(agentId);
  }

  getNode(agentId: string): AgentHierarchyNode | undefined {
    return this.nodes.get(agentId);
  }

  getChildren(agentId: string): AgentHierarchyNode[] {
    const node = this.nodes.get(agentId);
    if (!node) return [];
    return node.children
      .map((id) => this.nodes.get(id))
      .filter(Boolean) as AgentHierarchyNode[];
  }

  getParent(agentId: string): AgentHierarchyNode | undefined {
    const node = this.nodes.get(agentId);
    if (!node || !node.parentId) return undefined;
    return this.nodes.get(node.parentId);
  }

  getSiblings(agentId: string): AgentHierarchyNode[] {
    const node = this.nodes.get(agentId);
    if (!node || !node.parentId) return [];
    return this.getChildren(node.parentId).filter((n) => n.agentId !== agentId);
  }

  getStrategicAgents(): AgentHierarchyNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.role === 'strategic');
  }

  getSupervisors(strategicId?: string): AgentHierarchyNode[] {
    if (strategicId) return this.getChildren(strategicId);
    return Array.from(this.nodes.values()).filter((n) => n.role === 'supervisor');
  }

  getTaskAgents(supervisorId?: string): AgentHierarchyNode[] {
    if (supervisorId) return this.getChildren(supervisorId);
    return Array.from(this.nodes.values()).filter((n) => n.role === 'task');
  }

  addDelegationRule(rule: DelegationRule): void {
    this.delegationRules.push(rule);
  }

  findDelegationTarget(fromRole: string, taskPattern: string): AgentHierarchyNode | null {
    const rule = this.delegationRules.find(
      (r) => r.fromRole === fromRole && new RegExp(r.taskPattern).test(taskPattern)
    );
    if (!rule) return null;

    const candidates = Array.from(this.nodes.values()).filter(
      (n) => n.role === rule.toRole && n.status === 'idle'
    );
    return candidates[0] || null;
  }

  getFullHierarchy(): AgentHierarchyNode[] {
    return Array.from(this.nodes.values());
  }

  updateStatus(agentId: string, status: string): void {
    const node = this.nodes.get(agentId);
    if (node) node.status = status;
  }
}
