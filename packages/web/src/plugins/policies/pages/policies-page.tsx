import { Plus, Scale, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type ConstitutionalRule, type Policy, api } from '../../../lib/api.js';

export function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [rules, setRules] = useState<ConstitutionalRule[]>([]);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [policyForm, setPolicyForm] = useState({ facetCategory: '', accessLevel: 'denied', duration: 'persistent', grantedTo: '' });
  const [ruleForm, setRuleForm] = useState({ description: '', facetCategory: '', maxAccessLevel: 'hidden' });

  const load = () => {
    api.getPolicies().then((r) => setPolicies(r.data));
    api.getConstitution().then((r) => setRules(r.data));
  };

  useEffect(load, []);

  const handleAddPolicy = async () => {
    if (!policyForm.facetCategory) return;
    await api.addPolicy({
      facetCategory: policyForm.facetCategory,
      accessLevel: policyForm.accessLevel,
      duration: policyForm.duration,
      grantedTo: policyForm.grantedTo || undefined,
    });
    setShowAddPolicy(false);
    setPolicyForm({ facetCategory: '', accessLevel: 'denied', duration: 'persistent', grantedTo: '' });
    load();
  };

  const handleAddRule = async () => {
    if (!ruleForm.description || !ruleForm.facetCategory) return;
    await api.addRule(ruleForm);
    setShowAddRule(false);
    setRuleForm({ description: '', facetCategory: '', maxAccessLevel: 'hidden' });
    load();
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Consent & Constitution</h1>
        <p className="mt-1 text-sm text-zinc-500">Control who sees what</p>
      </div>

      {/* Constitutional Rules */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Constitutional Rules</h2>
          </div>
          <button type="button" onClick={() => setShowAddRule(!showAddRule)} className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500">
            <Plus className="h-3 w-3" /> Add Rule
          </button>
        </div>
        <p className="text-xs text-zinc-500">Immutable rules that override all policies. These are your absolute boundaries.</p>

        {showAddRule && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <input placeholder='Description (e.g. "Never share political views")' value={ruleForm.description} onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Category (e.g. political)" value={ruleForm.facetCategory} onChange={(e) => setRuleForm({ ...ruleForm, facetCategory: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none" />
              <select value={ruleForm.maxAccessLevel} onChange={(e) => setRuleForm({ ...ruleForm, maxAccessLevel: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none">
                <option value="hidden">Hidden</option>
                <option value="denied">Denied</option>
                <option value="existence">Existence only</option>
                <option value="summary">Summary only</option>
              </select>
            </div>
            <button type="button" onClick={handleAddRule} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500">Save Rule</button>
          </div>
        )}

        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">{rule.description}</p>
                <p className="mt-0.5 text-xs text-zinc-500">Category: <span className="text-amber-400">{rule.facetCategory}</span> — Max: <span className="text-amber-400">{rule.maxAccessLevel}</span></p>
              </div>
            </div>
          ))}
          {rules.length === 0 && <p className="text-sm text-zinc-600">No constitutional rules defined.</p>}
        </div>
      </section>

      {/* Consent Policies */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Consent Policies</h2>
          </div>
          <button type="button" onClick={() => setShowAddPolicy(!showAddPolicy)} className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500">
            <Plus className="h-3 w-3" /> Add Policy
          </button>
        </div>

        {showAddPolicy && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Category" value={policyForm.facetCategory} onChange={(e) => setPolicyForm({ ...policyForm, facetCategory: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none" />
              <input placeholder="Provider ID (optional, blank = all)" value={policyForm.grantedTo} onChange={(e) => setPolicyForm({ ...policyForm, grantedTo: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none" />
              <select value={policyForm.accessLevel} onChange={(e) => setPolicyForm({ ...policyForm, accessLevel: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none">
                <option value="full">Full</option>
                <option value="summary">Summary</option>
                <option value="existence">Existence only</option>
                <option value="denied">Denied</option>
                <option value="hidden">Hidden</option>
              </select>
              <select value={policyForm.duration} onChange={(e) => setPolicyForm({ ...policyForm, duration: e.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none">
                <option value="session">Session</option>
                <option value="persistent">Persistent</option>
                <option value="time-limited">Time limited</option>
              </select>
            </div>
            <button type="button" onClick={handleAddPolicy} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">Save Policy</button>
          </div>
        )}

        <div className="space-y-2">
          {policies.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
              <div>
                <p className="text-sm text-zinc-200">
                  <span className="text-purple-400">{p.facetCategory}</span>
                  {' → '}
                  <span className="font-medium">{p.accessLevel}</span>
                  {p.grantedTo && <span className="text-zinc-500"> for {p.grantedTo}</span>}
                </p>
                <p className="text-xs text-zinc-600">{p.duration}</p>
              </div>
            </div>
          ))}
          {policies.length === 0 && <p className="text-sm text-zinc-600">No consent policies defined.</p>}
        </div>
      </section>
    </div>
  );
}
