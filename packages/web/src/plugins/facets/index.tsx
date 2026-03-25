import { FileText } from 'lucide-react';
import { Route } from 'react-router-dom';
import { registerPlugin } from '../registry/index.js';
import { FacetsPage } from './pages/facets-page.js';

registerPlugin({
  id: 'facets',
  label: 'Facets',
  basePath: '/facets',
  icon: FileText,
  navItems: [{ label: 'Facets', path: '/facets', icon: FileText }],
  routes: <Route path="facets" element={<FacetsPage />} />,
});
