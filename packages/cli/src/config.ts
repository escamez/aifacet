import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

/**
 * AIFacet configuration.
 *
 * Resolution order (highest priority wins):
 *   1. CLI arguments (--port, --https, etc.)
 *   2. Environment variables (AIFACET_PASSPHRASE, AIFACET_MCP_PORT, etc.)
 *   3. Config file (~/.aifacet/config.json)
 *   4. Built-in defaults
 */
export interface AifacetConfig {
  passphrase: string;
  vaultPath: string;
  port: number;
  https: boolean;
  tlsCert?: string;
  tlsKey?: string;
  logFile: string;
}

const AIFACET_DIR = join(homedir(), '.aifacet');
const CONFIG_PATH = join(AIFACET_DIR, 'config.json');
const PID_PATH = join(AIFACET_DIR, 'aifacet.pid');

const LOG_PATH = join(AIFACET_DIR, 'server.log');

const DEFAULTS: AifacetConfig = {
  passphrase: 'default-dev-passphrase',
  vaultPath: join(AIFACET_DIR, 'vault'),
  port: 3300,
  https: false,
  logFile: LOG_PATH,
};

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

function ensureDir(): void {
  if (!existsSync(AIFACET_DIR)) {
    mkdirSync(AIFACET_DIR, { recursive: true });
  }
}

function readConfigFile(): Partial<AifacetConfig> {
  if (!existsSync(CONFIG_PATH)) return {};
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Partial<AifacetConfig>;
}

// ---------------------------------------------------------------------------
// Resolution: args > env > file > defaults
// ---------------------------------------------------------------------------

function fromEnv(): Partial<AifacetConfig> {
  const partial: Partial<AifacetConfig> = {};
  if (process.env.AIFACET_PASSPHRASE) partial.passphrase = process.env.AIFACET_PASSPHRASE;
  if (process.env.AIFACET_VAULT_PATH) partial.vaultPath = process.env.AIFACET_VAULT_PATH;
  if (process.env.AIFACET_MCP_PORT) partial.port = Number(process.env.AIFACET_MCP_PORT);
  if (process.env.AIFACET_MCP_HTTPS) partial.https = process.env.AIFACET_MCP_HTTPS === 'true';
  if (process.env.AIFACET_MCP_TLS_CERT) partial.tlsCert = process.env.AIFACET_MCP_TLS_CERT;
  if (process.env.AIFACET_MCP_TLS_KEY) partial.tlsKey = process.env.AIFACET_MCP_TLS_KEY;
  return partial;
}

function fromArgs(argv: string[]): Partial<AifacetConfig> {
  const partial: Partial<AifacetConfig> = {};
  const idx = (flag: string): number => argv.indexOf(flag);

  const portIdx = idx('--port');
  if (portIdx !== -1 && argv[portIdx + 1]) partial.port = Number(argv[portIdx + 1]);

  if (argv.includes('--https')) partial.https = true;
  if (argv.includes('--no-https')) partial.https = false;

  const certIdx = idx('--tls-cert');
  if (certIdx !== -1 && argv[certIdx + 1]) partial.tlsCert = argv[certIdx + 1];

  const keyIdx = idx('--tls-key');
  if (keyIdx !== -1 && argv[keyIdx + 1]) partial.tlsKey = argv[keyIdx + 1];

  return partial;
}

/**
 * Loads the resolved configuration: defaults ← file ← env ← args.
 * Passing argv enables CLI flag overrides (typically `process.argv.slice(2)`).
 */
export function loadConfig(argv: string[] = []): AifacetConfig {
  ensureDir();
  const file = readConfigFile();
  const env = fromEnv();
  const args = fromArgs(argv);

  return {
    ...DEFAULTS,
    ...file,
    ...env,
    ...args,
  };
}

/** Saves config to ~/.aifacet/config.json. */
export function saveConfig(config: AifacetConfig): void {
  ensureDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/** Initializes config file with defaults if it doesn't exist. */
export function initConfigIfNeeded(): void {
  ensureDir();
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULTS, null, 2), 'utf-8');
  }
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function getPidPath(): string {
  return PID_PATH;
}

/**
 * Builds environment variables for spawning the MCP server process.
 * This bridges the resolved config with the env-var-based http.ts.
 */
export function configToEnv(config: AifacetConfig): Record<string, string> {
  const env: Record<string, string> = {
    AIFACET_PASSPHRASE: config.passphrase,
    AIFACET_VAULT_PATH: config.vaultPath,
    AIFACET_MCP_PORT: String(config.port),
    AIFACET_LOG_FILE: config.logFile,
  };
  if (config.https) env.AIFACET_MCP_HTTPS = 'true';
  if (config.tlsCert) env.AIFACET_MCP_TLS_CERT = config.tlsCert;
  if (config.tlsKey) env.AIFACET_MCP_TLS_KEY = config.tlsKey;
  return env;
}

/** Resolves the absolute path to the MCP HTTP server entry point. */
export function getMcpHttpPath(): string {
  const cliDir = dirname(new URL(import.meta.url).pathname);
  const mcpHttp = join(cliDir, '..', '..', 'mcp-server', 'dist', 'http.js');
  if (existsSync(mcpHttp)) return mcpHttp;
  return join(process.cwd(), 'packages', 'mcp-server', 'dist', 'http.js');
}
