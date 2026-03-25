'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourseOfferingExpenses } from '@/features/data-admin/hooks/use-course-offerings';
import type { DataCourseOfferingExpense } from '@/features/data-admin/types';
import { formatCurrency } from '@/lib/utils';

export default function ExpensesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const { data, isLoading } = useCourseOfferingExpenses();

  const columns = useMemo<ColumnDef<DataCourseOfferingExpense>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Receipt className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'iname',
        header: 'Internal Name',
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {row.getValue('iname') || '--'}
          </span>
        ),
        enableSorting: false
      },
      {
        accessorKey: 'start_amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Start Amount' />
        ),
        cell: ({ row }) => {
          const amount = row.getValue('start_amount') as number;
          return (
            <span className='text-sm tabular-nums'>
              {amount ? formatCurrency(amount) : '--'}
            </span>
          );
        }
      },
      {
        accessorKey: 'end_amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='End Amount' />
        ),
        cell: ({ row }) => {
          const amount = row.getValue('end_amount') as number;
          return (
            <span className='text-sm tabular-nums'>
              {amount ? formatCurrency(amount) : '--'}
            </span>
          );
        }
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => (
          <Badge variant='outline'>{row.getValue('currency') ?? 'TZS'}</Badge>
        ),
        enableSorting: false
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: ({ row }) => {
          const tag = row.getValue('tag') as string;
          return tag ? (
            <Badge variant='secondary'>{tag}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>--</span>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) => {
          const isDefault = row.getValue('is_default') as boolean;
          return (
            <Badge
              variant={isDefault ? 'default' : 'secondary'}
              className={
                isDefault
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                  : ''
              }
            >
              {isDefault ? 'Default' : 'Optional'}
            </Badge>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className='text-muted-foreground max-w-[200px] truncate text-sm'>
            {row.getValue('description') || '--'}
          </span>
        ),
        enableSorting: false
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Created' />
        ),
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string;
          return date ? (
            <span className='text-muted-foreground text-sm'>
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
          ) : (
            '--'
          );
        }
      }
    ],
    []
  );

  const tableData = data?.results ?? [];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-[250px]' />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        searchPlaceholder='Search expenses...'
      />

      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
