
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  baseSalary: number;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  amount: number;
  bonus: number;
  deductions: number;
  date: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  type: string;
  size: string;
  color: string; // الحقل المضاف
  buyPrice: number;
  sellPrice: number;
  quantity: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  company: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
  transactions: {
    id: string;
    date: string;
    amount: number;
    type: 'DEBT' | 'PAYMENT';
    note: string;
  }[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  sellPrice: number;
  buyPriceAtSale: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: number;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  customerId?: string;
  customerName?: string;
  employeeId: string;
  employeeName: string;
}

export interface AppState {
  currentUser: User | null;
  products: Product[];
  suppliers: Supplier[];
  employees: User[];
  sales: Sale[];
  customers: Customer[];
  salaries: SalaryRecord[];
  lastInvoiceNumber: number;
}
