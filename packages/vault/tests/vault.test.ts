import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Facet } from '@aifacet/schema';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Vault } from '../src/vault.js';

describe('Vault', () => {
  let tempDir: string;
  const passphrase = 'test-vault-passphrase';

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'aifacet-vault-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  const createTestFacet = (overrides?: Partial<Facet>): Facet => ({
    category: 'physical',
    key: 'height_cm',
    value: 178,
    meta: {
      updatedAt: new Date().toISOString(),
      source: 'self-reported',
      confidence: 1.0,
      accessLevel: 'full',
    },
    ...overrides,
  });

  describe('given a new vault', () => {
    describe('when opening for the first time', () => {
      it('then it should create an empty context', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        const ctx = vault.getContext();

        expect(ctx.id).toBeDefined();
        expect(ctx.facets).toEqual([]);
        expect(ctx.policies).toEqual([]);
        expect(ctx.constitution).toEqual([]);
      });
    });

    describe('when reopening an existing vault', () => {
      it('then it should preserve the context', () => {
        const vault1 = Vault.open({ storagePath: tempDir, passphrase });
        const originalId = vault1.getContext().id;
        vault1.addFacet(createTestFacet());

        const vault2 = Vault.open({ storagePath: tempDir, passphrase });

        expect(vault2.getContext().id).toBe(originalId);
        expect(vault2.getFacets()).toHaveLength(1);
      });
    });
  });

  describe('given a vault with facets', () => {
    describe('when adding a facet', () => {
      it('then it should be retrievable', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        const facet = createTestFacet();

        vault.addFacet(facet);

        expect(vault.getFacets()).toHaveLength(1);
        expect(vault.getFacets()[0]?.key).toBe('height_cm');
      });
    });

    describe('when adding a facet with the same category and key', () => {
      it('then it should replace the existing one', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        vault.addFacet(createTestFacet({ value: 178 }));
        vault.addFacet(createTestFacet({ value: 180 }));

        expect(vault.getFacets()).toHaveLength(1);
        expect(vault.getFacets()[0]?.value).toBe(180);
      });
    });

    describe('when filtering facets by category', () => {
      it('then it should return only matching facets', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        vault.addFacet(createTestFacet({ category: 'physical', key: 'height_cm' }));
        vault.addFacet(createTestFacet({ category: 'professional', key: 'role' }));

        expect(vault.getFacets('physical')).toHaveLength(1);
        expect(vault.getFacets('professional')).toHaveLength(1);
        expect(vault.getFacets('health')).toHaveLength(0);
      });
    });

    describe('when removing a facet', () => {
      it('then it should no longer be retrievable', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        vault.addFacet(createTestFacet());

        const removed = vault.removeFacet('physical', 'height_cm');

        expect(removed).toBe(true);
        expect(vault.getFacets()).toHaveLength(0);
      });

      it('then it should return false for non-existent facets', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });

        expect(vault.removeFacet('physical', 'nonexistent')).toBe(false);
      });
    });
  });

  describe('given a vault with consent policies', () => {
    describe('when a constitutional rule blocks a category', () => {
      it('then authorized facets should exclude that category', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        vault.addFacet(createTestFacet({ category: 'physical', key: 'height_cm' }));
        vault.addFacet(
          createTestFacet({ category: 'political', key: 'leaning', value: 'private' }),
        );

        vault.addConstitutionalRule({
          id: 'rule-1',
          description: 'Never share political views',
          facetCategory: 'political',
          maxAccessLevel: 'hidden',
          createdAt: new Date().toISOString(),
        });

        const authorized = vault.getAuthorizedFacets('some-ai-provider');

        expect(authorized).toHaveLength(1);
        expect(authorized[0]?.category).toBe('physical');
      });
    });

    describe('when a policy denies access for a provider', () => {
      it('then that provider should not see the facet', () => {
        const vault = Vault.open({ storagePath: tempDir, passphrase });
        vault.addFacet(createTestFacet({ category: 'health', key: 'allergies' }));

        vault.addPolicy({
          facetCategory: 'health',
          accessLevel: 'denied',
          duration: 'persistent',
          grantedTo: 'chatgpt',
          createdAt: new Date().toISOString(),
        });

        expect(vault.getAuthorizedFacets('chatgpt')).toHaveLength(0);
        expect(vault.getAuthorizedFacets('claude')).toHaveLength(1);
      });
    });
  });
});
