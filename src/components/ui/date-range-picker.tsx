'use client';

import * as React from 'react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  subMonths
} from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface DateRangePreset {
  label: string;
  getValue: () => DateRange;
}

const PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    getValue: () => ({ from: new Date(), to: new Date() })
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: yesterday, to: yesterday };
    }
  },
  {
    label: 'This Week',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: 'Last 7 Days',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date()
    })
  },
  {
    label: 'This Month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Last 30 Days',
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date()
    })
  },
  {
    label: 'Last 3 Months',
    getValue: () => ({
      from: subMonths(new Date(), 3),
      to: new Date()
    })
  },
  {
    label: 'This Year',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: new Date()
    })
  }
];

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  className,
  align = 'end'
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  const handlePreset = (preset: DateRangePreset) => {
    const range = preset.getValue();
    onChange?.(range);
    setActivePreset(preset.label);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onChange?.(range);
    setActivePreset(null);
  };

  const handleClear = () => {
    onChange?.(undefined);
    setActivePreset(null);
    setOpen(false);
  };

  // Find matching preset label for display
  const displayLabel = React.useMemo(() => {
    if (activePreset) return activePreset;
    if (!value?.from) return null;
    // Check if current value matches any preset
    for (const preset of PRESETS) {
      const presetVal = preset.getValue();
      if (
        presetVal.from &&
        presetVal.to &&
        value.from &&
        value.to &&
        format(presetVal.from, 'yyyy-MM-dd') ===
          format(value.from, 'yyyy-MM-dd') &&
        format(presetVal.to, 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd')
      ) {
        return preset.label;
      }
    }
    return null;
  }, [value, activePreset]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn(
            'h-9 justify-start text-left font-normal',
            !value?.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4 shrink-0' />
          {value?.from ? (
            <span className='truncate'>
              {displayLabel ? (
                <span className='font-medium'>{displayLabel}</span>
              ) : value.to ? (
                <>
                  {format(value.from, 'MMM d, yyyy')} –{' '}
                  {format(value.to, 'MMM d, yyyy')}
                </>
              ) : (
                format(value.from, 'MMM d, yyyy')
              )}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align={align}>
        <div className='flex flex-col sm:flex-row'>
          {/* Presets sidebar */}
          <div className='border-b p-2 sm:w-[140px] sm:border-r sm:border-b-0'>
            <div className='flex flex-row flex-wrap gap-1 sm:flex-col'>
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant={
                    activePreset === preset.label ? 'secondary' : 'ghost'
                  }
                  size='sm'
                  className={cn(
                    'h-8 justify-start text-xs font-normal',
                    activePreset === preset.label && 'font-medium'
                  )}
                  onClick={() => handlePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          {/* Calendar */}
          <div className='p-0'>
            <Calendar
              mode='range'
              defaultMonth={value?.from}
              selected={value}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
            <div className='flex items-center justify-between border-t px-3 py-2'>
              <p className='text-muted-foreground text-xs'>
                {value?.from && value?.to
                  ? `${format(value.from, 'MMM d')} – ${format(value.to, 'MMM d, yyyy')}`
                  : 'Select a range'}
              </p>
              <div className='flex gap-1.5'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs'
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button
                  size='sm'
                  className='h-7 text-xs'
                  onClick={() => setOpen(false)}
                  disabled={!value?.from}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
