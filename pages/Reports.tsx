
import React, { useEffect, useState } from 'react';
import { getStore } from '../services/store';
import { Sale, Product } from '../types';

const Reports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // فلاتر التاريخ
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    const fetchData = async () => {
      const store = await getStore();
      setSales(store.sales);
      setProducts(store.products);
    };
    fetchData();
  }, []);

  const filteredSales = sales.filter(s => {
    const saleDate = s.date.split('T')[0];
    return saleDate >= startDate && saleDate <= endDate;
  });

  const totalSalesVolume = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = filteredSales.reduce((totalAcc, sale) => {
    const saleProfit = sale.items.reduce((itemAcc, item) => {
      const profitPerUnit = item.sellPrice - (item.buyPriceAtSale || 0);
      return itemAcc + (profitPerUnit * item.quantity);
    }, 0);
    return totalAcc + saleProfit;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">التقارير المالية</h1>
          <p className="text-slate-500 font-bold">متابعة الأرباح والمبيعات حسب التاريخ</p>
        </div>
        
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black mr-2 text-slate-400">من تاريخ</label>
              <input type="date" className="p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black mr-2 text-slate-400">إلى تاريخ</label>
              <input type="date" className="p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-8 rounded-[2.5rem] border-r-8 border-indigo-600 shadow-lg group hover:-translate-y-1 transition-all">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">إجمالي مبيعات الفترة</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{totalSalesVolume.toLocaleString()} <span className="text-base text-slate-400 font-normal">ج.م</span></h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border-r-8 border-emerald-500 shadow-lg group hover:-translate-y-1 transition-all">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">صافي أرباح الفترة</p>
          <h2 className="text-4xl font-black text-emerald-600 tracking-tight">{totalProfit.toLocaleString()} <span className="text-base text-slate-400 font-normal">ج.م</span></h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl print:hidden">
        <div className="p-8 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-black text-xl text-slate-800">سجل الفواتير للفترة المحددة</h3>
            <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black">{filteredSales.length} فاتورة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right font-bold">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b">
              <tr>
                <th className="px-8 py-5">رقم الفاتورة</th>
                <th className="px-8 py-5">التاريخ</th>
                <th className="px-8 py-5">العميل</th>
                <th className="px-8 py-5">المبلغ</th>
                <th className="px-8 py-5">الربح</th>
                <th className="px-8 py-5 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.slice().reverse().map(s => {
                const saleProfit = s.items.reduce((acc, item) => acc + (item.sellPrice - (item.buyPriceAtSale || 0)) * item.quantity, 0);
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-black text-indigo-500">#{s.invoiceNumber}</td>
                    <td className="px-8 py-5 text-sm">{new Date(s.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-8 py-5 font-black text-slate-700">{s.customerName}</td>
                    <td className="px-8 py-5 font-black">{s.totalAmount.toLocaleString()} ج.م</td>
                    <td className="px-8 py-5 text-emerald-600 font-black">+{saleProfit.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                        <button onClick={() => setSelectedSale(s)} className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all text-xs font-black shadow-lg shadow-slate-200">🖨️ عرض</button>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-black">لا توجد فواتير في هذه الفترة</td></tr>
              )}
            </tbody>
          </table>
        </div>
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

     
  

export default
