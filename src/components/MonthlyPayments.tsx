import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MonthlyExpense, MonthlyPaymentStatus, Expense, Category, Account, Currency } from '@/types/expense';
import { formatCurrency, generateId, convertToUSD } from '@/lib/expenseUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MonthlyPaymentsProps {
  monthlyExpenses: MonthlyExpense[];
  paymentStatuses: MonthlyPaymentStatus[];
  categories: Category[];
  accounts: Account[];
  currentMonth: string;
  onPaymentToggle: (monthlyExpenseId: string, selectedAccountId: string) => void;
}

export function MonthlyPayments({
  monthlyExpenses,
  paymentStatuses,
  categories,
  accounts,
  currentMonth,
  onPaymentToggle,
}: MonthlyPaymentsProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedMonthlyExpense, setSelectedMonthlyExpense] = useState<MonthlyExpense | null>(null);
  const [selectedAccountIdForPayment, setSelectedAccountIdForPayment] = useState('');

  const paymentStatusMap = useMemo(() => {
    const map = new Map<string, MonthlyPaymentStatus>();
    paymentStatuses.forEach((status) => {
      if (status.month === currentMonth) {
        map.set(status.monthlyExpenseId, status);
      }
    });
    return map;
  }, [paymentStatuses, currentMonth]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const handleToggle = (monthlyExpense: MonthlyExpense) => {
    const isPaid = paymentStatusMap.has(monthlyExpense.id);
    if (isPaid) {
      // if already paid do nothing
      // not important for now
      return;
    }

    setSelectedMonthlyExpense(monthlyExpense);
    // default select account that supports the monthly expense currency
    const defaultAccount = accounts.find(acc => acc.supportedCurrencies.includes(monthlyExpense.currency));
    setSelectedAccountIdForPayment(defaultAccount?.id || '');
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedMonthlyExpense || !selectedAccountIdForPayment) {
      toast.error('Please select an account to record the payment.');
      return;
    }

    const currentAccount = accounts.find(s => s.id === selectedAccountIdForPayment);
    if (!currentAccount) {
      toast.error('Selected account not found.');
      return;
    }
    if (!currentAccount.supportedCurrencies.includes(selectedMonthlyExpense.currency)) {
      toast.error(`The selected account "${currentAccount.name}" does not support ${selectedMonthlyExpense.currency} currency.`);
      return;
    }

    // check balance in the specific currency
    if ((currentAccount.balances[selectedMonthlyExpense.currency] || 0) < selectedMonthlyExpense.price) {
      toast.error(`Insufficient funds in ${currentAccount.name} for this monthly payment. Current balance: ${formatCurrency(currentAccount.balances[selectedMonthlyExpense.currency] || 0, selectedMonthlyExpense.currency)}`);
      return;
    }

    onPaymentToggle(selectedMonthlyExpense.id, selectedAccountIdForPayment);
    setShowPaymentDialog(false);
    setSelectedMonthlyExpense(null);
    setSelectedAccountIdForPayment('');
  };

  // filter accounts for dialog based on selected monthly expense currency
  const availableAccountsForPayment = useMemo(() => {
    if (!selectedMonthlyExpense) return [];
    return accounts.filter(account => account.supportedCurrencies.includes(selectedMonthlyExpense.currency));
  }, [accounts, selectedMonthlyExpense]);

  if (monthlyExpenses.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No monthly payments configured.
        <br />
        <span className="text-xs">Add them in the Config page.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monthlyExpenses.map((monthlyExpense) => {
        const isPaid = paymentStatusMap.has(monthlyExpense.id);
        
        return (
          <div
            key={monthlyExpense.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isPaid
                ? 'bg-muted/50 border-border/50 opacity-60'
                : 'bg-card border-border hover:border-primary/50'
            }`}
          >
            <Checkbox
              id={monthlyExpense.id}
              checked={isPaid}
              disabled={isPaid}
              onCheckedChange={() => handleToggle(monthlyExpense)}
              className="data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
            <Label
              htmlFor={monthlyExpense.id}
              className={`flex-1 cursor-pointer ${isPaid ? 'line-through' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{monthlyExpense.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({getCategoryName(monthlyExpense.categoryId)})
                  </span>
                </div>
                <span className="font-mono text-sm">
                  {formatCurrency(monthlyExpense.price, monthlyExpense.currency)}
                </span>
              </div>
            </Label>
          </div>
        );
      })}

      {/* Monthly Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Record Monthly Payment</DialogTitle>
            <DialogDescription>
              Confirm payment for "{selectedMonthlyExpense?.title}" and select the account it was paid from.
            </DialogDescription>
          </DialogHeader>
          {selectedMonthlyExpense && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Payment Details</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p className="font-medium">{selectedMonthlyExpense.title}</p>
                  <p className="text-muted-foreground">
                    {formatCurrency(selectedMonthlyExpense.price, selectedMonthlyExpense.currency)}
                    {' '}in {getCategoryName(selectedMonthlyExpense.categoryId)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAccount">Account</Label>
                <Select
                  value={selectedAccountIdForPayment}
                  onValueChange={setSelectedAccountIdForPayment}
                >
                  <SelectTrigger className="input-dark">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableAccountsForPayment.length === 0 ? (
                      <SelectItem value="" disabled>
                        No accounts support {selectedMonthlyExpense.currency}
                      </SelectItem>
                    ) : (
                      availableAccountsForPayment.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({formatCurrency(account.balances[selectedMonthlyExpense.currency] || 0, selectedMonthlyExpense.currency)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}