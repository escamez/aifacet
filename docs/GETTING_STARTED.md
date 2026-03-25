# AIME — Getting Started Guide

> Your AI context, owned by you. Portable across any AI.

This guide walks you through setting up AIME locally, creating your first facets, and integrating with Claude Code via MCP.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone and Install](#clone-and-install)
3. [Project Structure](#project-structure)
4. [Quick Start: Running Locally](#quick-start-running-locally)
5. [Quick Start: Docker-Compose](#quick-start-docker-compose)
6. [Adding Your First Facets](#adding-your-first-facets)
7. [Configuring the MCP Server for Claude Code](#configuring-the-mcp-server-for-claude-code)
8. [Environment Variables Reference](#environment-variables-reference)

---

## Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| **Node.js** | 22.0.0+ | `node --version` |
| **pnpm** | 10.0.0+ | `pnpm --version` |
| **Git** | any recent | `git --version` |
| **Docker** (optional) | 20+ | `docker --version` |

### Installing Node.js

If you don't have Node.js 22+, use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 22
nvm use 22
```

### Installing pnpm

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Or via npm:

```bash
npm install -g pnpm
```

---

## Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/contextme.git
cd contextme

# Install all dependencies (workspace-aware)
pnpm install

# Build all packages
pnpm build
```

After building, verify everything works:

```bash
# Run the full test suite
pnpm test

# Check linting
pnpm lint
```

---

## Project Structure

AIME is a **pnpm monorepo** with the following packages:

```
contextme/
├── package.json              Root workspace config
├── pnpm-workspace.yaml       Workspace definition
├── docker-compose.yml        Docker stack (API + Web)
├── biome.json                Linting & formatting (Biome)
├── vitest.workspace.ts       Test workspace config
│
├── docs/                     Documentation
│   ├── GETTING_STARTED.md    This file
│   ├── TESTING.md            Testing & validation guide
│   ├── PLUGIN_GUIDE.md       Plugin development guide
│   └── design/               Architecture & design docs
│
├── scripts/                  Utility scripts
│   └── sandbox.sh            Quick validation script
│
└── packages/
    ├── schema/               @aime/schema
    │   Core types and context model (Facet, Policy,
    │   ConstitutionalRule, AccessLevel, HumanContext)
    │
    ├── vault/                @aime/vault
    │   Encrypted local storage (AES-256-GCM).
    │   Single source of truth for all context data.
    │
    ├── cli/                  @aime/cli
    │   Command-line tool for managing context
    │   (add, list, status commands)
    │
    ├── mcp-server/           @aime/mcp-server
    │   MCP server for Claude Code integration.
    │   Exposes context via Model Context Protocol.
    │
    ├── api/                  @aime/api
    │   HTTP REST API built with Hono.
    │   Plugin-based architecture for extensibility.
    │
    └── web/                  @aime/web
        Web UI built with React + Vite + Tailwind.
        Plugin-based architecture for extensibility.
```

### Package Dependencies

```
@aime/schema       (no deps)     Core types
    ^
    |
@aime/vault        (schema)       Encrypted storage + consent
    ^
    |
@aime/cli          (vault, schema)  CLI tool
@aime/mcp-server   (vault, schema)  MCP integration
@aime/api          (vault, schema)  REST API
```

---

## Quick Start: Running Locally

### Option A: API + Web UI (Development Mode)

This is the recommended approach during development. Both servers support hot reload.

**Terminal 1 — Start the API:**

```bash
export AIME_PASSPHRASE="my-dev-passphrase"
pnpm --filter @aime/api dev
```

The API starts on `http://localhost:3100`.

**Terminal 2 — Start the Web UI:**

```bash
pnpm --filter @aime/web dev
```

The Web UI starts on `http://localhost:5173` (Vite default).

**Verify everything is running:**

```bash
# API health check
curl -s http://localhost:3100/api/health | jq

# Open Web UI in browser
open http://localhost:5173
```

### Option B: CLI Only

If you just want to manage context via the command line:

```bash
pnpm build

export AIME_PASSPHRASE="my-dev-passphrase"

# Check vault status
node packages/cli/dist/index.js status

# Add a facet
node packages/cli/dist/index.js add professional current_role "Engineer"

# List all facets
node packages/cli/dist/index.js facets
```

---

## Quick Start: Docker-Compose

Docker-compose runs the full stack (API + Web) in containers. No Node.js installation needed on the host beyond building.

```bash
# Set your passphrase
export AIME_PASSPHRASE="my-secure-passphrase"

# Build and start
docker compose up --build
```

| Service | URL | Description |
|---------|-----|-------------|
| **API** | `http://localhost:3100` | REST API with all plugins |
| **Web** | `http://localhost:3200` | Web UI dashboard |

The vault data is persisted in a Docker volume (`vault-data`).

To stop:

```bash
# Stop containers (vault data preserved)
docker compose down

# Stop and delete vault data (fresh start)
docker compose down -v
```

---

## Adding Your First Facets

Facets are the building blocks of your AI context. Each facet has a **category**, a **key**, and a **value**.

### Via the CLI

```bash
export AIME_PASSPHRASE="my-dev-passphrase"

# Physical attributes
node packages/cli/dist/index.js add physical height_cm 178
node packages/cli/dist/index.js add physical shoe_size_eu 44

# Professional context
node packages/cli/dist/index.js add professional current_role "Senior DevOps Engineer"
node packages/cli/dist/index.js add professional primary_language "TypeScript"

# Communication preferences
node packages/cli/dist/index.js add communication preferred_language "es"
node packages/cli/dist/index.js add communication style "concise"

# Verify
node packages/cli/dist/index.js facets
```

### Via the API

With the API server running (`pnpm --filter @aime/api dev`):

```bash
# Add a facet
curl -s -X POST http://localhost:3100/api/facets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "professional",
    "key": "current_role",
    "value": "Senior DevOps Engineer"
  }' | jq

# List all facets
curl -s http://localhost:3100/api/facets | jq

# List facets by category
curl -s "http://localhost:3100/api/facets?category=professional" | jq
```

### Via the Web UI

1. Start the API and Web UI (see [Quick Start](#quick-start-running-locally))
2. Open `http://localhost:5173` in your browser
3. Navigate to **Facets** in the sidebar
4. Use the form to add new facets with category, key, and value
5. Manage consent policies under **Consent**
6. Import/export your context under **Import/Export**

---

## Configuring the MCP Server for Claude Code

The MCP (Model Context Protocol) server allows Claude Code to read your context directly.

### Step 1: Build the project

```bash
pnpm build
```

### Step 2: Add MCP configuration

Edit your Claude Code settings file. Choose one:

- **Global:** `~/.claude/settings.json`
- **Per-project:** `.claude/settings.local.json`

Add the `aime-context` MCP server:

```json
{
  "mcpServers": {
    "aime-context": {
      "command": "node",
      "args": ["/absolute/path/to/contextme/packages/mcp-server/dist/index.js"],
      "env": {
        "AIME_PASSPHRASE": "your-secure-passphrase",
        "AIME_VAULT_PATH": "/Users/yourname/.aime/vault"
      }
    }
  }
}
```

> Replace `/absolute/path/to/contextme` with the actual path where you cloned the repo,
> and set your actual passphrase and vault path.

### Step 3: Restart Claude Code

Claude Code needs a restart to pick up the new MCP server.

### Step 4: Verify

In a new Claude Code conversation:

```
Use the about_me tool to see what context you have about me.
```

Claude should respond with your stored facets. This confirms the full pipeline:
**Vault -> MCP Server -> Claude Code**.

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `AIME_PASSPHRASE` | `default-dev-passphrase` | Encryption passphrase for the vault. **Always change this for real data.** |
| `AIME_VAULT_PATH` | `~/.aime/vault` | Filesystem path where the encrypted vault is stored. |
| `AIME_API_PORT` | `3100` | Port the HTTP API server listens on. |

### Setting Environment Variables

**For development (shell session):**

```bash
export AIME_PASSPHRASE="my-dev-passphrase"
export AIME_VAULT_PATH="$HOME/.aime/vault"
export AIME_API_PORT=3100
```

**For Docker-Compose:**

Create a `.env` file in the project root:

```env
AIME_PASSPHRASE=my-secure-passphrase
```

Or pass inline:

```bash
AIME_PASSPHRASE="my-passphrase" docker compose up --build
```

**For MCP Server (Claude Code):**

Environment variables are set in the MCP configuration JSON under the `"env"` key (see [Configuring the MCP Server](#configuring-the-mcp-server-for-claude-code)).

---

*Document generated: 2026-03-25*
*Project: AIME*
