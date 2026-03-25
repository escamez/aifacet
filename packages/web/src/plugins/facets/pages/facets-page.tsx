import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Facet, api } from '../../../lib/api.js';

const CATEGORY_COLORS: Record<string, string> = {
  physical: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  professional: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  communication: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  health: 'bg-red-500/10 text-red-400 border-red-500/20',
  preferences: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  behavioral: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  political: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  financial: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
};

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${color}`}>
      {category}
    </span>
  );
}

export function FacetsPage() {
  const [facets, setFacets] = useState<Facet[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: '', key: '', value: '' });
  const [filter, setFilter] = useState('');

  const load = () => {
    api.getFacets().then((r) => setFacets(r.data));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    if (!form.category || !form.key || !form.value) return;
    await api.addFacet({ category: form.category, key: form.key, value: form.value });
    setForm({ category: '', key: '', value: '' });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (category: string, key: string) => {
    await api.deleteFacet(category, key);
    load();
  };

  const filtered = filter ? facets.filter((f) => f.category === filter) : facets;
  const categories = [...new Set(facets.map((f) => f.category))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Facets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {facets.length} facet{facets.length !== 1 ? 's' : ''} across {categories.length} categories
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Facet
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h3 className="mb-4 text-sm font-medium text-zinc-300">New Facet</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              placeholder="Category (e.g. physical)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Key (e.g. height_cm)"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Value (e.g. 178)"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              !filter ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setFilter(cat === filter ? '' : cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === cat ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Category</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Key</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Value</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Access</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filtered.map((facet) => (
              <tr key={`${facet.category}-${facet.key}`} className="hover:bg-zinc-900/30">
                <td className="px-4 py-3">
                  <CategoryBadge category={facet.category} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{facet.key}</td>
                <td className="px-4 py-3 text-zinc-100">{String(facet.value)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-zinc-500">{facet.meta.accessLevel}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(facet.category, facet.key)}
                    className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-600">
                  No facets yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
