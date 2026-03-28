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
  Briefcase,
  Award,
  TrendingUp,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
  BookOpen,
  Target,
  Link as LinkIcon,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/page-container';
import { BulkImportExport } from '@/features/data-admin/components/BulkImportExport';
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
import { SectionAnalytics } from '@/features/data-admin/components/SectionAnalytics';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import { EntityPicker } from '@/features/data-admin/components/EntityPicker';
import {
  TableFilters,
  type FilterDef
} from '@/features/data-admin/components/TableFilters';
import { useDataStats } from '@/features/data-admin/hooks/use-data-stats';
import {
  GenericDataTable,
  type ColumnDef as GenericColumnDef,
  type FormFieldDef
} from '@/features/data-admin/components/GenericDataTable';
import type {
  DataCareer,
  DataScholarship,
  PaginatedResponse
} from '@/features/data-admin/types';

// =============================================================================
// Extra types for careers section
// =============================================================================

interface CareerTrend {
  id: string;
  career: string;
  career_name?: string;
  category: string;
  formal_employment_chances: number | null;
  self_employment_chances: number | null;
  world_trend_demand: number | null;
  local_market_demand: number | null;
  local_market_supply: number | null;
  major_stakeholders: string;
  side_hustles: string;
  market_perspective: string;
  relevant_courses: string;
  created_at: string;
  updated_at: string;
}

interface CareerSalary {
  id: string;
  career: string;
  career_name?: string;
  start_salary: number | null;
  end_salary: number | null;
  currency: string;
  level: string;
  country: string;
  country_name?: string;
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
  onRowClick?: (item: T) => void;
}

function InlineTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  globalFilter,
  onGlobalFilterChange,
  emptyMessage,
  onRowClick
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
                <TableRow
                  key={row.id}
                  className={
                    onRowClick ? 'hover:bg-muted/50 cursor-pointer' : ''
                  }
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={
                        cell.column.id === 'actions' ||
                        cell.column.id === 'select'
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
// Careers Tab
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

const careerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  img: z.string().nullable().optional()
});
type CareerFormValues = z.infer<typeof careerSchema>;

function CareersTab() {
  const { data, isLoading } = useCrudList<DataCareer>(
    '/data-admin/careers/',
    'careers'
  );
  const createMut = useCrudCreate<DataCareer>(
    '/data-admin/careers/',
    'careers',
    'Career'
  );
  const updateMut = useCrudUpdate<DataCareer>(
    '/data-admin/careers/',
    'careers',
    'Career'
  );
  const deleteMut = useCrudDelete('/data-admin/careers/', 'careers', 'Career');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataCareer | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataCareer | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: { name: '', slug: '', description: '', is_active: true }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          slug: editing.slug,
          img: (editing as any).img ?? null
        });
      } else {
        form.reset({ name: '', slug: '', img: null });
      }
    }
  }, [dialogOpen, editing, form]);

  // Auto slug
  const watchedName = form.watch('name');
  useEffect(() => {
    if (!editing && watchedName) {
      form.setValue('slug', slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, editing, form]);

  const onSubmit = (values: CareerFormValues) => {
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

  const columns = useMemo<ColumnDef<DataCareer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Briefcase className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-sm'>
            {row.getValue('slug')}
          </span>
        )
      },
      {
        accessorKey: 'courses_count',
        header: 'Courses',
        cell: ({ row }) => (
          <Badge variant='secondary'>
            <BookOpen className='mr-1 h-3 w-3' />
            {row.original.courses_count ?? 0}
          </Badge>
        )
      },
      {
        id: 'disciplines',
        header: 'Disciplines',
        cell: () => (
          <Badge variant='secondary'>
            <Target className='mr-1 h-3 w-3' />-
          </Badge>
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
      <div className='mb-4 flex items-center justify-end gap-2'>
        <BulkImportExport
          endpoint='/data-admin/careers/'
          entityName='Career'
          queryKey='data-admin-careers'
        />
        <Button
          size='sm'
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Career
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No careers found.'
        onRowClick={(item) => {
          setEditing(item);
          setDialogOpen(true);
        }}
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
            <DialogTitle>{editing ? 'Edit Career' : 'Add Career'}</DialogTitle>
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
                      <Input placeholder='Career name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='auto-generated' {...field} />
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
                      <Textarea placeholder='Description' rows={3} {...field} />
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
        title='Delete Career'
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
// Scholarships Tab
// =============================================================================

const scholarshipSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  img: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  university: z.string().nullable().optional(),
  description: z.string().optional().default(''),
  amount: z.string().nullable().optional().default(null),
  eligibility: z.string().optional().default(''),
  eligibility_short: z.string().optional().default(''),
  requirements: z.string().optional().default(''),
  posted_at: z.string().nullable().optional().default(null),
  deadline: z.string().nullable().optional().default(null),
  category: z.string().optional().default(''),
  region: z.string().optional().default(''),
  link: z.string().optional().default('')
});
type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;

function ScholarshipsTab() {
  const { data, isLoading } = useCrudList<DataScholarship>(
    '/data-admin/scholarships/',
    'scholarships'
  );
  const createMut = useCrudCreate<DataScholarship>(
    '/data-admin/scholarships/',
    'scholarships',
    'Scholarship'
  );
  const updateMut = useCrudUpdate<DataScholarship>(
    '/data-admin/scholarships/',
    'scholarships',
    'Scholarship'
  );
  const deleteMut = useCrudDelete(
    '/data-admin/scholarships/',
    'scholarships',
    'Scholarship'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DataScholarship | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<DataScholarship | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [scholFilterValues, setScholFilterValues] = useState<
    Record<string, string>
  >({});

  const scholAllItems = data?.results ?? [];
  const scholCategoryOptions = useMemo(() => {
    const cats = [
      ...new Set(scholAllItems.map((i: any) => i.category).filter(Boolean))
    ];
    return cats.map((c) => ({ value: c as string, label: c as string }));
  }, [scholAllItems]);
  const scholRegionOptions = useMemo(() => {
    const regions = [
      ...new Set(scholAllItems.map((i: any) => i.region).filter(Boolean))
    ];
    return regions.map((r) => ({ value: r as string, label: r as string }));
  }, [scholAllItems]);

  const scholFilteredItems = useMemo(() => {
    let items = scholAllItems;
    if (scholFilterValues.category)
      items = items.filter(
        (i: any) => i.category === scholFilterValues.category
      );
    if (scholFilterValues.region)
      items = items.filter((i: any) => i.region === scholFilterValues.region);
    return items;
  }, [scholAllItems, scholFilterValues]);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      name: '',
      slug: '',
      country: null,
      university: null,
      description: '',
      amount: null,
      currency: 'USD',
      coverage: '',
      eligibility: '',
      deadline: null,
      is_active: true,
      category: '',
      region: '',
      link: '',
      requirements: ''
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          name: editing.name,
          img: (editing as any).img ?? null,
          country: editing.country,
          university: editing.university,
          description: editing.description ?? '',
          amount: (editing as any).amount ?? null,
          eligibility: editing.eligibility ?? '',
          eligibility_short: (editing as any).eligibility_short ?? '',
          requirements: (editing as any).requirements ?? '',
          posted_at: (editing as any).posted_at ?? null,
          deadline: editing.deadline,
          category: (editing as any).category ?? '',
          region: (editing as any).region ?? '',
          link: (editing as any).link ?? ''
        });
      } else {
        form.reset({
          name: '',
          img: null,
          country: null,
          university: null,
          description: '',
          amount: null,
          eligibility: '',
          eligibility_short: '',
          requirements: '',
          posted_at: null,
          deadline: null,
          category: '',
          region: '',
          link: ''
        });
      }
    }
  }, [dialogOpen, editing, form]);

  // No auto slug needed for scholarships

  const onSubmit = (values: ScholarshipFormValues) => {
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

  const columns = useMemo<ColumnDef<DataScholarship>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Award className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='max-w-[200px] truncate font-medium'>
              {row.getValue('name')}
            </span>
          </div>
        )
      },
      {
        id: 'country_name',
        header: 'Country',
        accessorFn: (row) => row.country_name ?? '-',
        cell: ({ getValue }) => (
          <span className='text-sm'>{getValue() as string}</span>
        )
      },
      {
        id: 'university_name',
        header: 'University',
        accessorFn: (row) => row.university_name ?? '-',
        cell: ({ getValue }) => (
          <span className='block max-w-[150px] truncate text-sm'>
            {getValue() as string}
          </span>
        )
      },
      {
        id: 'category',
        header: 'Category',
        accessorFn: (row) => (row as any).category ?? '-',
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
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          const amt = row.original.amount;
          return amt != null ? (
            <span className='font-medium'>
              {row.original.currency} {amt.toLocaleString()}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        accessorKey: 'deadline',
        header: 'Deadline',
        cell: ({ row }) => {
          const d = row.getValue('deadline') as string | null;
          return d ? (
            <span className='text-sm'>
              {format(new Date(d), 'MMM d, yyyy')}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'region',
        header: 'Region',
        accessorFn: (row) => (row as any).region ?? '-',
        cell: ({ getValue }) => (
          <span className='text-muted-foreground text-sm'>
            {getValue() as string}
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
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <TableFilters
          filters={[
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              options: scholCategoryOptions
            },
            {
              key: 'region',
              label: 'Region',
              type: 'select',
              options: scholRegionOptions
            }
          ]}
          values={scholFilterValues}
          onChange={(key, val) =>
            setScholFilterValues((prev) => ({ ...prev, [key]: val }))
          }
        />
        <div className='ml-auto flex items-center gap-2'>
          <BulkImportExport
            endpoint='/data-admin/scholarships/'
            entityName='Scholarship'
            queryKey='data-admin-scholarships'
          />
          <Button
            size='sm'
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Scholarship
          </Button>
        </div>
      </div>

      <InlineTable
        data={scholFilteredItems}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No scholarships found.'
        onRowClick={(item) => {
          setEditing(item);
          setDialogOpen(true);
        }}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Scholarship' : 'Add Scholarship'}
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
                      <Input placeholder='Scholarship name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
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
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='FULL'>Full</SelectItem>
                          <SelectItem value='PARTIAL'>Partial</SelectItem>
                          <SelectItem value='MERIT'>Merit</SelectItem>
                          <SelectItem value='NEED'>Need-based</SelectItem>
                          <SelectItem value='OTHER'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Currency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='USD'>USD</SelectItem>
                          <SelectItem value='TZS'>TZS</SelectItem>
                          <SelectItem value='EUR'>EUR</SelectItem>
                          <SelectItem value='GBP'>GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
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

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='deadline'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='region'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. East Africa' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='link'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input placeholder='https://...' type='url' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='eligibility'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Eligibility criteria'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='requirements'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Application requirements'
                        rows={2}
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
        title='Delete Scholarship'
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
// Trends Tab
// =============================================================================

const trendSchema = z.object({
  career: z.string().nullable().optional(),
  category: z.string().optional().default(''),
  formal_employment_chances: z.coerce
    .number()
    .nullable()
    .optional()
    .default(null),
  self_employment_chances: z.coerce
    .number()
    .nullable()
    .optional()
    .default(null),
  world_trend_demand: z.coerce.number().nullable().optional().default(null),
  local_market_demand: z.coerce.number().nullable().optional().default(null),
  local_market_supply: z.coerce.number().nullable().optional().default(null),
  major_stakeholders: z.string().optional().default(''),
  side_hustles: z.string().optional().default(''),
  market_perspective: z.string().optional().default(''),
  relevant_courses: z.string().optional().default('')
});
type TrendFormValues = z.infer<typeof trendSchema>;

function TrendsTab() {
  const { data, isLoading } = useCrudList<CareerTrend>(
    '/data-admin/career-trends/',
    'career-trends'
  );
  const createMut = useCrudCreate<CareerTrend>(
    '/data-admin/career-trends/',
    'career-trends',
    'Career Trend'
  );
  const updateMut = useCrudUpdate<CareerTrend>(
    '/data-admin/career-trends/',
    'career-trends',
    'Career Trend'
  );
  const deleteMut = useCrudDelete(
    '/data-admin/career-trends/',
    'career-trends',
    'Career Trend'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CareerTrend | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CareerTrend | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [trendFilterValues, setTrendFilterValues] = useState<
    Record<string, string>
  >({});

  const trendAllItems = data?.results ?? [];
  const trendCategoryOptions = useMemo(() => {
    const cats = [
      ...new Set(trendAllItems.map((i) => i.category).filter(Boolean))
    ];
    return cats.map((c) => ({ value: c, label: c }));
  }, [trendAllItems]);

  const trendFilteredItems = useMemo(() => {
    let items = trendAllItems;
    if (trendFilterValues.career)
      items = items.filter((i) => i.career === trendFilterValues.career);
    if (trendFilterValues.category)
      items = items.filter((i) => i.category === trendFilterValues.category);
    return items;
  }, [trendAllItems, trendFilterValues]);

  const form = useForm<TrendFormValues>({
    resolver: zodResolver(trendSchema),
    defaultValues: {
      career: null,
      category: '',
      formal_employment_chances: null,
      self_employment_chances: null,
      world_trend_demand: null,
      local_market_demand: null,
      local_market_supply: null,
      major_stakeholders: '',
      side_hustles: '',
      market_perspective: '',
      relevant_courses: ''
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          career: editing.career,
          category: editing.category ?? '',
          formal_employment_chances:
            (editing as any).formal_employment_chances ?? null,
          self_employment_chances:
            (editing as any).self_employment_chances ?? null,
          world_trend_demand: (editing as any).world_trend_demand ?? null,
          local_market_demand: (editing as any).local_market_demand ?? null,
          local_market_supply: (editing as any).local_market_supply ?? null,
          major_stakeholders: (editing as any).major_stakeholders ?? '',
          side_hustles: (editing as any).side_hustles ?? '',
          market_perspective: (editing as any).market_perspective ?? '',
          relevant_courses: (editing as any).relevant_courses ?? ''
        });
      } else {
        form.reset({
          career: null,
          category: '',
          formal_employment_chances: null,
          self_employment_chances: null,
          world_trend_demand: null,
          local_market_demand: null,
          local_market_supply: null,
          major_stakeholders: '',
          side_hustles: '',
          market_perspective: '',
          relevant_courses: ''
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: TrendFormValues) => {
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
  };

  const columns = useMemo<ColumnDef<CareerTrend>[]>(
    () => [
      {
        id: 'career_name',
        header: 'Career',
        accessorFn: (row) => row.career_name ?? '-',
        cell: ({ getValue }) => (
          <span className='font-medium'>{getValue() as string}</span>
        )
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const v = row.getValue('category') as string;
          return v ? <Badge variant='outline'>{v}</Badge> : '-';
        }
      },
      {
        accessorKey: 'formal_employment_chances',
        header: 'Formal Emp.',
        cell: ({ row }) => {
          const v = row.original.formal_employment_chances;
          return v != null ? <Badge variant='secondary'>{v}/10</Badge> : '-';
        }
      },
      {
        accessorKey: 'self_employment_chances',
        header: 'Self Emp.',
        cell: ({ row }) => {
          const v = row.original.self_employment_chances;
          return v != null ? <Badge variant='secondary'>{v}/10</Badge> : '-';
        }
      },
      {
        accessorKey: 'world_trend_demand',
        header: 'World Trend',
        cell: ({ row }) => {
          const v = row.original.world_trend_demand;
          return v != null ? <Badge variant='outline'>{v}/10</Badge> : '-';
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

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <>
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <TableFilters
          filters={[
            {
              key: 'career',
              label: 'Career',
              type: 'entity',
              endpoint: '/data-admin/careers/',
              queryKey: 'data-admin-careers',
              mapItem: (item) => ({
                value: String(item.id),
                label: String(item.name)
              })
            },
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              options: trendCategoryOptions
            }
          ]}
          values={trendFilterValues}
          onChange={(key, val) =>
            setTrendFilterValues((prev) => ({ ...prev, [key]: val }))
          }
        />
        <div className='ml-auto'>
          <Button
            size='sm'
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Trend
          </Button>
        </div>
      </div>

      <InlineTable
        data={trendFilteredItems}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No career trends found.'
        onRowClick={(item) => {
          setEditing(item);
          setDialogOpen(true);
        }}
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
              {editing ? 'Edit Career Trend' : 'Add Career Trend'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='career'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career</FormLabel>
                    <EntityPicker
                      endpoint='/data-admin/careers/'
                      queryKey='data-admin-careers'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string
                      })}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder='Select career'
                    />
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
                      <Input placeholder='e.g. Technology' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='formal_employment_chances'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formal Employment (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='10'
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
                  name='self_employment_chances'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Self Employment (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='10'
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
                  name='world_trend_demand'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>World Trend (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='10'
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
                  name='local_market_demand'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Market Demand (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='10'
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
                  name='local_market_supply'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Market Supply (0-10)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='0'
                          max='10'
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
                name='major_stakeholders'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major Stakeholders</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Key stakeholders...'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='side_hustles'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Side Hustles</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Related side hustles...'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='market_perspective'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Perspective</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Market outlook...'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='relevant_courses'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Courses</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Related courses...'
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
        title='Delete Career Trend'
        description='Are you sure you want to delete this trend? This action cannot be undone.'
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
// Salaries Tab
// =============================================================================

const salarySchema = z.object({
  career: z.string().nullable().optional(),
  start_salary: z.coerce.number().nullable().optional().default(null),
  end_salary: z.coerce.number().nullable().optional().default(null),
  currency: z.string().optional().default('TZS'),
  level: z.string().optional().default(''),
  country: z.string().nullable().optional()
});
type SalaryFormValues = z.infer<typeof salarySchema>;

function SalariesTab() {
  const { data, isLoading } = useCrudList<CareerSalary>(
    '/data-admin/career-salaries/',
    'career-salaries'
  );
  const createMut = useCrudCreate<CareerSalary>(
    '/data-admin/career-salaries/',
    'career-salaries',
    'Career Salary'
  );
  const updateMut = useCrudUpdate<CareerSalary>(
    '/data-admin/career-salaries/',
    'career-salaries',
    'Career Salary'
  );
  const deleteMut = useCrudDelete(
    '/data-admin/career-salaries/',
    'career-salaries',
    'Career Salary'
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CareerSalary | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CareerSalary | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      career: null,
      start_salary: null,
      end_salary: null,
      currency: 'TZS',
      level: '',
      country: null
    }
  });

  useEffect(() => {
    if (dialogOpen) {
      if (editing) {
        form.reset({
          career: editing.career,
          start_salary: editing.start_salary,
          end_salary: editing.end_salary,
          currency: editing.currency ?? 'TZS',
          level: editing.level ?? '',
          country: editing.country ?? null
        });
      } else {
        form.reset({
          career: null,
          start_salary: null,
          end_salary: null,
          currency: 'TZS',
          level: '',
          country: null
        });
      }
    }
  }, [dialogOpen, editing, form]);

  const onSubmit = (values: SalaryFormValues) => {
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
  };

  const columns = useMemo<ColumnDef<CareerSalary>[]>(
    () => [
      {
        id: 'career_name',
        header: 'Career',
        accessorFn: (row) => row.career_name ?? '-',
        cell: ({ getValue }) => (
          <span className='font-medium'>{getValue() as string}</span>
        )
      },
      {
        accessorKey: 'start_salary',
        header: 'Start Salary',
        cell: ({ row }) => {
          const v = row.original.start_salary;
          return v != null
            ? `${row.original.currency} ${v.toLocaleString()}`
            : '-';
        }
      },
      {
        accessorKey: 'end_salary',
        header: 'End Salary',
        cell: ({ row }) => {
          const v = row.original.end_salary;
          return v != null
            ? `${row.original.currency} ${v.toLocaleString()}`
            : '-';
        }
      },
      {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => {
          const v = row.getValue('level') as string;
          return v ? <Badge variant='outline'>{v}</Badge> : '-';
        }
      },
      {
        id: 'country_name',
        header: 'Country',
        accessorFn: (row) => row.country_name ?? '-',
        cell: ({ getValue }) => (
          <span className='text-sm'>{getValue() as string}</span>
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
          Add Salary
        </Button>
      </div>

      <InlineTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage='No career salaries found.'
        onRowClick={(item) => {
          setEditing(item);
          setDialogOpen(true);
        }}
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
              {editing ? 'Edit Career Salary' : 'Add Career Salary'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='career'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career</FormLabel>
                    <EntityPicker
                      endpoint='/data-admin/careers/'
                      queryKey='data-admin-careers'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string
                      })}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder='Select career'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='start_salary'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Salary</FormLabel>
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
                  name='end_salary'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Salary</FormLabel>
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
                name='level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select level' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ENTRY'>Entry</SelectItem>
                        <SelectItem value='MID'>Mid</SelectItem>
                        <SelectItem value='SENIOR'>Senior</SelectItem>
                        <SelectItem value='EXECUTIVE'>Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        title='Delete Career Salary'
        description='Are you sure you want to delete this salary entry? This action cannot be undone.'
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

export default function CareersDataPage() {
  const { data: stats, isLoading: statsLoading } = useDataStats();
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'careers'
  });

  const careerStats = stats?.careers;

  const analyticsItems = [
    {
      label: 'Total Careers',
      value: careerStats?.total ?? 0,
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      label: 'With Specifics',
      value: careerStats?.with_specifics ?? 0,
      icon: Target,
      color:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      label: 'Scholarships',
      value: careerStats?.scholarships ?? 0,
      icon: Award,
      color:
        'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
    },
    {
      label: 'Career Salaries',
      value: 0,
      icon: DollarSign,
      color:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    },
    {
      label: 'Career Trends',
      value: 0,
      icon: TrendingUp,
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    }
  ];

  return (
    <PageContainer className='w-full'>
      <div className='w-full min-w-0 space-y-6'>
        {/* Header */}
        <div>
          <div className='flex items-center gap-2'>
            <Briefcase className='text-muted-foreground h-5 w-5' />
            <h1 className='text-2xl font-semibold tracking-tight'>Careers</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Manage careers, scholarships, trends, and salary data
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
        <Tabs value={activeTab ?? ''} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='careers'>Careers</TabsTrigger>
            <TabsTrigger value='specifics'>Specifics</TabsTrigger>
            <TabsTrigger value='career-courses'>Career Courses</TabsTrigger>
            <TabsTrigger value='career-disciplines'>
              Career Disciplines
            </TabsTrigger>
            <TabsTrigger value='scholarships'>Scholarships</TabsTrigger>
            <TabsTrigger value='scholarship-images'>
              Scholarship Images
            </TabsTrigger>
            <TabsTrigger value='trends'>Trends</TabsTrigger>
            <TabsTrigger value='salaries'>Salaries</TabsTrigger>
          </TabsList>

          <TabsContent value='careers' className='mt-4'>
            <CareersTab />
          </TabsContent>

          <TabsContent value='specifics' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/career-specifics/'
              queryKey='data-admin-career-specifics'
              entityName='Career Specific'
              columns={
                [
                  { key: 'career_name', header: 'Career', type: 'text' },
                  { key: 'version', header: 'Version', type: 'number' },
                  {
                    key: 'introduction',
                    header: 'Introduction',
                    type: 'truncate'
                  },
                  { key: 'created_at', header: 'Created', type: 'date' }
                ] as GenericColumnDef[]
              }
              formFields={
                [
                  {
                    name: 'career',
                    label: 'Career',
                    type: 'entity',
                    endpoint: '/data-admin/careers/',
                    queryKey: 'data-admin-careers-picker'
                  },
                  { name: 'version', label: 'Version', type: 'number' },
                  {
                    name: 'introduction',
                    label: 'Introduction',
                    type: 'textarea'
                  },
                  {
                    name: 'responsibilities',
                    label: 'Responsibilities',
                    type: 'textarea'
                  },
                  { name: 'skills', label: 'Skills', type: 'textarea' },
                  {
                    name: 'qualifications',
                    label: 'Qualifications',
                    type: 'textarea'
                  },
                  { name: 'career_map', label: 'Career Map', type: 'textarea' }
                ] as FormFieldDef[]
              }
            />
          </TabsContent>

          <TabsContent value='career-courses' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/career-courses/'
              queryKey='data-admin-career-courses'
              entityName='Career Course'
              columns={
                [
                  { key: 'career_name', header: 'Career', type: 'text' },
                  { key: 'course_name', header: 'Course', type: 'text' },
                  { key: 'created_at', header: 'Created', type: 'date' }
                ] as GenericColumnDef[]
              }
              formFields={
                [
                  {
                    name: 'career',
                    label: 'Career',
                    type: 'entity',
                    endpoint: '/data-admin/careers/',
                    queryKey: 'data-admin-careers-picker'
                  },
                  {
                    name: 'course',
                    label: 'Course',
                    type: 'entity',
                    endpoint: '/data-admin/courses/',
                    queryKey: 'data-admin-courses-picker'
                  }
                ] as FormFieldDef[]
              }
            />
          </TabsContent>

          <TabsContent value='career-disciplines' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/career-disciplines/'
              queryKey='data-admin-career-disciplines'
              entityName='Career Discipline'
              columns={
                [
                  { key: 'career_name', header: 'Career', type: 'text' },
                  {
                    key: 'discipline_name',
                    header: 'Discipline',
                    type: 'text'
                  },
                  { key: 'created_at', header: 'Created', type: 'date' }
                ] as GenericColumnDef[]
              }
              formFields={
                [
                  {
                    name: 'career',
                    label: 'Career',
                    type: 'entity',
                    endpoint: '/data-admin/careers/',
                    queryKey: 'data-admin-careers-picker'
                  },
                  {
                    name: 'discipline',
                    label: 'Discipline',
                    type: 'entity',
                    endpoint: '/data-admin/disciplines/',
                    queryKey: 'data-admin-disciplines-picker'
                  }
                ] as FormFieldDef[]
              }
            />
          </TabsContent>

          <TabsContent value='scholarships' className='mt-4'>
            <ScholarshipsTab />
          </TabsContent>

          <TabsContent value='scholarship-images' className='mt-4'>
            <GenericDataTable
              endpoint='/data-admin/scholarship-images/'
              queryKey='data-admin-scholarship-images'
              entityName='Scholarship Image'
              columns={
                [
                  {
                    key: 'scholarship_name',
                    header: 'Scholarship',
                    type: 'text'
                  },
                  { key: 'name', header: 'Name', type: 'text' },
                  { key: 'image', header: 'Image URL', type: 'truncate' },
                  { key: 'created_at', header: 'Created', type: 'date' }
                ] as GenericColumnDef[]
              }
              formFields={
                [
                  {
                    name: 'scholarship',
                    label: 'Scholarship',
                    type: 'entity',
                    endpoint: '/data-admin/scholarships/',
                    queryKey: 'data-admin-scholarships-picker'
                  },
                  { name: 'name', label: 'Name', type: 'text', required: true },
                  {
                    name: 'image',
                    label: 'Image',
                    type: 'image',
                    required: true
                  }
                ] as FormFieldDef[]
              }
            />
          </TabsContent>

          <TabsContent value='trends' className='mt-4'>
            <TrendsTab />
          </TabsContent>

          <TabsContent value='salaries' className='mt-4'>
            <SalariesTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
