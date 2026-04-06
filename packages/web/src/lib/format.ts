/**
 * Formats a facet value for display in the UI.
 * Handles the polymorphic nature of facet values (primitives, arrays, objects).
 */
export function formatFacetValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return value.map((item) => formatFacetValue(item)).join(', ');
  }
  return JSON.stringify(value);
}
