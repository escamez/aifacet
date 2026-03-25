import type { WebPlugin } from './types.js';

const plugins: WebPlugin[] = [];

export function registerPlugin(plugin: WebPlugin): void {
  if (plugins.some((p) => p.id === plugin.id)) {
    throw new Error(`Plugin "${plugin.id}" is already registered`);
  }
  plugins.push(plugin);
}

export function getPlugins(): readonly WebPlugin[] {
  return plugins;
}

export type { NavItem, WebPlugin } from './types.js';
