import type { ComponentType, ReactNode } from 'react';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: ComponentType<{ className?: string }>;
}

/**
 * A WebPlugin is a self-contained UI module.
 * New features are added by creating new plugins and registering them.
 */
export interface WebPlugin {
  readonly id: string;
  readonly label: string;
  readonly basePath: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly navItems: readonly NavItem[];
  readonly routes: ReactNode;
}
