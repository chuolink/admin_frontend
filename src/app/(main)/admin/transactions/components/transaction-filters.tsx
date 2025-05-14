'use client';

import { Button } from '@/components/ui/button';
import { IconFilter } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TransactionFilters as TransactionFiltersType } from '@/types';

interface TransactionFiltersProps {
  filters: TransactionFiltersType;
  onFilterChange: (key: keyof TransactionFiltersType, value: string) => void;
}

export function TransactionFilters({
  filters,
  onFilterChange
}: TransactionFiltersProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <IconFilter className='mr-2 h-4 w-4' />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Payment Method</Label>
            <Select
              value={filters.payment_method}
              onValueChange={(value) => onFilterChange('payment_method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='bank'>Bank Transfer</SelectItem>
                <SelectItem value='mobile'>Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Search</Label>
            <Input
              placeholder='Search by student name...'
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Start Date</Label>
              <DatePicker
                value={
                  filters.start_date ? new Date(filters.start_date) : undefined
                }
                onChange={(date) =>
                  onFilterChange('start_date', date?.toISOString() || '')
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>End Date</Label>
              <DatePicker
                value={
                  filters.end_date ? new Date(filters.end_date) : undefined
                }
                onChange={(date) =>
                  onFilterChange('end_date', date?.toISOString() || '')
                }
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
