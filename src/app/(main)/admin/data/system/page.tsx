// @ts-nocheck
'use client';

import { useQueryState } from 'nuqs';

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
  Settings,
  Hash,
  CreditCard,
  Mail,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import type { PaginatedResponse } from '@/features/data-admin/types';

// =============================================================================
// Types
// =============================================================================

interface NumberConstant {
  id: string;
  name: string;
  value: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  duration: number;
  duration_unit?: string;
  discount_percentage: number | null;
  description: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface MailingListEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Generic CRUD hooks
// =============================================================================

function useCrudList<T>(endpoint: string, key: string) {
  const { api } = useClientApi();
  return useQuery<PaginatedResponse<T>>({
    queryKey: ['data-admin', key],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const res = await api.get(endpoint, { params: { page_size: 200 } });
      return res.data;
    },
    enabled: !!api
  });
}

function useCrudCreate<T>(endpoint: string, key: string, label: string) {
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

function useCrudUpdate<T>(endpoint: string, key: string, label: string) {
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

function useCrudDelete(endpoint: string, key: string, label: string) {
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
// Number Constants Tab
// =============================================================================

const numberConstantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.coerce.number({ required_error: 'Value is required' }),
  description: z.string().optional().default('')
});
type NumberConstantForm = z.infer<typeof numberConstantSchema>;

function NumberConstantsTab() {
  const { data, isLoading } = useCrudList<NumberConstant>(
    '/data-admin/number-constants/',
    'number-constants'
  );
  const createMut = useCrudCreate<NumberConstant>(
    '/data-admin/number-constants/',
    'number-constants',
    'Number Constant'
  );
  const updateMut = useCrudUpdate<NumberConstant>(
    '/data-admin/number-constants/',
    'number-constants',
    'Number Constant'
  );
  const deleteMut = useCrudDelete(
    '/data-admin/number-constants/',
    'number-constants',
    'Number Constant'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NumberConstant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<NumberConstant | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<NumberConstantForm>({
    resolver: zodResolver(numberConstantSchema),
    defaultValues: { name: '', value: 0, description: '' }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          value: editing.value,
          description: editing.description ?? ''
        });
      } else {
        form.reset({ name: '', value: 0, description: '' });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: NumberConstantForm) => {
    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditing(null);
          }
        }
      );
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          setDialogOpen(false);
        }
      });
    }
  };

  const columns = useMemo<ColumnDef<NumberConstant>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Hash className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono text-base'>
            {row.getValue('value')}
          </Badge>
        )
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className='text-muted-foreground block max-w-[300px] truncate text-sm'>
            {row.getValue('description') || '-'}
          </span>
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

  const isPending = createMut.isPending || updateMut.isPending;

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
          Add Constant
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No number constants found.'
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Number Constant' : 'Add Number Constant'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. MAX_APPLICATIONS' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='value'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Value</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='any'
                        placeholder='0'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='What this constant is used for'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Number Constant'
        description={`Are you sure you want to delete "${toDelete?.name}"? This may affect system behavior.`}
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
// Subscriptions Tab
// =============================================================================

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().min(0, 'Amount must be 0 or more'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1'),
  duration_unit: z.string().optional().default('months'),
  discount_percentage: z.coerce.number().nullable().optional().default(null),
  description: z.string().optional().default(''),
  is_active: z.boolean().optional().default(true)
});
type SubscriptionForm = z.infer<typeof subscriptionSchema>;

function SubscriptionsTab() {
  const { data, isLoading } = useCrudList<Subscription>(
    '/data-admin/subscriptions/',
    'subscriptions'
  );
  const createMut = useCrudCreate<Subscription>(
    '/data-admin/subscriptions/',
    'subscriptions',
    'Subscription'
  );
  const updateMut = useCrudUpdate<Subscription>(
    '/data-admin/subscriptions/',
    'subscriptions',
    'Subscription'
  );
  const deleteMut = useCrudDelete(
    '/data-admin/subscriptions/',
    'subscriptions',
    'Subscription'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Subscription | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      amount: 0,
      duration: 1,
      duration_unit: 'months',
      discount_percentage: null,
      description: '',
      is_active: true
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          amount: editing.amount,
          duration: editing.duration,
          duration_unit: editing.duration_unit ?? 'months',
          discount_percentage: editing.discount_percentage,
          description: editing.description ?? '',
          is_active: editing.is_active ?? true
        });
      } else {
        form.reset({
          name: '',
          amount: 0,
          duration: 1,
          duration_unit: 'months',
          discount_percentage: null,
          description: '',
          is_active: true
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: SubscriptionForm) => {
    if (editing) {
      updateMut.mutate(
        { id: editing.id, data: values },
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
  };

  const columns = useMemo<ColumnDef<Subscription>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <CreditCard className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className='font-semibold'>
            TZS {(row.getValue('amount') as number).toLocaleString()}
          </span>
        )
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => (
          <span className='text-sm'>
            {row.getValue('duration')} {row.original.duration_unit ?? 'months'}
          </span>
        )
      },
      {
        accessorKey: 'discount_percentage',
        header: 'Discount %',
        cell: ({ row }) => {
          const v = row.original.discount_percentage;
          return v != null ? (
            <Badge
              variant='secondary'
              className='bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
            >
              {v}%
            </Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className='text-muted-foreground block max-w-[200px] truncate text-sm'>
            {row.getValue('description') || '-'}
          </span>
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

  const isPending = createMut.isPending || updateMut.isPending;

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
          Add Subscription
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No subscriptions found.'
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Subscription' : 'Add Subscription'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Premium Plan' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Amount (TZS)</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='0' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='discount_percentage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.1'
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
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='duration'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Duration</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='1'
                          placeholder='1'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='duration_unit'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder='months' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Plan description'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Subscription'
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
// Mailing List Tab
// =============================================================================

function MailingListTab() {
  const { data, isLoading } = useCrudList<MailingListEntry>(
    '/data-admin/mailing-list/',
    'mailing-list'
  );
  const deleteMut = useCrudDelete(
    '/data-admin/mailing-list/',
    'mailing-list',
    'Mailing List Entry'
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MailingListEntry | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<MailingListEntry | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<MailingListEntry>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className='text-sm'>{row.getValue('email')}</span>
        )
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {row.getValue('phone') || '-'}
          </span>
        )
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <span className='block max-w-[150px] truncate text-sm'>
            {row.getValue('subject') || '-'}
          </span>
        )
      },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => {
          const msg = row.getValue('message') as string;
          return (
            <span className='text-muted-foreground block max-w-[200px] truncate text-sm'>
              {msg ? (msg.length > 50 ? msg.slice(0, 50) + '...' : msg) : '-'}
            </span>
          );
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => {
          const d = row.getValue('created_at') as string;
          return d ? (
            <span className='text-muted-foreground text-sm'>
              {format(new Date(d), 'MMM d, yyyy')}
            </span>
          ) : (
            '-'
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => {
                  setViewing(row.original);
                  setViewOpen(true);
                }}
              >
                <Eye className='mr-2 h-4 w-4' />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => {
                  setToDelete(row.original);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    []
  );

  return (
    <>
      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No mailing list entries found.'
      />

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mailing List Entry</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className='space-y-3'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Name
                </p>
                <p className='text-sm'>{viewing.name}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Email
                </p>
                <p className='text-sm'>{viewing.email}</p>
              </div>
              {viewing.phone && (
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Phone
                  </p>
                  <p className='text-sm'>{viewing.phone}</p>
                </div>
              )}
              {viewing.subject && (
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Subject
                  </p>
                  <p className='text-sm'>{viewing.subject}</p>
                </div>
              )}
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Message
                </p>
                <p className='text-sm whitespace-pre-wrap'>
                  {viewing.message || '-'}
                </p>
              </div>
              {viewing.created_at && (
                <div>
                  <p className='text-muted-foreground text-sm font-medium'>
                    Created
                  </p>
                  <p className='text-sm'>
                    {format(new Date(viewing.created_at), 'PPpp')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Entry'
        description={`Are you sure you want to delete the entry from "${toDelete?.name}"?`}
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

export default function SystemDataPage() {
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'constants'
  });

  const analyticsItems = [
    {
      label: 'Number Constants',
      value: '-',
      icon: Hash,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'Subscriptions',
      value: '-',
      icon: CreditCard,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'Mailing List',
      value: '-',
      icon: Mail,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Settings className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>System</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage system constants, subscription plans, and mailing list
          </p>
        </div>

        {/* Stats */}
        <SectionAnalytics stats={analyticsItems} />

        {/* Tabs */}
        <Tabs value={activeTab ?? ''} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='constants'>Number Constants</TabsTrigger>
            <TabsTrigger value='subscriptions'>Subscriptions</TabsTrigger>
            <TabsTrigger value='mailing'>Mailing List</TabsTrigger>
          </TabsList>

          <TabsContent value='constants' className='mt-4'>
            <NumberConstantsTab />
          </TabsContent>

          <TabsContent value='subscriptions' className='mt-4'>
            <SubscriptionsTab />
          </TabsContent>

          <TabsContent value='mailing' className='mt-4'>
            <MailingListTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
