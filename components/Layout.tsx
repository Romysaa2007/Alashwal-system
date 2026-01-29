
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = user.role === UserRole.ADMIN;

  const mainItems = [
    { path: '/', label: 'لوحة التحكم', icon: '📊' },
    { path: '/sales', label: 'كاشير المبيعات', icon: '💰' },
    { path: '/products', label: 'إدارة المخزن', icon: '📦' },
    { path: '/customers', label: 'حسابات العملاء', icon: '👥' },
  ];

  const adminItems = [
    { path: '/suppliers', label: 'سجل الموردين', icon: '🚛' },
    { path: '/employees', label: 'الموظفين والرواتب', icon: '💳' },
    { path: '/reports', label: 'التقارير المالية', icon: '📈' },
  ];

  const NavLink: React.FC<{ item: typeof mainItems[0] }> = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
          isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          {item.icon}
        </span>
        <span className="font-bold text-sm tracking-wide">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-['Cairo'] antialiased">
      <aside className="hidden md:flex flex-col w-72 bg-slate-950 text-white sticky top-0 h-screen shadow-2xl z-50">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">🧱</div>
            <div>
              <h1 className="text-xl font-black tracking-tight">الأشوال</h1>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Cloud Connected</p>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
          <div>
            <p className="px-5 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">القائمة</p>
            <div className="space-y-1.5">
              {mainItems.map((item) => <NavLink key={item.path} item={item} />)}
              {isAdmin && adminItems.map((item) => <NavLink key={item.path} item={item} />)}
            </div>
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-900/50 rounded-3xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-sm border border-indigo-500/20">👤</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold">{isAdmin ? 'مدير النظام' : 'كاشير'}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all duration-300 font-black text-[11px]">🚪 تسجيل الخروج</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-100 p-5 sticky top-0 z-[60] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm text-white">🧱</div>
            <h1 className="text-lg font-black text-slate-900">الأشوال</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">☰</button>
        </header>
        
        <div className="p-5 md:p-10 lg:p-14 max-w-[1600px] mx-auto min-h-screen">
          {children}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-slate-950 shadow-2xl p-8 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">🧱</div>
                <h2 className="text-xl font-black text-white">الأشوال</h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 bg-white/5 rounded-xl text-white">✕</button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {mainItems.map((item) => <NavLink key={item.path} item={item} />)}
              {isAdmin && adminItems.map((item) => <NavLink key={item.path} item={item} />)}
            </nav>
            <button onClick={onLogout} className="mt-auto p-5 bg-red-500/10 text-red-500 rounded-2xl font-black text-center">🚪 خروج</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
