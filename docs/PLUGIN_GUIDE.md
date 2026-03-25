# AIME — Plugin Development Guide

> How to extend AIME with new API and Web plugins.

AIME uses a plugin-based architecture for both the backend API and the frontend Web UI. New features are added by creating plugins — self-contained modules that register routes (API) or pages (Web) without modifying the core application code.

## Table of Contents

1. [API Plugin Architecture](#api-plugin-architecture)
2. [Web Plugin Architecture](#web-plugin-architecture)
3. [Step-by-Step: Creating a New Plugin](#step-by-step-creating-a-new-plugin)
4. [File Structure Conventions](#file-structure-conventions)

---

## API Plugin Architecture

### The ApiPlugin Interface

Every API plugin implements the `ApiPlugin` interface defined in `packages/api/src/plugins/types.ts`:

```typescript
import type { Hono } from 'hono';

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
```

### How It Works

1. Each plugin is a **factory function** that receives a `Vault` instance and returns an `ApiPlugin`.
2. The plugin creates its own `Hono` app with its routes.
3. The main application mounts each plugin's routes under `/api{basePath}`.
4. All registered plugins are discoverable via `GET /api/plugins`.

### Registration Flow

In `packages/api/src/index.ts`, plugins are created and registered:

```typescript
import type { ApiPlugin } from './plugins/types.js';

const plugins: ApiPlugin[] = [
  createHealthPlugin(vault),
  createFacetsPlugin(vault),
  createPoliciesPlugin(vault),
  createConstitutionPlugin(vault),
  createImportExportPlugin(vault),
];

const api = new Hono();
for (const plugin of plugins) {
  api.route(plugin.basePath, plugin.routes);
}

app.route('/api', api);
```

### Example: The Health Plugin

The simplest plugin — a single GET endpoint:

```typescript
import type { Vault } from '@aime/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createHealthPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  app.get('/', (c) => {
    const ctx = vault.getContext();
    return c.json({
      status: 'ok',
      version: ctx.version,
      facets: ctx.facets.length,
      policies: ctx.policies.length,
      constitution: ctx.constitution.length,
    });
  });

  return { id: 'health', name: 'Health', basePath: '/health', routes: app };
}
```

---

## Web Plugin Architecture

### The WebPlugin Interface

Every Web plugin implements the `WebPlugin` interface defined in `packages/web/src/plugins/registry/types.ts`:

```typescript
import type { ComponentType, ReactNode } from 'react';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: ComponentType<{ className?: string }>;
}

export interface WebPlugin {
  readonly id: string;
  readonly label: string;
  readonly basePath: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly navItems: readonly NavItem[];
  readonly routes: ReactNode;
}
```

### How It Works

1. Each plugin is a module that calls `registerPlugin()` at import time.
2. The plugin provides its navigation items, routes (React Router `<Route>` elements), and an icon (from [lucide-react](https://lucide.dev)).
3. The `Shell` layout component renders navigation from all registered plugins.
4. The `App` component renders all plugin routes inside a shared `<Routes>` tree.

### Registration Flow

In `packages/web/src/app.tsx`, plugins are registered via side-effect imports:

```typescript
// Register all plugins (order matters for navigation)
import './plugins/dashboard/index.js';
import './plugins/facets/index.js';
import './plugins/policies/index.js';
import './plugins/import-export/index.js';

export function App() {
  const plugins = getPlugins();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          {plugins.map((plugin) => plugin.routes)}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Registry Module

The registry (`packages/web/src/plugins/registry/index.ts`) manages plugin state:

```typescript
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
```

### Example: The Dashboard Plugin

The simplest Web plugin — a single page at the root path:

```typescript
import { LayoutDashboard } from 'lucide-react';
import { Route } from 'react-router-dom';
import { registerPlugin } from '../registry/index.js';
import { DashboardPage } from './pages/dashboard-page.js';

registerPlugin({
  id: 'dashboard',
  label: 'Dashboard',
  basePath: '/',
  icon: LayoutDashboard,
  navItems: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }],
  routes: <Route index element={<DashboardPage />} />,
});
```

---

## Step-by-Step: Creating a New Plugin

This example walks through creating an **"Audit"** plugin that shows access logs — both the API backend and the Web frontend.

### Step 1: Create the API Plugin

Create the file `packages/api/src/plugins/audit.ts`:

```typescript
import type { Vault } from '@aime/vault';
import { Hono } from 'hono';
import type { ApiPlugin } from './types.js';

export function createAuditPlugin(vault: Vault): ApiPlugin {
  const app = new Hono();

  // GET /api/audit — list all audit entries
  app.get('/', (c) => {
    // Replace with actual audit log retrieval
    return c.json({
      data: [
        {
          timestamp: new Date().toISOString(),
          action: 'facets.read',
          provider: 'claude',
          facetsAccessed: 5,
        },
      ],
    });
  });

  // GET /api/audit/stats — summary statistics
  app.get('/stats', (c) => {
    return c.json({
      totalAccesses: 42,
      uniqueProviders: 2,
      lastAccess: new Date().toISOString(),
    });
  });

  return {
    id: 'audit',
    name: 'Audit Log',
    basePath: '/audit',
    routes: app,
  };
}
```

### Step 2: Register the API Plugin

Edit `packages/api/src/index.ts` to add the new plugin:

```typescript
import { createAuditPlugin } from './plugins/audit.js';

// In the plugins array:
const plugins: ApiPlugin[] = [
  createHealthPlugin(vault),
  createFacetsPlugin(vault),
  createPoliciesPlugin(vault),
  createConstitutionPlugin(vault),
  createImportExportPlugin(vault),
  createAuditPlugin(vault),  // <-- Add here
];
```

The new endpoints are now available at:
- `GET /api/audit`
- `GET /api/audit/stats`
- Listed in `GET /api/plugins`

### Step 3: Create the Web Plugin Page

Create the page component at `packages/web/src/plugins/audit/pages/audit-page.tsx`:

```tsx
import { useEffect, useState } from 'react';

interface AuditEntry {
  timestamp: string;
  action: string;
  provider: string;
  facetsAccessed: number;
}

export function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    fetch('http://localhost:3100/api/audit')
      .then((res) => res.json())
      .then((json) => setEntries(json.data));
  }, []);

  return (
    <div>
      <h1>Audit Log</h1>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Action</th>
            <th>Provider</th>
            <th>Facets</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i}>
              <td>{entry.timestamp}</td>
              <td>{entry.action}</td>
              <td>{entry.provider}</td>
              <td>{entry.facetsAccessed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 4: Create the Web Plugin Registration

Create `packages/web/src/plugins/audit/index.tsx`:

```tsx
import { ClipboardList } from 'lucide-react';
import { Route } from 'react-router-dom';
import { registerPlugin } from '../registry/index.js';
import { AuditPage } from './pages/audit-page.js';

registerPlugin({
  id: 'audit',
  label: 'Audit',
  basePath: '/audit',
  icon: ClipboardList,
  navItems: [{ label: 'Audit Log', path: '/audit', icon: ClipboardList }],
  routes: <Route path="audit" element={<AuditPage />} />,
});
```

### Step 5: Register the Web Plugin Import

Edit `packages/web/src/app.tsx` to import the new plugin:

```typescript
// Register all plugins (order matters for navigation)
import './plugins/dashboard/index.js';
import './plugins/facets/index.js';
import './plugins/policies/index.js';
import './plugins/import-export/index.js';
import './plugins/audit/index.js';  // <-- Add here
```

### Step 6: Test

```bash
# Verify API plugin
curl -s http://localhost:3100/api/audit | jq
curl -s http://localhost:3100/api/plugins | jq

# Open Web UI and check the new "Audit" nav item
open http://localhost:5173/audit
```

---

## File Structure Conventions

### API Plugin

```
packages/api/src/plugins/
├── types.ts              Plugin interface (shared)
├── health.ts             One file per simple plugin
├── facets.ts
├── policies.ts
├── constitution.ts
├── import-export.ts
└── audit.ts              Your new plugin
```

**Naming conventions:**
- File name: kebab-case matching the plugin id (e.g., `import-export.ts`)
- Factory function: `create{Name}Plugin` (e.g., `createImportExportPlugin`)
- Plugin id: kebab-case (e.g., `import-export`)
- Base path: begins with `/` (e.g., `/transfer`)

### Web Plugin

```
packages/web/src/plugins/
├── registry/
│   ├── types.ts          Plugin interface (shared)
│   └── index.ts          registerPlugin / getPlugins
│
├── dashboard/
│   ├── index.tsx          Plugin registration (imports pages)
│   └── pages/
│       └── dashboard-page.tsx
│
├── facets/
│   ├── index.tsx
│   └── pages/
│       └── facets-page.tsx
│
└── audit/                 Your new plugin
    ├── index.tsx           Plugin registration
    └── pages/
        └── audit-page.tsx  Page component(s)
```

**Naming conventions:**
- Directory name: kebab-case matching the plugin id (e.g., `import-export/`)
- Registration file: always `index.tsx`
- Pages directory: `pages/` with `{name}-page.tsx` files
- Plugin id: kebab-case (e.g., `import-export`)
- Icon: imported from `lucide-react`
- Routes: React Router `<Route>` elements

### Checklist for a New Plugin

- [ ] **API:** Create `packages/api/src/plugins/{name}.ts` with a factory function
- [ ] **API:** Add the plugin to the `plugins` array in `packages/api/src/index.ts`
- [ ] **Web:** Create `packages/web/src/plugins/{name}/index.tsx` with `registerPlugin()` call
- [ ] **Web:** Create page component(s) in `packages/web/src/plugins/{name}/pages/`
- [ ] **Web:** Add the side-effect import in `packages/web/src/app.tsx`
- [ ] **Test:** Verify with `curl` (API) and browser (Web)
- [ ] **Test:** Check that `GET /api/plugins` lists the new plugin

---

*Document generated: 2026-03-25*
*Project: AIME*
