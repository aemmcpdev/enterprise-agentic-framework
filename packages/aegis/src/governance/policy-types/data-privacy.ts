import type { Policy } from '@eaf/core';

export function createDataPrivacyPolicy(name: string, scope: Policy['scope']): Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: 'Prevents agents from accessing or transmitting PII without approval',
    type: 'require_approval',
    scope,
    conditions: [{ field: 'action', operator: 'matches', value: '(pii|personal|ssn|credit_card)' }],
    enforcement: 'block',
    priority: 90,
    status: 'active',
  };
}
