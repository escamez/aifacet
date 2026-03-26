#!/usr/bin/env bash
# =============================================================================
# AIFacet Sandbox - Local validation script
# Creates a test vault, populates it with sample facets, and verifies the CLI
# =============================================================================
set -euo pipefail

SANDBOX_DIR="${TMPDIR:-/tmp}/aifacet-sandbox-$$"
export AIFACET_VAULT_PATH="$SANDBOX_DIR/vault"
export AIFACET_PASSPHRASE="sandbox-test-passphrase"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLI="node $PROJECT_ROOT/packages/cli/dist/index.js"

# Colors (safe for dark terminals)
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

cleanup() {
  if [ -d "$SANDBOX_DIR" ]; then
    rm -rf "$SANDBOX_DIR"
    info "Cleaned up sandbox at $SANDBOX_DIR"
  fi
}
trap cleanup EXIT

echo ""
echo "=========================================="
echo "  AIFacet Sandbox - Local Validation"
echo "=========================================="
echo ""

# --- Step 1: Build ---
info "Building all packages..."
(cd "$PROJECT_ROOT" && pnpm build > /dev/null 2>&1) || fail "Build failed"
ok "Build complete"

# --- Step 2: Create vault ---
info "Creating vault at $AIFACET_VAULT_PATH"
mkdir -p "$SANDBOX_DIR"

$CLI status
ok "Vault created"

# --- Step 3: Add sample facets ---
info "Adding sample facets..."

$CLI add physical height_cm 178
$CLI add physical shoe_size_eu 44
$CLI add physical pants_size_eu 42
$CLI add professional current_role "Senior DevOps Engineer"
$CLI add professional primary_language "Go"
$CLI add communication preferred_language "es"
$CLI add communication style "concise"
$CLI add health allergies "peanuts"
$CLI add preferences editor "neovim"

ok "9 facets added"

# --- Step 4: Verify facets ---
info "Verifying vault status..."
$CLI status
echo ""

info "Listing all facets..."
$CLI facets
echo ""

info "Listing physical facets only..."
$CLI facets physical
echo ""

# --- Step 5: Verify MCP server starts ---
info "Testing MCP server startup..."
timeout 3 node "$PROJECT_ROOT/packages/mcp-server/dist/index.js" 2>/dev/null &
MCP_PID=$!
sleep 1
if kill -0 $MCP_PID 2>/dev/null; then
  ok "MCP server started successfully (PID: $MCP_PID)"
  kill $MCP_PID 2>/dev/null || true
  wait $MCP_PID 2>/dev/null || true
else
  warn "MCP server exited (expected for stdio mode without client)"
fi

echo ""
echo "=========================================="
echo -e "  ${GREEN}Sandbox validation complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Configure Claude Code to use the MCP server (see docs/TESTING.md)"
echo "  2. Ask Claude to read your context"
echo ""
