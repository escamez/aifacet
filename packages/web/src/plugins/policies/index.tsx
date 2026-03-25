import { Shield } from 'lucide-react';
import { Route } from 'react-router-dom';
import { registerPlugin } from '../registry/index.js';
import { PoliciesPage } from './pages/policies-page.js';

registerPlugin({
  id: 'policies',
  label: 'Consent',
  basePath: '/consent',
  icon: Shield,
  navItems: [{ label: 'Consent', path: '/consent', icon: Shield }],
  routes: <Route path="consent" element={<PoliciesPage />} />,
});
