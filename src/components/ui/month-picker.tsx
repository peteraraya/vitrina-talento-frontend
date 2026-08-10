'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

interface MonthPickerProps {
  value?: string; // YYYY-MM
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MonthPicker({ value, onChange, disabled }: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(new Date().getFullYear());

  // Parse value
  const selectedYear = value ? parseInt(value.split('-')[0], 10) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1], 10) - 1 : null;

  React.useEffect(() => {
    if (value && isOpen) {
      setViewYear(parseInt(value.split('-')[0], 10));
    }
  }, [value, isOpen]);

  const handleSelectMonth = (monthIndex: number) => {
    const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${!value ? 'text-gray-500' : ''}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? `${MONTHS[selectedMonth || 0]} ${selectedYear}` : 'Seleccionar fecha'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewYear(viewYear - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold">{viewYear}</div>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewYear(viewYear + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((m, i) => {
            const isSelected = selectedYear === viewYear && selectedMonth === i;
            return (
              <Button
                key={m}
                variant={isSelected ? 'default' : 'ghost'}
                className={`h-9 ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => handleSelectMonth(i)}
              >
                {m}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
