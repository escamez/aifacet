# NGI Zero Commons Fund — AIME Proposal Draft

> Programme: NGI Zero Commons Fund (12th Open Call)
> Deadline: April 1, 2026 at 12:00 CEST
> Apply at: https://nlnet.nl/propose/
> Status: DRAFT — Review and adapt before submission

---

## Field: Proposal Name

AIME — User-Owned Encrypted AI Context with Portable Privacy

---

## Field: Website / Wiki

https://github.com/[ORGANISATION]/aime

---

## Field: Abstract

AIME is an open-source system that gives individuals sole ownership and cryptographic control over the personal context that AI systems use to personalise their responses. It implements a local encrypted vault (AES-256-GCM with per-operation IV and salt derivation), a structured schema for AI context data, and a server that exposes user-authorised context to AI providers through the Model Context Protocol (MCP). The user decides what to share, with whom, and for how long — AI providers receive only the facets the user explicitly consents to, per session.

Today, every AI provider builds its own proprietary understanding of each user: their health concerns, political views, professional knowledge, personal preferences. This data is fragmented across corporate systems, inaccessible to the individual, and practically non-portable — despite the right to portability of provided and observed data under GDPR Article 20, and the switching rights under the Data Act. AIME eliminates this asymmetry by placing the context in the user's hands — covering not only data squarely within Article 20's scope but also inferred and derived context that current law has yet to fully address, encrypted at rest, portable across any AI, and erasable with certainty.

The project delivers four open-source packages: a formal context schema (@aime/schema), a cryptographic vault (@aime/vault), an MCP integration server (@aime/mcp-server), and a command-line tool for context management (@aime/cli). All outputs are published under the European Union Public Licence v1.2 (EUPL-1.2), with a comprehensive test suite and full documentation.

---

## Field: Previous Involvement

[TO COMPLETE: Include links to prior open-source contributions, relevant professional experience, publications, conference talks, or community involvement. NLnet reviewers verify these links — only include genuine, verifiable contributions.]

---

## Field: Requested Amount

EUR 45,500

---

## Field: Budget Usage Explanation

The grant funds the development and publication of AIME's four core open-source packages, from their current prototype state to production-ready v1.0 releases. The budget covers approximately 700 hours of engineering work at EUR 65/hour, distributed across seven milestones with verifiable deliverables.

No funds are allocated to marketing, commercial activities, or overhead. The entirety of the budget supports direct R&D: protocol design, cryptographic implementation, integration engineering, testing, security review, and documentation.

---

## Field: Budget Breakdown

| Milestone | Description | Hours | Rate | Amount |
|-----------|------------|-------|------|--------|
| **M1** | Context schema formalisation and specification | 80h | EUR 65/h | EUR 5,200 |
| **M2** | Vault security hardening and cryptographic documentation | 120h | EUR 65/h | EUR 7,800 |
| **M3** | MCP server production readiness and multi-provider testing | 140h | EUR 65/h | EUR 9,100 |
| **M4** | CLI tool with import/export in open, documented format | 100h | EUR 65/h | EUR 6,500 |
| **M5** | Granular consent system: per-facet, per-provider, per-session | 120h | EUR 65/h | EUR 7,800 |
| **M6** | Protocol specification, integration guide, contributor docs | 80h | EUR 65/h | EUR 5,200 |
| **M7** | End-to-end integration testing with Claude, ChatGPT, Gemini | 60h | EUR 65/h | EUR 3,900 |
| | **Total** | **700h** | | **EUR 45,500** |

### Milestone Deliverables (Verifiable)

- **M1:** Published @aime/schema package on npm with formal JSON Schema specification, documented data model, and passing test suite (>90% coverage).
- **M2:** Published @aime/vault package with documented cryptographic architecture (AES-256-GCM, Argon2id key derivation, per-write random IV/salt). Includes threat model document and automated security test suite.
- **M3:** Published @aime/mcp-server v1.0 with documented API, integration tests against at least two major AI providers, and performance benchmarks.
- **M4:** Published @aime/cli with documented commands for context creation, export (open JSON format), import, vault management, and provider authorisation.
- **M5:** Consent mechanism allowing users to define sharing rules at the facet level (e.g., share professional context with Provider A, withhold health context from Provider B). Full audit trail of consent decisions. Published as part of @aime/schema and @aime/mcp-server.
- **M6:** Published protocol specification (versioned, human-readable, machine-parseable), integration guide for AI providers, and contributor guide for the open-source community.
- **M7:** Documented end-to-end test results demonstrating context portability across at least three AI providers using MCP. Published test suite and results.

---

## Field: Comparison with Existing Efforts

### AI Provider Memory Systems (ChatGPT Memory, Claude Projects, Gemini Gems)

Every major AI provider has built proprietary memory features. These systems store user context on the provider's servers, under the provider's control, in proprietary formats. Users cannot export their context in a portable format, cannot transfer it to a competing provider, and cannot verify what is stored or how it is used. These systems create vendor lock-in by design: the more a user invests in personalising one AI, the higher the cost of switching.

AIME inverts this model entirely. Context is stored locally, encrypted, under the user's sole control. AI providers receive only what the user explicitly authorises, and only for the duration the user specifies.

### W3C Solid Project (Inrupt)

Solid, led by Sir Tim Berners-Lee, creates decentralised personal data stores (Pods) for general web data. AIME differs in three fundamental respects:

1. **AI-native design.** Solid is a general-purpose data platform. AIME's schema, consent model, and integration protocol are purpose-built for the AI interaction paradigm, where context must be structured for machine consumption, not human browsing.
2. **Encryption by default.** Solid relies on access control (WebACL) for data protection. AIME encrypts all data at rest with AES-256-GCM, ensuring that even if the storage medium is compromised, the data remains unintelligible without the user's key.
3. **Protocol integration.** AIME uses the Model Context Protocol (MCP), which major AI providers already support or are adopting. Solid requires providers to implement a separate data access protocol that has no native AI integration path.

### European Digital Identity Wallet (EUDI Wallet)

The EUDI Wallet, mandated by the revised eIDAS Regulation, provides citizens with verifiable credentials (identity documents, diplomas, licences). It is designed for identity attestation, not for AI personalisation context. AIME addresses a different layer: not "who you are" (identity) but "what an AI should know about you to be useful" (context). The two systems are complementary — AIME could eventually use EUDI Wallet for identity verification — but they solve fundamentally different problems.

### Personal Knowledge Management (Notion AI, Obsidian, Logseq)

These tools help individuals organise their own knowledge but are not designed for AI consumption. They lack structured schemas for AI context, have no consent mechanism for selective sharing, and provide no interoperability protocol for AI providers.

### Key Differentiators

| Capability | AIME | Provider Memory | Solid | EUDI Wallet | PKM Tools |
|------------|------|----------------|-------|-------------|-----------|
| User-owned data | Yes | No | Yes | Yes | Yes |
| Encrypted at rest | AES-256-GCM | Provider-managed | ACL-based | Varies | No |
| AI-native schema | Yes | Proprietary | No | No | No |
| Portable across AI providers | Yes | No | Not designed for AI | Not designed for AI | No |
| Granular consent per AI | Yes | No | Yes (general) | Yes (credentials) | No |
| Open protocol (MCP) | Yes | No | LDP/Solid | eIDAS/EUDI | No |

---

## Field: Technical Challenges

### 1. Cryptographic key management for non-technical users

The vault uses AES-256-GCM with Argon2id key derivation and per-write random IV/salt rotation. The fundamental challenge is making this secure without requiring the user to understand cryptography. Key derivation from a user-chosen passphrase must resist offline brute-force attacks (Argon2id parameters tuned to hardware constraints), while key rotation and vault migration must be possible without data loss. The design must balance security strength against usability — if the system is too complex, users will abandon it or choose weak passphrases.

### 2. Context schema expressiveness vs. interoperability

The context schema must be expressive enough to capture the nuance of human preferences, expertise levels, communication styles, and domain knowledge, while remaining structured enough for diverse AI systems to consume reliably. Overly rigid schemas lose important context; overly flexible schemas become unparseable. The challenge is defining a schema grammar that is both human-meaningful and machine-actionable, with clear extension points for domain-specific facets.

### 3. Consent granularity without cognitive overload

The consent system must allow per-facet, per-provider, per-session control without overwhelming the user with decisions. Research in privacy decision-making (Acquisti, A., Brandimarte, L., & Loewenstein, G. (2015). Privacy and human behavior in the age of information. *Science*, 347(6221), 509-514) demonstrates that excessive granularity leads to consent fatigue and blanket acceptance — the opposite of informed consent. The technical challenge is designing defaults, groupings, and progressive disclosure that respect user autonomy while remaining practically usable.

### 4. MCP integration across divergent provider implementations

The Model Context Protocol is an emerging standard with varying levels of implementation maturity across AI providers. The server must handle differences in authentication mechanisms, context injection formats, session lifecycle management, and error handling across providers that nominally implement the same protocol. Robust abstraction layers and comprehensive integration tests are essential.

### 5. Protecting sensitive data categories under GDPR Article 9

When a user discusses health conditions, political opinions, religious beliefs, sexual orientation, or trade union membership with an AI, the resulting context data falls within the special categories defined by GDPR Article 9. The context schema and consent mechanism must treat these categories with heightened protection: explicit consent per-facet, clear labelling of sensitivity levels, and technical safeguards that prevent inadvertent disclosure. This is not merely a compliance requirement — it is a fundamental design constraint that shapes every layer of the architecture.

---

## Field: Ecosystem Description

### Standards and Protocol Engagement

AIME builds on the Model Context Protocol (MCP), an open specification for AI tool integration supported by Anthropic and adopted by a growing ecosystem of AI providers and tool developers. We will engage actively with the MCP community to contribute the context-sharing patterns AIME implements, propose extensions where the current protocol is insufficient, and ensure upstream compatibility.

Where relevant, we will participate in W3C and IETF discussions on data portability, personal data stores, and AI interoperability standards.

### Open-Source Community

All code is published under the EUPL-1.2 on GitHub. We will maintain active issue trackers, accept community contributions through pull requests, and publish a contributor guide as a project milestone. The schema specification will be published as a versioned, human-readable document inviting community review and extension proposals.

### AI Provider Engagement

We will provide integration guides and reference implementations for AI providers seeking to support user-owned context. The MCP server serves as both a functional tool and a reference implementation that providers can study and adapt.

### User Community

The CLI tool and documentation are designed for both technical and non-technical users. We will build a community channel (Matrix/Discord) for user feedback, feature requests, and support.

---

## Appendix: High-Impact Use Cases — Sensitive Data and Fundamental Rights

This appendix articulates use cases where AIME's privacy architecture is not merely convenient but essential for the protection of fundamental rights.

### A1. Health Data — The Patient Who Consults AI

A citizen managing a chronic condition uses AI to research treatment options, understand medication interactions, and prepare questions for their physician. Over months of interaction, the AI accumulates an intimate health profile: diagnoses, symptoms, medication history, mental health indicators, genetic predispositions.

**Under current practice:** This health data resides on the AI provider's servers, classified as "special category data" under GDPR Article 9. The user has no practical mechanism to port this context to a different AI, erase it selectively, or prevent it from being used for model training. If the provider suffers a data breach, the user's entire medical context is exposed.

**With AIME:** The user's health context remains in their local encrypted vault. When consulting an AI, they share only the relevant health facets — and only for that session. The AI provider never stores the health context persistently. If the user switches from one AI to another, their health context travels with them, encrypted, intact, and under their sole control. Deletion is absolute: erasing the local vault eliminates the data with cryptographic certainty.

**EU regulatory alignment:** GDPR Article 9 requires explicit consent for processing special category data. The European Health Data Space Regulation ((EU) 2025/327) establishes the citizen's right to control their electronic health data. AIME provides the technical mechanism for both.

### A2. Gender Identity and Sexual Orientation — The Citizen Who Explores Privately

An individual exploring their gender identity uses AI for information, emotional support, and community resources. This interaction generates profoundly sensitive data about sexual orientation and gender identity — data that, in many contexts, carries risks of discrimination, social exclusion, or even physical danger.

**Under current practice:** This data is stored by the AI provider with the same protections as a recipe search. The user cannot verify whether their gender identity exploration is separated from their general profile, whether it influences advertising, or whether it is accessible to the provider's employees.

**With AIME:** The user creates a separate, encrypted facet for this deeply personal context. They can share it exclusively with the AI they trust for this purpose, while keeping it entirely invisible to other AI providers they use for professional or general tasks. The facet is labelled as GDPR Article 9 special category data, triggering heightened consent requirements. The user retains absolute control over disclosure.

**EU regulatory alignment:** The EU Charter of Fundamental Rights (Article 21) prohibits discrimination on grounds of sexual orientation. The GDPR's special category protections (Article 9) cover data concerning sex life and sexual orientation. The AI Act's transparency obligations (Article 50) and the GPAI model rules (Articles 53-55) require that users be informed about AI system capabilities and limitations, while deployers of high-risk AI in sensitive contexts must conduct fundamental rights impact assessments (Article 27). AIME provides the architectural layer that makes these protections technically enforceable at the individual level.

### A3. Political Opinions and Civic Engagement — The Citizen Who Thinks Freely

A citizen uses AI to research political positions, draft letters to elected representatives, analyse policy proposals, and explore ideological perspectives. This interaction reveals political opinions — among the most sensitive personal data categories, given the historical use of political profiling for repression.

**Under current practice:** AI providers accumulate a detailed political profile of each user. This profile may influence response framing, content recommendations, or — in adversarial scenarios — be subpoenaed, leaked, or exploited. The user has no visibility into this profiling and no mechanism to compartmentalise their political exploration.

**With AIME:** Political context is stored in a dedicated facet within the user's encrypted vault, tagged as GDPR Article 9 special category data (political opinions). The user controls whether this facet is shared with any AI, and can maintain entirely separate context profiles for different aspects of their civic life. No AI provider accumulates a persistent political profile.

**EU regulatory alignment:** GDPR Article 9 provides heightened protection for data revealing political opinions. The EU Democracy Action Plan emphasises the need to protect citizens from political profiling and manipulation. The Digital Services Act (Article 26) prohibits targeting advertising based on special category data including political opinions. AIME extends these protections to the AI interaction layer.

### A4. Religious and Philosophical Beliefs — The Citizen Who Seeks Guidance

A citizen consults AI about matters of faith, philosophical inquiry, existential questions, or spiritual practice. This interaction may reveal religious affiliation, denominational specifics, doubts, conversions, or departures from faith — all deeply personal and, in certain social contexts, potentially dangerous to disclose.

**With AIME:** Religious and philosophical context is encrypted, faceted, and shared only with the user's explicit, per-session consent. The user can explore different faith traditions across different AI providers without any single provider building a composite religious profile.

**EU regulatory alignment:** GDPR Article 9 protects data revealing religious or philosophical beliefs. The EU Charter of Fundamental Rights (Article 10) guarantees freedom of thought, conscience, and religion.

### A5. Trade Union Membership and Labour Rights — The Worker Who Organises

A worker uses AI to research labour rights, draft collective bargaining proposals, or explore union membership options. In sectors with hostile employer-employee dynamics, exposure of this activity could result in retaliation.

**With AIME:** Labour and trade union context is encrypted and compartmentalised. The user controls disclosure absolutely. No AI provider retains evidence of the user's labour organising activity.

**EU regulatory alignment:** GDPR Article 9 specifically protects data revealing trade union membership. The EU Charter of Fundamental Rights (Article 12) guarantees freedom of association, including trade union rights.

### A6. Children and Minors — The Parent Who Protects

A parent manages their child's educational AI interactions — homework help, language learning, creative exploration. Under current practice, the child's developing profile is stored on corporate servers with limited parental visibility or control.

**With AIME:** The parent maintains the child's AI context in a family vault, controlling exactly what is shared with educational AI tools. When the child reaches the age of digital consent (16 in most EU member states per GDPR Article 8), ownership of the vault transfers to them.

**EU regulatory alignment:** GDPR Article 8 requires parental consent for data processing of children under 16. The EU Strategy for a Better Internet for Kids (BIK+) emphasises the need for age-appropriate digital services with strong parental controls. AIME provides the technical architecture for compliant AI interactions for minors.

---

## Appendix: Post-Grant Sustainability

AIME's sustainability beyond the grant period rests on three pillars:

1. **Open-source community.** By publishing all code under the EUPL-1.2 and actively cultivating contributors through documentation, issue triage, and community channels, AIME builds a self-sustaining development base. The protocol specification, once published, becomes a community asset that outlives any single funding cycle.

2. **Open-core revenue model.** The protocol and local tools remain permanently free and open source. Revenue from premium convenience features (multi-device encrypted sync, cloud backup, enterprise compliance tools) funds ongoing maintenance and development of the commons components. This model is proven by analogous projects (Bitwarden, Grafana, GitLab).

3. **Subsequent funding.** AIME is concurrently pursuing CDTI NEOTEC (up to EUR 325K) for the startup phase and plans to apply to the EIC Accelerator for scaling. These instruments provide a multi-year funding runway while the open-core revenue model matures.

The combination of community contribution, commercial revenue on premium layers, and sequential grant funding ensures that the open-source core is never dependent on a single funding source.

---

### Summary: The Fundamental Rights Alignment

| Use Case | GDPR Article 9 Category | EU Charter Right | AIME Protection |
|----------|------------------------|------------------|-----------------|
| Health data | Health data | Art. 35 (Healthcare) | Encrypted health facet, per-session consent |
| Gender identity | Sexual orientation | Art. 21 (Non-discrimination) | Compartmentalised facet, invisible to other providers |
| Political opinions | Political opinions | Art. 12 (Assembly), Art. 11 (Expression) | Dedicated facet, no persistent political profiling |
| Religious beliefs | Religious/philosophical beliefs | Art. 10 (Thought, conscience, religion) | Encrypted, per-provider consent |
| Trade union membership | Trade union membership | Art. 12 (Freedom of association) | Compartmentalised, no employer-visible activity |
| Children's data | Minors' data (Art. 8) | Art. 24 (Rights of the child) | Parental vault control, age-based ownership transfer |

These are not hypothetical scenarios. They represent the daily reality of hundreds of millions of European citizens who interact with AI systems. The legal protections exist. The technical infrastructure to enforce them does not — until AIME.
