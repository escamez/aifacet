import type { Hono } from 'hono';

/**
 * An API plugin is a self-contained module that registers routes
 * on a base path. New features are added by creating new plugins.
 */
export interface ApiPlugin {
  /** Unique identifier for the plugin */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** Base path where routes are mounted (e.g., '/facets') */
  readonly basePath: string;
  /** Hono app containing the plugin's routes */
  readonly routes: Hono;
}
