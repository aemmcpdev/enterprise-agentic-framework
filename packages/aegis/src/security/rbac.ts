import { logger } from '@eaf/core';

export interface Role {
  name: string;
  permissions: string[];
  description?: string;
}

export class RBAC {
  private roles: Map<string, Role> = new Map();
  private agentRoles: Map<string, string[]> = new Map();

  addRole(role: Role): void {
    this.roles.set(role.name, role);
    logger.info('Role added', { name: role.name });
  }

  assignRole(agentId: string, roleName: string): void {
    const roles = this.agentRoles.get(agentId) || [];
    if (!roles.includes(roleName)) {
      roles.push(roleName);
      this.agentRoles.set(agentId, roles);
    }
  }

  removeRole(agentId: string, roleName: string): void {
    const roles = this.agentRoles.get(agentId) || [];
    this.agentRoles.set(agentId, roles.filter((r) => r !== roleName));
  }

  hasPermission(agentId: string, permission: string): boolean {
    const roleNames = this.agentRoles.get(agentId) || [];
    for (const roleName of roleNames) {
      const role = this.roles.get(roleName);
      if (!role) continue;
      for (const p of role.permissions) {
        if (p === '*' || p === permission) return true;
        if (p.endsWith('.*') && permission.startsWith(p.slice(0, -1))) return true;
      }
    }
    return false;
  }

  getAgentPermissions(agentId: string): string[] {
    const roleNames = this.agentRoles.get(agentId) || [];
    const permissions = new Set<string>();
    for (const roleName of roleNames) {
      const role = this.roles.get(roleName);
      if (role) role.permissions.forEach((p) => permissions.add(p));
    }
    return Array.from(permissions);
  }

  getAgentRoles(agentId: string): string[] {
    return this.agentRoles.get(agentId) || [];
  }
}
