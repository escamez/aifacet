import type { ConsentPolicy, ConstitutionalRule } from './access.js';
import type { Facet } from './facet.js';

/**
 * The complete human context document.
 * This is the top-level structure that represents everything
 * the system knows about a user, organized into facets.
 */
export interface HumanContext {
  readonly id: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly facets: ReadonlyArray<Facet>;
  readonly policies: ReadonlyArray<ConsentPolicy>;
  readonly constitution: ReadonlyArray<ConstitutionalRule>;
}

/**
 * Schema version for the current context format.
 * Follows semver. Breaking changes increment the major version.
 */
export const SCHEMA_VERSION = '0.1.0';

/**
 * Creates an empty HumanContext with sensible defaults.
 */
export function createEmptyContext(id: string): HumanContext {
  const now = new Date().toISOString();
  return {
    id,
    version: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    facets: [],
    policies: [],
    constitution: [],
  };
}
