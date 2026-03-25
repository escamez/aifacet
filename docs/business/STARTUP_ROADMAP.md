# ContextMe — Startup Roadmap: From Idea to Business

> Document created: 2026-03-25
> Status: Initial research
> Jurisdiction: Spain / EU

## Table of Contents

1. [The Short Answer](#1-the-short-answer)
2. [Protecting the Idea](#2-protecting-the-idea)
3. [Company Registration in Spain](#3-company-registration-in-spain)
4. [Open Source Licensing Strategy](#4-open-source-licensing-strategy)
5. [Funding Options](#5-funding-options)
6. [Step-by-Step Action Plan](#6-step-by-step-action-plan)
7. [EU-Specific Advantages](#7-eu-specific-advantages)
8. [Key Resources](#8-key-resources)

---

## 1. The Short Answer

**How do you start?** You don't register a company first — you validate, build, and incorporate when you need a legal entity (to receive money, sign contracts, or hire).

**How do you protect the idea?** You don't protect ideas — they can't be patented or copyrighted. You protect **execution**: trademarks for the brand, copyright for the code (automatic), and paradoxically, **publishing openly** (prior art) is stronger protection than secrecy for a protocol.

**How do you pitch without getting robbed?** Share the "what" and "why" freely, hold back the "how" in early conversations, and rely on execution speed. VCs will refuse to sign NDAs — that's normal and expected.

---

## 2. Protecting the Idea

### What CAN Be Protected

| Asset | Protection | Cost | Timeline |
|-------|-----------|------|----------|
| **Brand name "ContextMe"** | EU Trademark (EUIPO) | €850 (1 class) | 5-8 months |
| **Brand name (Spain only)** | Spanish Trademark (OEPM) | €125-170 | 6-8 months |
| **Source code** | Copyright (automatic) | €0 | Instant |
| **Source code (registered)** | Registro de Propiedad Intelectual | ~€10-15 | Weeks |
| **Protocol technical innovations** | EU Patent (if technical character) | €5,000-15,000 | 2-4 years |
| **Protocol technical innovations** | US Provisional Patent | ~$320 | 12 months priority |
| **Business secrets** | Trade secret law (EU Directive 2016/943, Ley 1/2019 Spain) | €0 (but requires measures) | Automatic if protected |

### What CANNOT Be Protected

- The abstract idea of "portable AI context"
- A software protocol "as such" (EU) — only if it has technical character beyond normal software-hardware interaction
- Business methods, algorithms in abstract form

### The Open Source Paradox: Publishing IS Protection

This is counterintuitive but critical:

1. **Publishing the protocol as open source creates prior art** — nobody (including patent trolls) can later patent what you've already published
2. **Git history with signed commits** = timestamped evidence of authorship
3. **If the protocol is public and adopted**, your competitive advantage shifts to community, brand, enterprise features, and support — which are far more defensible than a secret
4. Companies like Mozilla, Red Hat, and Grafana Labs prove this model works

### How Companies Like Us Protect Themselves

| Company | Strategy |
|---------|----------|
| **Mozilla** | Trademark "Firefox." Anyone can fork the code, nobody can use the name. |
| **Canonical** | Trademark "Ubuntu." Forks must rebrand. |
| **Grafana Labs** | AGPL license deters proprietary forks. Enterprise features are proprietary. |
| **HashiCorp** | Switched to BSL 1.1 to prevent cloud providers from competing with their own code. |
| **Elastic** | Created ELv2 after AWS forked Elasticsearch. Prohibits offering as managed service. |

**Our recommended strategy:**
1. **Register the EU trademark immediately** (€850, EUIPO)
2. **Publish the protocol openly** (creates prior art, drives adoption)
3. **Use strategic licensing** (see section 4)
4. **Use CLA** (Contributor License Agreement) from day one

### How to Pitch Safely

**The reality about NDAs:**
- Most VCs and angels **will refuse to sign NDAs** before hearing a pitch
- This is standard worldwide, not a red flag — they see hundreds of similar pitches
- Asking for an NDA signals inexperience

**What to do instead:**

1. **Layer your disclosures**: First meeting = problem, market, vision. Second meeting = architecture, approach. Technical deep-dive = later, possibly under NDA.
2. **Share the "what" and "why" freely**: "We're building a portable AI context protocol with granular privacy controls" — this is not stealable.
3. **Hold back the "how"**: Specific implementation details, proprietary algorithms, secret sauce.
4. **Talk to many investors**: If 20 VCs know about you, none can "steal" it — the ecosystem knows you're the originator.
5. **Build in public**: Blog posts, conference talks, GitHub activity — all establish provenance.
6. **Send follow-up emails** summarizing what was discussed (paper trail).

---

## 3. Company Registration in Spain

### Company Type: SL (Sociedad Limitada)

The standard choice for tech startups in Spain. Equivalent to UK Ltd or US LLC.

| Detail | Value |
|--------|-------|
| **Minimum capital** | €1 (since Ley Crea y Crece, Oct 2022) |
| **Liability** | Limited to share capital |
| **Registration cost** | €300-600 (notary + registry) |
| **With gestoría** | €600-1,200 total |
| **Timeline** | 3-15 business days (faster with standard bylaws online) |
| **Annual obligations** | Corporate tax filing, annual accounts, VAT (if applicable) |

### Important: When to Incorporate

**Do NOT incorporate yet.** Incorporate when you need to:
- Receive money (investment, grants, revenue)
- Hire people
- Sign contracts as a legal entity
- Apply for grants that require a legal entity

**Before that, work as individuals or autónomos.** An SL has ongoing administrative costs and obligations even with zero revenue.

### Registration Process

1. **Name certificate** (Registro Mercantil Central) — confirm name is unique (~€15-20, 1-3 days)
2. **Open bank account** and deposit capital (even €1)
3. **Draft bylaws** — use model statutes for speed
4. **Notary deed** (escritura de constitución) — ~€150-600
5. **Obtain NIF/CIF** (tax ID) — provisional issued immediately
6. **Register at Registro Mercantil** — ~€100-150, 2-15 days
7. **Tax registration** (Agencia Tributaria, modelo 036/037)
8. **Social Security** registration if hiring

**Online via PAE/CIRCE**: https://paeelectronico.es — much of the process can be digital.

### Ley de Startups Benefits (Ley 28/2022)

If certified as "empresa emergente" (through ENISA), you get:

| Benefit | Standard | With Startup Certification |
|---------|----------|---------------------------|
| **Corporate tax** | 25% | **15%** (first 4 years of profit) |
| **Stock options tax exemption** | €12,000/year | **€50,000/year** |
| **Stock options tax event** | At exercise | **Deferred until sale** (up to 10 years) |
| **Tax debt deferral** | No | First 2 years, no interest/guarantees |
| **Founder employment** | Restrictions | Can maintain regular employment while founding |

**Requirements to qualify:**
- Less than 5 years old (7 for biotech)
- Not listed on stock exchange
- Headquarters/majority of workforce in Spain
- Annual turnover under €10M
- "Innovative" character (assessed by ENISA)

**Apply at**: https://www.enisa.es

### Founder Agreements (Pacto de Socios)

**Critical — do this BEFORE incorporating.**

Standard terms:
- **Vesting**: 4-year vesting with 1-year cliff (global standard)
- **Good/bad leaver clauses**: What happens if a founder leaves
- **IP assignment**: All work belongs to the company
- **Non-compete**: Reasonable restrictions
- **Decision-making**: Voting rights, board composition
- **Drag-along / tag-along**: Rights in a sale scenario

**Cost**: €1,000-3,000 for a lawyer to draft properly. Worth every euro.

---

## 4. Open Source Licensing Strategy

### Recommended License Structure

| Component | License | Rationale |
|-----------|---------|-----------|
| **Protocol specification** | Apache 2.0 | Maximum adoption. Patent grant protects us. Enterprise-friendly. |
| **Core implementation** (vault, broker) | AGPL 3.0 | Truly open source but deters proprietary forks. Closes SaaS loophole. |
| **Client libraries / SDKs** | MIT | Minimum friction for integrators |
| **Enterprise features** | Proprietary | Revenue stream |
| **Documentation** | CC BY 4.0 | Open, with attribution |

### Why AGPL for the Core (Not BSL/ELv2)

- AGPL is **OSI-approved** open source — BSL and ELv2 are "source-available" but not true open source
- AGPL **deters cloud providers** from offering our code as a service without contributing back (they must open-source their modifications)
- AGPL is **accepted by the community** — BSL/ELv2 have caused backlash and forks (HashiCorp → OpenTofu, Redis → Valkey)
- If we need to change later, starting with AGPL is easier to justify than switching from permissive to restrictive

### CLA (Contributor License Agreement)

**Essential from day one.** Use CLA Assistant (https://cla-assistant.io) — integrates with GitHub.

Why:
- Gives us the legal right to offer dual licensing (open source + commercial)
- Without CLA, every contributor retains copyright, and we'd need unanimous consent to relicense
- Standard practice for open-core companies (GitLab, Grafana, etc.)

### Alternative: DCO (Developer Certificate of Origin)

Lighter weight (just a `Signed-off-by` line in commits). Used by the Linux kernel. But it does NOT grant relicensing rights, so it's insufficient if we plan to dual-license.

---

## 5. Funding Options

### Non-Dilutive Funding (Grants — No Equity Given Up)

| Program | Amount | Requirements | Fit |
|---------|--------|-------------|-----|
| **NLnet / NGI Zero** | €5K-50K per project | Open source, internet infrastructure | **Perfect fit** — protocol + privacy focus |
| **NGI (Next Generation Internet)** | Various calls | EU-funded, open source | **Perfect fit** |
| **CDTI Neotec** | Up to €250K grant | Tech startup < 3 years | Excellent |
| **Sovereign Tech Fund** (Germany) | €150K-900K+ | Open source digital infrastructure | Good fit |
| **EIC Pathfinder** | Up to €3-4M | Breakthrough research | If deep-tech angle |
| **Open Technology Fund** | Various | Internet freedom, privacy, security | Good fit |
| **Regional programs** | Varies | Catalonia (ACCIÓ), Madrid (Madri+d), Basque (SPRI) | Check local |

**Priority recommendation**: Apply to **NLnet/NGI** first — lightweight process, non-dilutive, perfectly suited for protocol work.

### Quasi-Equity (Loans Without Collateral)

| Program | Amount | Terms | Fit |
|---------|--------|-------|-----|
| **ENISA Jóvenes Emprendedores** | Up to €75K | Participative loan, no guarantees, founders < 40 | Excellent |
| **ENISA Emprendedores** | Up to €300K | Participative loan, no guarantees | Excellent |
| **ENISA Crecimiento** | Up to €1.5M | For scaling | Later stage |
| **ICO Lines** | Up to €12.5M | Through commercial banks, for SMEs | General purpose |

**ENISA is the single most popular funding instrument for Spanish startups.** Apply at: https://www.enisa.es

### Equity Funding

| Stage | Typical Amount | Typical Dilution | Sources |
|-------|---------------|------------------|---------|
| **Pre-seed** | €100K-500K | 8-15% | Angels, AEBAN network, friends & family |
| **Seed** | €500K-2M | 15-25% | Spanish VCs, international VCs |
| **Series A** | €2M-10M | 20-30% | International VCs |

**Spanish VCs active in this space:**
- JME Ventures, Kfund, Samaipata, Nauta Capital, Seaya Ventures, All Iron Ventures

**International VCs active in Spain:**
- Point Nine (Berlin), Lakestar, Atomico

**EU-level:**
- **EIC Accelerator**: Up to €2.5M grant + €15M equity. Extremely competitive (~5% success rate) but transformative.

### Accelerators / Incubators

| Program | Location | Equity Taken | Notes |
|---------|----------|-------------|-------|
| **Lanzadera** | Valencia | **None** | Spain's most prominent. Free. |
| **Wayra** (Telefónica) | Madrid | Invests €25K-250K | Good for B2B/infrastructure |
| **Plug and Play** | Madrid | Varies | International network |
| **Y Combinator** | US (remote ok) | 7% for $500K | Accepts EU companies |
| **Techstars** | Various EU | 6% for $120K | Multiple EU programs |
| **Entrepreneur First** | Berlin, Paris | ~10% | Builds teams from scratch |

---

## 6. Step-by-Step Action Plan

### Phase 0 — Now (Before Incorporation)

```
Week 1-2:
├── [ ] Register domain name (contextme.org / contextme.io)
├── [ ] Check trademark availability on EUIPO for "ContextMe"
├── [ ] Create GitHub organization
├── [ ] Set up project governance (CONTRIBUTING.md, CODE_OF_CONDUCT.md)
├── [ ] Choose and apply licenses (Apache 2.0 for spec, AGPL for core, MIT for SDKs)
├── [ ] Set up CLA Assistant on GitHub
└── [ ] Draft founder agreement (pacto de socios) — engage a lawyer

Week 3-8:
├── [ ] Build protocol specification v0.1
├── [ ] Build MVP (CLI + basic vault + MCP server)
├── [ ] Apply to NLnet/NGI for grant funding
├── [ ] Start community building (blog, social media, dev talks)
├── [ ] Talk to 50+ potential users (validate the problem)
└── [ ] Collect letters of intent / early interest

Month 3-6:
├── [ ] Release public alpha
├── [ ] Build browser extension for ChatGPT/Gemini
├── [ ] Present at conferences / meetups
├── [ ] Apply to ENISA for participative loan
├── [ ] Build early community (Discord/Slack, GitHub discussions)
└── [ ] Iterate based on user feedback
```

### Phase 1 — Incorporation (When Needed)

```
When you need to receive money or sign contracts:
├── [ ] Incorporate SL (€300-1,200 with gestoría)
├── [ ] Apply for "empresa emergente" certification (ENISA)
├── [ ] Register EU trademark via EUIPO (€850)
├── [ ] Open business bank account
├── [ ] Sign the pacto de socios formally
├── [ ] Apply to CDTI Neotec if < 3 years old (up to €250K grant)
└── [ ] Set up basic accounting (gestoría or Holded/Quipu SaaS)
```

### Phase 2 — Traction

```
├── [ ] Launch premium personal tier
├── [ ] Apply to accelerators if strategic (Lanzadera, Wayra, etc.)
├── [ ] Start enterprise conversations
├── [ ] Seek pre-seed / seed if needed
├── [ ] Apply to EIC Accelerator if ready (long shot, high reward)
└── [ ] Align enterprise launch with EU regulatory timeline
```

---

## 7. EU-Specific Advantages

### Why Being EU-Based Is an Asset

1. **GDPR-native**: European customers (especially enterprise, public sector, healthcare, finance) increasingly require EU-based providers. Being GDPR-compliant by design is a genuine selling point.

2. **Digital sovereignty push**: The EU actively reduces US tech dependency. Gaia-X, European Cloud Initiative, and national programs favor European providers. The Interoperable Europe Act (2024) mandates public sector preference for open-source and interoperable standards.

3. **Regulatory alignment**: DMA, Data Act, and AI Act collectively push toward portability — exactly what we're building. Being EU-based means we're native to this regulatory environment.

4. **Non-dilutive funding**: NLnet, NGI, Sovereign Tech Fund, CDTI, ENISA — significant funding available as grants and soft loans, unavailable to non-EU companies.

5. **Privacy as marketing**: "Built in Europe. Your data stays yours. GDPR-compliant by design." — This resonates with privacy-conscious users globally.

---

## 8. Key Resources

### Registration & Legal
- **PAE/CIRCE** (online company registration): https://paeelectronico.es
- **OEPM** (Spanish trademark office): https://www.oepm.es
- **EUIPO** (EU trademark office): https://euipo.europa.eu
- **Registro Mercantil Central**: https://www.rmc.es

### Funding
- **ENISA**: https://www.enisa.es
- **CDTI**: https://www.cdti.es
- **NLnet Foundation**: https://nlnet.nl
- **NGI**: https://www.ngi.eu
- **EIC Accelerator**: https://eic.ec.europa.eu
- **Sovereign Tech Fund**: https://www.sovereigntechfund.de
- **ICO**: https://www.ico.es

### Open Source Governance
- **CLA Assistant**: https://cla-assistant.io
- **Choose a License**: https://choosealicense.com
- **Open Source Guides**: https://opensource.guide
- **SPDX License List**: https://spdx.org/licenses/

### Ecosystem
- **AEBAN** (business angels): https://www.aeban.es
- **Startup Spain map**: https://startupxplore.com
- **South Summit**: https://www.southsummit.co
- **4YFN (Barcelona)**: https://www.4yfn.com

---

*Document generated: 2026-03-25*
*Project: ContextMe*
