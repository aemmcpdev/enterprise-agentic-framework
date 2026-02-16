import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { logger } from '@eaf/core';

export class CredentialVault {
  private store: Map<string, string> = new Map();
  private encryptionKey: Buffer;

  constructor(masterPassword: string = process.env.VAULT_MASTER_KEY || 'default-dev-key') {
    this.encryptionKey = scryptSync(masterPassword, 'eaf-vault-salt', 32);
  }

  set(key: string, value: string): void {
    const encrypted = this.encrypt(value);
    this.store.set(key, encrypted);
    logger.debug('Credential stored', { key });
  }

  get(key: string): string | null {
    const encrypted = this.store.get(key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  listKeys(): string[] {
    return Array.from(this.store.keys());
  }

  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  private decrypt(data: string): string {
    const [ivHex, authTagHex, encrypted] = data.split(':');
    const iv = Buffer.from(ivHex!, 'hex');
    const authTag = Buffer.from(authTagHex!, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted!, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
