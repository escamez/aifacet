const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Health
  health: () =>
    request<{ status: string; facets: number; policies: number; constitution: number }>('/health'),

  // Facets
  getFacets: (category?: string) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ data: Facet[] }>(`/facets${q}`);
  },
  addFacet: (facet: { category: string; key: string; value: unknown }) =>
    request<{ ok: boolean }>('/facets', { method: 'POST', body: JSON.stringify(facet) }),
  deleteFacet: (category: string, key: string) =>
    request<{ ok: boolean }>(`/facets/${encodeURIComponent(category)}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    }),

  // Policies
  getPolicies: () => request<{ data: Policy[] }>('/policies'),
  addPolicy: (policy: Omit<Policy, 'createdAt'>) =>
    request<{ ok: boolean }>('/policies', { method: 'POST', body: JSON.stringify(policy) }),

  // Constitution
  getConstitution: () => request<{ data: ConstitutionalRule[] }>('/constitution'),
  addRule: (rule: { description: string; facetCategory: string; maxAccessLevel: string }) =>
    request<{ ok: boolean }>('/constitution', { method: 'POST', body: JSON.stringify(rule) }),

  // Import/Export
  exportContext: () => request<unknown>('/transfer/export'),
  importFacets: (facets: Facet[]) =>
    request<{ ok: boolean; imported: number; skipped: number }>('/transfer/import', {
      method: 'POST',
      body: JSON.stringify({ facets }),
    }),
};

// Lightweight types for the API client (avoids depending on @aifacet/schema in the browser)
export interface Facet {
  category: string;
  key: string;
  value: unknown;
  meta: {
    updatedAt: string;
    source: string;
    confidence: number;
    accessLevel: string;
  };
}

export interface Policy {
  facetCategory: string;
  accessLevel: string;
  duration: string;
  grantedTo?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ConstitutionalRule {
  id: string;
  description: string;
  facetCategory: string;
  maxAccessLevel: string;
  createdAt: string;
}
