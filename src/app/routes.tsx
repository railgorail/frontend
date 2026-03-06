import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Fleet } from './pages/Fleet';
import { VehicleDetail } from './pages/VehicleDetail';
import { Diagnostics } from './pages/Diagnostics';
import { Incidents } from './pages/Incidents';

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full p-12 text-center">
      <div>
        <div className="text-slate-600 text-6xl font-bold mb-4">404</div>
        <p className="text-slate-400 text-sm">Страница не найдена</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'fleet', Component: Fleet },
      { path: 'fleet/:id', Component: VehicleDetail },
      { path: 'diagnostics', Component: Diagnostics },
      { path: 'diagnostics/new', Component: Diagnostics },
      { path: 'incidents', Component: Incidents },
      { path: '*', Component: NotFound },
    ],
  },
]);
