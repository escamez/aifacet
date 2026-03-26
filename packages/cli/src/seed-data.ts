import type { ConsentPolicy, ConstitutionalRule, Facet } from '@aifacet/schema';

const now = new Date().toISOString();

/**
 * Creates a facet with default metadata.
 * Keeps seed definitions concise while ensuring consistent metadata.
 */
function facet(
  category: string,
  key: string,
  value: unknown,
  accessLevel: 'full' | 'summary' | 'existence' | 'hidden' = 'full',
  confidence = 1.0,
): Facet {
  return {
    category,
    key,
    value,
    meta: { updatedAt: now, source: 'self-reported', confidence, accessLevel },
  };
}

/**
 * A realistic sample human profile for development and testing.
 *
 * Represents "Elena Martínez", a fictitious senior engineer based in Madrid.
 * Covers all built-in facet categories to exercise the full consent system,
 * including GDPR Article 9 special categories (health, political opinions,
 * religious beliefs, sexual orientation, trade union membership).
 */
export const SEED_FACETS: ReadonlyArray<Facet> = [
  // ── Physical ──────────────────────────────────────────────
  facet('physical', 'height_cm', 168),
  facet('physical', 'shoe_size_eu', 39),
  facet('physical', 'pants_size_eu', 38),
  facet('physical', 'shirt_size', 'M'),

  // ── Professional ──────────────────────────────────────────
  facet('professional', 'current_role', 'Senior Software Engineer'),
  facet('professional', 'industry', 'Technology / SaaS'),
  facet('professional', 'years_experience', 12),
  facet('professional', 'skills', [
    { name: 'TypeScript', level: 'expert', years: 8 },
    { name: 'Go', level: 'advanced', years: 5 },
    { name: 'React', level: 'advanced', years: 6 },
    { name: 'Kubernetes', level: 'intermediate', years: 3 },
    { name: 'Rust', level: 'beginner', years: 1 },
  ]),
  facet('professional', 'current_projects', [
    'Migrating monolith to microservices',
    'Building internal developer platform',
  ]),

  // ── Communication ─────────────────────────────────────────
  facet('communication', 'preferred_language', 'es'),
  facet('communication', 'additional_languages', ['en', 'fr']),
  facet('communication', 'style', 'concise'),
  facet('communication', 'tone', 'technical but friendly'),
  facet('communication', 'response_format', 'bullet-points'),

  // ── Health (GDPR Art. 9 — special category) ───────────────
  facet('health', 'allergies', ['peanuts', 'penicillin'], 'summary'),
  facet('health', 'dietary', 'vegetarian', 'summary'),
  facet('health', 'chronic_condition', 'Type 2 diabetes, managed with metformin', 'summary'),
  facet('health', 'mental_health', 'Generalised anxiety, weekly therapy since 2023', 'hidden'),
  facet('health', 'blood_type', 'A+', 'existence'),

  // ── Identity (GDPR Art. 9 — special category) ─────────────
  facet('identity', 'sexual_orientation', 'bisexual', 'hidden'),
  facet('identity', 'gender_identity', 'cisgender woman', 'summary'),
  facet('identity', 'pronouns', 'she/her', 'full'),

  // ── Religious (GDPR Art. 9 — special category) ────────────
  facet('religious', 'beliefs', 'Agnostic, exploring Buddhism', 'hidden'),
  facet('religious', 'practices', 'Daily meditation, occasional temple visits', 'hidden'),

  // ── Labor (GDPR Art. 9 — special category) ────────────────
  facet('labor', 'union_membership', 'Active member, UGT (since 2019)', 'hidden'),
  facet('labor', 'union_role', 'Section delegate, workers committee', 'hidden'),

  // ── Preferences ───────────────────────────────────────────
  facet('preferences', 'editor', 'VS Code + Neovim for quick edits'),
  facet('preferences', 'os', 'macOS (primary), Linux (servers)'),
  facet('preferences', 'music_while_working', 'lo-fi hip hop, ambient electronica'),

  // ── Behavioral ────────────────────────────────────────────
  facet('behavioral', 'question_style', 'direct and specific'),
  facet('behavioral', 'decision_making', 'data-driven, prefers benchmarks and evidence'),
  facet('behavioral', 'learning_style', 'hands-on, learns by building'),

  // ── Political (GDPR Art. 9 — special category) ────────────
  facet('political', 'leaning', 'progressive-centrist', 'hidden'),
  facet('political', 'voting_history', 'Consistent voter since 2010', 'hidden'),

  // ── Financial ─────────────────────────────────────────────
  facet('financial', 'salary_range', '80k-100k EUR', 'hidden'),
  facet('financial', 'investment_style', 'index funds, conservative', 'existence'),
];

/**
 * Constitutional rules — the user's non-negotiable privacy boundaries.
 * These override ALL consent policies and cannot be bypassed by any provider.
 *
 * Maps directly to GDPR Article 9 special categories where the user
 * has decided absolute protection is required.
 */
export const SEED_CONSTITUTION: ReadonlyArray<ConstitutionalRule> = [
  {
    id: 'const-001',
    description: 'Never share my political views with any AI, ever',
    facetCategory: 'political',
    maxAccessLevel: 'hidden',
    createdAt: now,
  },
  {
    id: 'const-002',
    description: 'Never share my financial information with any AI',
    facetCategory: 'financial',
    maxAccessLevel: 'hidden',
    createdAt: now,
  },
  {
    id: 'const-003',
    description: 'Never share my sexual orientation or gender identity with any AI',
    facetCategory: 'identity',
    maxAccessLevel: 'hidden',
    createdAt: now,
  },
  {
    id: 'const-004',
    description: 'Never share my religious beliefs with any AI',
    facetCategory: 'religious',
    maxAccessLevel: 'hidden',
    createdAt: now,
  },
  {
    id: 'const-005',
    description: 'Never share my trade union membership with any AI',
    facetCategory: 'labor',
    maxAccessLevel: 'hidden',
    createdAt: now,
  },
];

/**
 * Consent policies — per-provider access rules.
 *
 * Demonstrates selective trust: Elena trusts her health AI with medical data
 * but blocks it from ChatGPT. She shares professional context broadly
 * but keeps everything else locked down by default.
 */
export const SEED_POLICIES: ReadonlyArray<ConsentPolicy> = [
  // ── Health AI gets full health access (trusted medical assistant) ──
  {
    facetCategory: 'health',
    accessLevel: 'full',
    duration: 'persistent',
    grantedTo: 'health-assistant',
    createdAt: now,
  },

  // ── ChatGPT is explicitly denied health data ──
  {
    facetCategory: 'health',
    accessLevel: 'denied',
    duration: 'persistent',
    grantedTo: 'chatgpt',
    createdAt: now,
  },

  // ── Claude gets professional context ──
  {
    facetCategory: 'professional',
    accessLevel: 'full',
    duration: 'persistent',
    grantedTo: 'claude',
    createdAt: now,
  },

  // ── Career coach gets professional context ──
  {
    facetCategory: 'professional',
    accessLevel: 'full',
    duration: 'persistent',
    grantedTo: 'career-coach',
    createdAt: now,
  },

  // ── Communication preferences shared with all providers ──
  {
    facetCategory: 'communication',
    accessLevel: 'full',
    duration: 'persistent',
    createdAt: now,
  },

  // ── Behavioral shared with all (helps every AI interact better) ──
  {
    facetCategory: 'behavioral',
    accessLevel: 'full',
    duration: 'persistent',
    createdAt: now,
  },
];
