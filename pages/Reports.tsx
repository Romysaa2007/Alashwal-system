
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

      {selectedSale && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[1000] p-4 print:bg-white print:p-0 print:static">
          <div className="w-full max-w-xl flex flex-col gap-4">
            <div className="flex gap-4 print:hidden">
                <button onClick={handlePrint} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-2xl">اطبع الآن 🖨️</button>
                <button onClick={() => setSelectedSale(null)} className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black border border-white/20">إغلاق</button>
            </div>

            <div id="historical-invoice-print" className="bg-white p-10 w-full text-right print:p-4 shadow-2xl" dir="rtl">
                <div className="text-center border-b-4 border-double border-slate-900 pb-6 mb-6">
                    <h1 className="text-3xl font-black text-slate-900">الأشوال للدهانات</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1 italic uppercase tracking-widest">نسخة تاريخية من الأرشيف</p>
                </div>

                <div className="flex justify-between items-center mb-8 text-sm font-bold bg-slate-50 p-6 rounded-2xl border">
                    <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-[10px]">رقم الفاتورة</span>
                        <span className="text-lg font-black text-slate-900">#{selectedSale.invoiceNumber}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-center">
                        <span className="text-slate-400 text-[10px]">اسم العميل</span>
                        <span className="text-lg font-black text-slate-900">{selectedSale.customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                        <span className="text-slate-400 text-[10px]">التاريخ</span>
                        <span className="text-lg font-black text-slate-900">{new Date(selectedSale.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                </div>

                <table className="w-full text-sm mb-8 border-collapse">
                    <thead><tr className="border-b-2 border-slate-900"><th className="py-2 text-right">الصنف</th><th className="py-2 text-center">كمية</th><th className="py-2 text-left">الإجمالي</th></tr></thead>
                    <tbody className="font-bold divide-y">{selectedSale.items.map((item, idx) => (<tr key={idx}><td className="py-4 text-slate-800">{item.productName}</td><td className="py-4 text-center">{item.quantity}</td><td className="py-4 text-left font-black">{item.total.toLocaleString()} ج.م</td></tr>))}</tbody>
                </table>

                <div className="space-y-4 pt-6 border-t-2 border-slate-900">
                    <div className="flex justify-between items-center text-xl font-black"><span>الإجمالي النهائي:</span><span>{selectedSale.totalAmount.toLocaleString()} ج.م</span></div>
                    <div className="flex justify-between text-emerald-600 font-bold text-sm"><span>المبلغ المحصل نقداً:</span><span>{selectedSale.paidAmount.toLocaleString()} ج.م</span></div>
                    {selectedSale.debtAmount > 0 && (
                        <div className="border-4 border-black p-6 bg-slate-50 rounded-2xl flex justify-between items-center font-black mt-4">
                            <span className="text-xl">المتبقي (الدين):</span>
                            <span className="text-4xl underline">{selectedSale.debtAmount.toLocaleString()} ج.م</span>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center border-t border-dashed pt-6 opacity-30">
                    <p className="text-[10px] font-black">نظام إدارة الأشوال السحابي - تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')}</p>
                </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #historical-invoice-print, #historical-invoice-print * { visibility: visible !important; }
          #historical-invoice-print { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
