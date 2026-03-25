import { describe, expect, it } from 'vitest';
import { createServer } from '../src/index.js';

describe('MCP Server', () => {
  describe('given the server factory', () => {
    describe('when creating a server instance', () => {
      it('then it should return a valid MCP server', () => {
        const server = createServer();
        expect(server).toBeDefined();
      });
    });
  });
});
