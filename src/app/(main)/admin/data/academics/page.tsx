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
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  Layers,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2
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
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import type {
  DataALevelCombination,
  DataALevelSubject,
  DataALevelGrade,
  DataOLevelSubject,
  DataOLevelGrade,
  PaginatedResponse
} from '@/features/data-admin/types';

// =============================================================================
// Generic CRUD hooks
// =============================================================================

function useAcademicList<T>(endpoint: string, key: string) {
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

function useAcademicCreate<T>(endpoint: string, key: string, label: string) {
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

function useAcademicUpdate<T>(endpoint: string, key: string, label: string) {
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

function useAcademicDelete(endpoint: string, key: string, label: string) {
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
// A-Level Combinations Tab
// =============================================================================

const combinationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  category: z.string().optional().default(''),
  description: z.string().optional().default('')
});
type CombinationForm = z.infer<typeof combinationSchema>;

function ALevelCombinationsTab() {
  const { data, isLoading } = useAcademicList<DataALevelCombination>(
    '/data-admin/alevel-combinations/',
    'alevel-combinations'
  );
  const createMut = useAcademicCreate<DataALevelCombination>(
    '/data-admin/alevel-combinations/',
    'alevel-combinations',
    'A-Level Combination'
  );
  const updateMut = useAcademicUpdate<DataALevelCombination>(
    '/data-admin/alevel-combinations/',
    'alevel-combinations',
    'A-Level Combination'
  );
  const deleteMut = useAcademicDelete(
    '/data-admin/alevel-combinations/',
    'alevel-combinations',
    'A-Level Combination'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataALevelCombination | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataALevelCombination | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<CombinationForm>({
    resolver: zodResolver(combinationSchema),
    defaultValues: { name: '', code: '', category: '', description: '' }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          code: editing.code,
          category: (editing as any).category ?? '',
          description: (editing as any).description ?? ''
        });
      } else {
        form.reset({ name: '', code: '', category: '', description: '' });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: CombinationForm) => {
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

  const columns = useMemo<ColumnDef<DataALevelCombination>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Combination',
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono'>
            {row.getValue('code')}
          </Badge>
        )
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => (row as any).category ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        id: 'description',
        header: 'Description',
        accessorFn: (row) => (row as any).description ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground max-w-[200px] truncate text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        id: 'subjects',
        header: 'Codes',
        cell: ({ row }) => {
          const names =
            row.original.subject_names ?? row.original.subjects ?? [];
          return (
            <div className='flex flex-wrap gap-1'>
              {names.slice(0, 3).map((s, i) => (
                <Badge key={i} variant='outline' className='text-xs'>
                  {s}
                </Badge>
              ))}
              {names.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{names.length - 3}
                </Badge>
              )}
            </div>
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
                  setEditing(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
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
          Add Combination
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No A-Level combinations found.'
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
              {editing ? 'Edit Combination' : 'Add Combination'}
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
                      <Input placeholder='e.g. PCB' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Code</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. PCB' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Science' {...field} />
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
                      <Textarea placeholder='Description' rows={2} {...field} />
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
        title='Delete A-Level Combination'
        description={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
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
// A-Level Subjects Tab
// =============================================================================

const alevelSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.string().optional().default(''),
  category: z.string().optional().default(''),
  is_active: z.boolean().default(true)
});
type ALevelSubjectForm = z.infer<typeof alevelSubjectSchema>;

function ALevelSubjectsTab() {
  const { data, isLoading } = useAcademicList<DataALevelSubject>(
    '/data-admin/alevel-subjects/',
    'alevel-subjects'
  );
  const createMut = useAcademicCreate<DataALevelSubject>(
    '/data-admin/alevel-subjects/',
    'alevel-subjects',
    'A-Level Subject'
  );
  const updateMut = useAcademicUpdate<DataALevelSubject>(
    '/data-admin/alevel-subjects/',
    'alevel-subjects',
    'A-Level Subject'
  );
  const deleteMut = useAcademicDelete(
    '/data-admin/alevel-subjects/',
    'alevel-subjects',
    'A-Level Subject'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataALevelSubject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataALevelSubject | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<ALevelSubjectForm>({
    resolver: zodResolver(alevelSubjectSchema),
    defaultValues: {
      name: '',
      code: '',
      type: '',
      category: '',
      is_active: true
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          code: editing.code,
          type: (editing as any).type ?? '',
          category: (editing as any).category ?? '',
          is_active: editing.is_active
        });
      } else {
        form.reset({
          name: '',
          code: '',
          type: '',
          category: '',
          is_active: true
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: ALevelSubjectForm) => {
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

  const columns = useMemo<ColumnDef<DataALevelSubject>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono'>
            {row.getValue('code')}
          </Badge>
        )
      },
      {
        id: 'type',
        header: 'Type',
        accessorFn: (row) => (row as any).type ?? '-',
        cell: ({ getValue }) => {
          const v = getValue() as string;
          return v && v !== '-' ? (
            <Badge variant='outline'>{v}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => (row as any).category ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'is_active',
        header: 'Active',
        cell: ({ row }) =>
          row.getValue('is_active') ? (
            <Badge className='bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'>
              Active
            </Badge>
          ) : (
            <Badge variant='secondary'>Inactive</Badge>
          )
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
                  setEditing(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
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
          Add Subject
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No A-Level subjects found.'
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
              {editing ? 'Edit A-Level Subject' : 'Add A-Level Subject'}
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
                      <Input placeholder='e.g. Physics' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Code</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. PHY' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Principal'>Principal</SelectItem>
                        <SelectItem value='Subsidiary'>Subsidiary</SelectItem>
                        <SelectItem value='Elective'>Elective</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Science' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-3 space-y-0 rounded-md border p-3'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>Active</FormLabel>
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
        title='Delete A-Level Subject'
        description={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
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
// A-Level Grades Tab
// =============================================================================

const alevelGradeSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  points: z.coerce.number().min(0, 'Points must be 0 or more'),
  min_marks: z.coerce.number().optional(),
  max_marks: z.coerce.number().optional(),
  range: z.string().optional().default(''),
  description: z.string().optional().default('')
});
type ALevelGradeForm = z.infer<typeof alevelGradeSchema>;

function ALevelGradesTab() {
  const { data, isLoading } = useAcademicList<DataALevelGrade>(
    '/data-admin/alevel-grades/',
    'alevel-grades'
  );
  const createMut = useAcademicCreate<DataALevelGrade>(
    '/data-admin/alevel-grades/',
    'alevel-grades',
    'A-Level Grade'
  );
  const updateMut = useAcademicUpdate<DataALevelGrade>(
    '/data-admin/alevel-grades/',
    'alevel-grades',
    'A-Level Grade'
  );
  const deleteMut = useAcademicDelete(
    '/data-admin/alevel-grades/',
    'alevel-grades',
    'A-Level Grade'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataALevelGrade | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataALevelGrade | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<ALevelGradeForm>({
    resolver: zodResolver(alevelGradeSchema),
    defaultValues: {
      grade: '',
      points: 0,
      min_marks: undefined,
      max_marks: undefined,
      range: '',
      description: ''
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          grade: editing.grade,
          points: editing.points,
          min_marks: (editing as any).min_marks ?? undefined,
          max_marks: (editing as any).max_marks ?? undefined,
          range: (editing as any).range ?? '',
          description: (editing as any).description ?? ''
        });
      } else {
        form.reset({
          grade: '',
          points: 0,
          min_marks: undefined,
          max_marks: undefined,
          range: '',
          description: ''
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: ALevelGradeForm) => {
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

  const columns = useMemo<ColumnDef<DataALevelGrade>[]>(
    () => [
      {
        accessorKey: 'grade',
        header: 'Grade',
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono text-base'>
            {row.getValue('grade')}
          </Badge>
        )
      },
      {
        accessorKey: 'points',
        header: 'Points',
        cell: ({ row }) => (
          <span className='font-semibold'>{row.getValue('points')}</span>
        )
      },
      {
        id: 'min_marks',
        header: 'Min',
        accessorFn: (row) => (row as any).min_marks ?? '-',
        cell: ({ getValue }) => (
          <span className='text-sm'>{String(getValue())}</span>
        )
      },
      {
        id: 'max_marks',
        header: 'Max',
        accessorFn: (row) => (row as any).max_marks ?? '-',
        cell: ({ getValue }) => (
          <span className='text-sm'>{String(getValue())}</span>
        )
      },
      {
        id: 'range',
        header: 'Range',
        accessorFn: (row) => (row as any).range ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        id: 'description',
        header: 'Description',
        accessorFn: (row) => (row as any).description ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
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
                  setEditing(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
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
          Add Grade
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No A-Level grades found.'
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
              {editing ? 'Edit A-Level Grade' : 'Add A-Level Grade'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='grade'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Grade</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. A' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='points'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Points</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='5' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='min_marks'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Marks</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='80' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='max_marks'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Marks</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='100' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='range'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Range</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 80-100' {...field} />
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
                      <Input placeholder='e.g. Excellent' {...field} />
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
        title='Delete A-Level Grade'
        description={`Are you sure you want to delete grade "${toDelete?.grade}"? This action cannot be undone.`}
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
// O-Level Subjects Tab
// =============================================================================

const olevelSubjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.string().optional().default(''),
  category: z.string().optional().default(''),
  is_active: z.boolean().default(true)
});
type OLevelSubjectForm = z.infer<typeof olevelSubjectSchema>;

function OLevelSubjectsTab() {
  const { data, isLoading } = useAcademicList<DataOLevelSubject>(
    '/data-admin/olevel-subjects/',
    'olevel-subjects'
  );
  const createMut = useAcademicCreate<DataOLevelSubject>(
    '/data-admin/olevel-subjects/',
    'olevel-subjects',
    'O-Level Subject'
  );
  const updateMut = useAcademicUpdate<DataOLevelSubject>(
    '/data-admin/olevel-subjects/',
    'olevel-subjects',
    'O-Level Subject'
  );
  const deleteMut = useAcademicDelete(
    '/data-admin/olevel-subjects/',
    'olevel-subjects',
    'O-Level Subject'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataOLevelSubject | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataOLevelSubject | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<OLevelSubjectForm>({
    resolver: zodResolver(olevelSubjectSchema),
    defaultValues: {
      name: '',
      code: '',
      type: '',
      category: '',
      is_active: true
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          code: editing.code,
          type: (editing as any).type ?? '',
          category: (editing as any).category ?? '',
          is_active: editing.is_active
        });
      } else {
        form.reset({
          name: '',
          code: '',
          type: '',
          category: '',
          is_active: true
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: OLevelSubjectForm) => {
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

  const columns = useMemo<ColumnDef<DataOLevelSubject>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className='font-medium'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono'>
            {row.getValue('code')}
          </Badge>
        )
      },
      {
        id: 'type',
        header: 'Type',
        accessorFn: (row) => (row as any).type ?? '-',
        cell: ({ getValue }) => {
          const v = getValue() as string;
          return v && v !== '-' ? (
            <Badge variant='outline'>{v}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => (row as any).category ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        accessorKey: 'is_active',
        header: 'Active',
        cell: ({ row }) =>
          row.getValue('is_active') ? (
            <Badge className='bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'>
              Active
            </Badge>
          ) : (
            <Badge variant='secondary'>Inactive</Badge>
          )
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
                  setEditing(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
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
          Add Subject
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No O-Level subjects found.'
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
              {editing ? 'Edit O-Level Subject' : 'Add O-Level Subject'}
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
                      <Input placeholder='e.g. Mathematics' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Code</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. MATH' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Compulsory' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Science' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-3 space-y-0 rounded-md border p-3'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>Active</FormLabel>
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
        title='Delete O-Level Subject'
        description={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
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
// O-Level Grades Tab
// =============================================================================

const olevelGradeSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  points: z.coerce.number().min(0, 'Points must be 0 or more'),
  min_marks: z.coerce.number().optional(),
  max_marks: z.coerce.number().optional(),
  range: z.string().optional().default(''),
  description: z.string().optional().default('')
});
type OLevelGradeForm = z.infer<typeof olevelGradeSchema>;

function OLevelGradesTab() {
  const { data, isLoading } = useAcademicList<DataOLevelGrade>(
    '/data-admin/olevel-grades/',
    'olevel-grades'
  );
  const createMut = useAcademicCreate<DataOLevelGrade>(
    '/data-admin/olevel-grades/',
    'olevel-grades',
    'O-Level Grade'
  );
  const updateMut = useAcademicUpdate<DataOLevelGrade>(
    '/data-admin/olevel-grades/',
    'olevel-grades',
    'O-Level Grade'
  );
  const deleteMut = useAcademicDelete(
    '/data-admin/olevel-grades/',
    'olevel-grades',
    'O-Level Grade'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataOLevelGrade | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataOLevelGrade | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<OLevelGradeForm>({
    resolver: zodResolver(olevelGradeSchema),
    defaultValues: {
      grade: '',
      points: 0,
      min_marks: undefined,
      max_marks: undefined,
      range: '',
      description: ''
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          grade: editing.grade,
          points: editing.points,
          min_marks: (editing as any).min_marks ?? undefined,
          max_marks: (editing as any).max_marks ?? undefined,
          range: (editing as any).range ?? '',
          description: (editing as any).description ?? ''
        });
      } else {
        form.reset({
          grade: '',
          points: 0,
          min_marks: undefined,
          max_marks: undefined,
          range: '',
          description: ''
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: OLevelGradeForm) => {
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

  const columns = useMemo<ColumnDef<DataOLevelGrade>[]>(
    () => [
      {
        accessorKey: 'grade',
        header: 'Grade',
        cell: ({ row }) => (
          <Badge variant='secondary' className='font-mono text-base'>
            {row.getValue('grade')}
          </Badge>
        )
      },
      {
        accessorKey: 'points',
        header: 'Points',
        cell: ({ row }) => (
          <span className='font-semibold'>{row.getValue('points')}</span>
        )
      },
      {
        id: 'min_marks',
        header: 'Min',
        accessorFn: (row) => (row as any).min_marks ?? '-',
        cell: ({ getValue }) => (
          <span className='text-sm'>{String(getValue())}</span>
        )
      },
      {
        id: 'max_marks',
        header: 'Max',
        accessorFn: (row) => (row as any).max_marks ?? '-',
        cell: ({ getValue }) => (
          <span className='text-sm'>{String(getValue())}</span>
        )
      },
      {
        id: 'range',
        header: 'Range',
        accessorFn: (row) => (row as any).range ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        id: 'description',
        header: 'Description',
        accessorFn: (row) => (row as any).description ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
          </span>
        )
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
                  setEditing(row.original);
                  setDialogOpen(true);
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
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
          Add Grade
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No O-Level grades found.'
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
              {editing ? 'Edit O-Level Grade' : 'Add O-Level Grade'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='grade'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Grade</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. A' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='points'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Points</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='1' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='min_marks'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Marks</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='75' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='max_marks'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Marks</FormLabel>
                      <FormControl>
                        <Input type='number' placeholder='100' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='range'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Range</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 75-100' {...field} />
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
                      <Input placeholder='e.g. Distinction' {...field} />
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
        title='Delete O-Level Grade'
        description={`Are you sure you want to delete grade "${toDelete?.grade}"? This action cannot be undone.`}
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

export default function AcademicsDataPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [activeTab, setActiveTab] = useState('alevel-combinations');

  const academicStats = stats?.academics;

  const analyticsItems = [
    {
      label: 'A-Level Combinations',
      value: academicStats?.alevel_combinations ?? 0,
      icon: Layers,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'A-Level Subjects',
      value: academicStats?.alevel_subjects ?? 0,
      icon: BookOpen,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    },
    {
      label: 'A-Level Grades',
      value: academicStats?.alevel_grades ?? 0,
      icon: Award,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'O-Level Subjects',
      value: academicStats?.olevel_subjects ?? 0,
      icon: FileText,
      color:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    },
    {
      label: 'O-Level Grades',
      value: academicStats?.olevel_grades ?? 0,
      icon: GraduationCap,
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <GraduationCap className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>Academics</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage A-Level and O-Level subjects, grades, and combinations
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {Array.from({ length: 5 }).map((_, i) => (
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
            <TabsTrigger value='alevel-combinations'>
              A-Level Combinations
            </TabsTrigger>
            <TabsTrigger value='alevel-subjects'>A-Level Subjects</TabsTrigger>
            <TabsTrigger value='alevel-grades'>A-Level Grades</TabsTrigger>
            <TabsTrigger value='olevel-subjects'>O-Level Subjects</TabsTrigger>
            <TabsTrigger value='olevel-grades'>O-Level Grades</TabsTrigger>
          </TabsList>

          <TabsContent value='alevel-combinations' className='mt-4'>
            <ALevelCombinationsTab />
          </TabsContent>

          <TabsContent value='alevel-subjects' className='mt-4'>
            <ALevelSubjectsTab />
          </TabsContent>

          <TabsContent value='alevel-grades' className='mt-4'>
            <ALevelGradesTab />
          </TabsContent>

          <TabsContent value='olevel-subjects' className='mt-4'>
            <OLevelSubjectsTab />
          </TabsContent>

          <TabsContent value='olevel-grades' className='mt-4'>
            <OLevelGradesTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
