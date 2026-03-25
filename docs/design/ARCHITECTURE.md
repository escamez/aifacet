# AIME — Architecture Overview

> This document provides a visual guide to the system architecture using Mermaid diagrams.
> Diagrams are designed for dark mode compatibility (GitHub, Safari, VS Code).

## System Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#4a9eff', 'primaryTextColor': '#e8e8e8', 'primaryBorderColor': '#6bb3ff', 'lineColor': '#8899aa', 'secondaryColor': '#2d5a8a', 'tertiaryColor': '#1a3550', 'background': '#0d1117', 'mainBkg': '#161b22', 'nodeBorder': '#4a9eff', 'clusterBkg': '#161b22', 'clusterBorder': '#30363d', 'titleColor': '#e8e8e8', 'edgeLabelBackground': '#161b22', 'noteTextColor': '#e8e8e8', 'noteBkgColor': '#1a3550', 'noteBorderColor': '#4a9eff'}}}%%

graph TB
    subgraph USER["👤 User Device"]
        direction TB
        CLI["<b>@aime/cli</b><br/>Command Line Interface"]
        UI["<b>Future: Web UI</b><br/>Consent Dashboard"]

        subgraph CORE["Core Engine"]
            direction TB
            SCHEMA["<b>@aime/schema</b><br/>Context Model &amp; Types<br/><i>Facets · Policies · Constitution</i>"]
            VAULT["<b>@aime/vault</b><br/>Encrypted Storage<br/><i>AES-256-GCM · Local-first</i>"]
            CONSENT["<b>Consent Manager</b><br/><i>Policies · Constitutional Rules</i><br/><i>Access Level Enforcement</i>"]
            AUDIT["<b>Audit Log</b><br/><i>Who accessed what, when</i>"]
        end

        MCP["<b>@aime/mcp-server</b><br/>Model Context Protocol<br/><i>Resources · Tools</i>"]
        BROKER["<b>Future: Context Broker</b><br/>REST API / Protocol<br/><i>Serves authorized facets</i>"]
    end

    subgraph PROVIDERS["🤖 AI Providers"]
        CLAUDE["<b>Claude</b><br/><i>via MCP</i>"]
        GPT["<b>ChatGPT</b><br/><i>via Broker/Extension</i>"]
        GEMINI["<b>Gemini</b><br/><i>via Broker/Extension</i>"]
        OTHER["<b>Any AI</b><br/><i>via Open Protocol</i>"]
    end

    CLI --> VAULT
    UI -.-> VAULT
    VAULT --> SCHEMA
    VAULT --> CONSENT
    CONSENT --> AUDIT
    MCP --> VAULT
    MCP --> CONSENT
    BROKER -.-> VAULT
    BROKER -.-> CONSENT

    MCP --> CLAUDE
    BROKER -.-> GPT
    BROKER -.-> GEMINI
    BROKER -.-> OTHER

    style USER fill:#0d1117,stroke:#4a9eff,stroke-width:2px,color:#e8e8e8
    style CORE fill:#1a2332,stroke:#30363d,stroke-width:1px,color:#e8e8e8
    style PROVIDERS fill:#0d1117,stroke:#f0883e,stroke-width:2px,color:#e8e8e8

    style CLI fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style UI fill:#1a2332,stroke:#30363d,stroke-dasharray:5 5,color:#8899aa
    style SCHEMA fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style VAULT fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style CONSENT fill:#3a1f3a,stroke:#bc8cff,color:#e8e8e8
    style AUDIT fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
    style MCP fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style BROKER fill:#1a2332,stroke:#30363d,stroke-dasharray:5 5,color:#8899aa

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
    participant MCP as @aime/mcp-server
    participant Consent as Consent Manager
    participant Vault as @aime/vault
    participant Disk as 🔒 Encrypted Storage

    AI->>MCP: get_authorized_context(provider_id)
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
    SCHEMA["@aime/schema<br/><i>Core Types</i>"]
    VAULT["@aime/vault<br/><i>Storage + Consent</i>"]
    MCP["@aime/mcp-server<br/><i>MCP Protocol</i>"]
    CLI["@aime/cli<br/><i>CLI Tool</i>"]

    VAULT --> SCHEMA
    MCP --> VAULT
    MCP --> SCHEMA
    CLI --> VAULT
    CLI --> SCHEMA

    style SCHEMA fill:#1a3550,stroke:#4a9eff,color:#e8e8e8
    style VAULT fill:#1f3a1f,stroke:#3fb950,color:#e8e8e8
    style MCP fill:#2d1a3a,stroke:#bc8cff,color:#e8e8e8
    style CLI fill:#2d2d1a,stroke:#d29922,color:#e8e8e8
```

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
aime/
├── package.json              Root workspace config
├── pnpm-workspace.yaml       Workspace definition
├── tsconfig.base.json        Shared TypeScript config (strict)
├── biome.json                Linting & formatting (Biome v2)
├── vitest.workspace.ts       Test workspace config
├── .husky/pre-commit         Pre-commit: lint check
│
├── docs/
│   ├── design/               Design documents & architecture
│   ├── research/             Market analysis & research
│   └── business/             Monetization & startup roadmap
│
└── packages/
    ├── schema/               @aime/schema — Core types
    │   ├── src/types/
    │   │   ├── access.ts     AccessLevel, ConsentPolicy, ConstitutionalRule
    │   │   ├── facet.ts      Facet, FacetMeta, categories
    │   │   └── context.ts    HumanContext, createEmptyContext
    │   └── tests/            16 tests
    │
    ├── vault/                @aime/vault — Encrypted storage
    │   ├── src/
    │   │   ├── storage.ts    AES-256-GCM encrypted file I/O
    │   │   └── vault.ts      Vault API (CRUD, consent enforcement)
    │   └── tests/            14 tests
    │
    ├── mcp-server/           @aime/mcp-server — Claude integration
    │   ├── src/
    │   │   └── index.ts      MCP resources + tools (get_facets, get_authorized_context)
    │   └── tests/            1 test
    │
    └── cli/                  @aime/cli — Command line tool
        └── src/
            └── index.ts      status, facets, add commands
```

---

*Document generated: 2026-03-25*
*Project: AIME*
