
import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { getStore, updateSuppliers } from '../services/store';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', company: '' });

  // Fix: Wrapped getStore() call in an async function inside useEffect and awaited it
  useEffect(() => {
    const init = async () => {
      const store = await getStore();
      setSuppliers(store.suppliers);
    };
    init();
  }, []);

  const handleSave = () => {
    const newSuppliers = [...suppliers, { ...formData, id: Date.now().toString() }];
    setSuppliers(newSuppliers);
    updateSuppliers(newSuppliers);
    setShowModal(false);
    setFormData({ name: '', phone: '', company: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">إدارة الموردين</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all"
        >
          ➕ إضافة مورد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
            <h3 className="text-xl font-bold text-slate-800">{s.name}</h3>
            <p className="text-slate-500 mt-1">🏢 الشركة: {s.company}</p>
            <p className="text-purple-600 font-bold mt-2">📞 {s.phone}</p>
          </div>
        ))}
        {suppliers.length === 0 && <p className="col-span-full text-center text-slate-400 py-12">لم يتم إضافة موردين بعد</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">إضافة مورد جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">اسم المورد</label>
                <input type="text" className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">الشركة</label>
                <input type="text" className="w-full border p-2 rounded-lg" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">رقم الهاتف</label>
                <input type="text" className="w-full border p-2 rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={handleSave} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold">حفظ</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 py-3 rounded-lg font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;