import { useState, useMemo, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Account, Currency, Income } from '@/types/expense';
import { generateId, formatCurrency } from '@/lib/expenseUtils';
import { Wallet, Plus, Trash2, ArrowRightLeft, PiggyBank, DollarSign, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountPage() {
  const { data, setData } = useLocalStorage();

  // account
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountSupportedCurrencies, setNewAccountSupportedCurrencies] = useState<Currency[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingAccountSupportedCurrencies, setEditingAccountSupportedCurrencies] = useState<Currency[]>([]);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [showEditAccountDialog, setShowEditAccountDialog] = useState(false);


  // income
  const [addIncomeAccountId, setAddIncomeAccountId] = useState('');
  const [addIncomeAmount, setAddIncomeAmount] = useState('');
  const [addIncomeTitle, setAddIncomeTitle] = useState('');
  const [addIncomeCurrency, setAddIncomeCurrency] = useState<Currency>('$');
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false);

  // transfer
  const [transferFromAccountId, setTransferFromAccountId] = useState('');
  const [transferToAccountId, setTransferToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState<Currency>('$');
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // conversion
  const [conversionSourceCurrency, setConversionSourceCurrency] = useState<Currency>('$');
  const [conversionSourceAccountId, setConversionSourceAccountId] = useState('');
  const [conversionDestinationAccountId, setConversionDestinationAccountId] = useState('');
  const [conversionQuantity, setConversionQuantity] = useState('');
  const [conversionRateInput, setConversionRateInput] = useState(data.config.conversionRate.toString());
  const [showConversionDialog, setShowConversionDialog] = useState(false);

  // initialize default account selections based on available accounts
  const initializeDialogAccountSelections = () => {
    if (data.accounts.length > 0) {
      const defaultUSDAccount = data.accounts.find(acc => acc.supportedCurrencies.includes('$'))?.id || '';
      const defaultLLAccount = data.accounts.find(acc => acc.supportedCurrencies.includes('L.L.'))?.id || '';

      // update add income account
      if (addIncomeCurrency === '$') {
        setAddIncomeAccountId(defaultUSDAccount);
      } else {
        setAddIncomeAccountId(defaultLLAccount);
      }

      // in transfer case we need to update both from & to
      if (transferCurrency === '$') {
        setTransferFromAccountId(defaultUSDAccount);
        const otherUSDAccount = data.accounts.find(acc => acc.id !== defaultUSDAccount && acc.supportedCurrencies.includes('$'))?.id || '';
        setTransferToAccountId(otherUSDAccount);
      } else {
        setTransferFromAccountId(defaultLLAccount);
        const otherLLAccount = data.accounts.find(acc => acc.id !== defaultLLAccount && acc.supportedCurrencies.includes('L.L.'))?.id || '';
        setTransferToAccountId(otherLLAccount);
      }

      // for conversion we need to update both source and destination
      if (conversionSourceCurrency === '$') {
        setConversionSourceAccountId(defaultUSDAccount);
        setConversionDestinationAccountId(defaultUSDAccount);
      } else {
        setConversionSourceAccountId(defaultLLAccount);
        setConversionDestinationAccountId(defaultLLAccount);
      }
      setConversionRateInput(data.config.conversionRate.toString());
    } else {
      setAddIncomeAccountId('');
      setTransferFromAccountId('');
      setTransferToAccountId('');
      setConversionSourceAccountId('');
      setConversionDestinationAccountId('');
    }
  };

  const availableAddIncomeAccounts = useMemo(() => {
    return data.accounts.filter(account => account.supportedCurrencies.includes(addIncomeCurrency));
  }, [data.accounts, addIncomeCurrency]);

  const availableTransferAccounts = useMemo(() => {
    return data.accounts.filter(account => account.supportedCurrencies.includes(transferCurrency));
  }, [data.accounts, transferCurrency]);

  const conversionDestinationCurrency = conversionSourceCurrency === '$' ? 'L.L.' : '$';

  const availableConversionSourceAccounts = useMemo(() => {
    return data.accounts.filter(account => account.supportedCurrencies.includes(conversionSourceCurrency));
  }, [data.accounts, conversionSourceCurrency]);

  const availableConversionDestinationAccounts = useMemo(() => {
    return data.accounts.filter(account => account.supportedCurrencies.includes(conversionDestinationCurrency));
  }, [data.accounts, conversionDestinationCurrency]);

  // update selected account for adding income when currency changes
  useEffect(() => {
    if (showAddIncomeDialog) {
      const currentAccountSupportsCurrency = availableAddIncomeAccounts.some(acc => acc.id === addIncomeAccountId);
      if (!currentAccountSupportsCurrency && availableAddIncomeAccounts.length > 0) {
        setAddIncomeAccountId(availableAddIncomeAccounts[0].id);
      } else if (availableAddIncomeAccounts.length === 0) {
        setAddIncomeAccountId('');
      }
    }
  }, [addIncomeCurrency, availableAddIncomeAccounts, addIncomeAccountId, showAddIncomeDialog]);

  // update selected accounts for transfer when currency changes
  useEffect(() => {
    if (showTransferDialog) {
      const currentFromAccountSupportsCurrency = availableTransferAccounts.some(acc => acc.id === transferFromAccountId);
      if (!currentFromAccountSupportsCurrency && availableTransferAccounts.length > 0) {
        setTransferFromAccountId(availableTransferAccounts[0].id);
      } else if (availableTransferAccounts.length === 0) {
        setTransferFromAccountId('');
      }

      const currentToAccountSupportsCurrency = availableTransferAccounts.some(acc => acc.id === transferToAccountId);
      if (!currentToAccountSupportsCurrency && availableTransferAccounts.length > 0) {
        const defaultTo = availableTransferAccounts.find(acc => acc.id !== transferFromAccountId)?.id || '';
        setTransferToAccountId(defaultTo);
      } else if (availableTransferAccounts.length === 0) {
        setTransferToAccountId('');
      }
    }
  }, [transferCurrency, availableTransferAccounts, transferFromAccountId, transferToAccountId, showTransferDialog]);

  // update selected accounts for conversion when currency changes
  useEffect(() => {
    if (showConversionDialog) {
      const currentSourceAccountSupportsCurrency = availableConversionSourceAccounts.some(acc => acc.id === conversionSourceAccountId);
      if (!currentSourceAccountSupportsCurrency && availableConversionSourceAccounts.length > 0) {
        setConversionSourceAccountId(availableConversionSourceAccounts[0].id);
      } else if (availableConversionSourceAccounts.length === 0) {
        setConversionSourceAccountId('');
      }

      const currentDestinationAccountSupportsCurrency = availableConversionDestinationAccounts.some(acc => acc.id === conversionDestinationAccountId);
      if (!currentDestinationAccountSupportsCurrency && availableConversionDestinationAccounts.length > 0) {
        // if source & dest currencies different, try find a different account
        if (conversionSourceCurrency !== conversionDestinationCurrency) {
          const defaultTo = availableConversionDestinationAccounts.find(acc => acc.id !== conversionSourceAccountId)?.id || '';
          setConversionDestinationAccountId(defaultTo);
        } else {
          // if same currency default to same account
          setConversionDestinationAccountId(conversionSourceAccountId);
        }
      } else if (availableConversionDestinationAccounts.length === 0) {
        setConversionDestinationAccountId('');
      }
    }
  }, [conversionSourceCurrency, availableConversionSourceAccounts, availableConversionDestinationAccounts, conversionSourceAccountId, conversionDestinationAccountId, showConversionDialog]);


  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      toast.error('Account name cannot be empty.');
      return;
    }
    if (newAccountSupportedCurrencies.length === 0) {
      toast.error('Please select at least one supported currency for the account.');
      return;
    }

    const newAccount: Account = {
      id: generateId(),
      name: newAccountName.trim(),
      balances: {},
      supportedCurrencies: newAccountSupportedCurrencies,
    };

    // initialize balances for supported currencies to 0
    newAccount.supportedCurrencies.forEach(currency => {
      newAccount.balances[currency] = 0;
    });

    setData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
    }));

    setNewAccountName('');
    // Reset to default
    setNewAccountSupportedCurrencies(['$']);
    toast.success('Account added!');
  };

  const handleUpdateAccount = () => {
    if (!editingAccount) return;
    if (!editingAccount.name.trim()) {
      toast.error('Account name cannot be empty.');
      return;
    }
    if (editingAccountSupportedCurrencies.length === 0) {
      toast.error('Please select at least one supported currency for the account.');
      return;
    }

    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((s) => {
        if (s.id === editingAccount.id) {
          const updatedBalances = {};
          // preserve existing balances for supported currencies
          editingAccountSupportedCurrencies.forEach(currency => {
            updatedBalances[currency] = s.balances[currency] ?? 0;
          });

          return {
            ...s,
            name: editingAccount.name.trim(),
            supportedCurrencies: editingAccountSupportedCurrencies,
            balances: updatedBalances,
          };
        }
        return s;
      }),
    }));

    setEditingAccount(null);
    setEditingAccountSupportedCurrencies([]);
    setShowEditAccountDialog(false);
    toast.success('Account updated!');
  };

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;

    // prevent deleting if there are expenses associated with the account
    const hasAssociatedExpenses = data.expenses.some(
      (expense) => expense.accountId === accountToDelete.id
    );

    if (hasAssociatedExpenses) {
      toast.error(
        `Cannot delete account "${accountToDelete.name}" because it has associated expenses. Please reassign them first.`
      );
      setAccountToDelete(null);
      return;
    }

    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((s) => s.id !== accountToDelete.id),
    }));

    setAccountToDelete(null);
    toast.success('Account deleted!');
  };

  const handleAddIncome = () => {
    const amount = parseFloat(addIncomeAmount);
    if (isNaN(amount) || amount <= 0 || !addIncomeAccountId) {
      toast.error('Please enter a valid amount and select an account.');
      return;
    }
    // update account
    const targetAccount = data.accounts.find(acc => acc.id === addIncomeAccountId);
    if (!targetAccount) {
      toast.error('Selected account not found.');
      return;
    }
    if (!targetAccount.supportedCurrencies.includes(addIncomeCurrency)) {
      toast.error(`The selected account "${targetAccount.name}" does not support ${addIncomeCurrency} currency.`);
      return;
    }
    // update incomes
    const newIncome: Income = {
      id: generateId(),
      amount: amount,
      title: addIncomeTitle,
      currency: addIncomeCurrency,
      date: new Date().toISOString().split('T')[0],
      accountId: addIncomeAccountId
    }
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((s) =>
        s.id === addIncomeAccountId
          ? {
              ...s,
              balances: {
                ...s.balances,
                [addIncomeCurrency]: (s.balances[addIncomeCurrency] || 0) + amount,
              },
            }
          : s
      ),
      incomes: [...prev.incomes, newIncome ],
    }));

    setAddIncomeAmount('');
    setShowAddIncomeDialog(false);
    toast.success(`${formatCurrency(amount, addIncomeCurrency)} added to ${targetAccount.name}.`);
  };

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || !transferFromAccountId || !transferToAccountId || transferFromAccountId === transferToAccountId) {
      toast.error('Please enter a valid amount and select different accounts for transfer.');
      return;
    }

    const fromAccount = data.accounts.find((s) => s.id === transferFromAccountId);
    const toAccount = data.accounts.find((s) => s.id === transferToAccountId);

    if (!fromAccount || !toAccount) {
      toast.error('One or both selected accounts not found.');
      return;
    }
    if (!fromAccount.supportedCurrencies.includes(transferCurrency)) {
      toast.error(`The 'From' account "${fromAccount.name}" does not support ${transferCurrency} currency.`);
      return;
    }
    if (!toAccount.supportedCurrencies.includes(transferCurrency)) {
      toast.error(`The 'To' account "${toAccount.name}" does not support ${transferCurrency} currency.`);
      return;
    }

    if ((fromAccount.balances[transferCurrency] || 0) < amount) {
      toast.error(`Insufficient balance in the "From" account (${formatCurrency(fromAccount.balances[transferCurrency] || 0, transferCurrency)}) for this transfer.`);
      return;
    }

    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((s) => {
        if (s.id === transferFromAccountId) {
          return {
            ...s,
            balances: {
              ...s.balances,
              [transferCurrency]: (s.balances[transferCurrency] || 0) - amount,
            },
          };
        }
        if (s.id === transferToAccountId) {
          return {
            ...s,
            balances: {
              ...s.balances,
              [transferCurrency]: (s.balances[transferCurrency] || 0) + amount,
            },
          };
        }
        return s;
      }),
    }));

    setTransferAmount('');
    setShowTransferDialog(false);
    toast.success(`${formatCurrency(amount, transferCurrency)} transferred from ${fromAccount.name} to ${toAccount.name}.`);
  };

  const handleConvert = () => {
    const quantity = parseFloat(conversionQuantity);
    const rate = parseFloat(conversionRateInput);

    if (isNaN(quantity) || quantity <= 0 || isNaN(rate) || rate <= 0) {
      toast.error('Please enter valid quantity and conversion rate.');
      return;
    }
    if (!conversionSourceAccountId || !conversionDestinationAccountId) {
      toast.error('Please select both source and destination accounts.');
      return;
    }

    const sourceAccount = data.accounts.find(acc => acc.id === conversionSourceAccountId);
    const destinationAccount = data.accounts.find(acc => acc.id === conversionDestinationAccountId);

    if (!sourceAccount || !destinationAccount) {
      toast.error('Source or destination account not found.');
      return;
    }
    if (!sourceAccount.supportedCurrencies.includes(conversionSourceCurrency)) {
      toast.error(`The source account "${sourceAccount.name}" does not support ${conversionSourceCurrency} currency.`);
      return;
    }
    if (!destinationAccount.supportedCurrencies.includes(conversionDestinationCurrency)) {
      toast.error(`The destination account "${destinationAccount.name}" does not support ${conversionDestinationCurrency} currency.`);
      return;
    }

    if ((sourceAccount.balances[conversionSourceCurrency] || 0) < quantity) {
      toast.error(`Insufficient funds in ${sourceAccount.name}. Current balance: ${formatCurrency(sourceAccount.balances[conversionSourceCurrency] || 0, conversionSourceCurrency)}`);
      return;
    }

    let convertedAmount: number;
    if (conversionSourceCurrency === '$' && conversionDestinationCurrency === 'L.L.') {
      convertedAmount = quantity * rate;
    } else if (conversionSourceCurrency === 'L.L.' && conversionDestinationCurrency === '$') {
      convertedAmount = quantity / rate;
    } else {
      // impossible case but i wrote it just in case
      toast.error('Invalid currency conversion direction.');
      return;
    }

    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) => {
        if (acc.id === conversionSourceAccountId) {
          return {
            ...acc,
            balances: {
              ...acc.balances,
              [conversionSourceCurrency]: (acc.balances[conversionSourceCurrency] || 0) - quantity,
            },
          };
        }
        if (acc.id === conversionDestinationAccountId) {
          return {
            ...acc,
            balances: {
              ...acc.balances,
              [conversionDestinationCurrency]: (acc.balances[conversionDestinationCurrency] || 0) + convertedAmount,
            },
          };
        }
        return acc;
      }),
    }));

    setConversionQuantity('');
    setConversionRateInput(data.config.conversionRate.toString());
    setShowConversionDialog(false);
    toast.success(`Converted ${formatCurrency(quantity, conversionSourceCurrency)} from ${sourceAccount.name} to ${formatCurrency(convertedAmount, conversionDestinationCurrency)} in ${destinationAccount.name}.`);
  };


  const handleCurrencyCheckboxChange = (currency: Currency, isChecked: boolean, type: 'new' | 'edit') => {
    if (type === 'new') {
      setNewAccountSupportedCurrencies((prev) =>
        isChecked ? [...prev, currency] : prev.filter((c) => c !== currency)
      );
    } else {
      setEditingAccountSupportedCurrencies((prev) =>
        isChecked ? [...prev, currency] : prev.filter((c) => c !== currency)
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <PiggyBank className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Financial Accounts</h1>
            <p className="text-sm text-muted-foreground">Manage your cash, bank accounts, etc.</p>
          </div>
        </div>

        {/* Current Balances & Add/Manage Accounts */}
        <Card className="glass-card mb-6 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Current Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing accounts */}
            <div className="space-y-2">
              {data.accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No financial accounts configured. Add one below!
                </p>
              ) : (
                data.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="py-3 px-5 bg-muted rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => {
                      setEditingAccount({ ...account });
                      setEditingAccountSupportedCurrencies([...account.supportedCurrencies]);
                      setShowEditAccountDialog(true);
                    }}
                  >
                    <div className='flex items-center justify-between'>
                      <span className="font-medium">{account.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountToDelete(account);
                        }}
                      >
                        <Trash2 className="w-4 h-4 opacity-60 hover:opacity-100" />
                      </Button>
                    </div>
                    <div className="flex justify-start items-center gap-5">
                      {account.supportedCurrencies.map(currency => (
                        <span key={currency} className="font-mono text-sm text-gray-400">
                          {formatCurrency(account.balances[currency] || 0, currency)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add new account */}
            <div className="pt-4 border-t border-border space-y-3">
              <Label className="text-sm text-muted-foreground">Add New Account</Label>
              <Input
                placeholder="account name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="input-dark"
              />
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Supported Currencies</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-usd-currency"
                      checked={newAccountSupportedCurrencies.includes('$')}
                      onCheckedChange={(checked) => handleCurrencyCheckboxChange('$', checked as boolean, 'new')}
                    />
                    <Label htmlFor="new-usd-currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      USD ($)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-ll-currency"
                      checked={newAccountSupportedCurrencies.includes('L.L.')}
                      onCheckedChange={(checked) => handleCurrencyCheckboxChange('L.L.', checked as boolean, 'new')}
                    />
                    <Label htmlFor="new-ll-currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      L.L.
                    </Label>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddAccount} className="w-full" variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Income */}
        <Card className="glass-card mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-primary" />
              Add Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showAddIncomeDialog} onOpenChange={(open) => {
              setShowAddIncomeDialog(open);
              if (open) initializeDialogAccountSelections();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={data.accounts.length === 0}>
                  Add Income to an Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add Income</DialogTitle>
                  <DialogDescription>
                    Manually add money to one of your financial accounts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={addIncomeCurrency === '$' ? 'default' : 'secondary'}
                        className="flex-1"
                        onClick={() => setAddIncomeCurrency('$')}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        USD
                      </Button>
                      <Button
                        type="button"
                        variant={addIncomeCurrency === 'L.L.' ? 'default' : 'secondary'}
                        className="flex-1"
                        onClick={() => setAddIncomeCurrency('L.L.')}
                      >
                        L.L.
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addIncomeTitle">Title</Label>
                    <Input
                      id="addIncomeTitle"
                      type="text"
                      value={addIncomeTitle}
                      onChange={(e) => setAddIncomeTitle(e.target.value)}
                      placeholder="optional title"
                      className="input-dark font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addIncomeAccount">Account</Label>
                    <Select value={addIncomeAccountId} onValueChange={setAddIncomeAccountId}>
                      <SelectTrigger className="input-dark">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {availableAddIncomeAccounts.length === 0 ? (
                          <SelectItem value="" disabled>
                            No accounts support {addIncomeCurrency}
                          </SelectItem>
                        ) : (
                          availableAddIncomeAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addIncomeAmount">Amount ({addIncomeCurrency})</Label>
                    <Input
                      id="addIncomeAmount"
                      type="number"
                      step="0.1"
                      min="1"
                      value={addIncomeAmount}
                      onChange={(e) => setAddIncomeAmount(e.target.value)}
                      placeholder="0.00"
                      className="input-dark font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddIncome}>Confirm Add Income</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Transfer Money */}
        <Card className="glass-card mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showTransferDialog} onOpenChange={(open) => {
              setShowTransferDialog(open);
              if (open) initializeDialogAccountSelections();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={data.accounts.length < 2}>
                  Transfer Money Between Accounts
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Transfer Income</DialogTitle>
                  <DialogDescription>
                    Move money from one financial account to another.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={transferCurrency === '$' ? 'default' : 'secondary'}
                        className="flex-1"
                        onClick={() => setTransferCurrency('$')}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        USD
                      </Button>
                      <Button
                        type="button"
                        variant={transferCurrency === 'L.L.' ? 'default' : 'secondary'}
                        className="flex-1"
                        onClick={() => setTransferCurrency('L.L.')}
                      >
                        L.L.
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferFromAccount">From Account</Label>
                    <Select value={transferFromAccountId} onValueChange={setTransferFromAccountId}>
                      <SelectTrigger className="input-dark">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {availableTransferAccounts.length === 0 ? (
                          <SelectItem value="" disabled>
                            No accounts support {transferCurrency}
                          </SelectItem>
                        ) : (
                          availableTransferAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balances[transferCurrency] || 0, transferCurrency)})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferToAccount">To Account</Label>
                    <Select value={transferToAccountId} onValueChange={setTransferToAccountId}>
                      <SelectTrigger className="input-dark">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {availableTransferAccounts.length === 0 ? (
                          <SelectItem value="" disabled>
                            No accounts support {transferCurrency}
                          </SelectItem>
                        ) : (
                          availableTransferAccounts
                            // invalid transfer to the same account
                            .filter(account => account.id !== transferFromAccountId)
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} ({formatCurrency(account.balances[transferCurrency] || 0, transferCurrency)})
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferAmount">Amount ({transferCurrency})</Label>
                    <Input
                      id="transferAmount"
                      type="number"
                      step="0.1"
                      min="1"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="input-dark font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleTransfer}>Confirm Transfer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Currency Conversion */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat2 className="w-4 h-4 text-primary" />
              Currency Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={showConversionDialog} onOpenChange={(open) => {
              setShowConversionDialog(open);
              if (open) initializeDialogAccountSelections();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={data.accounts.length === 0}>
                  Convert Income Between Currencies
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Currency Conversion</DialogTitle>
                  <DialogDescription>
                    Convert money from one currency to another, within or between accounts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Source Currency</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={conversionSourceCurrency === '$' ? 'default' : 'secondary'}
                        className="flex-1"
                        onClick={() => setConversionSourceCurrency('$')}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        USD
                      </Button>
                      <Button
                        type="button"
                        variant={conversionSourceCurrency === 'L.L.' ? 'default' : 'secondary'}
                        className="flex-1"
                        onClick={() => setConversionSourceCurrency('L.L.')}
                      >
                        L.L.
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversionSourceAccount">From Account ({conversionSourceCurrency})</Label>
                    <Select value={conversionSourceAccountId} onValueChange={setConversionSourceAccountId}>
                      <SelectTrigger className="input-dark">
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {availableConversionSourceAccounts.length === 0 ? (
                          <SelectItem value="" disabled>
                            No accounts support {conversionSourceCurrency}
                          </SelectItem>
                        ) : (
                          availableConversionSourceAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balances[conversionSourceCurrency] || 0, conversionSourceCurrency)})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversionDestinationAccount">To Account ({conversionDestinationCurrency})</Label>
                    <Select value={conversionDestinationAccountId} onValueChange={setConversionDestinationAccountId}>
                      <SelectTrigger className="input-dark">
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {availableConversionDestinationAccounts.length === 0 ? (
                          <SelectItem value="" disabled>
                            No accounts support {conversionDestinationCurrency}
                          </SelectItem>
                        ) : (
                          availableConversionDestinationAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({formatCurrency(account.balances[conversionDestinationCurrency] || 0, conversionDestinationCurrency)})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversionQuantity">Quantity to Convert ({conversionSourceCurrency})</Label>
                    <Input
                      id="conversionQuantity"
                      type="number"
                      step="0.1"
                      min="1"
                      value={conversionQuantity}
                      onChange={(e) => setConversionQuantity(e.target.value)}
                      placeholder="0.00"
                      className="input-dark font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversionRateInput">Conversion Rate (1$ = X L.L.)</Label>
                    <Input
                      id="conversionRateInput"
                      type="number"
                      step="0.1"
                      min="1"
                      value={conversionRateInput}
                      onChange={(e) => setConversionRateInput(e.target.value)}
                      placeholder={data.config.conversionRate.toString()}
                      className="input-dark font-mono"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleConvert}>Confirm Conversion</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Edit Account Dialog */}
      <Dialog open={showEditAccountDialog} onOpenChange={setShowEditAccountDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the account name and supported currencies.</DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      name: e.target.value,
                    })
                  }
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Supported Currencies</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-usd-currency"
                      checked={editingAccountSupportedCurrencies.includes('$')}
                      onCheckedChange={(checked) => handleCurrencyCheckboxChange('$', checked as boolean, 'edit')}
                    />
                    <Label htmlFor="edit-usd-currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      USD ($)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-ll-currency"
                      checked={editingAccountSupportedCurrencies.includes('L.L.')}
                      onCheckedChange={(checked) => handleCurrencyCheckboxChange('L.L.', checked as boolean, 'edit')}
                    />
                    <Label htmlFor="edit-ll-currency" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      L.L.
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateAccount}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={!!accountToDelete} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{accountToDelete?.name}". This action cannot be undone.
              Ensure no expenses are associated with this account before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Navigation />
    </div>
  );
}