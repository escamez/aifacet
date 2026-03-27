import type { AccessLevel } from '@aifacet/schema';
import type { Vault } from '@aifacet/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createConstitutionPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  /** List all constitutional rules */
  app.get('/', (c) => {
    const ctx = vault.getContext();
    return c.json({ data: ctx.constitution });
  });

  /** Add a constitutional rule */
  app.post('/', async (c) => {
    const body = await c.req.json<{
      description: string;
      facetCategory: string;
      maxAccessLevel: AccessLevel;
    }>();

    if (!body.description || !body.facetCategory || !body.maxAccessLevel) {
      return c.json({ error: 'description, facetCategory, and maxAccessLevel are required' }, 400);
    }

    await vault.addConstitutionalRule({
      id: crypto.randomUUID(),
      description: body.description,
      facetCategory: body.facetCategory,
      maxAccessLevel: body.maxAccessLevel,
      createdAt: new Date().toISOString(),
    });

    return c.json({ ok: true }, 201);
  });

  return { id: 'constitution', name: 'Constitution', basePath: '/constitution', routes: app };
}
