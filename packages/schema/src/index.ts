export type {
  AccessLevel,
  ConsentDuration,
  ConsentPolicy,
  ConstitutionalRule,
} from './types/access.js';
export type { HumanContext } from './types/context.js';
export { createEmptyContext, SCHEMA_VERSION } from './types/context.js';
export type { BuiltInCategory, Facet, FacetMeta, FacetSource } from './types/facet.js';
export { BUILT_IN_CATEGORIES, isValidConfidence } from './types/facet.js';
