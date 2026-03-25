import { homedir } from 'node:os';
import { join } from 'node:path';
import { Vault } from '@aime/vault';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const DEFAULT_VAULT_PATH = join(homedir(), '.aime', 'vault');
const DEFAULT_PASSPHRASE = process.env.AIME_PASSPHRASE ?? 'default-dev-passphrase';

/** Creates and configures the AIME MCP server with all tools and resources. */
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
    'about_me',
    'Get information about the user — their profile, preferences, skills, and personal context. Optionally filter by category (e.g. "professional", "health", "preferences").',
    { category: z.string().optional().describe('Facet category to filter by') },
    async ({ category }) => {
      const facets = vault.getFacets(category);
      return {
        content: [{ type: 'text', text: JSON.stringify(facets, null, 2) }],
      };
    },
  );

  server.tool(
    'what_can_you_know',
    "Get the user context that this AI provider is authorized to see, based on the user's consent policies and constitutional rules.",
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

export { createServer };
