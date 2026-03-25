# AIME — Testing & Validation Guide

> How to validate the system locally, including the API, Web UI, Docker, and Claude Code integration.

## Table of Contents

1. [Quick Validation (Sandbox Script)](#quick-validation-sandbox-script)
2. [Testing the API with curl](#testing-the-api-with-curl)
3. [Testing the Web UI Locally](#testing-the-web-ui-locally)
4. [Docker-Compose Testing](#docker-compose-testing)
5. [Testing with Claude Code (MCP)](#testing-with-claude-code-the-real-test)
6. [Unit & Integration Tests](#unit--integration-tests)
7. [Environment Variables](#environment-variables)

---

## Quick Validation (Sandbox Script)

Run the sandbox script to create a temporary vault, populate it with sample data, and verify everything works:

```bash
pnpm build
bash scripts/sandbox.sh
```

This will:
1. Build all packages
2. Create a temporary encrypted vault
3. Add 9 sample facets (physical, professional, communication, health, preferences)
4. Verify CLI reads them back correctly
5. Test MCP server startup
6. Clean up automatically

---

## Testing the API with curl

Start the API server in development mode:

```bash
# From the project root
export AIME_PASSPHRASE="test-passphrase"
pnpm --filter @aime/api dev
```

The API runs on `http://localhost:3100` by default. All endpoints are prefixed with `/api`.

### Health Check

```bash
curl -s http://localhost:3100/api/health | jq
```

Expected response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "facets": 0,
  "policies": 0,
  "constitution": 0
}
```

### List Plugins

```bash
curl -s http://localhost:3100/api/plugins | jq
```

### Facets CRUD

**Create a facet:**

```bash
curl -s -X POST http://localhost:3100/api/facets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "physical",
    "key": "height_cm",
    "value": 178
  }' | jq
```

**Create multiple facets:**

```bash
curl -s -X POST http://localhost:3100/api/facets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "professional",
    "key": "current_role",
    "value": "DevOps Engineer",
    "source": "self-reported",
    "accessLevel": "full"
  }' | jq

curl -s -X POST http://localhost:3100/api/facets \
  -H "Content-Type: application/json" \
  -d '{
    "category": "communication",
    "key": "preferred_language",
    "value": "es"
  }' | jq
```

**List all facets:**

```bash
curl -s http://localhost:3100/api/facets | jq
```

**List facets by category:**

```bash
curl -s "http://localhost:3100/api/facets?category=professional" | jq
```

**Delete a facet:**

```bash
curl -s -X DELETE http://localhost:3100/api/facets/physical/height_cm | jq
```

### Import / Export

**Export all context:**

```bash
curl -s http://localhost:3100/api/transfer/export | jq
```

**Import facets from JSON:**

```bash
curl -s -X POST http://localhost:3100/api/transfer/import \
  -H "Content-Type: application/json" \
  -d '{
    "facets": [
      {
        "category": "physical",
        "key": "shoe_size_eu",
        "value": 44
      },
      {
        "category": "physical",
        "key": "pants_size_eu",
        "value": 42
      }
    ]
  }' | jq
```

Expected response:

```json
{
  "ok": true,
  "imported": 2,
  "skipped": 0
}
```

### Consent Policies

**List all policies:**

```bash
curl -s http://localhost:3100/api/policies | jq
```

**Add a consent policy:**

```bash
curl -s -X POST http://localhost:3100/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "facetCategory": "professional",
    "accessLevel": "full",
    "duration": "persistent",
    "grantedTo": "claude"
  }' | jq
```

### Constitutional Rules

**List all constitutional rules:**

```bash
curl -s http://localhost:3100/api/constitution | jq
```

**Add a constitutional rule:**

```bash
curl -s -X POST http://localhost:3100/api/constitution \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Never share political views with any AI",
    "facetCategory": "political",
    "maxAccessLevel": "hidden"
  }' | jq
```

### Full API Smoke Test (One-liner)

Run all commands in sequence to validate the complete API surface:

```bash
# Health
curl -sf http://localhost:3100/api/health | jq '.status' && \
# Create facet
curl -sf -X POST http://localhost:3100/api/facets \
  -H "Content-Type: application/json" \
  -d '{"category":"test","key":"smoke","value":"ok"}' | jq '.ok' && \
# List facets
curl -sf "http://localhost:3100/api/facets?category=test" | jq '.data | length' && \
# Delete facet
curl -sf -X DELETE http://localhost:3100/api/facets/test/smoke | jq '.ok' && \
echo "API smoke test passed"
```

---

## Testing the Web UI Locally

### Prerequisites

Make sure the API server is running first (the Web UI fetches data from it):

```bash
# Terminal 1: Start the API
export AIME_PASSPHRASE="test-passphrase"
pnpm --filter @aime/api dev
```

### Start the Web UI in Dev Mode

```bash
# Terminal 2: Start the Web UI
pnpm --filter @aime/web dev
```

The Web UI starts on `http://localhost:5173` (Vite default) with hot module replacement.

### What to Test

1. **Dashboard** — Visit `http://localhost:5173/` and verify the overview loads correctly
2. **Facets** — Navigate to `/facets`, add a facet, verify it appears in the list
3. **Consent** — Navigate to `/consent`, add a consent policy
4. **Import/Export** — Navigate to `/transfer`, test exporting and re-importing context

### Running Both Together (Convenience)

From the project root, you can run both in parallel:

```bash
# Terminal 1
pnpm --filter @aime/api dev

# Terminal 2
pnpm --filter @aime/web dev
```

---

## Docker-Compose Testing

Docker-compose runs both the API and Web UI as containers, ideal for integration testing and demos.

### Prerequisites

- Docker and Docker Compose installed
- No other services running on ports 3100 (API) and 3200 (Web)

### Start the Stack

```bash
# From the project root
export AIME_PASSPHRASE="my-secure-passphrase"
docker compose up --build
```

This builds and starts:
- **API** on `http://localhost:3100` — backed by a persistent Docker volume for the vault
- **Web** on `http://localhost:3200` — depends on the API service

### Verify the Stack

```bash
# Check API health
curl -s http://localhost:3100/api/health | jq

# Open Web UI
open http://localhost:3200
```

### Run the Full Curl Suite Against Docker

All the curl commands from the [Testing the API with curl](#testing-the-api-with-curl) section work identically against the Dockerized API on port 3100.

### Stop and Clean Up

```bash
# Stop containers
docker compose down

# Stop containers and remove the vault volume (fresh start)
docker compose down -v
```

### Persistent Vault Data

The `docker-compose.yml` uses a named volume `vault-data` mounted at `/data/vault` inside the API container. Data persists across restarts unless you explicitly remove the volume with `docker compose down -v`.

---

## Testing with Claude Code (The Real Test)

This is the **most important validation** — proving that Claude can actually read your context via MCP.

### Step 1: Create your real vault

```bash
# Set a passphrase (use something real, not this example)
export AIME_PASSPHRASE="your-secure-passphrase"

# Use the CLI to add your context
node packages/cli/dist/index.js add physical height_cm 178
node packages/cli/dist/index.js add professional current_role "DevOps Engineer"
node packages/cli/dist/index.js add communication preferred_language "es"
node packages/cli/dist/index.js add communication style "concise"

# Verify
node packages/cli/dist/index.js status
node packages/cli/dist/index.js facets
```

Your vault is stored at `~/.aime/vault/` by default.

### Step 2: Configure Claude Code to use the MCP server

Add this to your Claude Code MCP settings (`~/.claude/settings.json` or project `.claude/settings.local.json`):

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

> **Important:** Replace paths and passphrase with your actual values.

### Step 3: Restart Claude Code

After adding the MCP config, restart Claude Code so it picks up the new server.

### Step 4: Ask Claude to read your context

In a new Claude Code conversation, try:

```
Use the get_facets tool to see what context you have about me.
```

Or more specifically:

```
Use get_authorized_context with provider_id "claude" to see what facets are authorized for you.
```

If it works, Claude will respond with your context facets. **This proves the full pipeline: vault -> MCP -> Claude.**

### Step 5: Test consent enforcement

Add a constitutional rule that blocks a category, then verify Claude can't see it:

```bash
# Add political facet
node packages/cli/dist/index.js add political leaning "private"

# Ask Claude to read all facets — political should be visible
# Then we'll add a constitutional rule to block it (via code, not CLI yet)
```

---

## Unit & Integration Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (during development)
pnpm test:watch

# Run tests for a specific package
pnpm --filter @aime/vault test
pnpm --filter @aime/schema test

# Run with coverage
pnpm test:coverage
```

### Test Structure

All tests follow the **GIVEN / WHEN / THEN** pattern:

```typescript
describe('Vault', () => {
  describe('given a vault with facets', () => {
    describe('when adding a facet', () => {
      it('then it should be retrievable', () => {
        // ...
      });
    });
  });
});
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AIME_VAULT_PATH` | `~/.aime/vault` | Path to the encrypted vault directory |
| `AIME_PASSPHRASE` | `default-dev-passphrase` | Encryption passphrase (CHANGE THIS!) |
| `AIME_API_PORT` | `3100` | Port for the HTTP API server |

---

*Document updated: 2026-03-25*
