import { describe, expect, it } from 'vitest';
import { createEmptyContext, SCHEMA_VERSION } from '../src/index.js';

describe('HumanContext', () => {
  describe('createEmptyContext', () => {
    describe('given a valid user id', () => {
      const userId = 'user-123';

      describe('when creating an empty context', () => {
        const context = createEmptyContext(userId);

        it('then it should have the correct id', () => {
          expect(context.id).toBe(userId);
        });

        it('then it should have the current schema version', () => {
          expect(context.version).toBe(SCHEMA_VERSION);
        });

        it('then it should have valid ISO timestamps', () => {
          expect(() => new Date(context.createdAt)).not.toThrow();
          expect(() => new Date(context.updatedAt)).not.toThrow();
        });

        it('then it should have empty facets', () => {
          expect(context.facets).toEqual([]);
        });

        it('then it should have empty policies', () => {
          expect(context.policies).toEqual([]);
        });

        it('then it should have empty constitution', () => {
          expect(context.constitution).toEqual([]);
        });
      });
    });
  });
});
