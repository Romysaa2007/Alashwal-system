
import React, { useState, useEffect } from 'react';
import { Product, SaleItem, User, Sale, Customer } from '../types';
import { getStore, addSale } from '../services/store';

const Sales: React.FC<{ user: User }> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [nextInvoiceNum, setNextInvoiceNum] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const store = await getStore();
      setProducts(store.products);
      setCustomers(store.customers);
      setNextInvoiceNum(store.lastInvoiceNumber + 1);
    };
    init();
  }, []);

  const refreshData = async () => {
    const store = await getStore();
    setProducts(store.products);
    setCustomers(store.customers);
    setNextInvoiceNum(store.lastInvoiceNumber + 1);
  };

  const addToCart = (p: Product) => {
    if (p.quantity <= 0) return alert('هذا الصنف خلص من المخزن!');
    const existing = cart.find(item => item.productId === p.id);
    if (existing) {
      if (existing.quantity >= p.quantity) return alert('الكمية المتاحة لا تكفي');
      setCart(cart.map(item => item.productId === p.id 
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellPrice }
        : item
      ));
    } else {
      setCart([...cart, { 
        productId: p.id, productName: p.name, quantity: 1, 
        sellPrice: p.sellPrice, buyPriceAtSale: p.buyPrice, total: p.sellPrice 
      }]);
    }
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);
  const debtAmount = Math.max(0, totalAmount - (paidAmount === '' ? totalAmount : Number(paidAmount)));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (debtAmount > 0 && !manualCustomerName) return alert('لازم تكتب اسم العميل عشان نسجل الدين عليه');
    
    setIsProcessing(true);
    try {
      const newSale: Sale = {
        id: Date.now().toString(),
        invoiceNumber: nextInvoiceNum,
        date: new Date().toISOString(),
        items: [...cart],
        totalAmount,
        paidAmount: paidAmount === '' ? totalAmount : Number(paidAmount),
        debtAmount,
        customerName: manualCustomerName || 'عميل نقدي',
        employeeId: user.id,
        employeeName: user.name
      };

      await addSale(newSale);
      setLastSale(newSale);
      setShowPreview(true);
      setCart([]);
      setPaidAmount('');
      setManualCustomerName('');
      await refreshData();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* واجهة البيع - تختفي عند الطباعة */}
      <div className={`flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] print:hidden ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-black text-slate-800">كاشير المبيعات</h2>
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الكود..." 
              className="w-full md:w-80 px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto flex-1 pb-4">
            {products.filter(p => p.name.includes(searchTerm) || p.code.includes(searchTerm)).map(p => (
              <button key={p.id} onClick={() => addToCart(p)} disabled={p.quantity <= 0} className="p-6 bg-white rounded-[2rem] border border-slate-100 text-right hover:border-indigo-600 transition-all hover:shadow-xl group">
                <p className="text-[10px] text-slate-300">#{p.code}</p>
                <h4 className="font-black text-slate-800 text-lg mb-1 truncate">{p.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-600 font-black text-xl">{p.sellPrice} ج.م</span>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">➕</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* سلة المشتريات */}
        <div className="w-full lg:w-[420px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b bg-slate-50 flex justify-between items-center"><h3 className="font-black text-slate-800">فاتورة جديدة</h3></div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex-1"><p className="font-black text-slate-800 text-sm">{item.productName}</p></div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-indigo-600">{item.total}</span>
                  <button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="text-red-400 font-bold p-2">✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t bg-slate-50 space-y-4">
            <input type="text" placeholder="اسم العميل..." className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold" value={manualCustomerName} onChange={e => setManualCustomerName(e.target.value)} />
            <div className="bg-white p-4 rounded-2xl border shadow-inner">
               <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500">الإجمالي:</span>
                  <span className="text-2xl font-black">{totalAmount} ج.م</span>
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-black text-emerald-600">المبلغ المدفوع:</label>
                  <input type="number" className="w-full p-4 bg-emerald-50 border-2 border-emerald-100 rounded-xl text-center font-black text-2xl outline-none" value={paidAmount} onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))} />
               </div>
               {debtAmount > 0 && (
                 <div className="mt-3 flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-100 animate-pulse">
                    <span className="text-sm font-black text-red-600">المتبقي (دين):</span>
                    <span className="text-xl font-black text-red-700">{debtAmount} ج.م</span>
                 </div>
               )}
            </div>
            <button onClick={handleCheckout} className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl shadow-xl transition-all text-xl hover:bg-indigo-600" disabled={cart.length === 0 || isProcessing}>
              {isProcessing ? 'جاري الحفظ...' : '💾 حفظ وطباعة'}
            </button>
          </div>
        </div>
      </div>

      {/* معاينة الفاتورة قبل الطباعة */}
      {showPreview && lastSale && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center z-[2000] p-4 overflow-y-auto print:bg-white print:p-0 print:static">
          <div className="flex flex-col items-center gap-6 w-full max-w-xl print:max-w-none print:w-full">
            
            {/* أزرار التحكم - تختفي عند الطباعة */}
            <div className="flex gap-4 w-full print:hidden">
                <button onClick={handlePrint} className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-3">
                    🖨️ اطباعة الفاتورة الآن
                </button>
                <button onClick={() => setShowPreview(false)} className="bg-white/10 text-white px-8 py-5 rounded-2xl font-black border border-white/20">
                    إغلاق
                </button>
            </div>

            {/* الفاتورة الفعلية - هي دي اللي بتطبع */}
            <div id="invoice-print-area" className="bg-white p-8 w-full shadow-2xl print:shadow-none print:border-0 print:p-4 text-right" dir="rtl">
                <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-6">
                    <h1 className="text-3xl font-black text-slate-900">الأشوال للدهانات</h1>
                    <p className="text-sm font-bold text-slate-500 mt-">محافظه الغربيه, مركز طنطا, قريه شبرا - رقم التليفون: 01228836919</p>
                    <div className="mt-4 flex justify-between items-center px-4">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-black">فاتورة مبيعات</span>
                        <span className="text-xs font-bold text-slate-500">{new Date(lastSale.date).toLocaleString('ar-EG')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-4">
                    <p className="text-sm font-bold">رقم الفاتورة: <span className="font-black">#{lastSale.invoiceNumber}</span></p>
                    <p className="text-sm font-bold text-left">العميل: <span className="font-black">{lastSale.customerName}</span></p>
                </div>

                <table className="w-full text-sm mb-8">
                    <thead className="border-b-2 border-slate-900">
                        <tr>
                            <th className="py-2 text-right">الصنف</th>
                            <th className="py-2 text-center">كمية</th>
                            <th className="py-2 text-left">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {lastSale.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3 font-bold">{item.productName}</td>
                                <td className="py-3 text-center font-bold">{item.quantity}</td>
                                <td className="py-3 text-left font-black">{item.total} ج.م</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>إجمالي الحساب:</span>
                        <span className="text-2xl font-black border-b-2 border-slate-900">{lastSale.totalAmount} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center text-base text-emerald-700 font-bold">
                        <span>المبلغ المدفوع:</span>
                        <span>{lastSale.paidAmount} ج.م</span>
                    </div>

                    {/* خانة الدين - مبروزة وواضحة جداً */}
                    {lastSale.debtAmount > 0 ? (
                        <div className="border-4 border-slate-900 p-6 rounded-xl bg-slate-50">
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-black text-slate-900">المتبقي (الدين):</span>
                                <span className="text-4xl font-black text-slate-900 underline">{lastSale.debtAmount} ج.م</span>
                            </div>
                            <p className="text-center text-[10px] font-bold mt-4 uppercase tracking-widest text-slate-500">يرجى مراجعة الحساب قبل المغادرة</p>
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <p className="font-black text-emerald-700">الفاتورة خالصة - شكراً لتعاملكم معنا</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center border-t border-dashed pt-6">
                    <p className="text-xs font-black text-slate-400">مع تحيات إدارة الأشوال</p>
                    <p className="text-[10px] text-slate-300">نظام إدارة المبيعات v2.0</p>
                </div>
            </div>
            
            <button onClick={() => setShowPreview(false)} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black print:hidden">
               العودة للكاشير ↩️
            </button>
          </div>
        </div>
      )}

      {/* تنسيقات الطباعة الإلزامية */}
      <style>{`
        @media print {
          /* إخفاء كل شيء في الصفحة */
          body * { 
            visibility: hidden !important; 
          }
          /* إظهار منطقة الفاتورة فقط */
          #invoice-print-area, #invoice-print-area * { 
            visibility: visible !important; 
          }
          /* تثبيت الفاتورة في أعلى الصفحة عند الطباعة */
          #invoice-print-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            margin: 0 !important;
            padding: 10px !important;
            border: none !important;
          }
          /* ضبط اتجاه الصفحة */
          @page {
            size: auto;
            margin: 5mm;
          }
        }
      `}</style>
    </>
  );
};

export default Sales;
