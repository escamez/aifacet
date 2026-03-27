import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Facet } from '@aifacet/schema';
import { Vault } from '@aifacet/vault';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServer } from '../src/server.js';

const TEST_PASSPHRASE = 'test-passphrase';

/** Creates a test facet with sensible defaults and optional overrides. */
const createTestFacet = (overrides?: Partial<Facet>): Facet => ({
  category: 'physical',
  key: 'height_cm',
  value: 178,
  meta: {
    updatedAt: '2025-01-01T00:00:00.000Z',
    source: 'self-reported',
    confidence: 1.0,
    accessLevel: 'full',
  },
  ...overrides,
});

/**
 * Extracts and parses the JSON text content returned by an MCP tool call.
 * All AIFacet tools return a single text content block with JSON-serialised data.
 */
function parseFacetsFromResult(result: Awaited<ReturnType<Client['callTool']>>): Facet[] {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text) as Facet[];
}

describe('MCP Server', () => {
  let tempDir: string;
  let client: Client;
  let clientTransport: InMemoryTransport;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'aifacet-mcp-test-'));
    vi.stubEnv('AIFACET_VAULT_PATH', tempDir);
    vi.stubEnv('AIFACET_PASSPHRASE', TEST_PASSPHRASE);
  });

  afterEach(async () => {
    if (clientTransport) {
      try {
        await clientTransport.close();
      } catch {}
    }
    vi.unstubAllEnvs();
    rmSync(tempDir, { recursive: true, force: true });
  });

  /**
   * Connects an MCP client to a fresh server instance via in-memory transport.
   * After calling this, `client` is ready to invoke tools and read resources.
   */
  async function connectClient(): Promise<void> {
    const server = await createServer();
    client = new Client({ name: 'test-client', version: '1.0.0' });
    const [ct, st] = InMemoryTransport.createLinkedPair();
    clientTransport = ct;
    await server.connect(st);
    await client.connect(ct);
  }

  /**
   * Populates the vault with representative test data:
   * - 3 facets: physical, professional, health
   * - 1 consent policy: deny health to 'chatgpt'
   * - 1 constitutional rule: hide political facets from all providers
   */
  async function seedVault(): Promise<void> {
    const vault = await Vault.open({ storagePath: tempDir, passphrase: TEST_PASSPHRASE });

    await vault.addFacet(createTestFacet({ category: 'physical', key: 'height_cm', value: 178 }));
    await vault.addFacet(
      createTestFacet({ category: 'professional', key: 'role', value: 'Software Engineer' }),
    );
    await vault.addFacet(
      createTestFacet({ category: 'health', key: 'allergies', value: ['pollen'] }),
    );

    await vault.addPolicy({
      facetCategory: 'health',
      accessLevel: 'denied',
      duration: 'persistent',
      grantedTo: 'chatgpt',
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    await vault.addConstitutionalRule({
      id: 'rule-1',
      description: 'Never share political views',
      facetCategory: 'political',
      maxAccessLevel: 'hidden',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
  }

  describe('given the server factory', () => {
    describe('when creating a server instance', () => {
      it('then it should return a valid MCP server', async () => {
        // when
        const server = await createServer();

        // then
        expect(server).toBeDefined();
      });
    });
  });

  describe('given a connected client with an empty vault', () => {
    beforeEach(async () => {
      await connectClient();
    });

    describe('when listing available tools', () => {
      it('then it should expose about_me and what_can_you_know', async () => {
        // when
        const { tools } = await client.listTools();

        // then
        expect(tools).toHaveLength(2);
        const names = tools.map((t) => t.name);
        expect(names).toContain('about_me');
        expect(names).toContain('what_can_you_know');
      });

      it('then about_me should describe its optional category parameter', async () => {
        // when
        const { tools } = await client.listTools();
        const aboutMe = tools.find((t) => t.name === 'about_me');

        // then
        expect(aboutMe).toMatchObject({
          name: 'about_me',
          inputSchema: expect.objectContaining({ type: 'object' }),
        });
        expect(aboutMe?.description).toContain('information about the user');
      });

      it('then what_can_you_know should require a provider_id parameter', async () => {
        // when
        const { tools } = await client.listTools();
        const tool = tools.find((t) => t.name === 'what_can_you_know');

        // then
        expect(tool?.description).toContain('authorized');
        expect(tool?.inputSchema).toMatchObject({
          type: 'object',
          required: expect.arrayContaining(['provider_id']),
        });
      });
    });

    describe('when calling about_me', () => {
      it('then it should return an empty facets array', async () => {
        // when
        const result = await client.callTool({ name: 'about_me', arguments: {} });

        // then
        const facets = parseFacetsFromResult(result);
        expect(facets).toEqual([]);
      });
    });

    describe('when calling what_can_you_know', () => {
      it('then it should return an empty facets array', async () => {
        // when
        const result = await client.callTool({
          name: 'what_can_you_know',
          arguments: { provider_id: 'any-provider' },
        });

        // then
        const facets = parseFacetsFromResult(result);
        expect(facets).toEqual([]);
      });
    });

    describe('when listing resources', () => {
      it('then it should include the context resource', async () => {
        // when
        const { resources } = await client.listResources();

        // then
        const uris = resources.map((r) => r.uri);
        expect(uris).toContain('aifacet://context');
      });
    });

    describe('when reading the context resource', () => {
      it('then it should return an empty context with schema version', async () => {
        // when
        const { contents } = await client.readResource({ uri: 'aifacet://context' });

        // then
        expect(contents).toHaveLength(1);
        expect(contents[0].mimeType).toBe('application/json');
        const ctx = JSON.parse(contents[0].text as string);
        expect(ctx).toMatchObject({
          facets: [],
          policies: [],
          constitution: [],
        });
        expect(ctx.version).toBeDefined();
      });
    });
  });

  describe('given a connected client with a seeded vault', () => {
    beforeEach(async () => {
      await seedVault();
      await connectClient();
    });

    describe('when calling about_me without category filter', () => {
      it('then it should return all three facets', async () => {
        // when
        const result = await client.callTool({ name: 'about_me', arguments: {} });

        // then
        const facets = parseFacetsFromResult(result);
        expect(facets).toHaveLength(3);
        expect(facets.map((f) => f.category)).toEqual(
          expect.arrayContaining(['physical', 'professional', 'health']),
        );
      });
    });

    describe('when calling about_me filtered by category', () => {
      it('then it should return only facets in that category', async () => {
        // when
        const result = await client.callTool({
          name: 'about_me',
          arguments: { category: 'professional' },
        });

        // then
        const facets = parseFacetsFromResult(result);
        expect(facets).toHaveLength(1);
        expect(facets[0]).toMatchObject({
          category: 'professional',
          key: 'role',
          value: 'Software Engineer',
        });
      });
    });

    describe('when calling about_me with a non-existent category', () => {
      it('then it should return an empty array', async () => {
        // when
        const result = await client.callTool({
          name: 'about_me',
          arguments: { category: 'nonexistent' },
        });

        // then
        expect(parseFacetsFromResult(result)).toEqual([]);
      });
    });

    describe('when calling what_can_you_know for a provider without restrictions', () => {
      it('then it should return all visible facets', async () => {
        // when
        const result = await client.callTool({
          name: 'what_can_you_know',
          arguments: { provider_id: 'claude' },
        });

        // then
        const facets = parseFacetsFromResult(result);
        expect(facets).toHaveLength(3);
      });
    });

    describe('when calling what_can_you_know for a provider with denied health access', () => {
      it('then it should exclude the denied health category', async () => {
        // when
        const result = await client.callTool({
          name: 'what_can_you_know',
          arguments: { provider_id: 'chatgpt' },
        });

        // then
        const facets = parseFacetsFromResult(result);
        expect(facets).toHaveLength(2);
        expect(facets.map((f) => f.category)).not.toContain('health');
      });
    });

    describe('when reading the context resource', () => {
      it('then it should return the full context including facets, policies, and rules', async () => {
        // when
        const { contents } = await client.readResource({ uri: 'aifacet://context' });

        // then
        const ctx = JSON.parse(contents[0].text as string);
        expect(ctx).toMatchObject({
          facets: expect.arrayContaining([expect.objectContaining({ key: 'height_cm' })]),
          policies: expect.arrayContaining([
            expect.objectContaining({ facetCategory: 'health', grantedTo: 'chatgpt' }),
          ]),
          constitution: expect.arrayContaining([
            expect.objectContaining({ facetCategory: 'political' }),
          ]),
        });
      });
    });

    describe('when reading facets by category via resource template', () => {
      it('then it should return only facets matching the requested category', async () => {
        // when
        const { contents } = await client.readResource({ uri: 'aifacet://facets/physical' });

        // then
        const facets = JSON.parse(contents[0].text as string) as Facet[];
        expect(facets).toHaveLength(1);
        expect(facets[0]).toMatchObject({ category: 'physical', key: 'height_cm', value: 178 });
      });

      it('then it should return an empty array for a category with no facets', async () => {
        // when
        const { contents } = await client.readResource({ uri: 'aifacet://facets/nonexistent' });

        // then
        const facets = JSON.parse(contents[0].text as string);
        expect(facets).toEqual([]);
      });
    });
  });
});
