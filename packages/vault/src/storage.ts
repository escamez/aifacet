import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import argon2 from 'argon2';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/** Argon2id parameters tuned per OWASP recommendations. */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
  hashLength: KEY_LENGTH,
  raw: true,
} as const;

export interface StorageOptions {
  readonly basePath: string;
}

/**
 * Encrypted file-based storage engine.
 * Each context is stored as an AES-256-GCM encrypted JSON file.
 */
export class EncryptedStorage {
  private readonly basePath: string;

  constructor(options: StorageOptions) {
    this.basePath = options.basePath;
    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  async write(filename: string, data: string, passphrase: string): Promise<void> {
    const salt = randomBytes(SALT_LENGTH);
    const key = await argon2.hash(passphrase, { ...ARGON2_OPTIONS, salt });
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const payload = Buffer.concat([salt, iv, authTag, encrypted]);

    const filePath = join(this.basePath, filename);
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, payload);
  }

  async read(filename: string, passphrase: string): Promise<string> {
    const filePath = join(this.basePath, filename);
    const payload = readFileSync(filePath);

    const salt = payload.subarray(0, SALT_LENGTH);
    const iv = payload.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = payload.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
    );
    const encrypted = payload.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

    const key = await argon2.hash(passphrase, { ...ARGON2_OPTIONS, salt });

    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  exists(filename: string): boolean {
    return existsSync(join(this.basePath, filename));
  }

  getBasePath(): string {
    return this.basePath;
  }
}
