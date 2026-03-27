import type { AccessLevel, ConsentDuration } from '@aifacet/schema';
import type { Vault } from '@aifacet/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createPoliciesPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  /** List all consent policies */
  app.get('/', (c) => {
    const ctx = vault.getContext();
    return c.json({ data: ctx.policies });
  });

  /** Add a consent policy */
  app.post('/', async (c) => {
    const body = await c.req.json<{
      facetCategory: string;
      accessLevel: AccessLevel;
      duration: ConsentDuration;
      grantedTo?: string;
      expiresAt?: string;
    }>();

    if (!body.facetCategory || !body.accessLevel || !body.duration) {
      return c.json({ error: 'facetCategory, accessLevel, and duration are required' }, 400);
    }

    await vault.addPolicy({
      ...body,
      createdAt: new Date().toISOString(),
    });

    return c.json({ ok: true }, 201);
  });

  return { id: 'policies', name: 'Policies', basePath: '/policies', routes: app };
}
