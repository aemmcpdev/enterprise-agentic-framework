import type { Policy } from '@eaf/core';

export function createAuthorityBoundaryPolicy(name: string, scope: Policy['scope'], allowedActions: string[]): Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: 'Restrict agent to specified actions only',
    type: 'deny',
    scope,
    conditions: [{ field: 'action', operator: 'not_in', value: allowedActions }],
    enforcement: 'block',
    priority: 80,
    status: 'active',
  };
}
