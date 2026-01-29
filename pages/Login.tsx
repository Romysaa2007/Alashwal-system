
import React, { useState } from 'react';
import { User } from '../types';
import { getStore } from '../services/store';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const store = await getStore();
    const user = store.employees.find(u => u.email === email && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-['Cairo'] bg-[#0a0f1e]">
      {/* Background Image - High Resolution Panoramic Paint Shop (Wide for Desktop) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[40s] scale-110 hover:scale-100 ease-out"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1589939705384-5185138a04b9?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* Advanced Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f1e] via-transparent to-[#0a0f1e]/40"></div>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Modern Floating Shapes for Depth */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row items-center gap-12 p-6 md:p-12">
        
        {/* Left Side: Brand Identity (Visible on Desktop) */}
        <div className="hidden md:flex flex-col flex-1 text-white space-y-6">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl border border-white/20 shadow-2xl">🎨</div>
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-4">الأشوال</h1>
            <h2 className="text-2xl font-bold text-indigo-300">نظام الإدارة السحابي v2.0</h2>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
            أهلاً بك في منصة الإدارة المتكاملة لمؤسسة الأشوال للدهانات. نظام ذكي لإدارة المخزون، المبيعات، وحسابات العملاء بأعلى دقة.
          </p>
          <div className="flex gap-4 pt-4">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
               ● Cloud Active
             </div>
             <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
               ● Secure Login
             </div>
          </div>
        </div>

        {/* Right Side: Login Form (Glassmorphism Card) */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group">
          
          {/* Form Header (Mobile Only or Centered) */}
          <div className="text-center mb-10 md:text-right">
             <div className="md:hidden text-5xl mb-6">🎨</div>
             <h3 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h3>
             <p className="text-indigo-200/50 text-xs font-bold">يرجى إدخال بيانات الوصول المعتمدة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-100 p-4 rounded-2xl text-xs font-black text-center animate-shake">
                ⚠️ {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mr-4">البريد الإلكتروني</label>
              <input
                type="email"
                required
                className="w-full bg-slate-900/40 border-2 border-white/5 p-5 rounded-3xl focus:border-indigo-500/50 focus:bg-slate-900/60 text-white outline-none transition-all font-bold placeholder:text-slate-700"
                placeholder="admin@alashwal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mr-4">كلمة المرور</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900/40 border-2 border-white/5 p-5 rounded-3xl focus:border-indigo-500/50 focus:bg-slate-900/60 text-white outline-none transition-all font-bold placeholder:text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
               دخول النظام 🛡️
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.4em]">
              Authorized Personnel Only
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default Login;
