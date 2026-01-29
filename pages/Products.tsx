
import React, { useState, useEffect } from 'react';
import { Product, User, UserRole } from '../types';
import { getStore, updateProducts } from '../services/store';

const Products: React.FC<{ user: User }> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    size: '',
    color: '',
    buyPrice: 0,
    sellPrice: 0,
    quantity: 0
  });

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    const init = async () => {
      const store = await getStore();
      setProducts(store.products || []);
    };
    init();
  }, []);

  const handleSave = () => {
    if (!formData.name || !formData.code) return alert('يرجى إدخال الاسم والكود');
    
    let newProducts = [...products];
    if (editingId) {
      newProducts = newProducts.map(p => p.id === editingId ? { ...formData, id: p.id } : p);
    } else {
      newProducts.push({ ...formData, id: Date.now().toString() });
    }
    setProducts(newProducts);
    updateProducts(newProducts);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', type: '', size: '', color: '', buyPrice: 0, sellPrice: 0, quantity: 0 });
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setFormData({ ...p });
    setEditingId(p.id);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const filtered = products.filter(p => p.id !== id);
      setProducts(filtered);
      updateProducts(filtered);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Cairo']">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">مخازن الأشوال</h1>
          <p className="text-slate-500 font-bold">إدارة البضاعة بالتفصيل (الكود، النوع، الحجم، السعر)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
          <input 
            type="text" 
            placeholder="بحث بالكود أو الاسم أو النوع..." 
            className="px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 outline-none focus:border-indigo-600 font-bold w-full sm:w-80 shadow-sm transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 font-black flex items-center justify-center gap-3 whitespace-nowrap"
            >
              <span>➕</span> إضافة صنف جديد
            </button>
          )}
        </div>
      </div>

      {/* Stats for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
             <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي تكلفة المخزن</p>
             <h3 className="text-3xl font-black">{products.reduce((acc, p) => acc + (p.buyPrice * p.quantity), 0).toLocaleString()} <span className="text-sm">ج.م</span></h3>
          </div>
          <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl">
             <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي قيمة البيع</p>
             <h3 className="text-3xl font-black">{products.reduce((acc, p) => acc + (p.sellPrice * p.quantity), 0).toLocaleString()} <span className="text-sm">ج.م</span></h3>
          </div>
          <div className="bg-emerald-600 text-white p-8 rounded-[2rem] shadow-xl">
             <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">صافي الأرباح المتوقعة</p>
             <h3 className="text-3xl font-black">{products.reduce((acc, p) => acc + ((p.sellPrice - p.buyPrice) * p.quantity), 0).toLocaleString()} <span className="text-sm">ج.م</span></h3>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr className="text-slate-500 font-black text-[11px] uppercase tracking-widest">
                <th className="px-6 py-6">كود / الاسم</th>
                <th className="px-4 py-6">النوع / الحجم</th>
                {isAdmin && <th className="px-4 py-6">سعر الشراء</th>}
                <th className="px-4 py-6">سعر البيع</th>
                <th className="px-4 py-6 text-center">الكمية</th>
                {isAdmin && <th className="px-4 py-6 bg-indigo-50/50 text-indigo-600">الإجمالي</th>}
                {isAdmin && <th className="px-4 py-6 bg-emerald-50/50 text-emerald-600">الربح</th>}
                <th className="px-6 py-6 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {filteredProducts.map((p) => {
                const totalItemValue = p.sellPrice * p.quantity;
                const totalItemProfit = (p.sellPrice - p.buyPrice) * p.quantity;
                
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-indigo-500 font-black">#{p.code}</span>
                        <span className="text-slate-800 text-base">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-slate-500">
                      <span className="block">{p.type || '-'}</span>
                      <span className="text-[10px] font-black text-slate-400">{p.size || '-'}</span>
                    </td>
                    {isAdmin && <td className="px-4 py-5 text-slate-400">{p.buyPrice} ج.م</td>}
                    <td className="px-4 py-5 text-slate-900 font-black">{p.sellPrice} ج.م</td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-black ${p.quantity < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-5 font-black text-indigo-700 bg-indigo-50/20">
                        {totalItemValue.toLocaleString()} ج.م
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-4 py-5 font-black text-emerald-600 bg-emerald-50/20">
                        {totalItemProfit.toLocaleString()} ج.م
                      </td>
                    )}
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isAdmin ? (
                          <>
                            <button onClick={() => handleEdit(p)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">📝</button>
                            <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-black">عرض فقط</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[500]">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900">{editingId ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزن'}</h2>
              <button onClick={() => setShowAddModal(false)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 text-xl transition-all">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">كود الصنف</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="P-101" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">اسم المنتج</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثلاً: جوتن مط" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">النوع</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="بلاستيك / زيت" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الحجم</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="جالون / بستلة" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-red-400 uppercase tracking-widest mr-2">سعر الشراء</label>
                <input type="number" className="w-full bg-red-50 border-2 border-red-100 p-5 rounded-2xl focus:border-red-600 outline-none transition-all font-black text-xl text-red-700" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-600 uppercase tracking-widest mr-2">سعر البيع</label>
                <input type="number" className="w-full bg-emerald-50 border-2 border-emerald-100 p-5 rounded-2xl focus:border-emerald-600 outline-none transition-all font-black text-xl text-emerald-700" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الكمية بالمخزن</label>
                <input type="number" className="w-full bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl focus:border-indigo-600 outline-none transition-all font-black text-3xl text-white text-center" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
              </div>
            </div>
            
            <div className="mt-12 flex gap-4">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all">حفظ البيانات</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-3xl font-bold hover:bg-slate-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
