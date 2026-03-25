import { Brain } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getPlugins } from '../../plugins/registry/index.js';

export function Sidebar() {
  const plugins = getPlugins();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-5">
        <Brain className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-semibold tracking-tight text-zinc-100">AIME</span>
        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
          alpha
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {plugins.flatMap((plugin) =>
          plugin.navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )),
        )}
      </nav>

      <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-600">
        Your context. Your control.
      </div>
    </aside>
  );
}
