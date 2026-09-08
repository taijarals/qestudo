import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Library, PenTool, BarChart2, BookOpen, Settings, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Library, label: 'Materiais', path: '/materiais' },
  { icon: PenTool, label: 'Estudar', path: '/estudar' },
  { icon: BarChart2, label: 'Desempenho', path: '/desempenho' },
  { icon: BookOpen, label: 'Caderno de erros', path: '/erros' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">QEstudo</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold">
            T
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Taijara</p>
            <p className="text-xs text-slate-400 truncate">Ver perfil</p>
          </div>
        </div>
        <button className="flex items-center space-x-3 px-4 py-2 mt-2 text-sm font-medium text-slate-400 hover:text-white transition-colors w-full">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
