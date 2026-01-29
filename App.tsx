
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getStore, saveStore } from './services/store';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Employees from './pages/Employees';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const initApp = async () => {
      const store = await getStore();
      if (store.currentUser) {
        setCurrentUser(store.currentUser);
      }
      setLoading(false);
    };

    initApp();

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    const store = await getStore();
    store.currentUser = user;
    await saveStore(store);
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    const store = await getStore();
    store.currentUser = null;
    await saveStore(store);
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-900 text-white">
      <div className="relative">
        <div className="text-7xl animate-bounce mb-4">🧱</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full blur-sm animate-pulse"></div>
      </div>
      <p className="text-xl font-black tracking-widest mt-6">جاري مزامنة بيانات "الأشوال" ..</p>
      <div className="mt-4 flex gap-2">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping delay-75"></span>
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping delay-150"></span>
      </div>
    </div>
  );

  return (
    <Router>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-[10px] py-1 text-center z-[9999] font-black uppercase tracking-widest">
           ⚠️ أنت تعمل الآن بدون إنترنت - لن تظهر التعديلات عند المدير حتى يعود الاتصال
        </div>
      )}
      {!currentUser ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <Layout user={currentUser} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route path="/sales" element={<Sales user={currentUser} />} />
            <Route path="/products" element={<Products user={currentUser} />} />
            <Route path="/customers" element={<Customers />} />
            {currentUser.role === UserRole.ADMIN && (
              <>
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/reports" element={<Reports />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App;
