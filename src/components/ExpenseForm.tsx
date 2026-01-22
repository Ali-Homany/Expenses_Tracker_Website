import { useState, useMemo, useEffect } from 'react';
import { format, subDays, addDays, isAfter, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Currency, Expense, Account } from '@/types/expense';
import { generateId, formatCurrency, convertToUSD } from '@/lib/expenseUtils';
import { Plus, Minus, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ExpenseFormProps {
  categories: Category[];
  accounts: Account[];
  conversionRate: number;
  onSubmit: (expense: Expense, accountId: string) => void;
}

export function ExpenseForm({ categories, accounts, conversionRate, onSubmit }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>('$');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'misc');
  const [date, setDate] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const today = startOfDay(new Date());

  // filter accounts based on selected currency
  const availableAccounts = useMemo(() => {
    return accounts.filter(account => account.supportedCurrencies.includes(currency));
  }, [accounts, currency]);

  // reset selected account if the current one doesnt support the new currency
  useEffect(() => {
    if (selectedAccountId) {
      const currentAccountSupportsCurrency = availableAccounts.some(acc => acc.id === selectedAccountId);
      if (!currentAccountSupportsCurrency) {
        // if curr selected doesnt support then we must remove it
        setSelectedAccountId('');
      }
    }
    // if no account is selected + there are available accounts, default 1st one
    if (!selectedAccountId && availableAccounts.length > 0) {
      setSelectedAccountId(availableAccounts[0].id);
    }
  }, [currency, availableAccounts, selectedAccountId]);

  const handleDateChange = (days: number) => {
    const newDate = days > 0 ? addDays(date, days) : subDays(date, Math.abs(days));
    if (!isAfter(startOfDay(newDate), today)) {
      setDate(newDate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || parseFloat(price) <= 0) {
      toast.error('Please fill in all expense details correctly.');
      return;
    }
    if (!selectedAccountId) {
      toast.error('Please select a financial account.');
      return;
    }

    const currentAccount = accounts.find(s => s.id === selectedAccountId);
    if (!currentAccount) {
      toast.error('Selected account not found.');
      return;
    }
    if (!currentAccount.supportedCurrencies.includes(currency)) {
      toast.error(`The selected account "${currentAccount.name}" does not support ${currency} currency.`);
      return;
    }

    const expensePrice = parseFloat(price);
    
    // check balance in the specific currency
    if ((currentAccount.balances[currency] || 0) < expensePrice) {
      toast.error(`Insufficient funds in ${currentAccount.name}. Current balance: ${formatCurrency(currentAccount.balances[currency] || 0, currency)}`);
      return;
    }

    const expense: Expense = {
      id: generateId(),
      title: title.trim(),
      price: expensePrice,
      currency,
      categoryId,
      date: format(date, 'yyyy-MM-dd'),
      accountId: selectedAccountId,
    };

    onSubmit(expense, selectedAccountId);
    setTitle('');
    setPrice('');
  };

  const canGoForward = !isAfter(startOfDay(addDays(date, 1)), today);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you spend on?"
            className="input-dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                step="0.1"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="input-dark font-mono pr-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={currency === '$' ? 'default' : 'secondary'}
                className="flex-1"
                onClick={() => setCurrency('$')}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                USD
              </Button>
              <Button
                type="button"
                variant={currency === 'L.L.' ? 'default' : 'secondary'}
                className="flex-1"
                onClick={() => setCurrency('L.L.')}
              >
                L.L.
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center justify-between">
          <div className="space-y-2 flex-1">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="input-dark">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <Label>Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="input-dark">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableAccounts.length === 0 ? (
                  <SelectItem value="" disabled>
                    No accounts support {currency}
                  </SelectItem>
                ) : (
                  availableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balances[currency] || 0, currency)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-center font-mono text-sm bg-muted rounded-lg py-2 px-3">
              {format(date, 'EEE, MMM d, yyyy')}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleDateChange(-1)}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => handleDateChange(1)}
              disabled={!canGoForward}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full glow-primary" size="lg">
        <Plus className="w-4 h-4 mr-2" />
        Add Expense
      </Button>
    </form>
  );
}