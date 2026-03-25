'use client';

import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface FacetedFilterConfig {
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: FacetedFilterConfig[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Search...',
  filters = [],
  globalFilter,
  onGlobalFilterChange,
  children
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    (globalFilter !== undefined && globalFilter !== '');

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {onGlobalFilterChange ? (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
        ) : searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        ) : null}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters();
              if (onGlobalFilterChange) onGlobalFilterChange('');
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <X className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
