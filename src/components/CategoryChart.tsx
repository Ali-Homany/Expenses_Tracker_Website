import { useMemo } from 'react';
import { Expense, Category } from '@/types/expense';
import { calculateCategoryTotals, formatCurrency } from '@/lib/expenseUtils';

interface CategoryChartProps {
  expenses: Expense[];
  categories: Category[];
  conversionRate: number;
}

export function CategoryChart({ expenses, categories, conversionRate }: CategoryChartProps) {
  const categoryData = useMemo(() => {
    const totals = calculateCategoryTotals(expenses, categories, conversionRate);
    return Array.from(totals.values())
      .filter((item) => item.allowed !== null || item.consumed > 0)
      .sort((a, b) => {
        // sort by percentage used (if has allowance), then by consumed
        const aRatio = a.allowed ? a.consumed / a.allowed : 0;
        const bRatio = b.allowed ? b.consumed / b.allowed : 0;
        return bRatio - aRatio;
      });
  }, [expenses, categories, conversionRate]);

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories with data to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categoryData.map(({ consumed, allowed, category }) => {
        const percentage = allowed ? Math.min((consumed / allowed) * 100, 100) : 0;
        const isOver = allowed !== null && consumed > allowed;
        const remaining = allowed !== null ? allowed - consumed : null;

        return (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{category.name}</span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={isOver ? 'text-destructive' : 'text-foreground'}>
                  {formatCurrency(consumed, '$')}
                </span>
                {allowed !== null && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(allowed, '$')}
                    </span>
                  </>
                )}
              </div>
            </div>

            {allowed !== null ? (
              <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                {/* Allowed (background) */}
                <div className="absolute inset-0 bg-secondary" />
                
                {/* Consumed */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                    isOver
                      ? 'bg-destructive glow-destructive'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />

                {/* Percentage label */}
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-xs font-mono text-foreground/80">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-6 bg-muted rounded-md flex items-center px-3">
                <span className="text-xs text-muted-foreground">No limit set</span>
              </div>
            )}

            {remaining !== null && (
              <div className="text-xs text-right">
                {isOver ? (
                  <span className="text-destructive font-medium">
                    Over by {formatCurrency(Math.abs(remaining), '$')}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {formatCurrency(remaining, '$')} remaining
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
