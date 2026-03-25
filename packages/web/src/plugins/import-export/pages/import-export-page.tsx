import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { api } from '../../../lib/api.js';

export function ImportExportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImport = async (file: File) => {
    setError(null);
    setResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Support both { facets: [...] } and plain [...]
      const facets = Array.isArray(json) ? json : json.facets;
      if (!Array.isArray(facets)) {
        throw new Error('JSON must be an array of facets or { facets: [...] }');
      }

      const res = await api.importFacets(facets);
      setResult({ imported: res.imported, skipped: res.skipped });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleExport = async () => {
    const data = await api.exportContext();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aime-context.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImport(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Import & Export</h1>
        <p className="mt-1 text-sm text-zinc-500">Bulk load facets from JSON or export your context</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Import */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Import</h2>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click(); }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-zinc-700 hover:border-zinc-600'
            }`}
          >
            <Upload className="mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-400">
              Drop a JSON file here or <span className="text-blue-400">click to browse</span>
            </p>
            <p className="mt-1 text-xs text-zinc-600">Supports .json files</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />

          {result && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
              Imported {result.imported} facets. {result.skipped > 0 && `Skipped ${result.skipped}.`}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-4 rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">Expected format:</p>
            <pre className="text-xs text-zinc-500">
{`[
  {
    "category": "physical",
    "key": "height_cm",
    "value": 178
  }
]`}
            </pre>
          </div>
        </div>

        {/* Export */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Export</h2>
          </div>

          <p className="mb-6 text-sm text-zinc-400">
            Download your complete context as a JSON file. Includes all facets, policies, and constitutional rules.
          </p>

          <button
            type="button"
            onClick={handleExport}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
          >
            <Download className="h-4 w-4" />
            Export Context as JSON
          </button>
        </div>
      </div>
    </div>
  );
}
