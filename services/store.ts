
import { AppState, Product, Supplier, User, UserRole, Sale, Customer, SalaryRecord } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDL2ua-jKvAiYHj0J8E0-9_mhPk8YZ3QHQ", 
  databaseURL: "https://alashwal-system-default-rtdb.firebaseio.com",
  projectId: "alashwal-system",
  appId: "1:161940375187:web:448863bbb2793dcc83ef66"
};

const STORAGE_KEY = 'alashwal_local_backup';
const CLOUD_URL = `${firebaseConfig.databaseURL.replace(/\/$/, '')}/store.json`;

const isFirebaseReady = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== "ضع_هنا_الـ_apiKey" && 
         firebaseConfig.databaseURL.includes("https://");
};

const initialData: AppState = {
  currentUser: null,
  products: [],
  suppliers: [],
  employees: [
    { 
      id: '1', 
      name: 'Mahmoud Alashwal', 
      email: 'admin@alashwal.com', 
      role: UserRole.ADMIN, 
      password: '123',
      baseSalary: 0 
    }
  ],
  sales: [],
  customers: [],
  salaries: [],
  lastInvoiceNumber: 0
};

// دالة تنظيف البيانات لمنع الـ Null Errors
const cleanArray = (arr: any[] | undefined | null) => (arr || []).filter(item => item !== null && typeof item === 'object');

export const getStore = async (): Promise<AppState> => {
  let rawData: any = null;

  if (isFirebaseReady()) {
    try {
      const response = await fetch(CLOUD_URL);
      if (response.ok) {
        rawData = await response.json();
      }
    } catch (e) {
      console.warn("جاري استخدام الذاكرة المحلية (أوفلاين)");
    }
  }

  if (!rawData) {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        rawData = JSON.parse(localData);
      } catch (e) {
        console.error("فشل قراءة البيانات المحلية.");
      }
    }
  }

  const finalData: AppState = {
    ...initialData,
    ...rawData,
    products: cleanArray(rawData?.products),
    sales: cleanArray(rawData?.sales),
    customers: cleanArray(rawData?.customers).map((c: any) => ({
      ...c,
      totalDebt: c.totalDebt || 0,
      transactions: cleanArray(c.transactions)
    })),
    employees: rawData?.employees ? cleanArray(rawData.employees) : initialData.employees,
    suppliers: cleanArray(rawData?.suppliers),
    salaries: cleanArray(rawData?.salaries),
    lastInvoiceNumber: rawData?.lastInvoiceNumber || 0
  };

  return finalData;
};

export const saveStore = async (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (isFirebaseReady()) {
    try {
      await fetch(CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
    } catch (e) {
      console.error("فشل الحفظ في السحاب.");
    }
  }
};

export const updateProducts = async (products: Product[]) => {
  const store = await getStore();
  store.products = products;
  await saveStore(store);
};

export const updateSuppliers = async (suppliers: Supplier[]) => {
  const store = await getStore();
  store.suppliers = suppliers;
  await saveStore(store);
};

export const addSale = async (sale: Sale) => {
  const store = await getStore();
  store.lastInvoiceNumber += 1;
  sale.invoiceNumber = store.lastInvoiceNumber;
  store.sales.push(sale);
  
  sale.items.forEach(item => {
    const p = store.products.find(prod => prod && prod.id === item.productId);
    if (p) p.quantity -= item.quantity;
  });

  if (sale.debtAmount > 0) {
    let cust = store.customers.find(c => c && c.name === sale.customerName);
    if (!cust) {
      cust = { id: 'c_'+Date.now(), name: sale.customerName || 'عميل آجل', phone: '', totalDebt: 0, transactions: [] };
      store.customers.push(cust);
    }
    cust.totalDebt += sale.debtAmount;
    cust.transactions.push({
      id: 't_'+Date.now(), date: sale.date, amount: sale.debtAmount, type: 'DEBT', note: `فاتورة #${sale.invoiceNumber}`
    });
  }
  await saveStore(store);
};

export const updateCustomers = async (customers: Customer[]) => {
  const store = await getStore();
  store.customers = customers;
  await saveStore(store);
};

export const updateEmployees = async (employees: User[]) => {
  const store = await getStore();
  store.employees = employees;
  await saveStore(store);
};

export const addSalaryRecord = async (record: SalaryRecord) => {
  const store = await getStore();
  store.salaries.push(record);
  await saveStore(store);
};
