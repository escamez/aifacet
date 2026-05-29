# AIFacet — Future Ideas

> This document collects ideas and research directions for future exploration.
> Nothing here is committed, prioritised, or scheduled.

---

## Future Integrations: MCP Alternatives

MCP (Model Context Protocol) is the current integration mechanism. It works well for clients
that support it natively (Claude, Cursor, Perplexity, VS Code Copilot). The following
alternatives would extend AIFacet's reach to AI providers that do not support MCP.

### OpenAI Custom GPT Actions

ChatGPT Custom GPTs can call external APIs via [Actions](https://platform.openai.com/docs/actions).
The idea is to expose an OpenAPI-compliant endpoint so that a Custom GPT can fetch authorised
facets from the vault.

**Approach:**
- Expose `GET /api/facets?provider_id=chatgpt` with an OpenAPI 3.1 schema at
  `/api/openapi.json`
- Adjust CORS headers in `@aifacet/api` to allow requests from `chat.openai.com`
- The Custom GPT would declare the action in its system prompt configuration

**Files involved:** `packages/api/src/plugins/`, `packages/api/src/index.ts`

---

### Browser Extension

A browser extension that injects the user's authorised context into AI web interfaces
(claude.ai, chatgpt.com, gemini.google.com) without requiring the AI provider to support
any specific protocol.

**Approach:**
- Content script detects the AI interface and injects relevant facets into the prompt or
  system context area
- Extension calls `@aifacet/api` locally (`http://localhost:3100`) to retrieve authorised
  facets for the current provider
- User controls which providers can receive context via the existing consent system

**Files involved:** new package `packages/browser-extension/`

---

### Generic Broker / OAuth Proxy

A broker service that acts as an intermediary between AI providers (without MCP support) and
the vault. The broker handles OAuth authorisation so that external AI services can request
context on behalf of the user.

**Approach:**
- User authorises the broker via OAuth 2.0 in the browser
- Broker receives a scoped token and proxies facet requests to `@aifacet/api`
- Provider identifies itself with a `provider_id`; existing consent policies apply

This is the pattern shown as dashed lines in [`ARCHITECTURE.md`](./ARCHITECTURE.md) under
"ChatGPT via Broker/Extension" and "Gemini via Broker/Extension".

**Files involved:** new package `packages/broker/` or a new plugin in `packages/api/src/plugins/`

---

### Gemini Extensions

Similar to OpenAI Custom Actions but targeting the Google Gemini ecosystem. Gemini supports
custom extensions that can call external REST APIs.

**Approach:** same as Custom GPT Actions above, reusing the OpenAPI endpoint.

---

## Premium Feature: Local AI Agent

Instead of returning raw JSON facets to the AI client, a local AI agent could synthesise the
user's context into a natural language answer. Because it runs locally via
[Ollama](https://ollama.com), no data ever leaves the user's machine — preserving the
privacy-first design of AIFacet.

### How it would work

```
AI client  →  ask_context("What are my dietary preferences and food allergies?")
                └─ ContextAgent
                     ├─ vault.getAuthorizedFacets(provider_id)   ← same consent rules
                     └─ Ollama (local LLM, e.g. llama3.2)
                          └─ synthesised natural-language answer
```

The agent sits **inside** the MCP server: the AI client does not call Ollama directly. The
local LLM is a synthesis engine, not a router.

### Planned scope

- New package `@aifacet/agent` — encapsulates `ContextAgent` class and Ollama integration
- New MCP tool `ask_context(question, provider_id?)` in `@aifacet/mcp-server`
- New CLI commands `aifacet agent configure` and `aifacet agent status`
- Feature is **opt-in** (disabled by default); activated via config or env vars
- Requires Ollama running locally; model is user-configurable (default: `llama3.2`)

### Files involved

| File | Change |
|------|--------|
| `packages/agent/` | New package |
| `packages/mcp-server/src/server.ts` | Add `ask_context` tool |
| `packages/mcp-server/package.json` | Add `@aifacet/agent` dependency |
| `packages/cli/src/config.ts` | Add `agent` config block |
| `packages/cli/src/index.ts` | Add `agent` subcommands |

---

## Setup Wizard

Configuring MCP clients today requires users to manually locate and edit JSON config files for
each client (Claude Desktop, Cursor, VS Code Copilot, Claude Code…). This is a barrier for
non-technical users and error-prone even for developers.

A setup wizard — invoked via `aifacet setup` — would automate this entirely:

1. Detect which MCP-compatible clients are installed on the user's machine
2. For each detected client, write (or update) the aifacet MCP server block in the appropriate
   config file
3. Verify the configuration is correct and the server is reachable

**Known config file locations per client:**

| Client | Config path |
|--------|-------------|
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| ChatGPT Desktop (macOS) | `~/Library/Application Support/ChatGPT/` *(exact filename TBD)* |
| ChatGPT Desktop (Windows) | `%APPDATA%\ChatGPT\` *(exact filename TBD)* |

**Files involved:** `packages/cli/src/index.ts` (new `setup` command),
new `packages/cli/src/wizard.ts`

---

## AIFacet from Your Mobile

Mobile AI apps (Claude, ChatGPT, Gemini on iOS and Android) are currently closed consumer
applications with no support for MCP or any external context integration. There is no clean
way today to connect AIFacet to them.

This space should be monitored continuously. If any of these apps adds MCP support or an
equivalent integration mechanism, AIFacet should be ready to provide a first-class, easy
configuration experience for mobile users — in line with the setup wizard approach planned
for desktop clients.

---

## 💡 Far-Future Idea: AIFacet Mobile App

A native iOS/Android app with a built-in conversational agent that lets users interact
directly with their own vault — asking questions, updating their context, and exploring their
personal data through natural language, without relying on any third-party AI provider.

> This is a raw idea. No evaluation of cost, architecture, or business model has been done.

---

*Document created: 2026-05-29*
*Project: AIFacet*
