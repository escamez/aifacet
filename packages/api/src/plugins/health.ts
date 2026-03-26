import type { Vault } from '@aifacet/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createHealthPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  app.get('/', (c) => {
    const ctx = vault.getContext();
    return c.json({
      status: 'ok',
      version: ctx.version,
      facets: ctx.facets.length,
      policies: ctx.policies.length,
      constitution: ctx.constitution.length,
    });
  });

  return { id: 'health', name: 'Health', basePath: '/health', routes: app };
}
