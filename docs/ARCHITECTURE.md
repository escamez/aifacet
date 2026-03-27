# AIFacet — Architecture Overview

> This document provides a visual guide to the system architecture using Mermaid diagrams.
> Diagrams are designed for dark mode compatibility (GitHub, Safari, VS Code).

## System Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550', 'background': '#0d1117', 'mainBkg': '#161b22', 'nodeBorder': '#4a9eff', 'clusterBkg': '#161b22', 'clusterBorder': '#30363d', 'titleColor': '#e8e8e8', 'edgeLabelBackground': '#161b22', 'noteTextColor': '#e8e8e8', 'noteBkgColor': '#1a3550', 'noteBorderColor': '#4a9eff'}}}%%

graph TB
    subgraph USER["👤 User Device"]
        direction TB
        CLI["<b>@aifacet/cli</b><br/>Command Line Interface"]
        WEB["<b>@aifacet/web</b><br/>Web UI Dashboard<br/><i>React · Vite · Tailwind</i>"]

        subgraph CORE["Core Engine"]
            direction TB
            SCHEMA["<b>@aifacet/schema</b><br/>Context Model &amp; Types<br/><i>Facets · Policies · Constitution</i>"]
            VAULT["<b>@aifacet/vault</b><br/>Encrypted Storage<br/><i>AES-256-GCM · Local-first</i>"]
            CONSENT["<b>Consent Manager</b><br/><i>Policies · Constitutional Rules</i><br/><i>Access Level Enforcement</i>"]
            AUDIT["<b>Audit Log</b><br/><i>Who accessed what, when</i>"]
        end

        API["<b>@aifacet/api</b><br/>HTTP REST API<br/><i>Hono · Plugin-based</i>"]
        MCP["<b>@aifacet/mcp-server</b><br/>Model Context Protocol<br/><i>Resources · Tools</i>"]
    end

    subgraph PROVIDERS["🤖 AI Providers"]
        CLAUDE["<b>Claude</b><br/><i>via MCP</i>"]
        GPT["<b>ChatGPT</b><br/><i>via Broker/Extension</i>"]
        GEMINI["<b>Gemini</b><br/><i>via Broker/Extension</i>"]
        OTHER["<b>Any AI</b><br/><i>via Open Protocol</i>"]
    end

    CLI --> VAULT
    WEB --> API
    API --> VAULT
    VAULT --> SCHEMA
    VAULT --> CONSENT
    CONSENT --> AUDIT
    MCP --> VAULT
    MCP --> CONSENT

    MCP --> CLAUDE
    API -.-> GPT
    API -.-> GEMINI
    API -.-> OTHER

    style USER fill:#0d1117,stroke:#4a9eff,stroke-width:2px,color:#e8e8e8
    style CORE fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style PROVIDERS fill:#0d1117,stroke:#f0883e,stroke-width:2px,color:#e8e8e8

    style CLI fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style WEB fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style SCHEMA fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style VAULT fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style CONSENT fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style AUDIT fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style API fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style MCP fill:#1a3550,stroke:#4a9eff,color:#e8e8e8

    style CLAUDE fill:#2d1a3a,stroke:#bc8cff,color:#e8e8e8
    style GPT fill:#1a2332,stroke:#30363d,stroke-dasharray:5 5,color:#8899aa
    style GEMINI fill:#1a2332,stroke:#30363d,stroke-dasharray:5 5,color:#8899aa
    style OTHER fill:#1a2332,stroke:#30363d,stroke-dasharray:5 5,color:#8899aa
```

**Legend:**
- Solid borders = implemented now
- Dashed borders = planned for future phases

---

## Data Flow: How Context Reaches an AI

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550'}}}%%

sequenceDiagram
    participant AI as 🤖 AI Provider
    participant MCP as @aifacet/mcp-server
    participant Consent as Consent Manager
    participant Vault as @aifacet/vault
    participant Disk as 🔒 Encrypted Storage

    AI->>MCP: what_can_you_know(provider_id)
    MCP->>Vault: getAuthorizedFacets(provider_id)
    Vault->>Consent: Check constitutional rules
    Consent-->>Vault: Apply access policies
    Vault->>Disk: Read encrypted context
    Disk-->>Vault: Decrypt (AES-256-GCM)
    Vault-->>Vault: Filter by policies
    Vault-->>MCP: Authorized facets only
    MCP-->>AI: JSON response

    Note over AI,Disk: The AI NEVER sees facets blocked<br/>by constitution or denied policies
```

---

## Package Dependency Graph

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550'}}}%%

graph LR
    SCHEMA["@aifacet/schema<br/><i>Core Types</i>"]
    VAULT["@aifacet/vault<br/><i>Storage + Consent</i>"]
    MCP["@aifacet/mcp-server<br/><i>MCP Protocol</i>"]
    CLI["@aifacet/cli<br/><i>CLI Tool</i>"]
    API["@aifacet/api<br/><i>REST API</i>"]
    WEB["@aifacet/web<br/><i>Web UI</i>"]

    VAULT --> SCHEMA
    MCP --> VAULT
    MCP --> SCHEMA
    CLI --> VAULT
    CLI --> SCHEMA
    API --> VAULT
    API --> SCHEMA
    WEB -.->|HTTP| API

    style SCHEMA fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style VAULT fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style MCP fill:#2d1a3a,stroke:#bc8cff,color:#e8e8e8
    style CLI fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style API fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style WEB fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
```

---

## API Plugin System

The `@aifacet/api` package uses a plugin architecture built on [Hono](https://hono.dev). Each plugin is a self-contained module that registers routes on a base path. The main application composes all plugins under `/api`.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550'}}}%%

graph TB
    subgraph APP["Hono Application"]
        direction TB
        MW["Middleware<br/><i>logger · cors</i>"]

        subgraph PLUGINS["API Plugins (mounted under /api)"]
            direction LR
            HEALTH["<b>health</b><br/>/api/health<br/><i>GET /</i>"]
            FACETS["<b>facets</b><br/>/api/facets<br/><i>GET / · POST / · DELETE /:cat/:key</i>"]
            POLICIES["<b>policies</b><br/>/api/policies<br/><i>GET / · POST /</i>"]
            CONSTITUTION["<b>constitution</b><br/>/api/constitution<br/><i>GET / · POST /</i>"]
            TRANSFER["<b>import-export</b><br/>/api/transfer<br/><i>GET /export · POST /import</i>"]
        end

        LISTING["/api/plugins<br/><i>Lists all registered plugins</i>"]
    end

    subgraph CORE["Core Layer"]
        VAULT["@aifacet/vault"]
        SCHEMA["@aifacet/schema"]
    end

    MW --> PLUGINS
    HEALTH --> VAULT
    FACETS --> VAULT
    POLICIES --> VAULT
    CONSTITUTION --> VAULT
    TRANSFER --> VAULT
    VAULT --> SCHEMA

    style APP fill:#0d1117,stroke:#4a9eff,stroke-width:2px,color:#e8e8e8
    style PLUGINS fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style CORE fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style MW fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style LISTING fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style HEALTH fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style FACETS fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style POLICIES fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style CONSTITUTION fill:#3a1f1f,stroke:#f85149,color:#e8e8e8
    style TRANSFER fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style VAULT fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style SCHEMA fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
```

**How API plugins work:**

1. A factory function (e.g., `createFacetsPlugin(vault)`) creates a Hono sub-app with routes.
2. The factory returns an `ApiPlugin` object: `{ id, name, basePath, routes }`.
3. The main app iterates all plugins and calls `api.route(plugin.basePath, plugin.routes)`.
4. All plugins are discoverable via `GET /api/plugins`.

---

## Web Plugin System

The `@aifacet/web` package uses a plugin architecture built on React Router and a central registry. Each plugin registers navigation items and routes via side-effect imports.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550'}}}%%

graph TB
    subgraph WEBAPP["React Application"]
        direction TB
        ROUTER["BrowserRouter<br/><i>React Router</i>"]
        SHELL["Shell Layout<br/><i>Sidebar · Navigation · Content</i>"]

        subgraph REGISTRY["Plugin Registry"]
            REG["registerPlugin()"]
            GET["getPlugins()"]
        end

        subgraph WPLUGINS["Web Plugins"]
            direction LR
            DASH["<b>dashboard</b><br/>/<br/><i>DashboardPage</i>"]
            WFACETS["<b>facets</b><br/>/facets<br/><i>FacetsPage</i>"]
            WPOLICIES["<b>policies</b><br/>/consent<br/><i>PoliciesPage</i>"]
            WTRANSFER["<b>import-export</b><br/>/transfer<br/><i>ImportExportPage</i>"]
        end
    end

    subgraph BACKEND["Backend"]
        BAPI["@aifacet/api<br/><i>HTTP REST API</i>"]
    end

    ROUTER --> SHELL
    SHELL --> WPLUGINS
    DASH --> REG
    WFACETS --> REG
    WPOLICIES --> REG
    WTRANSFER --> REG
    GET --> SHELL
    WFACETS -->|fetch| BAPI
    WPOLICIES -->|fetch| BAPI
    WTRANSFER -->|fetch| BAPI

    style WEBAPP fill:#0d1117,stroke:#4a9eff,stroke-width:2px,color:#e8e8e8
    style REGISTRY fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style WPLUGINS fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style BACKEND fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style ROUTER fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style SHELL fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style REG fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style GET fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style DASH fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style WFACETS fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style WPOLICIES fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style WTRANSFER fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style BAPI fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
```

**How Web plugins work:**

1. Each plugin is a directory under `packages/web/src/plugins/{name}/` with an `index.tsx` entry point.
2. The entry point calls `registerPlugin()` with the plugin's id, label, icon, nav items, and routes.
3. Registration happens via side-effect imports in `app.tsx` — import order determines nav order.
4. The `Shell` component reads `getPlugins()` to build the sidebar navigation.
5. The `App` component renders all plugin routes inside a shared `<Routes>` tree.

---

## Consent Model: How Access Control Works

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550'}}}%%

flowchart TD
    REQ["AI requests facet"]
    CONST{"Constitutional<br/>rule blocks it?"}
    POLICY{"Policy denies<br/>for this provider?"}
    FACET{"Facet access<br/>level?"}
    FULL["✅ Return full data"]
    SUMMARY["📋 Return summary"]
    EXIST["🔍 Return existence only"]
    HIDDEN["🚫 Invisible to AI"]
    DENIED["⛔ Explicitly denied"]

    REQ --> CONST
    CONST -->|Yes| HIDDEN
    CONST -->|No| POLICY
    POLICY -->|Denied| DENIED
    POLICY -->|No denial| FACET
    FACET -->|full| FULL
    FACET -->|summary| SUMMARY
    FACET -->|existence| EXIST
    FACET -->|hidden| HIDDEN

    style REQ fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style CONST fill:#3a1f1f,stroke:#f85149,color:#e8e8e8
    style POLICY fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style FACET fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style FULL fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style SUMMARY fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style EXIST fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style HIDDEN fill:#3a1f1f,stroke:#f85149,color:#e8e8e8
    style DENIED fill:#3a1f1f,stroke:#f85149,color:#e8e8e8
```

---

## Monorepo Structure

```
aifacet/
├── package.json              Root workspace config
├── pnpm-workspace.yaml       Workspace definition
├── docker-compose.yml        Docker stack (API + Web)
├── tsconfig.base.json        Shared TypeScript config (strict)
├── biome.json                Linting & formatting (Biome v2)
├── vitest.workspace.ts       Test workspace config
├── .husky/pre-commit         Pre-commit: lint check
│
├── docs/
│   ├── ARCHITECTURE.md       Architecture overview (this file)
│   ├── GETTING_STARTED.md    Getting started guide
│   ├── TESTING.md            Testing & validation guide
│   └── PLUGIN_GUIDE.md       Plugin development guide
│
├── scripts/
│   └── sandbox.sh            Quick validation script
│
└── packages/
    ├── schema/               @aifacet/schema — Core types
    │   ├── src/types/
    │   │   ├── access.ts     AccessLevel, ConsentPolicy, ConstitutionalRule
    │   │   ├── facet.ts      Facet, FacetMeta, categories
    │   │   └── context.ts    HumanContext, createEmptyContext
    │   └── tests/
    │
    ├── vault/                @aifacet/vault — Encrypted storage
    │   ├── src/
    │   │   ├── storage.ts    AES-256-GCM encrypted file I/O
    │   │   └── vault.ts      Vault API (CRUD, consent enforcement)
    │   └── tests/
    │
    ├── mcp-server/           @aifacet/mcp-server — MCP protocol integration
    │   ├── src/
    │   │   ├── server.ts     MCP resources + tools (about_me, what_can_you_know)
    │   │   ├── http.ts       Streamable HTTP transport server
    │   │   ├── logger.ts     Structured logging utility
    │   │   └── index.ts      Stdio transport entry point
    │   └── tests/
    │
    ├── cli/                  @aifacet/cli — Command line tool
    │   └── src/
    │       └── index.ts      status, facets, add commands
    │
    ├── api/                  @aifacet/api — HTTP REST API
    │   ├── Dockerfile
    │   ├── src/
    │   │   ├── index.ts      Hono app, plugin composition, server startup
    │   │   └── plugins/
    │   │       ├── types.ts          ApiPlugin interface
    │   │       ├── health.ts         GET /api/health
    │   │       ├── facets.ts         CRUD /api/facets
    │   │       ├── policies.ts       CRUD /api/policies
    │   │       ├── constitution.ts   CRUD /api/constitution
    │   │       └── import-export.ts  GET /api/transfer/export, POST /api/transfer/import
    │   └── tests/
    │
    └── web/                  @aifacet/web — Web UI
        ├── Dockerfile
        ├── src/
        │   ├── app.tsx       Root component, plugin imports, router
        │   ├── components/
        │   │   └── layout/
        │   │       └── shell.tsx     Shell layout with sidebar navigation
        │   └── plugins/
        │       ├── registry/
        │       │   ├── types.ts      WebPlugin, NavItem interfaces
        │       │   └── index.ts      registerPlugin(), getPlugins()
        │       ├── dashboard/
        │       │   ├── index.tsx          Plugin registration
        │       │   └── pages/
        │       │       └── dashboard-page.tsx
        │       ├── facets/
        │       │   ├── index.tsx
        │       │   └── pages/
        │       │       └── facets-page.tsx
        │       ├── policies/
        │       │   ├── index.tsx
        │       │   └── pages/
        │       │       └── policies-page.tsx
        │       └── import-export/
        │           ├── index.tsx
        │           └── pages/
        │               └── import-export-page.tsx
        └── tests/
```

---

*Document updated: 2026-03-25*
*Project: AIFacet*
