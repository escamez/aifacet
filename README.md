# AIME

> Your AI context, owned by you. Portable across any AI.

AIME is a personal context vault that stores your profile, preferences, and data in an encrypted local vault. AI assistants connect via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to learn about you — but only what you explicitly authorize.

## Key Features

- **Encrypted vault** — AES-256-GCM with per-write random IV/salt. Your data never leaves your machine unencrypted.
- **Consent-based access** — Constitutional rules and per-provider policies control what each AI can see.
- **MCP integration** — Works with Claude, ChatGPT, Perplexity, Cursor, VS Code/Copilot, and any MCP-compatible client.
- **Two transports** — Local stdio (for Claude Code, Cursor, etc.) and Streamable HTTP/HTTPS (for remote AI clients).
- **CLI management** — Start/stop server, manage vault, configure everything from the terminal.

## Architecture

```
packages/
  schema/       @aime/schema       Core types and context model
  vault/        @aime/vault        Encrypted storage (AES-256-GCM)
  mcp-server/   @aime/mcp-server   MCP server (stdio + HTTP transports)
  cli/          @aime/cli          CLI for server and vault management
  api/          @aime/api          REST API (Hono)
  web/          @aime/web          Web UI (React)
```

## Prerequisites

- **Node.js** 22+
- **pnpm** 10+

## Getting Started

```bash
# Clone and install
git clone <repo-url> && cd contextme
pnpm install

# Build all packages
pnpm build

# Seed the vault with sample profile data
AIME_PASSPHRASE=test aime seed --reset

# Verify MCP tools work
AIME_PASSPHRASE=test aime status
```

### Link the CLI globally

```bash
cd packages/cli && npm link
```

After this, the `aime` command is available system-wide.

## Running the MCP Server

### Local (stdio) — for Claude Code, Cursor, etc.

Add to your `.mcp.json` or MCP client configuration:

```json
{
  "mcpServers": {
    "aime-context": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "AIME_PASSPHRASE": "your-passphrase",
        "AIME_VAULT_PATH": "/path/to/.aime/vault"
      }
    }
  }
}
```

### Remote (HTTP/HTTPS) — for Perplexity, ChatGPT, etc.

```bash
# Start HTTP server (background daemon)
aime start

# Start with HTTPS (auto-generated self-signed cert)
aime start --https

# Start on a custom port
aime start --port 4000

# Start with your own TLS certificates
aime start --https --tls-cert /path/to/cert.pem --tls-key /path/to/key.pem

# Stop the server
aime stop

# Restart
aime restart
```

The MCP endpoint is available at `http(s)://localhost:<port>/mcp`.
Health check at `http(s)://localhost:<port>/health`.

## MCP Tools

| Tool | Description |
|------|-------------|
| `about_me` | Get user profile, preferences, skills, and personal context. Optional `category` filter. |
| `what_can_you_know` | Get only the facets authorized for a specific AI provider, based on consent policies. |

## CLI Commands

```
Server:
  aime start                        Start the MCP server (background)
  aime stop                         Stop the MCP server
  aime restart                      Restart the MCP server

Vault:
  aime status                       Show vault and server status
  aime facets [category]            List facets (optionally by category)
  aime add <category> <key> <value> Add a facet
  aime seed [--reset]               Load sample profile into vault
  aime reset                        Destroy and recreate empty vault

Config:
  aime config                       Show current configuration
  aime config set <key> <value>     Update a configuration value
```

## Configuration

Config file: `~/.aime/config.json`

```json
{
  "passphrase": "your-passphrase",
  "vaultPath": "/Users/you/.aime/vault",
  "port": 3300,
  "https": false,
  "logFile": "/Users/you/.aime/server.log"
}
```

Resolution order (highest priority wins):

1. **CLI arguments** (`--port`, `--https`, `--tls-cert`, `--tls-key`)
2. **Environment variables** (`AIME_PASSPHRASE`, `AIME_VAULT_PATH`, `AIME_MCP_PORT`, `AIME_MCP_HTTPS`, `AIME_LOG_FILE`, `AIME_LOG_LEVEL`)
3. **Config file** (`~/.aime/config.json`)
4. **Built-in defaults**

Config keys: `passphrase`, `vaultPath`, `port`, `https`, `tlsCert`, `tlsKey`, `logFile`

## Logging

The MCP HTTP server writes structured logs to stderr and to a log file.

| Path | Description |
|------|-------------|
| `~/.aime/server.log` | Server logs (requests, errors, lifecycle events) |
| `~/.aime/config.json` | Configuration file |
| `~/.aime/vault/` | Encrypted vault data |
| `~/.aime/aime.pid` | PID file for background daemon |

### Viewing logs

```bash
# Follow server logs in real time
tail -f ~/.aime/server.log

# Check last 50 lines
tail -50 ~/.aime/server.log
```

### Log levels

Set via `AIME_LOG_LEVEL` environment variable or at server startup:

| Level | Label | Description |
|-------|-------|-------------|
| `debug` | `DBG` | Detailed request tracing |
| `info` | `INF` | Startup, shutdown, normal operations (default) |
| `warn` | `WRN` | Unknown routes, timeout warnings |
| `error` | `ERR` | Request failures, server errors |

Log format: `2026-03-25T21:00:00.000Z [INF] message {"key":"value"}`

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
AIME_PASSPHRASE=test pnpm test

# Run tests in watch mode
AIME_PASSPHRASE=test pnpm test:watch

# Lint and format check
pnpm lint

# Auto-fix lint and formatting
pnpm lint:fix

# Clean build artifacts
pnpm clean
```

### Testing

Tests use **Vitest** with the **GIVEN/WHEN/THEN** pattern:

```typescript
describe('given a vault with consent policies', () => {
  describe('when requesting authorized facets for provider X', () => {
    it('then it should return only allowed facets', () => {
      // ...
    });
  });
});
```

### Code Quality

- TypeScript strict mode, no `any` types
- Biome for linting and formatting
- Husky pre-commit hook runs `biome check`
- AES-256-GCM encryption with random IV/salt per write

## How It Works

1. You store your personal context (facets) in the encrypted vault
2. You define consent policies and constitutional rules controlling access
3. An AI client connects via MCP (stdio or HTTP)
4. The AI calls `about_me` to learn about you, or `what_can_you_know` with its provider ID
5. The vault enforces your rules and returns only authorized data

```
AI Client ──MCP──► AIME Server ──► Vault
                                    ├── Facets (your data)
                                    ├── Policies (per-provider consent)
                                    └── Constitution (meta-rules)
```

## License

[European Union Public Licence v1.2 (EUPL-1.2)](./LICENSE) — the open-source licence created by the European Commission. Copyleft with broad compatibility (GPL, AGPL, MPL, and more). Available in 23 EU languages.
