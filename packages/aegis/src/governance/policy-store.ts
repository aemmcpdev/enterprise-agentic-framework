import { logger } from '@eaf/core';
import type { Policy } from '@eaf/core';

export class PolicyStore {
  private policies: Map<string, Policy> = new Map();

  save(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  get(id: string): Policy | undefined {
    return this.policies.get(id);
  }

  getAll(): Policy[] {
    return Array.from(this.policies.values());
  }

  getActive(): Policy[] {
    return this.getAll().filter((p) => p.status === 'active');
  }

  delete(id: string): boolean {
    return this.policies.delete(id);
  }

  getByType(type: string): Policy[] {
    return this.getAll().filter((p) => p.type === type);
  }
}
