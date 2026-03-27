import type { Facet } from '@aifacet/schema';
import type { Vault } from '@aifacet/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createImportExportPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  /** Export entire context as JSON */
  app.get('/export', (c) => {
    const ctx = vault.getContext();
    c.header('Content-Disposition', 'attachment; filename="aifacet-context.json"');
    return c.json(ctx);
  });

  /** Import facets from a JSON array */
  app.post('/import', async (c) => {
    const body = await c.req.json<{ facets: Facet[] }>();

    if (!body.facets || !Array.isArray(body.facets)) {
      return c.json({ error: 'Request body must contain a "facets" array' }, 400);
    }

    let imported = 0;
    for (const facet of body.facets) {
      if (!facet.category || !facet.key || facet.value === undefined) {
        continue;
      }
      await vault.addFacet({
        category: facet.category,
        key: facet.key,
        value: facet.value,
        meta: facet.meta ?? {
          updatedAt: new Date().toISOString(),
          source: 'imported',
          confidence: 1.0,
          accessLevel: 'full',
        },
      });
      imported++;
    }

    return c.json({ ok: true, imported, skipped: body.facets.length - imported }, 201);
  });

  return { id: 'import-export', name: 'Import/Export', basePath: '/transfer', routes: app };
}
