import type { FacetSource } from '@aifacet/schema';
import type { Vault } from '@aifacet/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createFacetsPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  /** List all facets, optionally filtered by category */
  app.get('/', (c) => {
    const category = c.req.query('category');
    const facets = vault.getFacets(category);
    return c.json({ data: facets });
  });

  /** Add or update a facet */
  app.post('/', async (c) => {
    const body = await c.req.json<{
      category: string;
      key: string;
      value: unknown;
      source?: FacetSource;
      accessLevel?: string;
    }>();

    if (!body.category || !body.key || body.value === undefined) {
      return c.json({ error: 'category, key, and value are required' }, 400);
    }

    vault.addFacet({
      category: body.category,
      key: body.key,
      value: body.value,
      meta: {
        updatedAt: new Date().toISOString(),
        source: body.source ?? 'self-reported',
        confidence: 1.0,
        accessLevel: (body.accessLevel as 'full') ?? 'full',
      },
    });

    return c.json({ ok: true }, 201);
  });

  /** Delete a facet by category and key */
  app.delete('/:category/:key', (c) => {
    const { category, key } = c.req.param();
    const removed = vault.removeFacet(category, key);
    if (!removed) {
      return c.json({ error: 'Facet not found' }, 404);
    }
    return c.json({ ok: true });
  });

  return { id: 'facets', name: 'Facets', basePath: '/facets', routes: app };
}
