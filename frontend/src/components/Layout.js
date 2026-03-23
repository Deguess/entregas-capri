import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MapPin, Package, Users, Route, FileText, LayoutDashboard, ListChecks } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/pedidos', icon: Package, label: 'Pedidos/Fichas' },
    { path: '/motoboys', icon: Users, label: 'Motoboys' },
    { path: '/rotas', icon: Route, label: 'Otimização' },
    { path: '/atribuir', icon: ListChecks, label: 'Atribuir' },
    { path: '/historico', icon: FileText, label: 'Histórico' },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 fixed left-0 top-0 flex flex-col z-50">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">Delivery</h1>
              <p className="text-xs text-zinc-400">Command Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\/| /g, '-')}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
            <p className="text-xs text-zinc-400 mb-1">Ponto Inicial</p>
            <p className="text-xs font-mono text-zinc-300">Rua N. S. das Mercês, 876</p>
            <p className="text-xs font-mono text-zinc-500">Vila das Merces - SP</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
