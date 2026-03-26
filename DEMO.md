# AIME — Consent Filtering Demo

> Protecting fundamental rights in the age of AI, one facet at a time.

This walkthrough demonstrates how AIME enforces granular consent over personal data shared with AI providers. The scenarios map directly to GDPR Article 9 special categories: health, political opinions, sexual orientation, religious beliefs, and trade union membership.

## Setup

```bash
pnpm build
aime seed --reset
```

This creates the profile of **Elena Martínez**, a fictitious senior engineer. Her vault contains 36 facets across 11 categories, protected by 5 constitutional rules and 6 consent policies.

## The User's Privacy Constitution

Elena has defined five non-negotiable rules that no AI provider can override:

| Rule | Category | Effect |
|------|----------|--------|
| Never share my political views | `political` | No AI ever sees her voting history or political leaning |
| Never share my financial data | `financial` | Salary, investments — invisible to all providers |
| Never share my sexual orientation | `identity` | Bisexuality, gender identity — absolute protection |
| Never share my religious beliefs | `religious` | Spiritual exploration — completely private |
| Never share my union membership | `labor` | Union activity — hidden from all providers |

These are **constitutional rules** — they override every consent policy, every provider agreement, everything. They represent the user's non-negotiable boundaries.

---

## Scenario 1: The Health AI vs. The General Assistant

Elena uses a specialised health AI and also ChatGPT for general questions. She trusts the health AI with her medical data but explicitly blocks ChatGPT from seeing it.

### What the health assistant sees

```bash
aime check health-assistant
```

```
Provider: health-assistant
Total facets: 36 | Visible: 24 | Blocked: 12

VISIBLE:
  health: allergies, dietary, chronic_condition, blood_type
  professional: current_role, industry, years_experience, skills, current_projects
  communication: preferred_language, additional_languages, style, tone, response_format
  ...

BLOCKED:
  health: mental_health
  identity: sexual_orientation, gender_identity, pronouns
  political: leaning, voting_history
  financial: salary_range, investment_style
  religious: beliefs, practices
  labor: union_membership, union_role
```

The health AI knows Elena is **allergic to peanuts and penicillin**, is **vegetarian**, has **Type 2 diabetes managed with metformin**, and her blood type is **A+**. It can warn her about drug interactions and dietary risks.

But it does NOT know about her mental health (hidden at facet level) or any Article 9 constitutional categories.

### What ChatGPT sees

```bash
aime check chatgpt
```

```
Provider: chatgpt
Total facets: 36 | Visible: 20 | Blocked: 16

VISIBLE:
  professional: current_role, industry, years_experience, skills, current_projects
  communication: preferred_language, additional_languages, style, tone, response_format
  ...

BLOCKED:
  health: allergies, dietary, chronic_condition, mental_health, blood_type
  identity: sexual_orientation, gender_identity, pronouns
  political: leaning, voting_history
  ...
```

ChatGPT sees **zero health data**. Elena's peanut allergy, her diabetes, her diet — all invisible. If she asks ChatGPT "Can I eat this peanut butter brand?", ChatGPT has no idea she's allergic. That's exactly what Elena wants: she discusses food with ChatGPT for recipes, not medical advice.

**The same question, two different AIs, two different levels of trust.**

---

## Scenario 2: "Who Does Elena Vote For?"

Elena's political views are protected by constitutional rule `const-001`:

> "Never share my political views with any AI, ever."

```bash
aime check chatgpt      # political: BLOCKED
aime check claude        # political: BLOCKED
aime check career-coach  # political: BLOCKED
```

**Every provider gets the same answer: nothing.** There is no policy, no override, no API call that can extract Elena's political leaning. The data exists in her encrypted vault, but the consent layer makes it invisible to every AI. Period.

An AI cannot profile Elena politically. It cannot nudge her towards content. It cannot be subpoenaed for her political opinions because it never had them.

This is Article 9 protection, enforced at the technical level.

---

## Scenario 3: The Career Coach

Elena uses an AI career coach to help with job interviews and skill development. She grants it access to her professional context:

```bash
aime check career-coach
```

```
Provider: career-coach
Total facets: 36 | Visible: 24 | Blocked: 12

VISIBLE:
  professional: current_role, industry, years_experience, skills, current_projects
  communication: preferred_language, additional_languages, style, tone, response_format
  behavioral: question_style, decision_making, learning_style
```

The career coach knows Elena is a Senior Software Engineer with 12 years of experience, expert in TypeScript, learning Rust, working on microservices migration. It knows she prefers concise, data-driven communication. It can prepare her for interviews and suggest career moves.

But it has **no idea** about her health, her union activity, her political views, her religion, her sexual orientation, or her salary. A recruiter AI cannot discriminate based on data it never receives.

---

## Scenario 4: The Invisible Walls

Some categories are protected at **multiple levels simultaneously**:

**Elena's mental health** (`health/mental_health`):
- Facet-level `accessLevel: "hidden"` — hidden even from providers with health access
- The health assistant sees allergies and diabetes, but NOT her anxiety treatment

**Elena's union role** (`labor/union_role`):
- Facet-level `accessLevel: "hidden"`
- Constitutional rule `const-005` blocks the entire `labor` category
- No provider, no matter how trusted, can see she's a union delegate

**Elena's salary** (`financial/salary_range`):
- Facet-level `accessLevel: "hidden"`
- Constitutional rule `const-002` blocks all financial data
- The career coach cannot see her salary to "help negotiate" — preventing anchoring bias

---

## Why This Matters

Every day, hundreds of millions of Europeans share deeply personal information with AI systems. Today, that data is:

- **Fragmented** across providers who each build their own profile
- **Non-portable** — switching AI means starting over
- **Uncontrollable** — users cannot see, limit, or erase what's stored
- **Unencrypted** at the provider's discretion

AIME inverts this model:

- **One vault**, owned by you, encrypted on your device
- **One set of rules**, defined by you, enforced automatically
- **Any AI** can connect via MCP — but only sees what you allow
- **Deletion is absolute** — erase the vault, erase the data. Cryptographic certainty.

The EU has the legal framework (GDPR, AI Act, Data Act). AIME provides the technical infrastructure to enforce it at the individual level.

---

## Running the Full Demo

```bash
# 1. Build and seed
pnpm build
aime seed --reset

# 2. See Elena's full profile (the owner sees everything)
aime facets

# 3. Check consent filtering per provider
aime check health-assistant    # Sees health data (trusted)
aime check chatgpt             # Health blocked (explicit deny)
aime check career-coach        # Professional only
aime check claude              # Professional only
aime check random-ai           # Minimal access

# 4. Verify constitutional blocks (same for ALL providers)
aime check health-assistant | grep -A20 BLOCKED
aime check chatgpt | grep -A20 BLOCKED
# → political, financial, identity, religious, labor always blocked
```
