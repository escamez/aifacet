import { Activity, FileText, Scale, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api.js';

export function DashboardPage() {
  const [stats, setStats] = useState<{
    facets: number;
    policies: number;
    constitution: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.health().then(setStats).catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400">
        Failed to connect to API: {error}
      </div>
    );
  }

  const cards = [
    { label: 'Facets', value: stats?.facets ?? '—', icon: FileText, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Policies', value: stats?.policies ?? '—', icon: Shield, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Constitutional Rules', value: stats?.constitution ?? '—', icon: Scale, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Status', value: stats ? 'Online' : 'Loading...', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Your AI context at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">{card.label}</span>
              <div className={`rounded-lg p-2 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-100">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
