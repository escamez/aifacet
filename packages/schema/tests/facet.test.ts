import { describe, expect, it } from 'vitest';
import type { Facet } from '../src/index.js';
import { BUILT_IN_CATEGORIES, isValidConfidence } from '../src/index.js';

describe('Facet', () => {
  describe('BUILT_IN_CATEGORIES', () => {
    it('then it should include essential categories', () => {
      expect(BUILT_IN_CATEGORIES).toContain('physical');
      expect(BUILT_IN_CATEGORIES).toContain('professional');
      expect(BUILT_IN_CATEGORIES).toContain('communication');
      expect(BUILT_IN_CATEGORIES).toContain('health');
    });
  });

  describe('isValidConfidence', () => {
    describe('given a confidence value within range', () => {
      it.each([0, 0.5, 1])('then %d should be valid', (value) => {
        expect(isValidConfidence(value)).toBe(true);
      });
    });

    describe('given a confidence value out of range', () => {
      it.each([-0.1, 1.1, -1, 2])('then %d should be invalid', (value) => {
        expect(isValidConfidence(value)).toBe(false);
      });
    });
  });

  describe('Facet structure', () => {
    describe('given valid facet data', () => {
      const facet: Facet = {
        category: 'physical',
        key: 'height_cm',
        value: 178,
        meta: {
          updatedAt: new Date().toISOString(),
          source: 'self-reported',
          confidence: 1.0,
          accessLevel: 'full',
        },
      };

      describe('when inspecting the facet', () => {
        it('then it should have all required fields', () => {
          expect(facet.category).toBe('physical');
          expect(facet.key).toBe('height_cm');
          expect(facet.value).toBe(178);
          expect(facet.meta.source).toBe('self-reported');
          expect(facet.meta.accessLevel).toBe('full');
        });

        it('then its confidence should be valid', () => {
          expect(isValidConfidence(facet.meta.confidence)).toBe(true);
        });
      });
    });
  });
});
