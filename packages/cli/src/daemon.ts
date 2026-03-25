import { spawn } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { configToEnv, getMcpHttpPath, getPidPath, loadConfig } from './config.js';

function readPid(): number | undefined {
  const pidPath = getPidPath();
  if (!existsSync(pidPath)) return undefined;
  const raw = readFileSync(pidPath, 'utf-8').trim();
  const pid = Number(raw);
  return Number.isNaN(pid) ? undefined : pid;
}

function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** Starts the MCP HTTP server as a detached background process. */
export function startServer(argv: string[] = []): void {
  const existingPid = readPid();
  if (existingPid && isRunning(existingPid)) {
    console.log(`AIME server already running (PID ${existingPid})`);
    return;
  }

  const config = loadConfig(argv);
  const mcpHttp = getMcpHttpPath();

  if (!existsSync(mcpHttp)) {
    console.error('MCP server not built. Run: pnpm --filter @aime/mcp-server build');
    console.error(`Expected: ${mcpHttp}`);
    process.exit(1);
  }

  const env = { ...process.env, ...configToEnv(config) };
  const protocol = config.https ? 'https' : 'http';

  const child = spawn('node', [mcpHttp], {
    env,
    detached: true,
    stdio: 'ignore',
  });

  child.unref();

  if (child.pid) {
    writeFileSync(getPidPath(), String(child.pid), 'utf-8');
    console.log(`AIME server started (PID ${child.pid})`);
    console.log(`  ${protocol.toUpperCase()} → ${protocol}://localhost:${config.port}/mcp`);
    console.log(`  Health → ${protocol}://localhost:${config.port}/health`);
  } else {
    console.error('Failed to start AIME server');
    process.exit(1);
  }
}

/** Stops the running MCP HTTP server. */
export function stopServer(): void {
  const pid = readPid();
  const pidPath = getPidPath();

  if (!pid) {
    console.log('AIME server is not running (no PID file)');
    return;
  }

  if (!isRunning(pid)) {
    console.log(`AIME server is not running (stale PID ${pid})`);
    unlinkSync(pidPath);
    return;
  }

  try {
    process.kill(pid, 'SIGTERM');
    console.log(`AIME server stopped (PID ${pid})`);
  } catch {
    console.error(`Failed to stop AIME server (PID ${pid})`);
  }

  if (existsSync(pidPath)) {
    unlinkSync(pidPath);
  }
}

/** Prints the current server status. */
export function serverStatus(): void {
  const config = loadConfig();
  const pid = readPid();
  const running = pid ? isRunning(pid) : false;
  const protocol = config.https ? 'https' : 'http';

  console.log('AIME MCP Server');
  console.log(`  Status:   ${running ? `running (PID ${pid})` : 'stopped'}`);
  console.log(`  Endpoint: ${protocol}://localhost:${config.port}/mcp`);
  console.log(`  HTTPS:    ${config.https ? 'enabled' : 'disabled'}`);
  console.log(`  Vault:    ${config.vaultPath}`);
}
