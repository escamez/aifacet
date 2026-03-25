import { ArrowLeftRight } from 'lucide-react';
import { Route } from 'react-router-dom';
import { registerPlugin } from '../registry/index.js';
import { ImportExportPage } from './pages/import-export-page.js';

registerPlugin({
  id: 'import-export',
  label: 'Import/Export',
  basePath: '/transfer',
  icon: ArrowLeftRight,
  navItems: [{ label: 'Import / Export', path: '/transfer', icon: ArrowLeftRight }],
  routes: <Route path="transfer" element={<ImportExportPage />} />,
});
