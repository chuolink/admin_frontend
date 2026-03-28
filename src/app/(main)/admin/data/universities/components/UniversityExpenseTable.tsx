// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { ServerPagination } from '@/features/data-admin/components/ServerPagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  TableFilters,
  type FilterDef
} from '@/features/data-admin/components/TableFilters';
import {
  useUniversityExpenses,
  useCreateUniversityExpense,
  useUpdateUniversityExpense,
  useDeleteUniversityExpense
} from '@/features/data-admin/hooks/use-university-sub';
import type { DataUniversityExpense } from '@/features/data-admin/types';

const expenseSchema = z.object({
  university: z.string().min(1, 'University is required'),
  name: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency is required'),
  start_amount: z.coerce.number().min(0, 'Must be a positive number'),
  end_amount: z.coerce.number().min(0, 'Must be a positive number'),
  tag: z.string().optional().default(''),
  is_default: z.boolean().optional().default(false)
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface UniversityExpenseTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function UniversityExpenseTable({
  dialogOpen,
  onDialogOpenChange
}: UniversityExpenseTableProps) {
  const [universityFilter, setUniversityFilter] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data: expensesData, isLoading } = useUniversityExpenses({
    page: String(page),
    page_size: String(pageSize),
    ...(universityFilter ? { university: universityFilter } : {}),
    ...Object.fromEntries(Object.entries(filterValues).filter(([, v]) => v))
  } as Record<string, string>);
  const createExpense = useCreateUniversityExpense();
  const updateExpense = useUpdateUniversityExpense();
  const deleteExpense = useDeleteUniversityExpense();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingExpense, setEditingExpense] =
    useState<DataUniversityExpense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] =
    useState<DataUniversityExpense | null>(null);

  const isEdit = !!editingExpense;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      university: '',
      name: '',
      currency: 'USD',
      start_amount: 0,
      end_amount: 0,
      tag: '',
      is_default: false
    }
  });

  useEffect(() => {
    if (dialogOpen && !editingExpense) {
      form.reset({
        university: universityFilter ?? '',
        name: '',
        currency: 'USD',
        start_amount: 0,
        end_amount: 0,
        tag: '',
        is_default: false
      });
    }
  }, [dialogOpen, editingExpense, form, universityFilter]);

  const handleEdit = (expense: DataUniversityExpense) => {
    setEditingExpense(expense);
    form.reset({
      university: expense.university,
      name: expense.name,
      currency: expense.currency,
      start_amount: expense.start_amount,
      end_amount: expense.end_amount,
      tag: expense.tag ?? '',
      is_default: expense.is_default ?? false
    });
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditingExpense(null);
  };

  const onSubmit = (values: ExpenseFormValues) => {
    if (isEdit && editingExpense) {
      updateExpense.mutate(
        { id: editingExpense.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createExpense.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const handleDeleteConfirm = () => {
    if (!expenseToDelete) return;
    deleteExpense.mutate(expenseToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setExpenseToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataUniversityExpense>[]>(
    () => [
      {
        accessorKey: 'university_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='University' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.university_name ?? '-'}
          </span>
        )
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => (
          <Badge variant='outline'>{row.getValue('currency')}</Badge>
        )
      },
      {
        accessorKey: 'start_amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Start Amount' />
        ),
        cell: ({ row }) => {
          const value = row.getValue('start_amount') as number;
          return (
            <span className='tabular-nums'>
              {value?.toLocaleString() ?? '-'}
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
          const value = row.getValue('end_amount') as number;
          return (
            <span className='tabular-nums'>
              {value?.toLocaleString() ?? '-'}
            </span>
          );
        }
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: ({ row }) => {
          const tag = row.getValue('tag') as string;
          return tag ? (
            <Badge variant='secondary'>{tag}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) => (
          <Badge variant={row.original.is_default ? 'default' : 'outline'}>
            {row.original.is_default ? 'Yes' : 'No'}
          </Badge>
        )
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const expense = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem onClick={() => handleEdit(expense)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setExpenseToDelete(expense);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    []
  );

  const tableData = expensesData?.results ?? [];

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const isPending = createExpense.isPending || updateExpense.isPending;

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
    <>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='max-w-xs'>
            <EntityPicker
              endpoint='/data-admin/universities/'
              queryKey='data-admin-universities'
              mapItem={(item) => ({
                id: item.id as string,
                name: item.name as string
              })}
              value={universityFilter}
              onChange={setUniversityFilter}
              placeholder='Filter by university...'
            />
          </div>
          <TableFilters
            filters={
              [
                {
                  key: 'is_default',
                  label: 'Default',
                  type: 'boolean'
                },
                {
                  key: 'currency',
                  label: 'Currency',
                  type: 'select',
                  options: [
                    { value: 'TZS', label: 'TZS' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'KES', label: 'KES' },
                    { value: 'UGX', label: 'UGX' },
                    { value: 'RWF', label: 'RWF' },
                    { value: 'CAD', label: 'CAD' },
                    { value: 'AUD', label: 'AUD' },
                    { value: 'CNY', label: 'CNY' }
                  ]
                }
              ] satisfies FilterDef[]
            }
            values={filterValues}
            onChange={(key, val) =>
              setFilterValues((prev) => ({ ...prev, [key]: val }))
            }
          />
        </div>

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
                  <TableRow
                    key={row.id}
                    className='hover:bg-muted/50 cursor-pointer'
                    onClick={() => handleEdit(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === 'actions'
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
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

        <ServerPagination
          totalCount={expensesData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='university'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>University</FormLabel>
                    <FormControl>
                      <EntityPicker
                        endpoint='/data-admin/universities/'
                        queryKey='data-admin-universities'
                        mapItem={(item) => ({
                          id: item.id as string,
                          name: item.name as string
                        })}
                        value={field.value || null}
                        onChange={(id) => field.onChange(id ?? '')}
                        placeholder='Select university...'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., Tuition Fee' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Currency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='USD'>USD</SelectItem>
                          <SelectItem value='EUR'>EUR</SelectItem>
                          <SelectItem value='GBP'>GBP</SelectItem>
                          <SelectItem value='KES'>KES</SelectItem>
                          <SelectItem value='TZS'>TZS</SelectItem>
                          <SelectItem value='UGX'>UGX</SelectItem>
                          <SelectItem value='RWF'>RWF</SelectItem>
                          <SelectItem value='CAD'>CAD</SelectItem>
                          <SelectItem value='AUD'>AUD</SelectItem>
                          <SelectItem value='CNY'>CNY</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='start_amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Start Amount</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} step='0.01' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='end_amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>End Amount</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} step='0.01' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='tag'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g., Accommodation' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='is_default'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-end gap-2 space-y-0 pt-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Is Default</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCloseDialog}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {isEdit ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Expense'
        description={`Are you sure you want to delete "${expenseToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteExpense.isPending}
      />
    </>
  );
}
