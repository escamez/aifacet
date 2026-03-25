import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_LABEL: Record<LogLevel, string> = {
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
};

export interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
}

/**
 * Creates a minimal structured logger.
 *
 * - Writes to stderr (safe for MCP stdio transport).
 * - Optionally appends to a file when `AIME_LOG_FILE` is set.
 * - No external dependencies.
 */
export function createLogger(minLevel?: LogLevel): Logger {
  const threshold = LEVEL_PRIORITY[minLevel ?? (process.env.AIME_LOG_LEVEL as LogLevel) ?? 'info'];
  const logFile = process.env.AIME_LOG_FILE;

  if (logFile) {
    mkdirSync(dirname(logFile), { recursive: true });
  }

  function emit(level: LogLevel, msg: string, data?: Record<string, unknown>): void {
    if (LEVEL_PRIORITY[level] < threshold) return;

    const ts = new Date().toISOString();
    const label = LEVEL_LABEL[level];
    const extra = data ? ` ${JSON.stringify(data)}` : '';
    const line = `${ts} [${label}] ${msg}${extra}\n`;

    process.stderr.write(line);

    if (logFile) {
      try {
        appendFileSync(logFile, line);
      } catch {
        // Best-effort file logging — avoid crashing the server
      }
    }
  }

  return {
    debug: (msg, data) => emit('debug', msg, data),
    info: (msg, data) => emit('info', msg, data),
    warn: (msg, data) => emit('warn', msg, data),
    error: (msg, data) => emit('error', msg, data),
  };
}
