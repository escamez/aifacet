# ContextMe — Market Analysis

> Research conducted: 2026-03-25
> Status: Initial analysis
> Verdict: **We are NOT pioneers, but the space is greenfield for a protocol-first, privacy-preserving solution. Timing is exceptional.**

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Academic Research](#2-academic-research)
3. [Direct Competitors](#3-direct-competitors)
4. [Adjacent Companies (Memory Infrastructure)](#4-adjacent-companies-memory-infrastructure)
5. [Major Platform Moves](#5-major-platform-moves)
6. [Standards and Protocols](#6-standards-and-protocols)
7. [Open Source Landscape](#7-open-source-landscape)
8. [Regulatory Tailwinds](#8-regulatory-tailwinds)
9. [Venture Capital Landscape](#9-venture-capital-landscape)
10. [Gap Analysis — What Does NOT Exist](#10-gap-analysis--what-does-not-exist)
11. [Strategic Positioning](#11-strategic-positioning)
12. [Sources](#12-sources)

---

## 1. Executive Summary

The idea of portable, user-owned AI context is **not new** — there is active academic research, a growing number of startups, and increasing regulatory pressure in this direction. However:

- **No dominant player** has emerged
- **No universal standard** has been adopted
- **No major AI provider** offers true bidirectional context portability
- **No funded company** is primarily focused on the privacy-first, protocol-first approach we envision

The convergence of EU regulation (DMA review May 2026, AI Act August 2026), industry moves (Claude memory import, MCP standardization), and academic work (Human Context Protocol) creates an **exceptional window of opportunity** in 2026.

---

## 2. Academic Research

### 2.1 Most Relevant Paper: Human Context Protocol (HCP)

**THE closest academic work to our vision.**

- **Authors**: Anand V. Shah, Tobin South, Talfan Evans, Hannah Rose Kirk, Jiaxin Pei, Andrew Trask, E. Glen Weyl, Michiel Bakker (MIT, Stanford, Oxford)
- **Year**: 2025
- **What it proposes**: A user-centric approach to representing and sharing personal preferences across AI systems. Treats preferences as a portable, user-governed layer. Uses a dedicated intermediary (HCP LLM) that interprets user preferences and enforces scoped, minimal disclosure to downstream models.
- **Key difference from our approach**: HCP uses an intermediary LLM to interpret preferences. ContextMe would give the user direct control over raw context data.
- **Links**: [PDF](https://miba.dev/assets/publications/HCP_ArXiv_2025.pdf) | [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5403981) | [Website](https://hcp.me/) | [Stanford Digital Economy Lab](https://digitaleconomy.stanford.edu/project/loyal-agents/hcp-human-context-protocol/)

### 2.2 Other Relevant Papers

| Paper | Year | Key Insight |
|-------|------|-------------|
| **PortLLM** ([arXiv](https://arxiv.org/abs/2410.10870)) | 2024 | Lightweight portable patches for LLM personalization across model versions |
| **MemOS** ([arXiv](https://arxiv.org/abs/2507.03724)) | 2025 | "MemCube" abstraction — portable memory units with metadata, provenance, versioning |
| **Memory in the Age of AI Agents** ([arXiv](https://arxiv.org/abs/2512.13564)) | 2025 | Survey by 47 authors. Explicitly states: *"there are no standard protocols for transferring memory between agents"* — confirms the gap |
| **AI Agents with DIDs and VCs** ([arXiv](https://arxiv.org/abs/2511.02841)) | 2025 | Using Decentralized Identifiers + Verifiable Credentials for AI agent identity |
| **Enabling Personalized Long-term Interactions** ([arXiv](https://arxiv.org/abs/2510.07925)) | 2025 | User-specific long-term memory via embeddings + MCP |
| **User Profile with LLMs** ([arXiv](https://arxiv.org/html/2502.10660v1)) | 2025 | Methodology for static construction and dynamic updating of user profiles |
| **Towards a Unified User Modeling Language** ([arXiv](https://arxiv.org/html/2505.24697v1)) | 2025 | Standardized language for human-centered AI user modeling |
| **Agent Interoperability Protocols Survey** ([arXiv](https://arxiv.org/abs/2505.02279)) | 2025 | Comparative analysis of MCP, ACP, A2A, ANP |

### 2.3 Key Research Collaborations

**Loyal Agents (Stanford Digital Economy Lab + Consumer Reports)**
- Joint research making agentic AI "loyal by design"
- Developed the HCP paper
- Running workshops, producing research and prototypes
- [Stanford page](https://digitaleconomy.stanford.edu/project/loyal-agents/) | [Website](https://loyalagents.org/)

---

## 3. Direct Competitors

### 3.1 Plurality Network — Open Context Layer (OCL)

**Closest existing product to our vision.**

- **What**: Decentralized, user-owned, privacy-preserving system for managing and sharing contexts across AI agents. "One memory layer that works across ChatGPT, Claude, Gemini."
- **Tech**: Encryption, multi-party compute (MPC), decentralized storage, smart contracts. "Smart Profiles" built on Oasis Sapphire blockchain.
- **Differentiator from us**: Blockchain/crypto-native approach. We would take a standards-based, developer-friendly approach.
- **Links**: [Website](https://plurality.network/) | [Docs](https://docs.plurality.network) | [Portable AI Context article](https://plurality.network/blogs/importance-of-portable-ai-context/)

### 3.2 Vanar Neutron / MyNeutron

- **What**: Blockchain-based personal AI memory system. "Neutron Seeds" are compressed, verifiable knowledge capsules stored on-chain.
- **Launched**: August 2025 (Neutron Personal), October 2025 (MyNeutron)
- **Tech**: 500x compression, on-chain storage. Browser extension for capturing context from ChatGPT, Claude, Gemini.
- **Differentiator from us**: Fully blockchain-based. Complex for mainstream users.
- **Links**: [Website](https://vanarchain.com/vanar-neutron)

### 3.3 Context Pack

- **What**: AI memory migration platform. Creates portable "Context Packs" from ChatGPT, Claude, and Gemini conversations.
- **Approach**: Zero lock-in, plain-text file, no API calls needed.
- **Differentiator from us**: Simple migration tool, not a protocol or platform.
- **Links**: [Website](https://www.context-pack.com/)

### 3.4 Second Me

- **What**: Open-source AI identity system. Trains a personal AI self using your data. Local-first. Three-layer hierarchical memory.
- **License**: Apache 2.0
- **Differentiator from us**: Focused on creating an AI "clone" of you, not on portable context.
- **Links**: [Website](https://www.secondme.io/)

### 3.5 Allie K. Miller's AI Context Vault

- **What**: Template-based approach — 8 copy-paste prompts to build context documents. Chrome extension that auto-injects context into 40+ AI interfaces.
- **Differentiator from us**: Manual/template, not automated or protocol-based. But notable for its influence.
- **Links**: [Website](https://www.alliekmiller.com/ai-context-vault) | [Chrome Extension](https://chromewebstore.google.com/detail/ai-context-vault/cickbnbhiiidcajkpglcepnodkkempmi)

### 3.6 context-use (by onfabric / DTI ecosystem)

- **What**: Open-source tool converting user archives (ChatGPT exports, Instagram exports) into searchable, portable AI memories stored locally in SQLite.
- **Links**: [GitHub](https://github.com/onfabric/context-use) | [Website](https://context-use.com/)

### Competitor Matrix

| Product | Approach | Privacy Model | Protocol/Standard | Open Source | Maturity |
|---------|----------|---------------|-------------------|-------------|----------|
| **Plurality Network** | Blockchain/MPC | Decentralized, crypto | Proprietary | Partial | Active |
| **Vanar Neutron** | Blockchain | On-chain | Proprietary | No | Active |
| **Context Pack** | File export | Local files | None | No | Active |
| **Second Me** | Local AI clone | Local-first | None | Yes (Apache 2.0) | Active |
| **AI Context Vault** | Templates | Manual copy-paste | None | Extension only | Active |
| **context-use** | Archive converter | Local SQLite | DTI-aligned | Yes | Early |
| **ContextMe (ours)** | Protocol-first | Granular consent (Apple model) | Open standard | TBD | Concept |

---

## 4. Adjacent Companies (Memory Infrastructure)

These companies build AI memory layers but are **not primarily focused on portability**. They could become competitors, partners, or acquisition targets.

| Company | Funding | Key Metric | Focus |
|---------|---------|------------|-------|
| **Mem0** | $24M (Series A) | 41K+ GitHub stars, 186M API calls/quarter | Universal memory layer. Founder uses "memory passport" phrase. |
| **Letta** (ex-MemGPT) | $10M (Seed) | UC Berkeley origin | Stateful agents with persistent memory |
| **Supermemory** | $3M (Seed) | 10K+ GitHub stars, 50K+ users | Memory engine with relationship mapping |
| **Interloom** | EUR14.2M (Seed) | Munich-based | Enterprise AI knowledge capture |
| **Papr AI** | Unknown | #1 Stanford STaRK benchmark | Predictive memory layer |

**Notable investors appearing repeatedly**: Jeff Dean (Google), Clem Delangue (HuggingFace), YC, Felicis, Basis Set Ventures.

---

## 5. Major Platform Moves

### 5.1 Anthropic Claude — Memory Import (March 2, 2026)

Claude now allows **importing memories from ChatGPT, Gemini, Copilot, and Grok**. Two-step process: extract from old provider, paste into Claude. Available at [claude.com/import-memory](https://claude.com/import-memory).

- Memories are encrypted, not used for training, and exportable
- **Significance**: Validates the market need. But it's one-directional (import only) and locked to Claude's ecosystem.
- **Links**: [MacRumors](https://www.macrumors.com/2026/03/02/anthropic-memory-import-tool/) | [Fast Company](https://www.fastcompany.com/91501002/anthropic-claude-app-import-chats-from-open-ai-chatgpt-gemini-copilot-memory-tool)

### 5.2 OpenAI ChatGPT — Export & Memory

- Data export available (Settings > Export Data) but it's a raw dump, not structured/portable
- Memory launched 2024, expanded 2025-2026. Now references all past conversations
- Full search added in 2026 using internal "PersonalContextAgentTool"
- **Memory is NOT exportable** in a structured, portable format
- **Links**: [OpenAI Help](https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data)

### 5.3 MCP — Model Context Protocol (Now Linux Foundation)

- Introduced by Anthropic (Nov 2024), adopted by OpenAI (March 2025), donated to Linux Foundation (Dec 2025)
- Standardizes AI ↔ tools/data connections. Does **NOT** directly solve personal context portability
- **But**: provides the infrastructure plumbing a portability solution would build on
- **Links**: [Spec](https://modelcontextprotocol.io/specification/2025-11-25) | [Wikipedia](https://en.wikipedia.org/wiki/Model_Context_Protocol) | [GitHub](https://github.com/modelcontextprotocol)

---

## 6. Standards and Protocols

### 6.1 Active Standardization Efforts

| Standard | Body | Status | Relevance |
|----------|------|--------|-----------|
| **Agent Context Protocol** | IETF (draft-liu) | Individual draft, expires Jan 2026 | Defines context exchange format for AI agents |
| **Framework for AI Agent Protocols** | IETF (draft-rosenberg) | Individual draft | Taxonomy of existing agent protocols |
| **Agent Transfer Protocol (ATP)** | IETF (draft-li) | Individual draft | Secure agent-to-agent communication |
| **AI Agent Protocol** | W3C Community Group | Working drafts | Open protocols for agent discovery/collaboration |
| **Agent Network Protocol (ANP)** | Open source + W3C CG | Active development | 3-layer protocol using DIDs + JSON-LD |
| **Verifiable Credentials 2.0** | W3C | Recommendation (May 2025) | Portable, privacy-preserving proofs of identity |
| **MCP** | Linux Foundation (AAIF) | Stable specification | AI ↔ tools/data connection standard |

### 6.2 Key Organizations

| Organization | Role | Links |
|-------------|------|-------|
| **Data Transfer Initiative (DTI)** | Leading policy + practical work on AI portability. Members: Google, Apple, Meta, Microsoft, Inflection. | [Website](https://dtinit.org) |
| **DIF (Decentralized Identity Foundation)** | AI agent identity via DIDs/VCs | [Website](https://identity.foundation) |
| **Solid Project (Tim Berners-Lee)** | Personal data pods with user-controlled access | [Website](https://solidproject.org) |
| **W3C AI Agent Protocol CG** | Open agent interoperability protocols | [W3C page](https://www.w3.org/community/agentprotocol/) |

---

## 7. Open Source Landscape

### 7.1 Portable AI Context Projects

| Project | Description | Links |
|---------|-------------|-------|
| **open-context** | Import/export chat history across AI platforms. MCP server included. | [GitHub](https://github.com/aviskaar/open-context) |
| **opencontext** | Save context, import/export across platforms. Docker + MCP. | [GitHub](https://github.com/adityak74/opencontext) |
| **context-use** | DTI-affiliated. Converts exports into local AI memories. | [GitHub](https://github.com/onfabric/context-use) |
| **MemCP** | "Portable Agent Memory. Remember everything. Everywhere." MCP-based. | [GitHub](https://github.com/ardaaltinors/MemCP) |
| **AI Context Kit** | Structured instruction templates for portable AI collaboration. | [GitHub](https://github.com/MSiccDev/ai-context-kit) |

### 7.2 MCP Memory Servers

| Project | Description | Links |
|---------|-------------|-------|
| **mcp-memory (Puliczek)** | User preferences/behaviors across conversations | [GitHub](https://github.com/Puliczek/mcp-memory) |
| **Knowledge Graph Memory** | Official MCP knowledge graph memory server | [GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) |
| **mcp-memory-service** | Persistent memory + knowledge graph + REST API | [GitHub](https://github.com/doobidoo/mcp-memory-service) |
| **OpenMemory** | Local persistent memory with MCP endpoint | [GitHub](https://github.com/CaviraOSS/OpenMemory) |

### 7.3 Curated Lists

- [awesome-ai-memory (IAAR-Shanghai)](https://github.com/IAAR-Shanghai/Awesome-AI-Memory)
- [awesome-ai-memory (topoteretes)](https://github.com/topoteretes/awesome-ai-memory)
- [Awesome-Memory-for-Agents (TsinghuaC3I)](https://github.com/TsinghuaC3I/Awesome-Memory-for-Agents)
- [Agent-Memory-Paper-List](https://github.com/Shichun-Liu/Agent-Memory-Paper-List)

---

## 8. Regulatory Tailwinds

### 8.1 EU Digital Markets Act (DMA)

- ChatGPT expected to be classified as "Virtual Assistant" in the DMA review (**report due May 3, 2026**)
- This would trigger **Article 6(9) and 6(10)** data portability obligations
- Would require ChatGPT to implement a data portability API for conversation histories
- **Impact**: Massive regulatory push for exactly what we're building
- [TechPolicy.Press analysis](https://www.techpolicy.press/can-the-digital-markets-act-free-users-data-in-the-ai-age/)

### 8.2 EU Data Act (effective September 2025)

- Requires cloud/data processing providers to support customer switching and data portability
- Explicitly **prohibits vendor lock-in**
- Switching cost restrictions after January 2027
- [Analysis](https://www.goodwinlaw.com/en/insights/publications/2025/10/alerts-technology-dpc-navigating-the-eu-data-act-key-obligations)

### 8.3 EU AI Act (fully applicable August 2, 2026)

- Supplements GDPR with AI-specific requirements
- Does not directly mandate AI context portability, but creates transparency and user rights obligations
- Combined with DMA, creates a strong framework favoring portability

### Regulatory Timeline

```
2025 Sep ── EU Data Act effective
2026 Mar ── Claude memory import launched (industry validation)
2026 May ── DMA review report (ChatGPT classification decision)
2026 Aug ── EU AI Act fully applicable
2027 Jan ── EU Data Act switching cost restrictions
```

---

## 9. Venture Capital Landscape

### 9.1 Funded Companies

| Company | Funding | Focus | Portability Focus? |
|---------|---------|-------|--------------------|
| Mem0 | $24M | Universal memory layer | Partial (moving toward it) |
| Letta | $10M | Stateful agents | No |
| Supermemory | $3M | Memory engine | No |
| Interloom | EUR14.2M | Enterprise knowledge | No |

### 9.2 The Funding Gap

**No company has raised significant funding primarily to solve AI context portability/ownership.** The companies above build memory infrastructure, with some (Mem0) starting to frame around portability.

- AI startups attracted **61% ($258.7B)** of all VC investment in 2025
- Seed AI startups receive ~42% higher valuations than non-AI peers
- The "AI memory" space is growing fast but remains fragmented
- **A dedicated, protocol-first portability company would be novel in the VC landscape**

---

## 10. Gap Analysis — What Does NOT Exist

| Gap | Status | Opportunity |
|-----|--------|-------------|
| **Universal standard format for AI user context** | HCP proposes one (not adopted). No RFC or W3C Recommendation. | Define and champion the standard |
| **True portable AI identity service with mainstream adoption** | Plurality Network is closest but niche/blockchain | Build mainstream, developer-friendly alternative |
| **Bidirectional context transfer between providers** | Claude import is one-directional. ChatGPT export is raw dumps. | Build the bridge protocol |
| **IETF RFC for personal AI context exchange** | Early-stage drafts only, focused on agent-to-agent | Contribute to or create the user-to-service spec |
| **Privacy-first consent layer (Apple model)** | No one has built the "App Tracking Transparency for AI context" | Core differentiator for ContextMe |
| **DMA-mandated API for AI portability** | Expected after May 2026 review, not in force yet | Be ready when regulation hits |
| **"Context passport" standard** | Mem0 founder uses the phrase, but no actual spec exists | Define it |

---

## 11. Strategic Positioning

### Where We Fit

```
                    Protocol/Standard Focus
                           ▲
                           │
                    HCP ●  │  ● ContextMe (us)
                           │
           Blockchain ─────┼───── Developer-Friendly
                           │
         Plurality ●       │       ● Mem0
         Vanar ●           │       ● Letta
                           │
                           ▼
                    Product/Tool Focus
```

### Our Potential Differentiators

1. **Privacy-first consent model** (Apple-inspired, granular scopes) — nobody does this well
2. **Protocol-first approach** — build the standard, not just a product
3. **Developer-friendly** (not blockchain/crypto-native) — lower barrier to entry
4. **Local-first** — data lives on user's device by default
5. **Built on existing standards** (JSON-LD, OAuth, DIDs, MCP) — not reinventing wheels
6. **Open source** — community-driven adoption
7. **Timing** — aligned with EU regulatory wave (DMA, Data Act, AI Act)

### Potential Allies

- **Apple**: Privacy-first philosophy, existing infrastructure (Keychain, HealthKit, ATT)
- **DTI (Data Transfer Initiative)**: Already doing the policy work, members include Apple/Google/Meta/Microsoft
- **Anthropic**: MCP is the natural integration layer, Claude memory import shows openness
- **Solid Project**: Philosophical alignment, potential data pod integration
- **Consumer Reports**: Co-developing HCP, consumer advocacy angle
- **EU regulators**: Our solution directly enables compliance with DMA/Data Act

### Potential Threats

- **AI providers build it themselves** — Claude's import feature is a step. If providers agree on a standard, they might not need us.
- **HCP gains adoption** — Stanford/Consumer Reports backing is strong. We could be complementary or competing.
- **Blockchain solutions gain mainstream traction** — if Plurality or Vanar crack mainstream UX.
- **Regulation mandates a specific format** — we need to be the format, or be compatible.

---

## 12. Sources

### Academic Papers
- [HCP Paper (PDF)](https://miba.dev/assets/publications/HCP_ArXiv_2025.pdf)
- [HCP on SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5403981)
- [PortLLM (arXiv 2410.10870)](https://arxiv.org/abs/2410.10870)
- [MemOS (arXiv 2507.03724)](https://arxiv.org/abs/2507.03724)
- [Memory in the Age of AI Agents (arXiv 2512.13564)](https://arxiv.org/abs/2512.13564)
- [AI Agents with DIDs and VCs (arXiv 2511.02841)](https://arxiv.org/abs/2511.02841)
- [User Profile with LLMs (arXiv 2502.10660)](https://arxiv.org/html/2502.10660v1)
- [Agent Interoperability Protocols Survey (arXiv 2505.02279)](https://arxiv.org/abs/2505.02279)

### Products & Companies
- [Plurality Network](https://plurality.network/)
- [Vanar Neutron](https://vanarchain.com/vanar-neutron)
- [Context Pack](https://www.context-pack.com/)
- [Second Me](https://www.secondme.io/)
- [Allie K. Miller AI Context Vault](https://www.alliekmiller.com/ai-context-vault)
- [Mem0](https://mem0.ai/) | [TechCrunch](https://techcrunch.com/2025/10/28/mem0-raises-24m-from-yc-peak-xv-and-basis-set-to-build-the-memory-layer-for-ai-apps/)
- [Letta](https://www.letta.com/)
- [Supermemory](https://github.com/supermemoryai/supermemory) | [TechCrunch](https://techcrunch.com/2025/10/06/a-19-year-old-nabs-backing-from-google-execs-for-his-ai-memory-startup-supermemory/)

### Standards & Organizations
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [IETF Agent Context Protocol](https://datatracker.ietf.org/doc/draft-liu-agent-context-protocol/)
- [W3C AI Agent Protocol CG](https://www.w3.org/community/agentprotocol/)
- [W3C Verifiable Credentials 2.0](https://www.w3.org/press-releases/2025/verifiable-credentials-2-0/)
- [DTI Blog Series on AI Portability](https://dtinit.org/blog/)
- [Stanford Loyal Agents / HCP](https://digitaleconomy.stanford.edu/project/loyal-agents/)
- [Solid Project](https://solidproject.org/)

### Regulatory
- [TechPolicy.Press: DMA and AI data](https://www.techpolicy.press/can-the-digital-markets-act-free-users-data-in-the-ai-age/)
- [EU Data Act analysis](https://www.goodwinlaw.com/en/insights/publications/2025/10/alerts-technology-dpc-navigating-the-eu-data-act-key-obligations)

### Industry Analysis
- [DTI: A turning point for AI portability (March 2026)](https://dtinit.org/blog/2026/03/10/turning-point-AI-portability)
- [Piet van den Boer: Case for portable AI context (Jan 2026)](https://pvandenboer.substack.com/p/the-case-for-portable-ai-context)
- [New America OTI: AI Agents and Memory (Nov 2025)](https://www.newamerica.org/oti/briefs/ai-agents-and-memory/)

### Open Source
- [open-context](https://github.com/aviskaar/open-context)
- [opencontext](https://github.com/adityak74/opencontext)
- [context-use](https://github.com/onfabric/context-use)
- [MemCP](https://github.com/ardaaltinors/MemCP)
- [AI Context Kit](https://github.com/MSiccDev/ai-context-kit)

---

*Document generated: 2026-03-25*
*Project: ContextMe*
