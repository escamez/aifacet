import { LayoutDashboard } from 'lucide-react';
import { Route } from 'react-router-dom';
import { registerPlugin } from '../registry/index.js';
import { DashboardPage } from './pages/dashboard-page.js';

registerPlugin({
  id: 'dashboard',
  label: 'Dashboard',
  basePath: '/',
  icon: LayoutDashboard,
  navItems: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }],
  routes: <Route index element={<DashboardPage />} />,
});
