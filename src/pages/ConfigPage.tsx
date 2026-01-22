import { useState } from 'react';
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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Category, MonthlyExpense, Currency } from '@/types/expense';
import { generateId, formatCurrency } from '@/lib/expenseUtils';
import {
  Settings,
  Tags,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  ArrowLeftRight,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ConfigPage() {
  const { data, setData } = useLocalStorage();

  // category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAllowance, setNewCategoryAllowance] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // monthly expense state
  const [newMonthlyTitle, setNewMonthlyTitle] = useState('');
  const [newMonthlyPrice, setNewMonthlyPrice] = useState('');
  const [newMonthlyCurrency, setNewMonthlyCurrency] = useState<Currency>('$');
  const [newMonthlyCategoryId, setNewMonthlyCategoryId] = useState(data.categories[0]?.id || 'misc');
  const [monthlyToDelete, setMonthlyToDelete] = useState<MonthlyExpense | null>(null);

  // conversion state
  const [conversionRate, setConversionRate] = useState(data.config.conversionRate.toString());

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const category: Category = {
      id: generateId(),
      name: newCategoryName.trim(),
      allowedPerMonth: newCategoryAllowance ? parseFloat(newCategoryAllowance) : null,
    };

    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));

    setNewCategoryName('');
    setNewCategoryAllowance('');
    toast.success('Category added!');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === editingCategory.id ? editingCategory : c
      ),
    }));

    setEditingCategory(null);
    toast.success('Category updated!');
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    // move all its expenses to default category Misc
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryToDelete.id),
      expenses: prev.expenses.map((e) =>
        e.categoryId === categoryToDelete.id ? { ...e, categoryId: 'misc' } : e
      ),
      monthlyExpenses: prev.monthlyExpenses.map((e) =>
        e.categoryId === categoryToDelete.id ? { ...e, categoryId: 'misc' } : e
      ),
    }));

    setCategoryToDelete(null);
    toast.success('Category deleted, expenses moved to Misc');
  };

  const handleAddMonthlyExpense = () => {
    if (!newMonthlyTitle.trim() || !newMonthlyPrice) {
      toast.error('Please fill in all monthly expense details.');
      return;
    }

    const monthlyExpense: MonthlyExpense = {
      id: generateId(),
      title: newMonthlyTitle.trim(),
      price: parseFloat(newMonthlyPrice),
      currency: newMonthlyCurrency,
      categoryId: newMonthlyCategoryId,
    };

    setData((prev) => ({
      ...prev,
      monthlyExpenses: [...prev.monthlyExpenses, monthlyExpense],
    }));

    setNewMonthlyTitle('');
    setNewMonthlyPrice('');
    toast.success('Monthly expense added!');
  };

  const handleDeleteMonthlyExpense = () => {
    if (!monthlyToDelete) return;

    setData((prev) => ({
      ...prev,
      monthlyExpenses: prev.monthlyExpenses.filter((m) => m.id !== monthlyToDelete.id),
    }));

    setMonthlyToDelete(null);
    toast.success('Monthly expense removed');
  };

  const handleUpdateConversionRate = () => {
    const rate = parseFloat(conversionRate);
    if (isNaN(rate) || rate <= 0) return;

    setData((prev) => ({
      ...prev,
      config: { ...prev.config, conversionRate: rate },
    }));

    toast.success('Conversion rate updated!');
  };

  const getCategoryName = (categoryId: string) =>
    data.categories.find((c) => c.id === categoryId)?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Configuration</h1>
            <p className="text-sm text-muted-foreground">Manage your settings</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <Card className="glass-card mb-6 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">1$ =</span>
              <Input
                type="number"
                value={conversionRate}
                onChange={(e) => setConversionRate(e.target.value)}
                className="input-dark font-mono flex-1"
              />
              <span className="text-sm text-muted-foreground">L.L.</span>
              <Button onClick={handleUpdateConversionRate} size="sm">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="glass-card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tags className="w-4 h-4 text-primary" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing categories */}
            <div className="space-y-2">
              {data.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {category.allowedPerMonth !== null
                        ? formatCurrency(category.allowedPerMonth, '$') + '/mo'
                        : 'No limit'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingCategory({ ...category })}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                          <DialogDescription>
                            Update the category name and allowance
                          </DialogDescription>
                        </DialogHeader>
                        {editingCategory && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={editingCategory.name}
                                onChange={(e) =>
                                  setEditingCategory({
                                    ...editingCategory,
                                    name: e.target.value,
                                  })
                                }
                                className="input-dark"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Monthly Allowance ($)</Label>
                              <Input
                                type="number"
                                value={editingCategory.allowedPerMonth ?? ''}
                                onChange={(e) =>
                                  setEditingCategory({
                                    ...editingCategory,
                                    allowedPerMonth: e.target.value
                                      ? parseFloat(e.target.value)
                                      : null,
                                  })
                                }
                                placeholder="Leave empty for no limit"
                                className="input-dark font-mono"
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button onClick={handleUpdateCategory}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {category.id !== 'misc' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add new category */}
            <div className="pt-4 border-t border-border space-y-3">
              <Label className="text-sm text-muted-foreground">Add New Category</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input-dark"
                />
                <Input
                  type="number"
                  placeholder="Allowance ($)"
                  value={newCategoryAllowance}
                  onChange={(e) => setNewCategoryAllowance(e.target.value)}
                  className="input-dark font-mono"
                />
              </div>
              <Button onClick={handleAddCategory} className="w-full" variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing monthly expenses */}
            <div className="space-y-2">
              {data.monthlyExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No monthly expenses configured
                </p>
              ) : (
                data.monthlyExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{expense.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({getCategoryName(expense.categoryId)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {formatCurrency(expense.price, expense.currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setMonthlyToDelete(expense)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add new monthly expense */}
            <div className="pt-4 border-t border-border space-y-3">
              <Label className="text-sm text-muted-foreground">Add Monthly Expense</Label>
              <Input
                placeholder="Title"
                value={newMonthlyTitle}
                onChange={(e) => setNewMonthlyTitle(e.target.value)}
                className="input-dark"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Price"
                  value={newMonthlyPrice}
                  onChange={(e) => setNewMonthlyPrice(e.target.value)}
                  className="input-dark font-mono"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant={newMonthlyCurrency === '$' ? 'default' : 'secondary'}
                    className="flex-1"
                    onClick={() => setNewMonthlyCurrency('$')}
                  >
                    <DollarSign className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={newMonthlyCurrency === 'L.L.' ? 'default' : 'secondary'}
                    className="flex-1"
                    onClick={() => setNewMonthlyCurrency('L.L.')}
                  >
                    L.L.
                  </Button>
                </div>
              </div>
              <Select value={newMonthlyCategoryId} onValueChange={setNewMonthlyCategoryId}>
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
              {/* Removed account selection for monthly expense */}
              <Button onClick={handleAddMonthlyExpense} className="w-full" variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Monthly Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete "{categoryToDelete?.name}" and move all its expenses to Misc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Monthly Expense Confirmation */}
      <AlertDialog open={!!monthlyToDelete} onOpenChange={() => setMonthlyToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Monthly Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{monthlyToDelete?.title}" from your monthly expenses list. Existing
              expenses already recorded will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMonthlyExpense}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Navigation />
    </div>
  );
}