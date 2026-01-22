import { Expense, Currency, AppData, Category } from '@/types/expense';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function convertToUSD(amount: number, currency: Currency, conversionRate: number): number {
  if (currency === '$') return amount;
  return amount / conversionRate;
}

export function convertToLL(amount: number, currency: Currency, conversionRate: number): number {
  if (currency === 'L.L.') return amount;
  return amount * conversionRate;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  conversionRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  if (toCurrency === '$') return convertToUSD(amount, fromCurrency, conversionRate);
  return convertToLL(amount, fromCurrency, conversionRate);
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === '$') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} L.L.`;
}

export function getMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

export function getExpensesForMonth(expenses: Expense[], month: string): Expense[] {
  const [year, monthNum] = month.split('-').map(Number);
  const start = startOfMonth(new Date(year, monthNum - 1));
  const end = endOfMonth(new Date(year, monthNum - 1));

  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
}

export function calculateCategoryTotals(
  expenses: Expense[],
  categories: Category[],
  conversionRate: number
): Map<string, { consumed: number; allowed: number | null; category: Category }> {
  const totals = new Map<string, { consumed: number; allowed: number | null; category: Category }>();

  // initialize all categories
  categories.forEach((cat) => {
    totals.set(cat.id, { consumed: 0, allowed: cat.allowedPerMonth, category: cat });
  });

  // sum expenses
  expenses.forEach((expense) => {
    const current = totals.get(expense.categoryId);
    if (current) {
      const amountInUSD = convertToUSD(expense.price, expense.currency, conversionRate);
      current.consumed += amountInUSD;
    }
  });

  return totals;
}

export function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  return format(new Date(year, monthNum - 1), 'MMMM yyyy');
}