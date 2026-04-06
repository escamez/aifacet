import { describe, expect, it } from 'vitest';
import { formatFacetValue } from './format.js';

describe('formatFacetValue', () => {
  // ---------------------------------------------------------------------------
  // Primitive values
  // ---------------------------------------------------------------------------

  describe('given a string value', () => {
    describe('when formatting', () => {
      it('then returns the string as-is', () => {
        expect(formatFacetValue('Senior Software Engineer')).toBe('Senior Software Engineer');
      });
    });
  });

  describe('given a number value', () => {
    describe('when formatting', () => {
      it('then returns the number as string', () => {
        expect(formatFacetValue(168)).toBe('168');
      });
    });
  });

  describe('given a boolean value', () => {
    describe('when formatting', () => {
      it('then returns true as "true"', () => {
        expect(formatFacetValue(true)).toBe('true');
      });

      it('then returns false as "false"', () => {
        expect(formatFacetValue(false)).toBe('false');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Null / undefined
  // ---------------------------------------------------------------------------

  describe('given a null value', () => {
    describe('when formatting', () => {
      it('then returns an empty string', () => {
        expect(formatFacetValue(null)).toBe('');
      });
    });
  });

  describe('given an undefined value', () => {
    describe('when formatting', () => {
      it('then returns an empty string', () => {
        expect(formatFacetValue(undefined)).toBe('');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Arrays of primitives (e.g. additional_languages, allergies, current_projects)
  // ---------------------------------------------------------------------------

  describe('given an array of strings', () => {
    describe('when formatting', () => {
      it('then returns values joined by comma and space', () => {
        expect(formatFacetValue(['en', 'fr'])).toBe('en, fr');
      });

      it('then handles a single-element array', () => {
        expect(formatFacetValue(['es'])).toBe('es');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Arrays of objects — THE BUG: skills facet produces [object Object]
  // ---------------------------------------------------------------------------

  describe('given an array of objects (skills facet)', () => {
    const skills = [
      { name: 'TypeScript', level: 'expert', years: 8 },
      { name: 'Go', level: 'advanced', years: 5 },
      { name: 'React', level: 'advanced', years: 6 },
    ];

    describe('when formatting', () => {
      it('then does NOT contain [object Object]', () => {
        const result = formatFacetValue(skills);
        expect(result).not.toContain('[object Object]');
      });

      it('then contains the object values in a readable form', () => {
        const result = formatFacetValue(skills);
        expect(result).toContain('TypeScript');
        expect(result).toContain('Go');
        expect(result).toContain('React');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Plain object (edge case for future facet shapes)
  // ---------------------------------------------------------------------------

  describe('given a plain object', () => {
    describe('when formatting', () => {
      it('then does NOT contain [object Object]', () => {
        const result = formatFacetValue({ name: 'TypeScript', level: 'expert' });
        expect(result).not.toContain('[object Object]');
      });

      it('then contains the object values in a readable form', () => {
        const result = formatFacetValue({ name: 'TypeScript', level: 'expert' });
        expect(result).toContain('TypeScript');
        expect(result).toContain('expert');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Empty array
  // ---------------------------------------------------------------------------

  describe('given an empty array', () => {
    describe('when formatting', () => {
      it('then returns an empty string', () => {
        expect(formatFacetValue([])).toBe('');
      });
    });
  });
});
