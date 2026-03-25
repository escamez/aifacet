import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

/**
 * AIME configuration.
 *
 * Resolution order (highest priority wins):
 *   1. CLI arguments (--port, --https, etc.)
 *   2. Environment variables (AIME_PASSPHRASE, AIME_MCP_PORT, etc.)
 *   3. Config file (~/.aime/config.json)
 *   4. Built-in defaults
 */
export interface AimeConfig {
  passphrase: string;
  vaultPath: string;
  port: number;
  https: boolean;
  tlsCert?: string;
  tlsKey?: string;
}

const AIME_DIR = join(homedir(), '.aime');
const CONFIG_PATH = join(AIME_DIR, 'config.json');
const PID_PATH = join(AIME_DIR, 'aime.pid');

const DEFAULTS: AimeConfig = {
  passphrase: 'default-dev-passphrase',
  vaultPath: join(AIME_DIR, 'vault'),
  port: 3300,
  https: false,
};

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

function ensureDir(): void {
  if (!existsSync(AIME_DIR)) {
    mkdirSync(AIME_DIR, { recursive: true });
  }
}

function readConfigFile(): Partial<AimeConfig> {
  if (!existsSync(CONFIG_PATH)) return {};
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Partial<AimeConfig>;
}

// ---------------------------------------------------------------------------
// Resolution: args > env > file > defaults
// ---------------------------------------------------------------------------

function fromEnv(): Partial<AimeConfig> {
  const partial: Partial<AimeConfig> = {};
  if (process.env.AIME_PASSPHRASE) partial.passphrase = process.env.AIME_PASSPHRASE;
  if (process.env.AIME_VAULT_PATH) partial.vaultPath = process.env.AIME_VAULT_PATH;
  if (process.env.AIME_MCP_PORT) partial.port = Number(process.env.AIME_MCP_PORT);
  if (process.env.AIME_MCP_HTTPS) partial.https = process.env.AIME_MCP_HTTPS === 'true';
  if (process.env.AIME_MCP_TLS_CERT) partial.tlsCert = process.env.AIME_MCP_TLS_CERT;
  if (process.env.AIME_MCP_TLS_KEY) partial.tlsKey = process.env.AIME_MCP_TLS_KEY;
  return partial;
}

function fromArgs(argv: string[]): Partial<AimeConfig> {
  const partial: Partial<AimeConfig> = {};
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
export function loadConfig(argv: string[] = []): AimeConfig {
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

/** Saves config to ~/.aime/config.json. */
export function saveConfig(config: AimeConfig): void {
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
export function configToEnv(config: AimeConfig): Record<string, string> {
  const env: Record<string, string> = {
    AIME_PASSPHRASE: config.passphrase,
    AIME_VAULT_PATH: config.vaultPath,
    AIME_MCP_PORT: String(config.port),
  };
  if (config.https) env.AIME_MCP_HTTPS = 'true';
  if (config.tlsCert) env.AIME_MCP_TLS_CERT = config.tlsCert;
  if (config.tlsKey) env.AIME_MCP_TLS_KEY = config.tlsKey;
  return env;
}

/** Resolves the absolute path to the MCP HTTP server entry point. */
export function getMcpHttpPath(): string {
  const cliDir = dirname(new URL(import.meta.url).pathname);
  const mcpHttp = join(cliDir, '..', '..', 'mcp-server', 'dist', 'http.js');
  if (existsSync(mcpHttp)) return mcpHttp;
  return join(process.cwd(), 'packages', 'mcp-server', 'dist', 'http.js');
}
