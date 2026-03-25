import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import type { Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createLogger } from './logger.js';
import { createServer } from './server.js';

const DEFAULT_PORT = 3300;
const log = createLogger();

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
    log.info('Using provided TLS certificates', { cert: certPath, key: keyPath });
    return { cert: readFileSync(certPath), key: readFileSync(keyPath) };
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

  log.info('Self-signed certificate generated', { dir });
  return { cert: readFileSync(certFile), key: readFileSync(keyFile) };
}

/** Sets CORS headers on every response. */
function setCorsHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
}

/** Handles MCP protocol requests with error recovery. */
async function handleMcp(
  transport: StreamableHTTPServerTransport,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    await transport.handleRequest(req, res);
    log.debug('MCP request handled', {
      method: req.method,
      session: req.headers['mcp-session-id'],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('MCP request failed', { method: req.method, error: message });
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
}

/** Registers graceful shutdown handlers for the HTTP server. */
function setupGracefulShutdown(server: Server, transport: StreamableHTTPServerTransport): void {
  const shutdown = (signal: string) => {
    log.info(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      log.info('HTTP server closed');
      transport.close().then(() => {
        log.info('MCP transport closed');
        process.exit(0);
      });
    });
    // Force exit after 5 seconds if graceful shutdown stalls
    setTimeout(() => {
      log.warn('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

async function main(): Promise<void> {
  const port = Number(process.env.AIME_MCP_PORT ?? DEFAULT_PORT);
  const tls = resolveTls();
  const mcpServer = createServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });

  await mcpServer.connect(transport);
  log.info('MCP server connected to HTTP transport');

  const handler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const protocol = tls ? 'https' : 'http';
    const url = new URL(req.url ?? '/', `${protocol}://${req.headers.host}`);

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/mcp') {
      await handleMcp(transport, req, res);
      return;
    }

    if (url.pathname === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', transport: 'streamable-http', tls: !!tls }));
      return;
    }

    log.warn('Request to unknown path', { method: req.method, path: url.pathname });
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. MCP endpoint is at /mcp' }));
  };

  const server: Server = tls ? createHttpsServer(tls, handler) : createHttpServer(handler);

  server.on('error', (err) => {
    log.error('HTTP server error', {
      error: err.message,
      code: (err as NodeJS.ErrnoException).code,
    });
    if ((err as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      log.error(`Port ${port} already in use`);
      process.exit(1);
    }
  });

  setupGracefulShutdown(server, transport);

  const protocol = tls ? 'https' : 'http';
  server.listen(port, () => {
    log.info('AIME MCP server listening', {
      protocol: protocol.toUpperCase(),
      url: `${protocol}://localhost:${port}/mcp`,
    });
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  log.error('Failed to start AIME MCP HTTP server', { error: message });
  process.exit(1);
});
