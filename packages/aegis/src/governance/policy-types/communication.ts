import type { Policy } from '@eaf/core';

export function createExternalCommPolicy(name: string, scope: Policy['scope']): Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: 'Require approval for all external communications',
    type: 'require_approval',
    scope,
    conditions: [{ field: 'action', operator: 'in', value: ['send_email', 'slack_send'] }],
    enforcement: 'block',
    priority: 85,
    status: 'active',
  };
}
