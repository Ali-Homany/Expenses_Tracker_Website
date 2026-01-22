import { useState } from 'react';
import { format } from 'date-fns';
import { ExpenseForm } from '@/components/ExpenseForm';
import { CategoryChart } from '@/components/CategoryChart';
import { MonthlyPayments } from '@/components/MonthlyPayments';
import { MonthSelector } from '@/components/MonthSelector';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, MonthlyPaymentStatus } from '@/types/expense';
import { getExpensesForMonth, getMonthKey, generateId } from '@/lib/expenseUtils';
import { Wallet, TrendingUp, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { data, setData } = useLocalStorage();
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));

  const monthExpenses = getExpensesForMonth(data.expenses, selectedMonth);
  const currentMonthKey = format(new Date(), 'yyyy-MM');

  const handleAddExpense = (expense: Expense, accountId: string) => {
    setData((prev) => {
      const updatedAccounts = prev.accounts.map(s => {
        if (s.id === accountId) {
          return {
            ...s,
            balances: {
              ...s.balances,
              [expense.currency]: (s.balances[expense.currency] || 0) - expense.price,
            },
          };
        }
        return s;
      });

      return {
        ...prev,
        expenses: [...prev.expenses, expense],
        accounts: updatedAccounts,
      };
    });
    toast.success('Expense added!');
  };

  const handlePaymentToggle = (monthlyExpenseId: string, selectedAccountId: string) => {
    const monthlyExpense = data.monthlyExpenses.find(m => m.id === monthlyExpenseId);
    if (!monthlyExpense) {
      toast.error('Monthly expense not found.');
      return;
    }

    const currentAccount = data.accounts.find(s => s.id === selectedAccountId);

    if (!currentAccount) {
      toast.error('Selected account for monthly payment not found.');
      return;
    }

    const newExpense: Expense = {
      id: generateId(),
      title: monthlyExpense.title,
      price: monthlyExpense.price,
      currency: monthlyExpense.currency,
      categoryId: monthlyExpense.categoryId,
      date: format(new Date(), 'yyyy-MM-dd'),
      isMonthlyPayment: true,
      monthlyExpenseId: monthlyExpense.id,
      accountId: selectedAccountId,
    };

    const status: MonthlyPaymentStatus = {
      monthlyExpenseId: monthlyExpense.id,
      month: currentMonthKey,
      expenseId: newExpense.id,
    };

    setData((prev) => {
      const updatedAccounts = prev.accounts.map(s => {
        if (s.id === selectedAccountId) {
          return {
            ...s,
            balances: {
              ...s.balances,
              [monthlyExpense.currency]: (s.balances[monthlyExpense.currency] || 0) - monthlyExpense.price,
            },
          };
        }
        return s;
      });

      return {
        ...prev,
        expenses: [...prev.expenses, newExpense],
        monthlyPaymentStatuses: [...prev.monthlyPaymentStatuses, status],
        accounts: updatedAccounts,
      };
    });
    toast.success('Monthly payment recorded!');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Expense Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your spending</p>
          </div>
        </div>

        {/* Add Expense Card */}
        <Card className="glass-card mb-6 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm
              categories={data.categories}
              accounts={data.accounts}
              conversionRate={data.config.conversionRate}
              onSubmit={handleAddExpense}
            />
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="glass-card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <MonthSelector currentMonth={selectedMonth} onChange={setSelectedMonth} />
            </div>
            {monthExpenses.length > 0 ? (
              <CategoryChart
                expenses={monthExpenses}
                categories={data.categories}
                conversionRate={data.config.conversionRate}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No data for this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Payments Card */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              Monthly Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyPayments
              monthlyExpenses={data.monthlyExpenses}
              paymentStatuses={data.monthlyPaymentStatuses}
              categories={data.categories}
              accounts={data.accounts}
              currentMonth={currentMonthKey}
              onPaymentToggle={handlePaymentToggle}
            />
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </div>
  );
}