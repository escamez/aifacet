import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EncryptedStorage } from '../src/storage.js';

describe('EncryptedStorage', () => {
  let tempDir: string;
  let storage: EncryptedStorage;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'aifacet-test-'));
    storage = new EncryptedStorage({ basePath: tempDir });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('given a new storage instance', () => {
    describe('when writing and reading data', () => {
      it('then it should round-trip correctly', async () => {
        const data = JSON.stringify({ hello: 'world', number: 42 });
        const passphrase = 'test-passphrase-123';

        await storage.write('test.vault', data, passphrase);
        const result = await storage.read('test.vault', passphrase);

        expect(result).toBe(data);
      });
    });

    describe('when reading with wrong passphrase', () => {
      it('then it should throw an error', async () => {
        await storage.write('test.vault', 'secret data', 'correct-passphrase');

        await expect(storage.read('test.vault', 'wrong-passphrase')).rejects.toThrow();
      });
    });

    describe('when checking file existence', () => {
      it('then it should return false for non-existent files', () => {
        expect(storage.exists('nonexistent.vault')).toBe(false);
      });

      it('then it should return true after writing', async () => {
        await storage.write('test.vault', 'data', 'pass');
        expect(storage.exists('test.vault')).toBe(true);
      });
    });
  });

  describe('given encrypted data', () => {
    describe('when writing the same data twice', () => {
      it('then it should produce different ciphertexts (random IV/salt)', async () => {
        const data = 'same data';
        const passphrase = 'same-pass';

        await storage.write('file1.vault', data, passphrase);
        await storage.write('file2.vault', data, passphrase);

        const file1 = readFileSync(join(tempDir, 'file1.vault'));
        const file2 = readFileSync(join(tempDir, 'file2.vault'));

        expect(Buffer.compare(file1, file2)).not.toBe(0);
      });
    });
  });
});
