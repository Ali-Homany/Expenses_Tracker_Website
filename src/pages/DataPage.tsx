import { useState, useMemo, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, Income, Currency, DEFAULT_APP_DATA, ImportedExpense, Category, ImportedAppData, Account, MonthlyExpense } from '@/types/expense';
import { formatCurrency, convertCurrency, convertToUSD, generateId } from '@/lib/expenseUtils';
import { Database, Filter, DollarSign, Pencil, Trash2, Search, CalendarIcon, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DataPage() {
  const { data, setData } = useLocalStorage();

  // filter state
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [displayCurrency, setDisplayCurrency] = useState<Currency | 'original'>('original');
  const [filterSearchQuery, setFilterSearchQuery] = useState('');

  // calculate max expense price for the slider (in $ to be consistent)
  // used to set slider max value
  const maxExpensePrice = useMemo(() => {
    if (data.expenses.length === 0) return 1000;
    const pricesInUSD = data.expenses.map(expense =>
      convertToUSD(expense.price, expense.currency, data.config.conversionRate)
    );
    return Math.ceil(Math.max(...pricesInUSD) * 1.1);
  }, [data.expenses, data.config.conversionRate]);

  // price range in $
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxExpensePrice]);

  // reset price range when maxExpensePrice changes
  useEffect(() => {
    setPriceRange([0, maxExpensePrice]);
  }, [maxExpensePrice]);

  // edit/delete state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('$');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importedDataPayload, setImportedDataPayload] = useState<ImportedAppData | null>(null);

  // get unique months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.expenses.forEach((expense) => {
      months.add(format(parseISO(expense.date), 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  }, [data.expenses]);

  // apply filters on data
  const filteredExpenses = useMemo(() => {
    let expensesToFilter = data.expenses;

    if (filterMonth !== 'all') {
      expensesToFilter = expensesToFilter.filter((expense) => {
        const expenseMonth = format(parseISO(expense.date), 'yyyy-MM');
        return expenseMonth === filterMonth;
      });
    }
    if (filterCategory !== 'all') {
      expensesToFilter = expensesToFilter.filter((expense) => expense.categoryId === filterCategory);
    }
    // convert all prices to $ to be able to compare btw all
    expensesToFilter = expensesToFilter.filter((expense) => {
      const priceInUSD = convertToUSD(expense.price, expense.currency, data.config.conversionRate);
      return priceInUSD >= priceRange[0] && priceInUSD <= priceRange[1];
    });
    if (filterSearchQuery.trim()) {
      const query = filterSearchQuery.toLowerCase();
      expensesToFilter = expensesToFilter.filter((expense) =>
        expense.title.toLowerCase().includes(query)
      );
    }

    return expensesToFilter.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [data.expenses, filterMonth, filterCategory, priceRange, filterSearchQuery, data.config.conversionRate]);

  const getCategoryName = (categoryId: string) =>
    data.categories.find((c) => c.id === categoryId)?.name || 'Unknown';

  const getAccountName = (accountId: string) =>
    data.accounts.find((s) => s.id === accountId)?.name || 'Unknown';

  const getDisplayPrice = (expense: Expense) => {
    if (displayCurrency === 'original') {
      return formatCurrency(expense.price, expense.currency);
    }
    const converted = convertCurrency(
      expense.price,
      expense.currency,
      displayCurrency,
      data.config.conversionRate
    );
    return formatCurrency(converted, displayCurrency);
  };

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditTitle(expense.title);
    setEditPrice(expense.price.toString());
    setEditCurrency(expense.currency);
    setEditCategoryId(expense.categoryId);
    setEditDate(parseISO(expense.date));
  };

  const handleUpdateExpense = () => {
    if (!selectedExpense || !editTitle.trim() || !editPrice || parseFloat(editPrice) <= 0 || !editCategoryId || !editDate) {
      toast.error('Please fill all fields correctly.');
      return;
    }

    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.id === selectedExpense.id
          ? {
              ...e,
              title: editTitle.trim(),
              price: parseFloat(editPrice),
              currency: editCurrency,
              categoryId: editCategoryId,
              date: format(editDate, 'yyyy-MM-dd'),
            }
          : e
      ),
    }));

    setSelectedExpense(null);
    toast.success('Expense updated!');
  };

  const handleDelete = () => {
    if (!selectedExpense) return;

    // when expense is deleted return the money to the account that paid
    setData((prev) => {
      const updatedAccounts = prev.accounts.map(a => {
        if (a.id === selectedExpense.accountId) {
          return {
            ...a,
            balances: {
              ...a.balances,
              [selectedExpense.currency]: (a.balances[selectedExpense.currency] || 0) + selectedExpense.price,
            },
          };
        }
        return a;
      });

      return {
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== selectedExpense.id),
        monthlyPaymentStatuses: prev.monthlyPaymentStatuses.filter(
          (s) => s.expenseId !== selectedExpense.id
        ),
        accounts: updatedAccounts,
      };
    });

    setShowDeleteConfirm(false);
    setSelectedExpense(null);
    toast.success('Expense deleted and funds returned to account!');
  };

  const handleExportExpenses = () => {
    const importedExpenses: ImportedExpense[] = data.expenses.map(expense => {
      const categoryName = getCategoryName(expense.categoryId);
      const accountName = getAccountName(expense.accountId);
      return {
        id: expense.id,
        date: expense.date,
        title: expense.title,
        price: expense.price,
        currency: expense.currency,
        category: categoryName,
        isMonthlyPayment: expense.isMonthlyPayment || false,
        account: accountName,
      };
    });

    const exportedData: ImportedAppData = {
      expenses: importedExpenses,
      accounts: data.accounts,
      categories: data.categories,
      monthlyExpenses: data.monthlyExpenses,
      incomes: data.incomes,
    };

    const jsonString = JSON.stringify(exportedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-tracker-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('All data exported successfully!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please upload a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);

        // basic initial validation
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.expenses)) {
          toast.error('Invalid JSON file. Expected an object with at least an "expenses" array.');
          return;
        }

        // validate expenses against ImportedExpense schema
        const isValidExpenses = parsed.expenses.every((item: any) =>
          typeof item.id === 'string' &&
          typeof item.date === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
          typeof item.title === 'string' &&
          typeof item.price === 'number' &&
          (item.currency === '$' || item.currency === 'L.L.') &&
          typeof item.category === 'string' &&
          (typeof item.isMonthlyPayment === 'boolean' || item.isMonthlyPayment === undefined)
        );

        if (!isValidExpenses) {
          toast.error('Invalid JSON file schema for expenses. Please ensure expenses match the required structure (date format YYYY-MM-DD).');
          return;
        }

        // validating optional fields
        const isValidIncomes = !parsed.incomes || (Array.isArray(parsed.incomes) && parsed.incomes.every((item: any) =>
          typeof item.id === 'string' && typeof item.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && (!item.title || typeof item.title === 'string') && typeof item.amount === 'number' && (item.currency === '$' || item.currency === 'L.L.')
        ));
        const isValidCategories = !parsed.categories || (Array.isArray(parsed.categories) && parsed.categories.every((item: any) =>
          typeof item.id === 'string' && typeof item.name === 'string' && (typeof item.allowedPerMonth === 'number' || item.allowedPerMonth === null)
        ));
        const isValidAccounts = !parsed.accounts || (Array.isArray(parsed.accounts) && parsed.accounts.every((item: any) =>
          typeof item.id === 'string' && typeof item.name === 'string' && typeof item.balances === 'object' && Array.isArray(item.supportedCurrencies)
        ));
        const isValidMonthlyExpenses = !parsed.monthlyExpenses || (Array.isArray(parsed.monthlyExpenses) && parsed.monthlyExpenses.every((item: any) =>
          typeof item.id === 'string' && typeof item.title === 'string' && typeof item.price === 'number' && (item.currency === '$' || item.currency === 'L.L.') && typeof item.categoryId === 'string'
        ));

        const errors: string[] = [];
        if (!isValidIncomes) errors.push('Incomes');
        if (!isValidCategories) errors.push('Categories');
        if (!isValidAccounts) errors.push('Accounts');
        if (!isValidMonthlyExpenses) errors.push('Monthly Expenses');
        if (errors.length > 0) {
          toast.error(`Invalid JSON file schema for ${errors.join(', ')}. Please check the structure.`);
          return;
        }


        setImportedDataPayload(parsed as ImportedAppData);
        setShowImportConfirm(true);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast.error('Failed to parse JSON file. Please ensure it is valid.');
      }
    };
    reader.readAsText(file);
    // reset input file
    event.target.value = '';
  };

  const confirmImport = () => {
    if (importedDataPayload) {
      const { expenses: importedExpenses, accounts: importedAccounts, categories: importedCategories, monthlyExpenses: importedMonthlyExpenses, incomes: importedIncomes } = importedDataPayload;

      let finalCategories: Category[] = data.categories;
      if (importedCategories && importedCategories.length > 0) {
        finalCategories = importedCategories;
      } else {
        // get unique categories from imported expenses if no explicit categories provided
        const importedCategoryNames = new Set<string>();
        importedExpenses.forEach(exp => importedCategoryNames.add(exp.category));
        
        const existingCategoryNames = new Set(data.categories.map(c => c.name));
        const newCategoriesToAdd: Category[] = [];
        importedCategoryNames.forEach(catName => {
          if (!existingCategoryNames.has(catName)) {
            newCategoriesToAdd.push({
              id: generateId(),
              name: catName,
              allowedPerMonth: null,
            });
          }
        });
        finalCategories = [...data.categories, ...newCategoriesToAdd];
      }
      const categoryNameToIdMap = new Map<string, string>();
      finalCategories.forEach(cat => categoryNameToIdMap.set(cat.name, cat.id));

      let finalAccounts: Account[] = data.accounts;
      if (importedAccounts && importedAccounts.length > 0) {
        finalAccounts = importedAccounts;
      }
      // default accounts if none provided
      if (finalAccounts.length === 0) {
        finalAccounts = DEFAULT_APP_DATA.accounts;
      }
      // fallback to cash if no accounts
      const defaultAccountId = finalAccounts[0]?.id || 'cash';

      const finalMonthlyExpenses: MonthlyExpense[] = importedMonthlyExpenses && importedMonthlyExpenses.length > 0
        ? importedMonthlyExpenses
        : data.monthlyExpenses;

      // map imported expenses to Expense objects
      const newExpenses: Expense[] = importedExpenses.map(flatExpense => ({
        id: flatExpense.id,
        title: flatExpense.title,
        price: flatExpense.price,
        currency: flatExpense.currency,
        categoryId: categoryNameToIdMap.get(flatExpense.category) || 'misc', // map category name to id
        date: flatExpense.date,
        isMonthlyPayment: flatExpense.isMonthlyPayment || false,
        accountId: defaultAccountId, // assign default account id as ImportedExpense doesnt carry it
      }));

      // map incomes to Income objects
      const newIncomes: Income[] = importedIncomes.map(income => ({
        id: generateId(),
        amount: income.amount,
        currency: income.currency,
        date: income.date,
        accountId: income.accountId
      }))

      setData((prev) => ({
        ...prev,
        categories: finalCategories,
        accounts: finalAccounts,
        monthlyExpenses: finalMonthlyExpenses,
        expenses: newExpenses,
        monthlyPaymentStatuses: [],
        incomes: newIncomes,
      }));

      toast.success('Data imported successfully! Expenses, categories, accounts, and monthly payments have been updated.');
      setImportedDataPayload(null);
      setShowImportConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <header className="flex items-start justify-between mb-6 px-2">
          <div className="flex items-center gap-3 min-w-fit">
            <div className="p-2 rounded-xl bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">All Data</h1>
              <p className="text-sm text-muted-foreground">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2"> {/* Grouping buttons */}
            <Button onClick={handleImportClick} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <Button onClick={handleExportExpenses} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </header>

        {/* Filters */}
        <Card className="glass-card mb-6 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Month</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="input-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Months</SelectItem>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="input-dark">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Categories</SelectItem>
                    {data.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Price Range ($)</Label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm w-fit text-right">{formatCurrency(priceRange[0], '$')}</span>
                <Slider
                  min={0}
                  max={maxExpensePrice}
                  step={1}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="flex-1"
                />
                <span className="font-mono text-sm w-fit text-left">{formatCurrency(priceRange[1], '$')}</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Search Title</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search expenses by title..."
                  value={filterSearchQuery}
                  onChange={(e) => setFilterSearchQuery(e.target.value)}
                  className="input-dark pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Display Currency</Label>
              <div className="flex gap-2">
                <Button
                  variant={displayCurrency === 'original' ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDisplayCurrency('original')}
                >
                  Original
                </Button>
                <Button
                  variant={displayCurrency === '$' ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDisplayCurrency('$')}
                >
                  <DollarSign className="w-4 h-4" />
                </Button>
                <Button
                  variant={displayCurrency === 'L.L.' ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDisplayCurrency('L.L.')}
                >
                  L.L.
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-0">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No expenses found
              </div>
            ) : (
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {filteredExpenses.map((expense) => (
                  <button
                    key={expense.id}
                    onClick={() => handleRowClick(expense)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{expense.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{getCategoryName(expense.categoryId)}</span>
                          <span>•</span>
                          <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="font-mono text-sm ml-4">
                        {getDisplayPrice(expense)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit/Delete Dialog */}
      <Dialog open={!!selectedExpense && !showDeleteConfirm} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Make changes to your expense here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-dark"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editPrice">Price</Label>
                <Input
                  id="editPrice"
                  type="number"
                  step="0.1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="input-dark font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={editCurrency === '$' ? 'default' : 'secondary'}
                    className="flex-1"
                    onClick={() => setEditCurrency('$')}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    USD
                  </Button>
                  <Button
                    type="button"
                    variant={editCurrency === 'L.L.' ? 'default' : 'secondary'}
                    className="flex-1"
                    onClick={() => setEditCurrency('L.L.')}
                  >
                    L.L.
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCategory">Category</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger className="input-dark">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {data.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account field removed as per user request for DataPage detachment */}

            <div className="space-y-2">
              <Label htmlFor="editDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal input-dark",
                      !editDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={setEditDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleUpdateExpense} className="flex-1 sm:flex-none">
              <Pencil className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedExpense?.title}" and return the amount to its account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Confirmation */}
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Import?</AlertDialogTitle>
            <AlertDialogDescription>
              Uploading this file will replace ALL your existing expenses, categories, accounts, and monthly payments with the imported data. If categories, accounts, or monthly payments are missing from the imported file, your current data for those sections will be retained. Imported expenses without a specified account will be assigned to your default account. This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowImportConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmImport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Navigation />
    </div>
  );
}