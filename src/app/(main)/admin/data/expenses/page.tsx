// @ts-nocheck
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import {
  Receipt,
  Globe,
  GraduationCap,
  Library,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import { formatCurrency } from '@/lib/utils';
import type { PaginatedResponse } from '@/features/data-admin/types';

// =============================================================================
// Types
// =============================================================================

interface GeneralExpense {
  id: string;
  name: string;
  currency: string;
  start_amount: number | null;
  end_amount: number | null;
  description: string;
  tag: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CountryExpense {
  id: string;
  country: string;
  country_name?: string;
  name: string;
  currency: string;
  start_amount: number | null;
  end_amount: number | null;
  description: string;
  tag: string;
  is_default: boolean;
  linked_stage: string;
  created_at: string;
  updated_at: string;
}

interface UniversityExpense {
  id: string;
  university: string;
  university_name?: string;
  name: string;
  currency: string;
  start_amount: number | null;
  end_amount: number | null;
  description: string;
  tag: string;
  is_default: boolean;
  linked_stage: string;
  created_at: string;
  updated_at: string;
}

interface OfferingExpense {
  id: string;
  course_university: string;
  offering_name?: string;
  name: string;
  currency: string;
  start_amount: number | null;
  end_amount: number | null;
  description: string;
  tag: string;
  is_default: boolean;
  offer: number | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Generic CRUD hooks
// =============================================================================

function useExpenseList<T>(
  endpoint: string,
  key: string,
  params?: Record<string, string | null>
) {
  const { api } = useClientApi();
  const filteredParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v != null)
  );
  return useQuery<PaginatedResponse<T>>({
    queryKey: ['data-admin', key, filteredParams],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(endpoint, {
        params: { page_size: 200, ...filteredParams }
      });
      return res.data;
    },
    enabled: !!api
  });
}

function useExpenseCreate<T>(endpoint: string, key: string, label: string) {
  const { api } = useClientApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<T>) => {
      if (!api) throw new Error('API not initialized');
      const res = await api.post(endpoint, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${label} created successfully`);
      qc.invalidateQueries({ queryKey: ['data-admin', key] });
      qc.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          `Failed to create ${label.toLowerCase()}`
      );
    }
  });
}

function useExpenseUpdate<T>(endpoint: string, key: string, label: string) {
  const { api } = useClientApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      if (!api) throw new Error('API not initialized');
      const res = await api.patch(`${endpoint}${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${label} updated successfully`);
      qc.invalidateQueries({ queryKey: ['data-admin', key] });
      qc.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          `Failed to update ${label.toLowerCase()}`
      );
    }
  });
}

function useExpenseDelete(endpoint: string, key: string, label: string) {
  const { api } = useClientApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      await api.delete(`${endpoint}${id}/`);
    },
    onSuccess: () => {
      toast.success(`${label} deleted successfully`);
      qc.invalidateQueries({ queryKey: ['data-admin', key] });
      qc.invalidateQueries({ queryKey: ['data-admin', 'stats'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          `Failed to delete ${label.toLowerCase()}`
      );
    }
  });
}

// =============================================================================
// Generic inline table
// =============================================================================

interface InlineTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading: boolean;
  globalFilter: string;
  onGlobalFilterChange: (v: string) => void;
  emptyMessage: string;
}

function InlineTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  globalFilter,
  onGlobalFilterChange,
  emptyMessage
}: InlineTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <Input
        placeholder='Search...'
        value={globalFilter}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        className='max-w-sm'
      />
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
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
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          {table.getFilteredRowModel().rows.length} row(s)
        </p>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Amount formatting helper
// =============================================================================

function fmtAmount(amount: number | null, currency: string) {
  if (amount == null) return '-';
  return `${currency} ${amount.toLocaleString()}`;
}

// =============================================================================
// Shared expense form schema
// =============================================================================

const expenseFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency is required'),
  start_amount: z.coerce.number().min(0).nullable().default(null),
  end_amount: z.coerce.number().min(0).nullable().default(null),
  description: z.string().optional().default(''),
  tag: z.string().optional().default(''),
  is_default: z.boolean().default(false),
  linked_stage: z.string().optional().default(''),
  offer: z.coerce.number().nullable().optional().default(null),
  // FK fields
  country: z.string().nullable().optional(),
  university: z.string().nullable().optional(),
  course_university: z.string().nullable().optional()
});
type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// =============================================================================
// Expense Form Dialog (shared)
// =============================================================================

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: any | null;
  onSubmit: (values: ExpenseFormValues) => void;
  isPending: boolean;
  title: string;
  showCountry?: boolean;
  showUniversity?: boolean;
  showOffering?: boolean;
  showLinkedStage?: boolean;
  showOffer?: boolean;
  defaultCountry?: string | null;
  defaultUniversity?: string | null;
  defaultOffering?: string | null;
}

function ExpenseFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
  isPending,
  title,
  showCountry = false,
  showUniversity = false,
  showOffering = false,
  showLinkedStage = false,
  showOffer = false,
  defaultCountry = null,
  defaultUniversity = null,
  defaultOffering = null
}: ExpenseFormDialogProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: '',
      currency: 'TZS',
      start_amount: null,
      end_amount: null,
      description: '',
      tag: '',
      is_default: false,
      linked_stage: '',
      offer: null,
      country: null,
      university: null,
      course_university: null
    }
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        form.reset({
          name: editing.name ?? '',
          currency: editing.currency ?? 'TZS',
          start_amount: editing.start_amount ?? null,
          end_amount: editing.end_amount ?? null,
          description: editing.description ?? '',
          tag: editing.tag ?? '',
          is_default: editing.is_default ?? false,
          linked_stage: editing.linked_stage ?? '',
          offer: editing.offer ?? null,
          country: editing.country ?? defaultCountry,
          university: editing.university ?? defaultUniversity,
          course_university: editing.course_university ?? defaultOffering
        });
      } else {
        form.reset({
          name: '',
          currency: 'TZS',
          start_amount: null,
          end_amount: null,
          description: '',
          tag: '',
          is_default: false,
          linked_stage: '',
          offer: null,
          country: defaultCountry,
          university: defaultUniversity,
          course_university: defaultOffering
        });
      }
    }
  }, [open, editing, form, defaultCountry, defaultUniversity, defaultOffering]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit ${title}` : `Add ${title}`}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='max-h-[70vh] space-y-4 overflow-y-auto pr-2'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Expense name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCountry && (
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <EntityPicker
                      endpoint='/data-admin/countries/'
                      queryKey='data-admin-countries'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string
                      })}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder='Select country'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showUniversity && (
              <FormField
                control={form.control}
                name='university'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University</FormLabel>
                    <EntityPicker
                      endpoint='/data-admin/universities/'
                      queryKey='data-admin-universities'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string
                      })}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder='Select university'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showOffering && (
              <FormField
                control={form.control}
                name='course_university'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Offering</FormLabel>
                    <EntityPicker
                      endpoint='/data-admin/course-offerings/'
                      queryKey='data-admin-offerings'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string,
                        subtitle: item.university_name as string
                      })}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder='Select offering'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className='grid grid-cols-3 gap-3'>
              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Currency' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='TZS'>TZS</SelectItem>
                        <SelectItem value='USD'>USD</SelectItem>
                        <SelectItem value='EUR'>EUR</SelectItem>
                        <SelectItem value='GBP'>GBP</SelectItem>
                        <SelectItem value='KES'>KES</SelectItem>
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
                    <FormLabel>Start Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
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
                    <FormLabel>End Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='tag'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. tuition, living, visa'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showLinkedStage && (
              <FormField
                control={form.control}
                name='linked_stage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Stage</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. application, admission'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showOffer && (
              <FormField
                control={form.control}
                name='offer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer (0-1)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        min='0'
                        max='1'
                        placeholder='0.0'
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Description' rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='is_default'
              render={({ field }) => (
                <FormItem className='flex items-center gap-3 space-y-0 rounded-md border p-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='font-normal'>Is Default</FormLabel>
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Action menu helper
// =============================================================================

function ActionsMenu({
  onEdit,
  onDelete
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={onDelete}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============================================================================
// General Expenses Tab
// =============================================================================

function GeneralExpensesTab() {
  const { data, isLoading } = useExpenseList<GeneralExpense>(
    '/data-admin/general-expenses/',
    'general-expenses'
  );
  const createMut = useExpenseCreate<GeneralExpense>(
    '/data-admin/general-expenses/',
    'general-expenses',
    'General Expense'
  );
  const updateMut = useExpenseUpdate<GeneralExpense>(
    '/data-admin/general-expenses/',
    'general-expenses',
    'General Expense'
  );
  const deleteMut = useExpenseDelete(
    '/data-admin/general-expenses/',
    'general-expenses',
    'General Expense'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GeneralExpense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GeneralExpense | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<GeneralExpense>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
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
        header: 'Start Amount',
        cell: ({ row }) =>
          fmtAmount(row.original.start_amount, row.original.currency)
      },
      {
        accessorKey: 'end_amount',
        header: 'End Amount',
        cell: ({ row }) =>
          fmtAmount(row.original.end_amount, row.original.currency)
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
        cell: ({ row }) =>
          row.getValue('is_default') ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground/40 h-4 w-4' />
          )
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <ActionsMenu
            onEdit={() => {
              setEditing(row.original);
              setDialogOpen(true);
            }}
            onDelete={() => {
              setToDelete(row.original);
              setDeleteOpen(true);
            }}
          />
        )
      }
    ],
    []
  );

  return (
    <>
      <div className='mb-4 flex justify-end'>
        <Button
          size='sm'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add General Expense
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No general expenses found.'
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        title='General Expense'
        isPending={createMut.isPending || updateMut.isPending}
        onSubmit={(values) => {
          if (editing) {
            updateMut.mutate(
              { id: editing.id, data: values as any },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                }
              }
            );
          } else {
            createMut.mutate(values as any, {
              onSuccess: () => {
                setDialogOpen(false);
              }
            });
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete General Expense'
        description={`Are you sure you want to delete "${toDelete?.name}"?`}
        onConfirm={() => {
          if (toDelete) {
            deleteMut.mutate(toDelete.id, {
              onSuccess: () => {
                setDeleteOpen(false);
                setToDelete(null);
              }
            });
          }
        }}
        isPending={deleteMut.isPending}
      />
    </>
  );
}

// =============================================================================
// Country Expenses Tab
// =============================================================================

function CountryExpensesTab() {
  const [filterCountry, setFilterCountry] = useState<string | null>(null);

  const { data, isLoading } = useExpenseList<CountryExpense>(
    '/data-admin/country-expenses/',
    'country-expenses',
    { country: filterCountry }
  );
  const createMut = useExpenseCreate<CountryExpense>(
    '/data-admin/country-expenses/',
    'country-expenses',
    'Country Expense'
  );
  const updateMut = useExpenseUpdate<CountryExpense>(
    '/data-admin/country-expenses/',
    'country-expenses',
    'Country Expense'
  );
  const deleteMut = useExpenseDelete(
    '/data-admin/country-expenses/',
    'country-expenses',
    'Country Expense'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CountryExpense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CountryExpense | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<CountryExpense>[]>(
    () => [
      {
        id: 'country_name',
        header: 'Country',
        accessorFn: (row) => row.country_name ?? '-',
        cell: ({ getValue }) => (
          <span className='font-medium'>{getValue() as string}</span>
        )
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.getValue('name')
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => (
          <Badge variant='outline'>{row.getValue('currency')}</Badge>
        )
      },
      {
        id: 'amount_range',
        header: 'Amount Range',
        cell: ({ row }) => (
          <span className='text-sm'>
            {fmtAmount(row.original.start_amount, row.original.currency)}
            {' - '}
            {fmtAmount(row.original.end_amount, row.original.currency)}
          </span>
        )
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: ({ row }) => {
          const tag = row.getValue('tag') as string;
          return tag ? <Badge variant='secondary'>{tag}</Badge> : '-';
        }
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) =>
          row.getValue('is_default') ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground/40 h-4 w-4' />
          )
      },
      {
        accessorKey: 'linked_stage',
        header: 'Stage',
        cell: ({ row }) => {
          const v = row.getValue('linked_stage') as string;
          return v ? <Badge variant='outline'>{v}</Badge> : '-';
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <ActionsMenu
            onEdit={() => {
              setEditing(row.original);
              setDialogOpen(true);
            }}
            onDelete={() => {
              setToDelete(row.original);
              setDeleteOpen(true);
            }}
          />
        )
      }
    ],
    []
  );

  return (
    <>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='w-72'>
          <EntityPicker
            endpoint='/data-admin/countries/'
            queryKey='data-admin-countries'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string
            })}
            value={filterCountry}
            onChange={setFilterCountry}
            placeholder='Filter by country...'
          />
        </div>
        <Button
          size='sm'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Country Expense
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No country expenses found.'
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        title='Country Expense'
        showCountry
        showLinkedStage
        defaultCountry={filterCountry}
        isPending={createMut.isPending || updateMut.isPending}
        onSubmit={(values) => {
          if (editing) {
            updateMut.mutate(
              { id: editing.id, data: values as any },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                }
              }
            );
          } else {
            createMut.mutate(values as any, {
              onSuccess: () => {
                setDialogOpen(false);
              }
            });
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Country Expense'
        description={`Are you sure you want to delete "${toDelete?.name}"?`}
        onConfirm={() => {
          if (toDelete) {
            deleteMut.mutate(toDelete.id, {
              onSuccess: () => {
                setDeleteOpen(false);
                setToDelete(null);
              }
            });
          }
        }}
        isPending={deleteMut.isPending}
      />
    </>
  );
}

// =============================================================================
// University Expenses Tab
// =============================================================================

function UniversityExpensesTab() {
  const [filterUniversity, setFilterUniversity] = useState<string | null>(null);

  const { data, isLoading } = useExpenseList<UniversityExpense>(
    '/data-admin/university-expenses/',
    'university-expenses',
    { university: filterUniversity }
  );
  const createMut = useExpenseCreate<UniversityExpense>(
    '/data-admin/university-expenses/',
    'university-expenses',
    'University Expense'
  );
  const updateMut = useExpenseUpdate<UniversityExpense>(
    '/data-admin/university-expenses/',
    'university-expenses',
    'University Expense'
  );
  const deleteMut = useExpenseDelete(
    '/data-admin/university-expenses/',
    'university-expenses',
    'University Expense'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UniversityExpense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UniversityExpense | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<UniversityExpense>[]>(
    () => [
      {
        id: 'university_name',
        header: 'University',
        accessorFn: (row) => row.university_name ?? '-',
        cell: ({ getValue }) => (
          <span className='font-medium'>{getValue() as string}</span>
        )
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.getValue('name')
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => (
          <Badge variant='outline'>{row.getValue('currency')}</Badge>
        )
      },
      {
        id: 'amount_range',
        header: 'Amount Range',
        cell: ({ row }) => (
          <span className='text-sm'>
            {fmtAmount(row.original.start_amount, row.original.currency)}
            {' - '}
            {fmtAmount(row.original.end_amount, row.original.currency)}
          </span>
        )
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: ({ row }) => {
          const tag = row.getValue('tag') as string;
          return tag ? <Badge variant='secondary'>{tag}</Badge> : '-';
        }
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) =>
          row.getValue('is_default') ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground/40 h-4 w-4' />
          )
      },
      {
        accessorKey: 'linked_stage',
        header: 'Stage',
        cell: ({ row }) => {
          const v = row.getValue('linked_stage') as string;
          return v ? <Badge variant='outline'>{v}</Badge> : '-';
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <ActionsMenu
            onEdit={() => {
              setEditing(row.original);
              setDialogOpen(true);
            }}
            onDelete={() => {
              setToDelete(row.original);
              setDeleteOpen(true);
            }}
          />
        )
      }
    ],
    []
  );

  return (
    <>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='w-72'>
          <EntityPicker
            endpoint='/data-admin/universities/'
            queryKey='data-admin-universities'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string,
              subtitle: item.country_name as string
            })}
            value={filterUniversity}
            onChange={setFilterUniversity}
            placeholder='Filter by university...'
          />
        </div>
        <Button
          size='sm'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add University Expense
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No university expenses found.'
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        title='University Expense'
        showUniversity
        showLinkedStage
        defaultUniversity={filterUniversity}
        isPending={createMut.isPending || updateMut.isPending}
        onSubmit={(values) => {
          if (editing) {
            updateMut.mutate(
              { id: editing.id, data: values as any },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                }
              }
            );
          } else {
            createMut.mutate(values as any, {
              onSuccess: () => {
                setDialogOpen(false);
              }
            });
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete University Expense'
        description={`Are you sure you want to delete "${toDelete?.name}"?`}
        onConfirm={() => {
          if (toDelete) {
            deleteMut.mutate(toDelete.id, {
              onSuccess: () => {
                setDeleteOpen(false);
                setToDelete(null);
              }
            });
          }
        }}
        isPending={deleteMut.isPending}
      />
    </>
  );
}

// =============================================================================
// Course Offering Expenses Tab
// =============================================================================

function OfferingExpensesTab() {
  const [filterUniversity, setFilterUniversity] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState<string | null>(null);

  const params: Record<string, string | null> = {};
  if (filterUniversity) params.university = filterUniversity;
  if (filterCourse) params.course = filterCourse;

  const { data, isLoading } = useExpenseList<OfferingExpense>(
    '/data-admin/course-offering-expenses/',
    'course-offering-expenses',
    params
  );
  const createMut = useExpenseCreate<OfferingExpense>(
    '/data-admin/course-offering-expenses/',
    'course-offering-expenses',
    'Offering Expense'
  );
  const updateMut = useExpenseUpdate<OfferingExpense>(
    '/data-admin/course-offering-expenses/',
    'course-offering-expenses',
    'Offering Expense'
  );
  const deleteMut = useExpenseDelete(
    '/data-admin/course-offering-expenses/',
    'course-offering-expenses',
    'Offering Expense'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OfferingExpense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OfferingExpense | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<OfferingExpense>[]>(
    () => [
      {
        id: 'offering_name',
        header: 'Offering',
        accessorFn: (row) => row.offering_name ?? row.course_university ?? '-',
        cell: ({ getValue }) => (
          <span className='block max-w-[200px] truncate font-medium'>
            {getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.getValue('name')
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => (
          <Badge variant='outline'>{row.getValue('currency')}</Badge>
        )
      },
      {
        id: 'amount_range',
        header: 'Amount Range',
        cell: ({ row }) => (
          <span className='text-sm'>
            {fmtAmount(row.original.start_amount, row.original.currency)}
            {' - '}
            {fmtAmount(row.original.end_amount, row.original.currency)}
          </span>
        )
      },
      {
        accessorKey: 'tag',
        header: 'Tag',
        cell: ({ row }) => {
          const tag = row.getValue('tag') as string;
          return tag ? <Badge variant='secondary'>{tag}</Badge> : '-';
        }
      },
      {
        accessorKey: 'is_default',
        header: 'Default',
        cell: ({ row }) =>
          row.getValue('is_default') ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground/40 h-4 w-4' />
          )
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <ActionsMenu
            onEdit={() => {
              setEditing(row.original);
              setDialogOpen(true);
            }}
            onDelete={() => {
              setToDelete(row.original);
              setDeleteOpen(true);
            }}
          />
        )
      }
    ],
    []
  );

  return (
    <>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex gap-3'>
          <div className='w-64'>
            <EntityPicker
              endpoint='/data-admin/universities/'
              queryKey='data-admin-universities'
              mapItem={(item) => ({
                id: item.id as string,
                name: item.name as string
              })}
              value={filterUniversity}
              onChange={setFilterUniversity}
              placeholder='Filter by university...'
            />
          </div>
          <div className='w-64'>
            <EntityPicker
              endpoint='/data-admin/courses/'
              queryKey='data-admin-courses'
              mapItem={(item) => ({
                id: item.id as string,
                name: item.name as string
              })}
              value={filterCourse}
              onChange={setFilterCourse}
              placeholder='Filter by course...'
            />
          </div>
        </div>
        <Button
          size='sm'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Offering Expense
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No offering expenses found.'
      />

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        title='Offering Expense'
        showOffering
        showOffer
        isPending={createMut.isPending || updateMut.isPending}
        onSubmit={(values) => {
          if (editing) {
            updateMut.mutate(
              { id: editing.id, data: values as any },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  setEditing(null);
                }
              }
            );
          } else {
            createMut.mutate(values as any, {
              onSuccess: () => {
                setDialogOpen(false);
              }
            });
          }
        }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Offering Expense'
        description={`Are you sure you want to delete "${toDelete?.name}"?`}
        onConfirm={() => {
          if (toDelete) {
            deleteMut.mutate(toDelete.id, {
              onSuccess: () => {
                setDeleteOpen(false);
                setToDelete(null);
              }
            });
          }
        }}
        isPending={deleteMut.isPending}
      />
    </>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function ExpensesDataPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [activeTab, setActiveTab] = useState('general');

  const analyticsItems = [
    {
      label: 'General Expenses',
      value: stats?.overview?.countries ?? 0,
      icon: DollarSign,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'Country Expenses',
      value: stats?.countries?.total_expenses ?? 0,
      icon: Globe,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'University Expenses',
      value: stats?.universities?.total ?? 0,
      icon: GraduationCap,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    },
    {
      label: 'Offering Expenses',
      value: stats?.course_offerings?.with_expenses ?? 0,
      icon: Library,
      color:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Receipt className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Expenses & Fees
            </h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage fee structures across general, country, university, and
            course offering levels
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='px-6 py-4'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='mt-2 h-8 w-16' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <SectionAnalytics stats={analyticsItems} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='general'>General Expenses</TabsTrigger>
            <TabsTrigger value='country'>Country Expenses</TabsTrigger>
            <TabsTrigger value='university'>University Expenses</TabsTrigger>
            <TabsTrigger value='offering'>Offering Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='mt-4'>
            <GeneralExpensesTab />
          </TabsContent>

          <TabsContent value='country' className='mt-4'>
            <CountryExpensesTab />
          </TabsContent>

          <TabsContent value='university' className='mt-4'>
            <UniversityExpensesTab />
          </TabsContent>

          <TabsContent value='offering' className='mt-4'>
            <OfferingExpensesTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
