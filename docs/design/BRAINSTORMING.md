# ContextMe — Design Brainstorming

> A system for creating and managing a portable "AI context digital fingerprint" for humans, enabling any AI to load a person's context and provide tailored responses regardless of provider.

**Core principle:** The context belongs to the human, not to the AI provider.

## Table of Contents

1. [The Problem](#1-the-problem)
2. [What IS Human AI Context?](#2-what-is-human-ai-context)
3. [Architecture: Local Vault + Standard Protocol](#3-architecture-local-vault--standard-protocol)
4. [The Consent Model (The Apple Piece)](#4-the-consent-model-the-apple-piece)
5. [The Standard/Protocol](#5-the-standardprotocol)
6. [Context Creation and Evolution](#6-context-creation-and-evolution)
7. [Multi-Persona Support](#7-multi-persona-support)
8. [Apple Ecosystem Integration](#8-apple-ecosystem-integration)
9. [MVP vs Full Vision](#9-mvp-vs-full-vision)
10. [Risks and Challenges](#10-risks-and-challenges)

---

## 1. The Problem

Today, when you use ChatGPT, it learns about you. When you switch to Claude, you start from zero. When you use Gemini, zero again. Your "AI context" is locked in each provider's silo.

This is analogous to the early days of email — locked to one provider, no portability. Or phone numbers before number portability laws.

**ContextMe flips this model:** the human owns their AI context, stores it locally, and selectively shares it with any AI they choose.

---

## 2. What IS Human AI Context?

It is not a monolithic blob. It is a **set of facets**, each with different sensitivity levels and change velocity.

### Static / Slow-Changing Attributes
- **Physical**: height, weight, clothing sizes, shoe size
- **Demographic**: age, location, languages spoken
- **Professional**: role, skills (with proficiency level per domain), industry, years of experience
- **Communication style**: formal/informal, verbose/concise, preferred language, tone

### Dynamic / Fast-Changing Attributes
- Current projects and goals
- Active research interests
- Recent decisions and their rationale
- Situational context (traveling, at home, at work)

### Behavioral Patterns
- How the user asks questions (direct? exploratory?)
- Preferred response format (bullets, narrative, code-first)
- Decision-making style (data-driven? intuition-based?)
- Common workflows and tools used

### Values and Preferences (High Sensitivity)
- Ethical positions
- Political leanings
- Religious/spiritual beliefs
- Cultural context
- Aesthetic preferences
- Dietary preferences, allergies

---

## 3. Architecture: Local Vault + Standard Protocol

```
┌──────────────────────────────────────────┐
│            User Device                    │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │   Context    │  │     Consent      │  │
│  │    Vault     │◄►│     Manager      │  │
│  │  (encrypted, │  │  (policies,      │  │
│  │   local)     │  │   scopes,        │  │
│  │              │  │   constitution)  │  │
│  └──────┬───────┘  └──────┬───────────┘  │
│         │                 │              │
│  ┌──────▼─────────────────▼───────────┐  │
│  │          Context Broker            │  │
│  │   (serves authorized facets only)  │  │
│  └──────┬────────────┬────────────────┘  │
│         │            │                   │
│  ┌──────▼──────┐     │                   │
│  │  Audit Log  │     │                   │
│  └─────────────┘     │                   │
└──────────────────────┼───────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  Claude  │ │  ChatGPT │ │  Gemini  │
    └──────────┘ └──────────┘ └──────────┘
```

### Components

- **Context Vault**: Encrypted local storage for all context facets. The single source of truth.
- **Consent Manager**: Enforces access policies. Decides what gets shared, with whom, at what level.
- **Context Broker**: The API layer. Serves only authorized facets to requesting AI providers via a standard protocol.
- **Audit Log**: Records every access — what was shared, with whom, when. Fully reviewable by the user.

---

## 4. The Consent Model (The Apple Piece)

Inspired by Apple's privacy model (App Tracking Transparency, per-app permissions). The user decides what each AI sees.

### Scopes (OAuth-like)

```
contextme://physical/sizes          → pants: 42, shoes: 44, height: 178cm
contextme://professional/role       → Senior DevOps Engineer
contextme://professional/skills     → Go (expert), React (beginner)
contextme://communication/style     → concise, technical, Spanish preferred
contextme://health/allergies        → peanuts, penicillin
contextme://political/leaning       → [BLOCKED]
```

### Access Levels Per Facet

| Level | Description | Example |
|-------|-------------|---------|
| **Full** | AI sees the actual data | "User is 178cm tall" |
| **Summary** | AI sees a summary only | "User has food allergies" |
| **Existence-only** | AI knows the facet exists but cannot read it | "User has political preferences configured" |
| **Hidden** | AI does not even know the facet exists | (invisible) |
| **Denied** | AI asked, user said no | Explicit rejection logged |

### Time-Based Access

- **Per-session**: ephemeral, gone when conversation ends
- **Persistent**: until explicitly revoked
- **Time-limited**: access for 24h, 7 days, etc.

### User Constitution

Meta-rules that override everything:

- "Never share my political views with any AI, ever"
- "Always share my language preferences"
- "Share professional skills only with work-related AI services"
- "If any AI asks about my health, notify me before sharing"

The constitution acts as a **firewall** for the user's most sensitive boundaries.

---

## 5. The Standard/Protocol

If the protocol is good enough, the ecosystem builds itself (like OAuth did).

### The Spec Would Define

1. **Context Schema** — How facets are structured (JSON-LD with a defined vocabulary)
2. **Discovery** — How an AI discovers that a user has a ContextMe profile
3. **Request/Grant** — How access is negotiated (OAuth-like flow)
4. **Transport** — How context data flows (REST API, MCP, or both)
5. **Feedback** — How the AI returns new learnings for user approval

### Built on Existing Standards

| Standard | Role in ContextMe |
|----------|------------------|
| **JSON-LD** | Data model for context facets |
| **OAuth 2.0 / OIDC** | Consent flow |
| **DIDs (Decentralized Identifiers)** | User identity without central authority |
| **MCP (Model Context Protocol)** | Native Claude integration |
| **JSON Schema** | Facet validation |
| **Verifiable Credentials (W3C)** | Portable, privacy-preserving claims |

### Example Context Document

```json
{
  "@context": "https://contextme.org/schema/v1",
  "@type": "HumanContext",
  "id": "did:contextme:user123",
  "version": "2026-03-25T10:00:00Z",
  "facets": {
    "physical": {
      "height_cm": 178,
      "shoe_size_eu": 44,
      "pants_size_eu": 42,
      "_meta": {
        "updated": "2026-03-01",
        "confidence": "self-reported",
        "access_level": "full"
      }
    },
    "professional": {
      "current_role": "Senior DevOps Engineer",
      "skills": [
        { "name": "Go", "level": "expert", "years": 10 },
        { "name": "React", "level": "beginner", "years": 0.5 }
      ],
      "_meta": {
        "updated": "2026-03-20",
        "source": "self-curated"
      }
    },
    "communication": {
      "preferred_language": "es",
      "additional_languages": ["en", "fr"],
      "style": "concise",
      "tone": "technical",
      "response_format": "bullet-points",
      "_meta": {
        "updated": "2026-03-15",
        "source": "conversation-mining"
      }
    }
  }
}
```

---

## 6. Context Creation and Evolution

Context cannot be a one-time manual creation. It must evolve.

### Sources

1. **Manual curation** — User explicitly fills in facets via UI/CLI
2. **Post-conversation mining** — "We learned you prefer X during this session. Save it?" (like browser password saving)
3. **Import from existing services** — Bring data from ChatGPT Memory, Claude Projects, etc.
4. **Federated sources** — Link existing profiles (LinkedIn for professional, Apple Health for health data)
5. **AI-assisted curation** — An AI guides the user through building their context profile

### Git as Underlying Storage

A powerful idea: use **git** as the storage engine for context:

- **Version history** — track every change to every facet
- **Branches for personas** — `main` (full), `professional`, `personal`, `anonymous`
- **Diffs** — see exactly what changed and when
- **Signed commits** — integrity verification
- **Remotes** — encrypted sync across devices

### Context Freshness

- **Staleness detection**: "These facts are 6 months old. Still accurate?"
- **Conflict resolution**: "Two sources disagree on your Python skill level"
- **Rollback**: "I want to undo a recent context update"

---

## 7. Multi-Persona Support

A single human may need multiple context profiles:

| Persona | Use Case | Facets Exposed |
|---------|----------|---------------|
| **Professional** | Work AI interactions | Role, skills, projects, communication style |
| **Personal** | Shopping, personal assistant | Physical sizes, preferences, allergies |
| **Creative** | Writing, art collaboration | Aesthetic preferences, creative style, inspirations |
| **Anonymous** | Minimal context, max privacy | Language preference only |

Like browser profiles or SSH keys — different identities for different contexts.

---

## 8. Apple Ecosystem Integration

Apple already has the building blocks:

| Apple Technology | ContextMe Equivalent |
|-----------------|---------------------|
| **Keychain** | Secure storage for the Context Vault |
| **HealthKit** | Health data with granular consent model |
| **Sign in with Apple** | Privacy-preserving authentication |
| **App Tracking Transparency** | The exact consent UX we need |
| **Secure Enclave** | Hardware-level protection for sensitive facets |

### Vision

When an AI app requests context, iOS/macOS shows a native permission dialog:

> "ChatGPT would like to access your **Professional Skills** and **Communication Preferences**."
>
> [Allow Once] [Allow While Using App] [Don't Allow]

---

## 9. MVP vs Full Vision

### MVP (Buildable Now)

- [ ] JSON Schema definition for human AI context
- [ ] CLI tool that creates/edits context profiles
- [ ] MCP server that serves context to Claude
- [ ] Browser extension that injects context into ChatGPT/Gemini web interfaces
- [ ] Basic consent management (allow/deny per facet)

### Full Vision

- [ ] Decentralized identity + encrypted context vault
- [ ] Industry-standard protocol (adopted by AI providers)
- [ ] Native integration in all major AI platforms
- [ ] Consent management UI (mobile + desktop)
- [ ] Full audit trails with export
- [ ] Context marketplace (templates for specific use cases)
- [ ] AI-assisted curation with learning feedback loop
- [ ] Enterprise version (organizational context for teams)

---

## 10. Risks and Challenges

| Risk | Severity | Mitigation |
|------|----------|------------|
| **AI provider adoption** — incentive to keep context locked in | High | Start with open integrations (MCP, browser extensions). Build demand bottom-up. |
| **Context poisoning** — users manipulating context to exploit AIs | Medium | Validation layers, confidence scores, source tracking |
| **Staleness** — context becomes outdated | Medium | Freshness checks, periodic review prompts |
| **Security breach** — this is a complete profile of a person | Critical | Encryption at rest, local-first, hardware security (Secure Enclave) |
| **Standardization** — getting industry consensus | High | Start with a solid open spec. Build tooling. Let adoption drive standardization. |
| **Complexity** — too many facets becomes unmanageable | Medium | Good defaults, templates, AI-assisted curation |

---

## Key Insight

The most impactful deliverable is the **protocol/standard** itself. If the spec is solid and open, the ecosystem will form around it — just as OAuth, OpenID Connect, and WebAuthn did before it.

Build the spec. Build the reference implementation. Let the community scale it.

---

*Document generated: 2026-03-25*
*Project: ContextMe*
