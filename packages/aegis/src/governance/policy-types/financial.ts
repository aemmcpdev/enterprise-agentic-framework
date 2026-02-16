import type { Policy } from '@eaf/core';

export function createBudgetPolicy(name: string, scope: Policy['scope'], maxSpend: number): Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: `Budget limit: $${maxSpend}`,
    type: 'deny',
    scope,
    conditions: [{ field: 'total_cost', operator: 'gt', value: maxSpend }],
    enforcement: 'block',
    priority: 95,
    status: 'active',
  };
}
