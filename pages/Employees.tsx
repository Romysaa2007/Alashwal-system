
import React, { useState, useEffect } from 'react';
import { User, UserRole, SalaryRecord } from '../types';
import { getStore, updateEmployees, addSalaryRecord } from '../services/store';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [payModal, setPayModal] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: UserRole.EMPLOYEE, baseSalary: 3000 });
  const [salaryData, setSalaryData] = useState({ bonus: 0, deductions: 0 });

  // Fix: Wrapped getStore() call in an async function inside useEffect and awaited it
  useEffect(() => {
    const fetchData = async () => {
      const store = await getStore();
      setEmployees(store.employees);
      setSalaries(store.salaries);
    };
    fetchData();
  }, []);

  const handleSave = () => {
    if (!formData.email) return;
    const newEmployees = [...employees, { ...formData, id: Date.now().toString() }];
    setEmployees(newEmployees);
    updateEmployees(newEmployees);
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', role: UserRole.EMPLOYEE, baseSalary: 3000 });
  };

  const handlePaySalary = () => {
    if (!payModal) return;
    const record: SalaryRecord = {
      id: Date.now().toString(),
      employeeId: payModal.id,
      month: new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }),
      amount: payModal.baseSalary,
      bonus: salaryData.bonus,
      deductions: salaryData.deductions,
      date: new Date().toISOString()
    };
    addSalaryRecord(record);
    setSalaries([...salaries, record]);
    setPayModal(null);
    setSalaryData({ bonus: 0, deductions: 0 });
    alert(`تم صرف مرتب ${payModal.name} بنجاح`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">الموظفين والمرتبات</h1>
          <p className="text-slate-500 font-bold">إدارة شؤون العاملين والرواتب الشهرية</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl">➕ موظف جديد</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employees List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50">
             <h3 className="font-black text-slate-800">قائمة الموظفين</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {employees.map(emp => (
              <div key={emp.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h4 className="font-black text-slate-800">{emp.name}</h4>
                    <p className="text-xs text-slate-400 font-bold">{emp.role === UserRole.ADMIN ? 'مدير' : 'موظف مبيعات'} • {emp.baseSalary} ج.م</p>
                  </div>
                </div>
                <button onClick={() => setPayModal(emp)} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all">💰 صرف راتب</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Salaries */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50">
             <h3 className="font-black text-slate-800">أحدث الرواتب المصروفة</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
                {salaries.slice(-5).reverse().map(s => {
                    const emp = employees.find(e => e.id === s.employeeId);
                    const net = s.amount + s.bonus - s.deductions;
                    return (
                        <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-black text-slate-800 text-sm">{emp?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{s.month}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-indigo-600">{net} ج.م</p>
                                <p className="text-[9px] text-slate-400">بتاريخ {new Date(s.date).toLocaleDateString('ar-EG')}</p>
                            </div>
                        </div>
                    );
                })}
                {salaries.length === 0 && <p className="text-center text-slate-400 py-10 font-bold">لا يوجد سجل مرتبات حتى الآن</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Salary Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[400]">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-black mb-2">صرف راتب شهر {new Date().getMonth() + 1}</h2>
            <p className="text-slate-500 mb-6 font-bold">للموظف: {payModal.name}</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                 <p className="text-xs font-bold text-slate-400 uppercase">الراتب الأساسي</p>
                 <p className="text-xl font-black">{payModal.baseSalary} ج.م</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-emerald-600 block mr-1 mb-1">حوافز/مكافآت (+)</label>
                    <input type="number" className="w-full p-4 border-2 border-slate-100 rounded-xl" value={salaryData.bonus} onChange={e => setSalaryData({...salaryData, bonus: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-red-600 block mr-1 mb-1">خصومات (-)</label>
                    <input type="number" className="w-full p-4 border-2 border-slate-100 rounded-xl" value={salaryData.deductions} onChange={e => setSalaryData({...salaryData, deductions: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="p-6 bg-indigo-50 rounded-[1.5rem] border-2 border-indigo-100 text-center">
                 <p className="text-xs font-black text-indigo-400 mb-1 uppercase">صافي الراتب المستحق</p>
                 <p className="text-4xl font-black text-indigo-700">{payModal.baseSalary + salaryData.bonus - salaryData.deductions} ج.م</p>
              </div>

              <button onClick={handlePaySalary} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100">تأكيد عملية الصرف</button>
              <button onClick={() => setPayModal(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[400]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <h2 className="text-2xl font-black mb-8">إضافة موظف جديد للنظام</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="الاسم بالكامل" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="البريد الإلكتروني" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="password" placeholder="كلمة المرور" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <input type="number" placeholder="الراتب الأساسي" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} />
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none md:col-span-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                <option value={UserRole.EMPLOYEE}>موظف مبيعات</option>
                <option value={UserRole.ADMIN}>مدير نظام</option>
              </select>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg">حفظ الموظف</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;