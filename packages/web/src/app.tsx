import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Shell } from './components/layout/shell.js';
import { getPlugins } from './plugins/registry/index.js';

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
