import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionService {
  private key: Buffer;

  constructor(keyHex?: string) {
    this.key = keyHex ? Buffer.from(keyHex, 'hex') : randomBytes(32);
  }

  encrypt(data: string): { encrypted: string; iv: string; authTag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(encrypted: string, ivHex: string, authTagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  getKeyHex(): string {
    return this.key.toString('hex');
  }
}
