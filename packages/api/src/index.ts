import { Vault } from '@aifacet/vault';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createConstitutionPlugin } from './plugins/constitution.js';
import { createFacetsPlugin } from './plugins/facets.js';
import { createHealthPlugin } from './plugins/health.js';
import { createImportExportPlugin } from './plugins/import-export.js';
import { createPoliciesPlugin } from './plugins/policies.js';
import type { ApiPlugin } from './plugins/types.js';

const PORT = Number(process.env.AIFACET_API_PORT) || 3100;
const VAULT_PATH = process.env.AIFACET_VAULT_PATH ?? `${process.env.HOME}/.aifacet/vault`;
const PASSPHRASE = process.env.AIFACET_PASSPHRASE ?? 'default-dev-passphrase';

function createApp(): Hono {
  const vault = Vault.open({ storagePath: VAULT_PATH, passphrase: PASSPHRASE });
  const app = new Hono();

  app.use('*', logger());
  app.use('*', cors());

  // Register plugins
  const plugins: ApiPlugin[] = [
    createHealthPlugin(vault),
    createFacetsPlugin(vault),
    createPoliciesPlugin(vault),
    createConstitutionPlugin(vault),
    createImportExportPlugin(vault),
  ];

  const api = new Hono();
  for (const plugin of plugins) {
    api.route(plugin.basePath, plugin.routes);
  }

  app.route('/api', api);

  // Plugin listing endpoint
  app.get('/api/plugins', (c) =>
    c.json({
      data: plugins.map((p) => ({ id: p.id, name: p.name, basePath: `/api${p.basePath}` })),
    }),
  );

  return app;
}

const app = createApp();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`AIFacet API running on http://localhost:${info.port}`);
});

export { createApp };
