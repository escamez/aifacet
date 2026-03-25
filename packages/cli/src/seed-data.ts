import type { ConsentPolicy, ConstitutionalRule, Facet } from '@aime/schema';

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
 * Covers all built-in facet categories to exercise the full system:
 * physical, professional, communication, health, preferences,
 * behavioral, political, and financial.
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

  // ── Health ────────────────────────────────────────────────
  facet('health', 'allergies', ['peanuts', 'penicillin'], 'summary'),
  facet('health', 'dietary', 'vegetarian', 'summary'),

  // ── Preferences ───────────────────────────────────────────
  facet('preferences', 'editor', 'VS Code + Neovim for quick edits'),
  facet('preferences', 'os', 'macOS (primary), Linux (servers)'),
  facet('preferences', 'music_while_working', 'lo-fi hip hop, ambient electronica'),

  // ── Behavioral ────────────────────────────────────────────
  facet('behavioral', 'question_style', 'direct and specific'),
  facet('behavioral', 'decision_making', 'data-driven, prefers benchmarks and evidence'),
  facet('behavioral', 'learning_style', 'hands-on, learns by building'),

  // ── Political ─────────────────────────────────────────────
  facet('political', 'leaning', 'progressive-centrist', 'hidden'),

  // ── Financial ─────────────────────────────────────────────
  facet('financial', 'salary_range', '80k-100k EUR', 'hidden'),
  facet('financial', 'investment_style', 'index funds, conservative', 'existence'),
];

/**
 * Constitutional rules that override all consent policies.
 * These represent the user's non-negotiable privacy boundaries.
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
];

/**
 * Consent policies governing per-provider access.
 * Demonstrate both provider-specific and global policies.
 */
export const SEED_POLICIES: ReadonlyArray<ConsentPolicy> = [
  {
    facetCategory: 'health',
    accessLevel: 'denied',
    duration: 'persistent',
    grantedTo: 'chatgpt',
    createdAt: now,
  },
  {
    facetCategory: 'professional',
    accessLevel: 'full',
    duration: 'persistent',
    grantedTo: 'claude',
    createdAt: now,
  },
  {
    facetCategory: 'communication',
    accessLevel: 'full',
    duration: 'persistent',
    createdAt: now,
  },
];
