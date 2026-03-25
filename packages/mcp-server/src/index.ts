import { homedir } from 'node:os';
import { join } from 'node:path';
import { Vault } from '@aime/vault';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const DEFAULT_VAULT_PATH = join(homedir(), '.aime', 'vault');
const DEFAULT_PASSPHRASE = process.env.AIME_PASSPHRASE ?? 'default-dev-passphrase';

function createServer(): McpServer {
  const vaultPath = process.env.AIME_VAULT_PATH ?? DEFAULT_VAULT_PATH;
  const passphrase = process.env.AIME_PASSPHRASE ?? DEFAULT_PASSPHRASE;

  const vault = Vault.open({ storagePath: vaultPath, passphrase });
  const server = new McpServer({
    name: 'aime-context',
    version: '0.1.0',
  });

  server.resource('context', 'aime://context', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(vault.getContext(), null, 2),
      },
    ],
  }));

  server.resource(
    'facets-by-category',
    new ResourceTemplate('aime://facets/{category}', { list: undefined }),
    async (uri, params) => {
      const category = params.category as string;
      const facets = vault.getFacets(category);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(facets, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    'get_facets',
    'Get user context facets, optionally filtered by category',
    { category: z.string().optional().describe('Facet category to filter by') },
    async ({ category }) => {
      const facets = vault.getFacets(category);
      return {
        content: [{ type: 'text', text: JSON.stringify(facets, null, 2) }],
      };
    },
  );

  server.tool(
    'get_authorized_context',
    'Get context facets authorized for this AI provider',
    { provider_id: z.string().describe('The AI provider identifier') },
    async ({ provider_id }) => {
      const facets = vault.getAuthorizedFacets(provider_id);
      return {
        content: [{ type: 'text', text: JSON.stringify(facets, null, 2) }],
      };
    },
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error('Failed to start AIME MCP server:', error);
  process.exit(1);
});

export { createServer };
