import type { AccessLevel } from './access.js';

/**
 * Built-in facet categories. The system is extensible —
 * custom categories can be added beyond these defaults.
 */
export const BUILT_IN_CATEGORIES = [
  'physical',
  'professional',
  'communication',
  'health',
  'preferences',
  'behavioral',
  'political',
  'financial',
] as const;

export type BuiltInCategory = (typeof BUILT_IN_CATEGORIES)[number];

/**
 * How this facet's value was obtained.
 */
export type FacetSource = 'self-reported' | 'conversation-mining' | 'imported' | 'federated';

/**
 * Metadata attached to every facet, enabling provenance tracking,
 * staleness detection, and access control.
 */
export interface FacetMeta {
  readonly updatedAt: string;
  readonly source: FacetSource;
  readonly confidence: number;
  readonly accessLevel: AccessLevel;
  readonly expiresAt?: string;
}

/**
 * A Facet is the atomic unit of human context.
 * Each facet represents a single piece of information about the user,
 * categorized and annotated with metadata.
 */
export interface Facet {
  readonly category: string;
  readonly key: string;
  readonly value: unknown;
  readonly meta: FacetMeta;
}

/**
 * Validates that a confidence value is between 0 and 1.
 */
export function isValidConfidence(confidence: number): boolean {
  return confidence >= 0 && confidence <= 1;
}
