.DEFAULT_GOAL := help
SHELL := /bin/bash

# ── Versions ─────────────────────────────────────────────────
NODE_MIN   := 22
PNPM_MIN   := 10
PASS       ?= default-dev-passphrase

# ── Colors ───────────────────────────────────────────────────
OK   := \033[32m✔\033[0m
FAIL := \033[31m✘\033[0m
WARN := \033[33m!\033[0m
DIM  := \033[2m
RST  := \033[0m

# ── Helpers ──────────────────────────────────────────────────
define check_cmd
	@if command -v $(1) >/dev/null 2>&1; then \
		printf "  $(OK) $(1) found: %s\n" "$$($(1) --version 2>/dev/null | head -1)"; \
	else \
		printf "  $(FAIL) $(1) not found — $(2)\n"; \
		exit 1; \
	fi
endef

define check_version
	@ACTUAL=$$($(1) --version 2>/dev/null | grep -oE '[0-9]+' | head -1); \
	if [ "$$ACTUAL" -ge $(2) ] 2>/dev/null; then \
		printf "  $(OK) $(1) version $$ACTUAL (>= $(2))\n"; \
	else \
		printf "  $(FAIL) $(1) version $$ACTUAL — need >= $(2)\n"; \
		printf "    $(DIM)$(3)$(RST)\n"; \
		exit 1; \
	fi
endef

# ═════════════════════════════════════════════════════════════
# Targets
# ═════════════════════════════════════════════════════════════

.PHONY: help
help: ## Show this help
	@printf "\n\033[1mAIME — Development Commands\033[0m\n\n"
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@printf "\n"

# ── Setup ────────────────────────────────────────────────────

.PHONY: doctor
doctor: ## Check system dependencies and project health
	@printf "\n\033[1m System Dependencies\033[0m\n"
	$(call check_cmd,node,install from https://nodejs.org or use nvm/volta)
	$(call check_version,node,$(NODE_MIN),install Node 22+: nvm install 22 OR volta install node@22)
	$(call check_cmd,pnpm,install with: npm install -g pnpm)
	$(call check_version,pnpm,$(PNPM_MIN),upgrade with: npm install -g pnpm@latest)
	$(call check_cmd,openssl,required for HTTPS self-signed certificates)
	@printf "\n\033[1m Project State\033[0m\n"
	@if [ -d node_modules ]; then \
		printf "  $(OK) Dependencies installed\n"; \
	else \
		printf "  $(WARN) Dependencies not installed — run: make init\n"; \
	fi
	@if [ -d packages/cli/dist ]; then \
		printf "  $(OK) Project built\n"; \
	else \
		printf "  $(WARN) Project not built — run: make build\n"; \
	fi
	@if command -v aime >/dev/null 2>&1; then \
		printf "  $(OK) CLI installed globally (aime)\n"; \
	else \
		printf "  $(WARN) CLI not installed globally — run: make cli\n"; \
	fi
	@printf "\n\033[1m Vault\033[0m\n"
	@if [ -d "$$HOME/.aime/vault" ]; then \
		printf "  $(OK) Vault exists at ~/.aime/vault\n"; \
	else \
		printf "  $(WARN) No vault found — run: make seed\n"; \
	fi
	@if [ -f "$$HOME/.aime/aime.pid" ] && kill -0 $$(cat "$$HOME/.aime/aime.pid") 2>/dev/null; then \
		printf "  $(OK) Server running (PID $$(cat $$HOME/.aime/aime.pid))\n"; \
	else \
		printf "  $(DIM)  - Server not running$(RST)\n"; \
	fi
	@printf "\n"

.PHONY: init
init: ## Install dependencies, build, and set up the project
	@printf "\n\033[1m Initialising AIME...\033[0m\n\n"
	@$(MAKE) --no-print-directory doctor
	@printf "\033[1m Installing dependencies\033[0m\n"
	pnpm install
	@printf "\n\033[1m Building packages\033[0m\n"
	pnpm build
	@printf "\n\033[1m Installing CLI globally\033[0m\n"
	cd packages/cli && npm link
	@printf "\n$(OK) \033[1mReady! Run 'make seed' to create a sample vault.\033[0m\n\n"

.PHONY: cli
cli: ## Install the aime CLI globally
	cd packages/cli && npm link
	@printf "$(OK) aime CLI installed — try: aime status\n"

# ── Development ──────────────────────────────────────────────

.PHONY: build
build: ## Build all packages
	pnpm build

.PHONY: test
test: ## Run all tests
	AIME_PASSPHRASE=test pnpm test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	AIME_PASSPHRASE=test pnpm test:watch

.PHONY: lint
lint: ## Check linting and formatting
	pnpm lint

.PHONY: lint-fix
lint-fix: ## Auto-fix linting and formatting
	pnpm lint:fix

.PHONY: clean
clean: ## Remove build artifacts
	pnpm clean
	@printf "$(OK) Build artifacts removed\n"

# ── Vault ────────────────────────────────────────────────────

.PHONY: seed
seed: ## Load sample profile into the vault (resets existing data)
	AIME_PASSPHRASE=$(PASS) aime seed --reset
	@printf "\n$(OK) Vault seeded. Try: make demo\n"

.PHONY: reset
reset: ## Destroy the vault and create a fresh empty one
	AIME_PASSPHRASE=$(PASS) aime reset

# ── Server ───────────────────────────────────────────────────

.PHONY: start
start: ## Start the MCP HTTP server (background)
	AIME_PASSPHRASE=$(PASS) aime start

.PHONY: stop
stop: ## Stop the MCP HTTP server
	aime stop

.PHONY: restart
restart: ## Restart the MCP HTTP server
	aime restart

.PHONY: status
status: ## Show vault and server status
	AIME_PASSPHRASE=$(PASS) aime status

.PHONY: logs
logs: ## Follow server logs in real time
	@if [ -f "$$HOME/.aime/server.log" ]; then \
		tail -f "$$HOME/.aime/server.log"; \
	else \
		printf "$(WARN) No log file found. Start the server first: make start\n"; \
	fi

# ── Demo ─────────────────────────────────────────────────────

.PHONY: demo
demo: ## Run the consent filtering demo (4 scenarios)
	@printf "\n\033[1m═══ AIME Consent Filtering Demo ═══\033[0m\n"
	@printf "\033[1m\nElena's vault: 36 facets, 5 constitutional rules, 6 consent policies\033[0m\n"
	@printf "\n─── Scenario 1: Health AI (trusted with medical data) ───\n\n"
	@AIME_PASSPHRASE=$(PASS) aime check health-assistant
	@printf "\n─── Scenario 2: ChatGPT (health explicitly denied) ───\n\n"
	@AIME_PASSPHRASE=$(PASS) aime check chatgpt
	@printf "\n─── Scenario 3: Career Coach (professional only) ───\n\n"
	@AIME_PASSPHRASE=$(PASS) aime check career-coach
	@printf "\n─── Scenario 4: Unknown AI (minimal access) ───\n\n"
	@AIME_PASSPHRASE=$(PASS) aime check random-ai
	@printf "\n\033[1m═══ Key Takeaway ═══\033[0m\n"
	@printf "\nSame person, same data, different trust levels.\n"
	@printf "Political, financial, identity, religious, labor → ALWAYS blocked (constitutional rules).\n"
	@printf "Health → visible to health-assistant, blocked for chatgpt.\n"
	@printf "The user decides. The vault enforces. Cryptographically.\n\n"
