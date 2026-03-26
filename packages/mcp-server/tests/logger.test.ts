import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from '../src/logger.js';

describe('Logger', () => {
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

  afterEach(() => {
    stderrSpy.mockClear();
  });

  describe('given a logger with default level (info)', () => {
    describe('when logging at info level', () => {
      it('then it should write to stderr', () => {
        const logger = createLogger('info');
        logger.info('server started');

        expect(stderrSpy).toHaveBeenCalledOnce();
        const output = stderrSpy.mock.calls[0]?.[0] as string;
        expect(output).toContain('[INF]');
        expect(output).toContain('server started');
      });
    });

    describe('when logging at debug level', () => {
      it('then it should be suppressed', () => {
        const logger = createLogger('info');
        logger.debug('some detail');

        expect(stderrSpy).not.toHaveBeenCalled();
      });
    });

    describe('when logging at error level', () => {
      it('then it should write to stderr', () => {
        const logger = createLogger('info');
        logger.error('something broke');

        expect(stderrSpy).toHaveBeenCalledOnce();
        const output = stderrSpy.mock.calls[0]?.[0] as string;
        expect(output).toContain('[ERR]');
        expect(output).toContain('something broke');
      });
    });

    describe('when logging with extra data', () => {
      it('then it should include JSON data in the output', () => {
        const logger = createLogger('info');
        logger.info('request handled', { method: 'POST', status: 200 });

        const output = stderrSpy.mock.calls[0]?.[0] as string;
        expect(output).toContain('"method":"POST"');
        expect(output).toContain('"status":200');
      });
    });
  });

  describe('given a logger with debug level', () => {
    describe('when logging at debug level', () => {
      it('then it should write to stderr', () => {
        const logger = createLogger('debug');
        logger.debug('detailed trace');

        expect(stderrSpy).toHaveBeenCalledOnce();
        const output = stderrSpy.mock.calls[0]?.[0] as string;
        expect(output).toContain('[DBG]');
        expect(output).toContain('detailed trace');
      });
    });
  });

  describe('given a logger with error level', () => {
    describe('when logging at warn level', () => {
      it('then it should be suppressed', () => {
        const logger = createLogger('error');
        logger.warn('just a warning');

        expect(stderrSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('given a logger with a log file configured', () => {
    const logDir = join(tmpdir(), `aifacet-logger-test-${Date.now()}`);
    const logFile = join(logDir, 'test.log');

    beforeEach(() => {
      process.env.AIFACET_LOG_FILE = logFile;
    });

    afterEach(() => {
      delete process.env.AIFACET_LOG_FILE;
      if (existsSync(logDir)) {
        rmSync(logDir, { recursive: true, force: true });
      }
    });

    describe('when logging a message', () => {
      it('then it should write to both stderr and the file', () => {
        const logger = createLogger('info');
        logger.info('dual output');

        expect(stderrSpy).toHaveBeenCalledOnce();
        expect(existsSync(logFile)).toBe(true);

        const fileContent = readFileSync(logFile, 'utf-8');
        expect(fileContent).toContain('[INF]');
        expect(fileContent).toContain('dual output');
      });
    });

    describe('when logging multiple messages', () => {
      it('then it should append to the file', () => {
        const logger = createLogger('info');
        logger.info('first');
        logger.warn('second');

        const fileContent = readFileSync(logFile, 'utf-8');
        const lines = fileContent.trim().split('\n');
        expect(lines).toHaveLength(2);
        expect(lines[0]).toContain('first');
        expect(lines[1]).toContain('second');
      });
    });
  });

  describe('given a logger output format', () => {
    describe('when logging a message', () => {
      it('then it should include ISO timestamp', () => {
        const logger = createLogger('info');
        logger.info('test');

        const output = stderrSpy.mock.calls[0]?.[0] as string;
        // ISO 8601 format: 2026-03-25T...Z
        expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });
  });
});
