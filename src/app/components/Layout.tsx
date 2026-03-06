import { NavLink, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard, Car, Activity, AlertTriangle,
  Bell, ChevronRight, Menu, X, Gauge
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/fleet', label: 'Автопарк', icon: Car },
  { to: '/diagnostics', label: 'Диагностика', icon: Activity },
  { to: '/incidents', label: 'Инциденты', icon: AlertTriangle },
];

function StatusBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {count}
    </span>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { incidents } = useApp();
  const location = useLocation();

  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const newIncidents = incidents.filter(i => i.status === 'new').length;

  const getBadge = (to: string) => {
    if (to === '/incidents') return <StatusBadge count={newIncidents} />;
    return null;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Дашборд';
    if (path.startsWith('/fleet/')) return 'Карточка автомобиля';
    if (path === '/fleet') return 'Автопарк';
    if (path === '/diagnostics/new') return 'Новая диагностика';
    if (path === '/diagnostics') return 'Диагностика';
    if (path === '/incidents') return 'Инциденты';
    return 'KnockWatch';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-base tracking-tight">KnockWatch</div>
          <div className="text-slate-400 text-xs">Мониторинг двигателей</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
            <span className="text-sm">{label}</span>
            {getBadge(to)}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-medium">АД</span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">Артём Денисов</div>
            <div className="text-slate-500 text-xs">Администратор</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-700/50 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col z-10">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900/80 border-b border-slate-700/50 flex items-center px-4 lg:px-6 gap-4 shrink-0 backdrop-blur-sm">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-white text-base font-medium">{getPageTitle()}</h1>
          <div className="ml-auto flex items-center gap-2">
            {activeIncidents > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 text-xs">{activeIncidents} активных инцидента</span>
              </div>
            )}
            <button className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors relative">
              <Bell size={15} />
              {newIncidents > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {newIncidents}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
