export type Currency = '$' | 'L.L.';

export interface Expense {
  id: string;
  title: string;
  price: number;
  currency: Currency;
  categoryId: string;
  date: string; // yyyy-mm-dd
  isMonthlyPayment?: boolean; // default to false
  monthlyExpenseId?: string;
  accountId: string;
}
// expense interface for imported data
// differs in few optional keys
export interface ImportedExpense {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  price: number;
  currency: Currency;
  category: string;
  isMonthlyPayment?: boolean;
  account?: string; // optional, not used for mapping
}

export interface Income {
  id: string;
  title?: string;
  amount: number;
  currency: Currency;
  date: string; // yyyy-mm-dd
  accountId: string; // wont be used to link with acc
}
export interface ImportedIncome {
  id: string;
  title?: string;
  amount: number;
  currency: Currency;
  date: string; // yyyy-mm-dd
  accountName?: string; // wont be used to link with acc
}

export interface Category {
  id: string;
  name: string;
  allowedPerMonth: number | null; // null means no limit
}

export interface Account {
  id: string;
  name: string;
  balances: Partial<Record<Currency, number>>; // stores balances for supported currencies
  supportedCurrencies: Currency[]; // array of currencies this account supports
}

export interface MonthlyExpense {
  id: string;
  title: string;
  price: number;
  currency: Currency;
  categoryId: string;
  // accountId will be selected at payment time, then new Expense is created
}

export interface MonthlyPaymentStatus {
  monthlyExpenseId: string;
  month: string; // YYYY-MM
  expenseId: string; // filled on payment
}

export interface AppConfig {
  conversionRate: number; // $ to LL
}

export interface AppData {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  monthlyExpenses: MonthlyExpense[];
  monthlyPaymentStatuses: MonthlyPaymentStatus[];
  incomes: Income[];
  config: AppConfig;
}

export interface ImportedAppData {
  expenses: ImportedExpense[];
  accounts: Account[];
  categories: Category[];
  monthlyExpenses: MonthlyExpense[];
  incomes: Income[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'misc', name: 'Misc', allowedPerMonth: null },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'cash', name: 'Cash', balances: { '$': 0, 'L.L.': 0 }, supportedCurrencies: ['$', 'L.L.'] },
  { id: 'bank', name: 'Bank Account', balances: { '$': 0, 'L.L.': 0 }, supportedCurrencies: ['$', 'L.L.'] },
];

export const DEFAULT_CONFIG: AppConfig = {
  conversionRate: 89000,
};

export const DEFAULT_APP_DATA: AppData = {
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  accounts: DEFAULT_ACCOUNTS,
  monthlyExpenses: [],
  monthlyPaymentStatuses: [],
  incomes: [],
  config: DEFAULT_CONFIG,
};