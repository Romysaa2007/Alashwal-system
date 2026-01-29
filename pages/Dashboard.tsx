
import React, { useEffect, useState } from 'react';
import { getStore } from '../services/store';
import { AppState, User, UserRole } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [data, setData] = useState<AppState | null>(null);

  const refreshDashboard = async () => {
    const store = await getStore();
    setData(store);
  };

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 30000); 
    window.addEventListener('focus', refreshDashboard);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshDashboard);
    };
  }, []);

  if (!data) return null;

  const isAdmin = user.role === UserRole.ADMIN;
  const todayStr = new Date().toDateString();
  
  // 🛡️ التأكد من وجود المصفوفات وتصفيتها من أي قيم null
  const sales = (data.sales || []).filter(Boolean);
  const products = (data.products || []).filter(Boolean);
  const customers = (data.customers || []).filter(Boolean);

  const salesToday = sales.filter(s => s && s.date && new Date(s.date).toDateString() === todayStr);
  const totalSalesToday = salesToday.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  
  const totalProfitToday = salesToday.reduce((totalAcc, sale) => {
    if (!sale) return totalAcc;
    const items = sale.items || [];
    const saleProfit = items.reduce((itemAcc, item) => {
      if (!item) return itemAcc;
      const profitPerUnit = (item.sellPrice || 0) - (item.buyPriceAtSale || 0);
      return itemAcc + (profitPerUnit * (item.quantity || 0));
    }, 0);
    return totalAcc + saleProfit;
  }, 0);

  const totalDebt = customers.reduce((acc, c) => acc + (c?.totalDebt || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">مرحباً بك، {user.name}</h1>
            <p className="text-indigo-200 font-bold text-lg opacity-80">نظام الأشوال المتصل بالسحاب | {isAdmin ? 'صلاحية مدير' : 'صلاحية موظف'}</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
             <div className="bg-emerald-500/20 text-emerald-400 px-6 py-3 rounded-2xl border border-emerald-500/30 font-black text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                مزامنة البيانات نشطة
             </div>
             <p className="text-slate-400 font-bold">{new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Link to="/sales" className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-lg shadow-indigo-600/20 flex flex-col items-center gap-3 hover:scale-105 transition-all">
            <span className="text-3xl">💰</span>
            <span className="font-black text-sm">عملية بيع</span>
         </Link>
         <Link to="/products" className="bg-white text-slate-800 p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center gap-3 hover:scale-105 transition-all">
            <span className="text-3xl">📦</span>
            <span className="font-black text-sm">المخزن</span>
         </Link>
         <Link to="/customers" className="bg-white text-slate-800 p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center gap-3 hover:scale-105 transition-all">
            <span className="text-3xl">👥</span>
            <span className="font-black text-sm">العملاء</span>
         </Link>
         {isAdmin && (
           <Link to="/reports" className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition-all">
              <span className="text-3xl">📈</span>
              <span className="font-black text-sm">الأرباح</span>
           </Link>
         )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="مبيعات اليوم" value={`${totalSalesToday.toLocaleString()} ج.م`} icon="💵" color="bg-emerald-500" />
        <StatCard label="نواقص المخزن" value={products.filter(p => p && p.quantity < 5).length} icon="📦" color="bg-orange-500" />
        <StatCard label="إجمالي الديون" value={`${totalDebt.toLocaleString()} ج.م`} icon="📉" color="bg-red-500" />
        {isAdmin && (
          <StatCard label="أرباح اليوم" value={`${totalProfitToday.toLocaleString()} ج.م`} icon="💎" color="bg-blue-600" />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900">أحدث فواتير البيع</h3>
          <Link to="/reports" className="text-indigo-600 font-bold text-sm hover:underline">عرض الكل ←</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales.slice(-6).reverse().map((s, i) => (
            <div key={i} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">🧾</div>
               <div className="flex-1">
                  <p className="font-black text-slate-800 text-sm">#{s.invoiceNumber} - {s.customerName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(s.date).toLocaleTimeString('ar-EG')}</p>
               </div>
               <p className="font-black text-emerald-600">+{s.totalAmount}</p>
            </div>
          ))}
          {sales.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-bold">لا توجد مبيعات مسجلة اليوم</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div>
      <p className="text-slate-400 text-xs font-black mb-2 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
    <div className={`${color} w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-lg text-white`}>{icon}</div>
  </div>
);

export default Dashboard;
