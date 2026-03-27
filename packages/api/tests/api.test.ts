import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/index.js';

const TEST_PASSPHRASE = 'test-passphrase';

/** Builds a POST request with JSON body for API endpoint testing. */
function postJson(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/** Adds a facet to the app via the API. Used for test setup. */
async function addFacet(
  app: Hono,
  data: { category: string; key: string; value: unknown },
): Promise<void> {
  await app.request('/api/facets', postJson(data));
}

describe('API', () => {
  let tempDir: string;
  let app: Hono;

  beforeEach(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'aifacet-api-test-'));
    app = await createApp({ vaultPath: tempDir, passphrase: TEST_PASSPHRASE });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------------------
  // Health
  // ---------------------------------------------------------------------------

  describe('given a fresh app', () => {
    describe('when requesting the health endpoint', () => {
      it('then it should return status ok with zero counts and schema version', async () => {
        // when
        const response = await app.request('/api/health');

        // then
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({
          status: 'ok',
          facets: 0,
          policies: 0,
          constitution: 0,
          version: expect.any(String),
        });
      });
    });

    describe('when requesting the plugins list', () => {
      it('then it should return all five registered plugins', async () => {
        // when
        const response = await app.request('/api/plugins');

        // then
        expect(response.status).toBe(200);
        const body = (await response.json()) as { data: Array<{ id: string }> };
        const ids = body.data.map((p) => p.id);
        expect(ids).toEqual(
          expect.arrayContaining(['health', 'facets', 'policies', 'constitution', 'import-export']),
        );
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Facets — creation and validation
  // ---------------------------------------------------------------------------

  describe('given a fresh app', () => {
    describe('when listing facets', () => {
      it('then it should return an empty data array', async () => {
        // when
        const response = await app.request('/api/facets');

        // then
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ data: [] });
      });
    });

    describe('when adding a facet with all required fields', () => {
      it('then it should persist the facet and return 201', async () => {
        // given
        const facetData = { category: 'physical', key: 'height_cm', value: 178 };

        // when
        const response = await app.request('/api/facets', postJson(facetData));

        // then
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ ok: true });
      });
    });

    describe('when adding a facet without category', () => {
      it('then it should return 400 with a validation error', async () => {
        // when
        const response = await app.request('/api/facets', postJson({ key: 'height', value: 178 }));

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when adding a facet without key', () => {
      it('then it should return 400 with a validation error', async () => {
        // when
        const response = await app.request(
          '/api/facets',
          postJson({ category: 'physical', value: 178 }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when adding a facet without value', () => {
      it('then it should return 400 with a validation error', async () => {
        // when
        const response = await app.request(
          '/api/facets',
          postJson({ category: 'physical', key: 'height' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Facets — operations on existing data
  // ---------------------------------------------------------------------------

  describe('given an app with two facets (physical and professional)', () => {
    beforeEach(async () => {
      await addFacet(app, { category: 'physical', key: 'height_cm', value: 178 });
      await addFacet(app, { category: 'professional', key: 'role', value: 'Engineer' });
    });

    describe('when listing all facets', () => {
      it('then it should return both facets', async () => {
        // when
        const response = await app.request('/api/facets');

        // then
        const body = (await response.json()) as { data: unknown[] };
        expect(body.data).toHaveLength(2);
      });
    });

    describe('when filtering facets by category', () => {
      it('then it should return only the matching facet', async () => {
        // when
        const response = await app.request('/api/facets?category=physical');

        // then
        const body = (await response.json()) as { data: Array<{ key: string }> };
        expect(body.data).toHaveLength(1);
        expect(body.data[0].key).toBe('height_cm');
      });
    });

    describe('when deleting an existing facet', () => {
      it('then it should return ok and remove the facet', async () => {
        // when
        const deleteResponse = await app.request('/api/facets/physical/height_cm', {
          method: 'DELETE',
        });

        // then
        expect(deleteResponse.status).toBe(200);
        await expect(deleteResponse.json()).resolves.toMatchObject({ ok: true });

        // verify: facet no longer exists
        const listResponse = await app.request('/api/facets?category=physical');
        const body = (await listResponse.json()) as { data: unknown[] };
        expect(body.data).toHaveLength(0);
      });
    });

    describe('when deleting a facet that does not exist', () => {
      it('then it should return 404', async () => {
        // when
        const response = await app.request('/api/facets/physical/nonexistent', {
          method: 'DELETE',
        });

        // then
        expect(response.status).toBe(404);
      });
    });

    describe('when adding a facet with an existing category and key', () => {
      it('then it should replace the previous value', async () => {
        // given
        const updatedValue = 180;

        // when
        await app.request(
          '/api/facets',
          postJson({ category: 'physical', key: 'height_cm', value: updatedValue }),
        );

        // then
        const response = await app.request('/api/facets?category=physical');
        const body = (await response.json()) as { data: Array<{ value: unknown }> };
        expect(body.data).toHaveLength(1);
        expect(body.data[0].value).toBe(updatedValue);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Policies
  // ---------------------------------------------------------------------------

  describe('given a fresh app', () => {
    describe('when listing consent policies', () => {
      it('then it should return an empty array', async () => {
        // when
        const response = await app.request('/api/policies');

        // then
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ data: [] });
      });
    });

    describe('when adding a consent policy with all required fields', () => {
      it('then it should persist the policy and return 201', async () => {
        // given
        const policyData = {
          facetCategory: 'health',
          accessLevel: 'denied',
          duration: 'persistent',
          grantedTo: 'chatgpt',
        };

        // when
        const response = await app.request('/api/policies', postJson(policyData));

        // then
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ ok: true });
      });
    });

    describe('when adding a policy without facetCategory', () => {
      it('then it should return 400', async () => {
        // when
        const response = await app.request(
          '/api/policies',
          postJson({ accessLevel: 'denied', duration: 'persistent' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when adding a policy without accessLevel', () => {
      it('then it should return 400', async () => {
        // when
        const response = await app.request(
          '/api/policies',
          postJson({ facetCategory: 'health', duration: 'persistent' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when adding a policy without duration', () => {
      it('then it should return 400', async () => {
        // when
        const response = await app.request(
          '/api/policies',
          postJson({ facetCategory: 'health', accessLevel: 'denied' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });
  });

  describe('given an app with a consent policy denying health to chatgpt', () => {
    beforeEach(async () => {
      await app.request(
        '/api/policies',
        postJson({
          facetCategory: 'health',
          accessLevel: 'denied',
          duration: 'persistent',
          grantedTo: 'chatgpt',
        }),
      );
    });

    describe('when listing policies', () => {
      it('then it should return the stored policy with correct fields', async () => {
        // when
        const response = await app.request('/api/policies');

        // then
        const body = (await response.json()) as { data: Array<Record<string, unknown>> };
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({
          facetCategory: 'health',
          accessLevel: 'denied',
          grantedTo: 'chatgpt',
        });
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Constitution
  // ---------------------------------------------------------------------------

  describe('given a fresh app', () => {
    describe('when listing constitutional rules', () => {
      it('then it should return an empty array', async () => {
        // when
        const response = await app.request('/api/constitution');

        // then
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({ data: [] });
      });
    });

    describe('when adding a constitutional rule with all required fields', () => {
      it('then it should persist the rule and return 201', async () => {
        // given
        const ruleData = {
          description: 'Never share political views',
          facetCategory: 'political',
          maxAccessLevel: 'hidden',
        };

        // when
        const response = await app.request('/api/constitution', postJson(ruleData));

        // then
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({ ok: true });
      });
    });

    describe('when adding a rule without description', () => {
      it('then it should return 400', async () => {
        // when
        const response = await app.request(
          '/api/constitution',
          postJson({ facetCategory: 'political', maxAccessLevel: 'hidden' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when adding a rule without facetCategory', () => {
      it('then it should return 400', async () => {
        // when
        const response = await app.request(
          '/api/constitution',
          postJson({ description: 'Rule', maxAccessLevel: 'hidden' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when adding a rule without maxAccessLevel', () => {
      it('then it should return 400', async () => {
        // when
        const response = await app.request(
          '/api/constitution',
          postJson({ description: 'Rule', facetCategory: 'political' }),
        );

        // then
        expect(response.status).toBe(400);
      });
    });
  });

  describe('given an app with a constitutional rule blocking political data', () => {
    beforeEach(async () => {
      await app.request(
        '/api/constitution',
        postJson({
          description: 'Never share political views',
          facetCategory: 'political',
          maxAccessLevel: 'hidden',
        }),
      );
    });

    describe('when listing constitutional rules', () => {
      it('then it should return the stored rule with a generated ID', async () => {
        // when
        const response = await app.request('/api/constitution');

        // then
        const body = (await response.json()) as {
          data: Array<{ id: string; description: string }>;
        };
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({
          description: 'Never share political views',
          facetCategory: 'political',
          maxAccessLevel: 'hidden',
        });
        expect(body.data[0].id).toBeDefined();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Import / Export
  // ---------------------------------------------------------------------------

  describe('given an app with two facets', () => {
    beforeEach(async () => {
      await addFacet(app, { category: 'physical', key: 'height_cm', value: 178 });
      await addFacet(app, { category: 'professional', key: 'role', value: 'Engineer' });
    });

    describe('when exporting the full context', () => {
      it('then it should return a JSON file with all facets', async () => {
        // when
        const response = await app.request('/api/transfer/export');

        // then
        expect(response.status).toBe(200);
        expect(response.headers.get('content-disposition')).toContain('aifacet-context.json');
        const body = (await response.json()) as { facets: unknown[] };
        expect(body.facets).toHaveLength(2);
      });
    });
  });

  describe('given a fresh app', () => {
    describe('when importing valid facets with metadata', () => {
      it('then it should import all facets and report the count', async () => {
        // given
        const facetsToImport = [
          {
            category: 'physical',
            key: 'height_cm',
            value: 178,
            meta: {
              updatedAt: '2025-01-01T00:00:00.000Z',
              source: 'imported',
              confidence: 1.0,
              accessLevel: 'full',
            },
          },
          {
            category: 'professional',
            key: 'role',
            value: 'Engineer',
            meta: {
              updatedAt: '2025-01-01T00:00:00.000Z',
              source: 'imported',
              confidence: 1.0,
              accessLevel: 'full',
            },
          },
        ];

        // when
        const response = await app.request(
          '/api/transfer/import',
          postJson({ facets: facetsToImport }),
        );

        // then
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({
          ok: true,
          imported: 2,
          skipped: 0,
        });
      });

      it('then the imported facets should be retrievable via the facets endpoint', async () => {
        // given
        const facetsToImport = [
          {
            category: 'physical',
            key: 'height_cm',
            value: 178,
            meta: {
              updatedAt: '2025-01-01T00:00:00.000Z',
              source: 'imported',
              confidence: 1.0,
              accessLevel: 'full',
            },
          },
        ];

        // when
        await app.request('/api/transfer/import', postJson({ facets: facetsToImport }));

        // then
        const listResponse = await app.request('/api/facets');
        const body = (await listResponse.json()) as { data: unknown[] };
        expect(body.data).toHaveLength(1);
      });
    });

    describe('when importing without a facets array', () => {
      it('then it should return 400 with a descriptive error', async () => {
        // when
        const response = await app.request('/api/transfer/import', postJson({ notFacets: [] }));

        // then
        expect(response.status).toBe(400);
      });
    });

    describe('when importing a mix of valid and invalid facets', () => {
      it('then it should import valid facets and report the skipped count', async () => {
        // given
        const mixedFacets = [
          { category: 'physical', key: 'height_cm', value: 178 },
          { category: 'professional' }, // missing key and value
          { key: 'role', value: 'Engineer' }, // missing category
        ];

        // when
        const response = await app.request(
          '/api/transfer/import',
          postJson({ facets: mixedFacets }),
        );

        // then
        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toMatchObject({
          imported: 1,
          skipped: 2,
        });
      });
    });
  });
});
