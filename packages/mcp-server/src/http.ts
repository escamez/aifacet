import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import type { Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

const DEFAULT_PORT = 3300;

/**
 * Resolves TLS configuration from environment variables.
 *
 * - `AIME_MCP_TLS_CERT` + `AIME_MCP_TLS_KEY` → use provided certificate files
 * - `AIME_MCP_HTTPS=true` (without cert paths) → auto-generate self-signed certificate
 * - Neither → plain HTTP
 */
function resolveTls(): { cert: Buffer; key: Buffer } | undefined {
  const certPath = process.env.AIME_MCP_TLS_CERT;
  const keyPath = process.env.AIME_MCP_TLS_KEY;

  if (certPath && keyPath) {
    if (!existsSync(certPath)) throw new Error(`TLS cert not found: ${certPath}`);
    if (!existsSync(keyPath)) throw new Error(`TLS key not found: ${keyPath}`);
    return {
      cert: readFileSync(certPath),
      key: readFileSync(keyPath),
    };
  }

  if (process.env.AIME_MCP_HTTPS === 'true') {
    return generateSelfSignedCert();
  }

  return undefined;
}

/** Generates a self-signed certificate using OpenSSL CLI. */
function generateSelfSignedCert(): { cert: Buffer; key: Buffer } {
  const dir = mkdtempSync(join(tmpdir(), 'aime-tls-'));
  const keyFile = join(dir, 'key.pem');
  const certFile = join(dir, 'cert.pem');

  execSync(
    `openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 ` +
      `-keyout "${keyFile}" -out "${certFile}" -days 30 -nodes ` +
      `-subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`,
    { stdio: 'pipe' },
  );

  console.log(`Self-signed certificate generated in ${dir}`);
  return {
    cert: readFileSync(certFile),
    key: readFileSync(keyFile),
  };
}

async function main(): Promise<void> {
  const port = Number(process.env.AIME_MCP_PORT ?? DEFAULT_PORT);
  const tls = resolveTls();
  const mcpServer = createServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });

  await mcpServer.connect(transport);

  const handler = async (
    req: import('node:http').IncomingMessage,
    res: import('node:http').ServerResponse,
  ): Promise<void> => {
    const protocol = tls ? 'https' : 'http';
    const url = new URL(req.url ?? '/', `${protocol}://${req.headers.host}`);

    // CORS headers for browser-based and remote clients
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
    res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/mcp') {
      await transport.handleRequest(req, res);
      return;
    }

    // Health check
    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', transport: 'streamable-http', tls: !!tls }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. MCP endpoint is at /mcp' }));
  };

  const server: Server = tls ? createHttpsServer(tls, handler) : createHttpServer(handler);

  const protocol = tls ? 'https' : 'http';
  server.listen(port, () => {
    console.log(
      `AIME MCP server (${protocol.toUpperCase()}) listening on ${protocol}://localhost:${port}/mcp`,
    );
  });
}

main().catch((error: unknown) => {
  console.error('Failed to start AIME MCP HTTP server:', error);
  process.exit(1);
});
