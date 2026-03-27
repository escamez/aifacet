import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type McpHttpServer, startHttpServer } from '../src/http.js';

describe('MCP HTTP Server', () => {
  let tempDir: string;
  let handle: McpHttpServer;

  beforeEach(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'aifacet-http-test-'));
    vi.stubEnv('AIFACET_VAULT_PATH', tempDir);
    vi.stubEnv('AIFACET_PASSPHRASE', 'test-passphrase');

    handle = await startHttpServer({ port: 0 });
  });

  afterEach(async () => {
    if (handle) await handle.close();
    vi.unstubAllEnvs();
    rmSync(tempDir, { recursive: true, force: true });
  });

  /**
   * Creates an MCP client connected to the running HTTP server.
   * Caller is responsible for closing the client after use.
   */
  async function connectMcpClient(): Promise<Client> {
    const client = new Client({ name: 'http-test-client', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`${handle.url}/mcp`));
    await client.connect(transport);
    return client;
  }

  describe('given a running HTTP server', () => {
    describe('when requesting GET /health', () => {
      it('then it should return status ok with HTTP transport metadata', async () => {
        // when
        const response = await fetch(`${handle.url}/health`);

        // then
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toMatchObject({
          status: 'ok',
          transport: 'streamable-http',
          tls: false,
        });
      });
    });

    describe('when requesting OPTIONS /mcp (CORS preflight)', () => {
      it('then it should return 204 with permissive CORS headers', async () => {
        // when
        const response = await fetch(`${handle.url}/mcp`, { method: 'OPTIONS' });

        // then
        expect(response.status).toBe(204);
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect(response.headers.get('access-control-allow-methods')).toContain('POST');
        expect(response.headers.get('access-control-allow-headers')).toContain('mcp-session-id');
      });
    });

    describe('when requesting an unknown path', () => {
      it('then it should return 404 with a hint about the MCP endpoint', async () => {
        // when
        const response = await fetch(`${handle.url}/unknown`);

        // then
        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toMatchObject({
          error: expect.stringContaining('Not found'),
        });
      });
    });

    describe('when any response is returned', () => {
      it('then it should include CORS headers exposing the session ID', async () => {
        // when
        const response = await fetch(`${handle.url}/health`);

        // then
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect(response.headers.get('access-control-expose-headers')).toContain('mcp-session-id');
      });
    });
  });

  describe('given an MCP client connected over HTTP', () => {
    describe('when listing available tools', () => {
      it('then it should return the same tools as the in-memory transport', async () => {
        // given
        const client = await connectMcpClient();

        // when
        const { tools } = await client.listTools();

        // then
        expect(tools).toHaveLength(2);
        expect(tools.map((t) => t.name)).toEqual(
          expect.arrayContaining(['about_me', 'what_can_you_know']),
        );

        await client.close();
      });
    });

    describe('when calling the about_me tool', () => {
      it('then it should return facet data through the HTTP transport', async () => {
        // given
        const client = await connectMcpClient();

        // when
        const result = await client.callTool({ name: 'about_me', arguments: {} });

        // then
        expect(result.content).toHaveLength(1);
        const text = (result.content as Array<{ type: string; text: string }>)[0].text;
        expect(JSON.parse(text)).toEqual([]);

        await client.close();
      });
    });

    describe('when reading the context resource', () => {
      it('then it should return the vault context through the HTTP transport', async () => {
        // given
        const client = await connectMcpClient();

        // when
        const { contents } = await client.readResource({ uri: 'aifacet://context' });

        // then
        expect(contents).toHaveLength(1);
        const ctx = JSON.parse(contents[0].text as string);
        expect(ctx).toMatchObject({ facets: [], policies: [], constitution: [] });

        await client.close();
      });
    });
  });

  describe('given the server startup configuration', () => {
    it('then it should default to HTTP protocol', () => {
      expect(handle.protocol).toBe('http');
    });

    it('then it should assign a valid port', () => {
      expect(handle.port).toBeGreaterThan(0);
    });

    it('then the URL should reflect the protocol and assigned port', () => {
      expect(handle.url).toBe(`http://localhost:${handle.port}`);
    });
  });
});
