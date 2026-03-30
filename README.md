# AIFacet

> Your AI context, owned by you. Portable across any AI.

AIFacet is a personal context vault that stores your profile, preferences, and data in an encrypted local vault. AI assistants connect via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) to learn about you — but only what you explicitly authorize.

## Key Features

- **Encrypted vault** — AES-256-GCM with per-write random IV/salt. Your data never leaves your machine unencrypted.
- **Consent-based access** — Constitutional rules and per-provider policies control what each AI can see.
- **MCP integration** — Works with Claude, ChatGPT, Perplexity, Cursor, VS Code/Copilot, and any MCP-compatible client.
- **Two transports** — Local stdio (for Claude Code, Cursor, etc.) and Streamable HTTP/HTTPS (for remote AI clients).
- **CLI management** — Start/stop server, manage vault, configure everything from the terminal.

## Architecture

```
packages/
  schema/       @aifacet/schema       Core types and context model
  vault/        @aifacet/vault        Encrypted storage (AES-256-GCM)
  mcp-server/   @aifacet/mcp-server   MCP server (stdio + HTTP transports)
  cli/          @aifacet/cli          CLI for server and vault management
  api/          @aifacet/api          REST API (Hono)
  web/          @aifacet/web          Web UI (React)
```

## Prerequisites

- **Node.js** 22+
- **pnpm** 10+

## Getting Started

```bash
# Clone the repository
git clone https://github.com/escamez/aifacet.git && cd aifacet

# Check dependencies and set up everything
make doctor    # verify Node 22+, pnpm 10+, openssl
make init      # install deps, build, link CLI globally

# Seed the vault with a sample profile
make seed

# Run the consent filtering demo
make demo

# Start all services (API + Web UI + MCP server)
make start

# Open Web UI at http://localhost:3200
# REST API at http://localhost:3100
# MCP server at http://localhost:3300

# Stop everything
make stop
```

Run `make help` to see all available commands.

## Running the MCP Server

### Local (stdio) — for Claude Code, Cursor, etc.

Add to your `.mcp.json` or MCP client configuration:

```json
{
  "mcpServers": {
    "aifacet-context": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "AIFACET_PASSPHRASE": "your-passphrase",
        "AIFACET_VAULT_PATH": "/path/to/.aifacet/vault"
      }
    }
  }
}
```

### Remote (HTTP/HTTPS) — for Perplexity, ChatGPT, etc.

```bash
# Start HTTP server (background daemon)
aifacet start

# Start with HTTPS (auto-generated self-signed cert)
aifacet start --https

# Start on a custom port
aifacet start --port 4000

# Start with your own TLS certificates
aifacet start --https --tls-cert /path/to/cert.pem --tls-key /path/to/key.pem

# Stop the server
aifacet stop

# Restart
aifacet restart
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
  aifacet start                        Start the MCP server (background)
  aifacet stop                         Stop the MCP server
  aifacet restart                      Restart the MCP server

Vault:
  aifacet status                       Show vault and server status
  aifacet facets [category]            List facets (optionally by category)
  aifacet add <category> <key> <value> Add a facet
  aifacet seed [--reset]               Load sample profile into vault
  aifacet reset                        Destroy and recreate empty vault

Config:
  aifacet config                       Show current configuration
  aifacet config set <key> <value>     Update a configuration value
```

## Configuration

Config file: `~/.aifacet/config.json`

```json
{
  "passphrase": "your-passphrase",
  "vaultPath": "/Users/you/.aifacet/vault",
  "port": 3300,
  "https": false,
  "logFile": "/Users/you/.aifacet/server.log"
}
```

Resolution order (highest priority wins):

1. **CLI arguments** (`--port`, `--https`, `--tls-cert`, `--tls-key`)
2. **Environment variables** (`AIFACET_PASSPHRASE`, `AIFACET_VAULT_PATH`, `AIFACET_MCP_PORT`, `AIFACET_MCP_HTTPS`, `AIFACET_LOG_FILE`, `AIFACET_LOG_LEVEL`)
3. **Config file** (`~/.aifacet/config.json`)
4. **Built-in defaults**

Config keys: `passphrase`, `vaultPath`, `port`, `https`, `tlsCert`, `tlsKey`, `logFile`

## Logging

The MCP HTTP server writes structured logs to stderr and to a log file.

| Path | Description |
|------|-------------|
| `~/.aifacet/server.log` | Server logs (requests, errors, lifecycle events) |
| `~/.aifacet/config.json` | Configuration file |
| `~/.aifacet/vault/` | Encrypted vault data |
| `~/.aifacet/aifacet.pid` | PID file for background daemon |

### Viewing logs

```bash
# Follow server logs in real time
tail -f ~/.aifacet/server.log

# Check last 50 lines
tail -50 ~/.aifacet/server.log
```

### Log levels

Set via `AIFACET_LOG_LEVEL` environment variable or at server startup:

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
AIFACET_PASSPHRASE=test pnpm test

# Run tests in watch mode
AIFACET_PASSPHRASE=test pnpm test:watch

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
AI Client ──MCP──► AIFacet Server ──► Vault
                                    ├── Facets (your data)
                                    ├── Policies (per-provider consent)
                                    └── Constitution (meta-rules)
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) — full setup guide, Docker, MCP configuration
- [Architecture](docs/ARCHITECTURE.md) — system diagrams and package dependencies
- [Testing](docs/TESTING.md) — API testing, Docker testing, MCP validation
- [Plugin Guide](docs/PLUGIN_GUIDE.md) — how to extend AIFacet with new plugins

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code standards, DCO sign-off, and security policy.

## License

[European Union Public Licence v1.2 (EUPL-1.2)](./LICENSE) — the open-source licence created by the European Commission. Copyleft with broad compatibility (GPL, AGPL, MPL, and more). Available in 23 EU languages.
