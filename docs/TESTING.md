# AIME — Testing & Validation Guide

> How to validate the system locally, including testing with Claude Code.

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

If it works, Claude will respond with your context facets. **This proves the full pipeline: vault → MCP → Claude.**

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

---

## What Docker-Compose Would Add (Future)

Docker-compose is **not needed at this stage** because:
- The vault is local-first (files on disk)
- The MCP server uses stdio (not HTTP), so Claude Code launches it directly
- No database, no network services, no external dependencies

Docker-compose becomes valuable when we add:
- [ ] **HTTP Context Broker** — a REST API that serves context over the network
- [ ] **Web UI** — a consent management dashboard
- [ ] **Integration tests** — simulating multiple AI providers hitting the broker
- [ ] **CI/CD** — reproducible build/test environments

At that point, a `docker-compose.yml` with broker + UI + test providers makes sense.

---

*Document generated: 2026-03-25*
