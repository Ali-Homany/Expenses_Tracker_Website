import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMonthDisplay } from '@/lib/expenseUtils';
import { format, addMonths, subMonths } from 'date-fns';

interface MonthSelectorProps {
  currentMonth: string;
  onChange: (month: string) => void;
}

export function MonthSelector({ currentMonth, onChange }: MonthSelectorProps) {
  const [year, month] = currentMonth.split('-').map(Number);
  const currentDate = new Date(year, month - 1);

  const handlePrev = () => {
    const newDate = subMonths(currentDate, 1);
    onChange(format(newDate, 'yyyy-MM'));
  };

  const handleNext = () => {
    const newDate = addMonths(currentDate, 1);
    onChange(format(newDate, 'yyyy-MM'));
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={handlePrev}>
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <span className="font-semibold text-lg">{formatMonthDisplay(currentMonth)}</span>
      <Button variant="ghost" size="icon" onClick={handleNext}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
