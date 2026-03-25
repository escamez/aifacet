/**
 * Controls how much of a facet's data is exposed to an AI provider.
 *
 * - full: AI sees the actual data
 * - summary: AI sees a high-level summary (e.g., "user has food allergies")
 * - existence: AI knows the facet exists but cannot read its content
 * - hidden: AI does not know the facet exists at all
 * - denied: AI requested access and the user explicitly refused
 */
export type AccessLevel = 'full' | 'summary' | 'existence' | 'hidden' | 'denied';

/**
 * Controls the time scope of a consent grant.
 *
 * - session: valid only for the current conversation
 * - persistent: valid until explicitly revoked
 * - time-limited: valid until the specified expiration
 */
export type ConsentDuration = 'session' | 'persistent' | 'time-limited';

/**
 * A consent policy governs access to a specific facet category
 * for a specific AI provider (or all providers).
 */
export interface ConsentPolicy {
  readonly facetCategory: string;
  readonly accessLevel: AccessLevel;
  readonly duration: ConsentDuration;
  readonly grantedTo?: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
}

/**
 * A constitutional rule is an immutable, user-defined meta-policy
 * that overrides all other consent decisions.
 *
 * Example: "Never share my political views with any AI, ever."
 */
export interface ConstitutionalRule {
  readonly id: string;
  readonly description: string;
  readonly facetCategory: string;
  readonly maxAccessLevel: AccessLevel;
  readonly createdAt: string;
}
