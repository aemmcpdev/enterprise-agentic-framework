import { logger } from '@eaf/core';

interface KeyState {
  key: string;
  provider: string;
  active: boolean;
  lastUsed?: Date;
  errorCount: number;
  cooldownUntil?: Date;
}

export class KeyManager {
  private keys: Map<string, KeyState[]> = new Map();
  private cooldownMs = 60_000;

  addKey(provider: string, key: string): void {
    const existing = this.keys.get(provider) || [];
    existing.push({
      key,
      provider,
      active: true,
      errorCount: 0,
    });
    this.keys.set(provider, existing);
  }

  getKey(provider: string): string | null {
    const keys = this.keys.get(provider);
    if (!keys || keys.length === 0) return null;

    const now = new Date();

    // Find first active key not in cooldown
    for (const state of keys) {
      if (state.active && (!state.cooldownUntil || state.cooldownUntil <= now)) {
        state.lastUsed = now;
        return state.key;
      }
    }

    // If all in cooldown, return the one whose cooldown expires soonest
    const sortedByCooldown = keys
      .filter((k) => k.active)
      .sort((a, b) => (a.cooldownUntil?.getTime() || 0) - (b.cooldownUntil?.getTime() || 0));

    if (sortedByCooldown.length > 0) {
      return sortedByCooldown[0]!.key;
    }

    return null;
  }

  reportError(provider: string, key: string): void {
    const keys = this.keys.get(provider);
    if (!keys) return;

    const state = keys.find((k) => k.key === key);
    if (!state) return;

    state.errorCount++;

    if (state.errorCount >= 3) {
      state.cooldownUntil = new Date(Date.now() + this.cooldownMs);
      state.errorCount = 0;
      logger.warn('API key placed in cooldown', { provider, cooldownMs: this.cooldownMs });
    }
  }

  reportSuccess(provider: string, key: string): void {
    const keys = this.keys.get(provider);
    if (!keys) return;

    const state = keys.find((k) => k.key === key);
    if (state) {
      state.errorCount = 0;
      state.cooldownUntil = undefined;
    }
  }

  disableKey(provider: string, key: string): void {
    const keys = this.keys.get(provider);
    if (!keys) return;

    const state = keys.find((k) => k.key === key);
    if (state) state.active = false;
  }

  getActiveKeyCount(provider: string): number {
    const keys = this.keys.get(provider) || [];
    return keys.filter((k) => k.active).length;
  }
}
