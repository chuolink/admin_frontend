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
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataSheet } from '@/features/data-admin/components/DataSheet';
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
  useCourseTrends,
  useCreateCourseTrend,
  useUpdateCourseTrend,
  useDeleteCourseTrend
} from '@/features/data-admin/hooks/use-course-sub';
import type { DataCourseTrend } from '@/features/data-admin/types';

// All 14 scoring fields from CourseTrend model (each 0-10)
const SCORING_FIELDS = [
  { name: 'sector_relevance', label: 'Sector Relevance' },
  { name: 'employment_demand', label: 'Employment Demand' },
  { name: 'self_employment_potential', label: 'Self Employment Potential' },
  { name: 'formal_employment_demand', label: 'Formal Employment Demand' },
  { name: 'geographical_relevance', label: 'Geographical Relevance (TZ & EA)' },
  { name: 'economic_trends_alignment', label: 'Economic Trends Alignment' },
  {
    name: 'technological_advancement_alignment',
    label: 'Tech Advancement Alignment'
  },
  { name: 'government_policy_support', label: 'Government Policy Support' },
  { name: 'skill_gap_industry_need', label: 'Skill Gap & Industry Need' },
  {
    name: 'career_progression_stability',
    label: 'Career Progression Stability'
  },
  { name: 'income_salary_potential', label: 'Income & Salary Potential' },
  { name: 'alignment_with_sdgs', label: 'Alignment with SDGs' },
  {
    name: 'educational_infrastructure_quality',
    label: 'Educational Infrastructure'
  },
  { name: 'cultural_acceptance', label: 'Cultural Acceptance' }
] as const;

const scoreField = z.coerce.number().min(0).max(10).nullable().optional();

const trendSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  sector_relevance: scoreField,
  employment_demand: scoreField,
  self_employment_potential: scoreField,
  formal_employment_demand: scoreField,
  geographical_relevance: scoreField,
  economic_trends_alignment: scoreField,
  technological_advancement_alignment: scoreField,
  government_policy_support: scoreField,
  skill_gap_industry_need: scoreField,
  career_progression_stability: scoreField,
  income_salary_potential: scoreField,
  alignment_with_sdgs: scoreField,
  educational_infrastructure_quality: scoreField,
  cultural_acceptance: scoreField,
  predictability_duration: z.string().optional().default(''),
  overall_potential: z.coerce.number().min(0).max(100).nullable().optional()
});

type TrendFormValues = z.infer<typeof trendSchema>;

const emptyDefaults: TrendFormValues = {
  course: '',
  sector_relevance: null,
  employment_demand: null,
  self_employment_potential: null,
  formal_employment_demand: null,
  geographical_relevance: null,
  economic_trends_alignment: null,
  technological_advancement_alignment: null,
  government_policy_support: null,
  skill_gap_industry_need: null,
  career_progression_stability: null,
  income_salary_potential: null,
  alignment_with_sdgs: null,
  educational_infrastructure_quality: null,
  cultural_acceptance: null,
  predictability_duration: '',
  overall_potential: null
};

interface CourseTrendTableProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function CourseTrendTable({
  dialogOpen,
  onDialogOpenChange
}: CourseTrendTableProps) {
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data: trendsData, isLoading } = useCourseTrends({
    page: String(page),
    page_size: String(pageSize),
    ...(courseFilter ? { course: courseFilter } : {})
  });
  const createTrend = useCreateCourseTrend();
  const updateTrend = useUpdateCourseTrend();
  const deleteTrend = useDeleteCourseTrend();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    sector_relevance: false,
    self_employment_potential: false,
    formal_employment_demand: false,
    geographical_relevance: false,
    economic_trends_alignment: false,
    technological_advancement_alignment: false,
    government_policy_support: false,
    skill_gap_industry_need: false,
    career_progression_stability: false,
    alignment_with_sdgs: false,
    educational_infrastructure_quality: false,
    cultural_acceptance: false,
    predictability_duration: false
  });
  const [editingTrend, setEditingTrend] = useState<DataCourseTrend | null>(
    null
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [trendToDelete, setTrendToDelete] = useState<DataCourseTrend | null>(
    null
  );

  const isEdit = !!editingTrend;

  const form = useForm<TrendFormValues>({
    resolver: zodResolver(trendSchema),
    defaultValues: emptyDefaults
  });

  useEffect(() => {
    if (dialogOpen && !editingTrend) {
      form.reset({ ...emptyDefaults, course: courseFilter ?? '' });
    }
  }, [dialogOpen, editingTrend, form, courseFilter]);

  const handleEdit = (trend: DataCourseTrend) => {
    setEditingTrend(trend);
    const vals: Record<string, unknown> = {
      course: trend.course,
      predictability_duration: trend.predictability_duration ?? '',
      overall_potential: trend.overall_potential
    };
    for (const f of SCORING_FIELDS) {
      vals[f.name] = (trend as Record<string, unknown>)[f.name] ?? null;
    }
    form.reset(vals as TrendFormValues);
    onDialogOpenChange(true);
  };

  const handleCloseDialog = () => {
    onDialogOpenChange(false);
    setEditingTrend(null);
  };

  const onSubmit = (values: TrendFormValues) => {
    if (isEdit && editingTrend) {
      updateTrend.mutate(
        { id: editingTrend.id, data: values },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createTrend.mutate(values, { onSuccess: handleCloseDialog });
    }
  };

  const handleDeleteConfirm = () => {
    if (!trendToDelete) return;
    deleteTrend.mutate(trendToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setTrendToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataCourseTrend>[]>(
    () => [
      {
        accessorKey: 'course_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course' />
        ),
        cell: ({ row }) => (
          <div
            className='max-w-[250px] truncate font-medium'
            title={row.original.course_name ?? ''}
          >
            {row.original.course_name ?? '-'}
          </div>
        )
      },
      {
        accessorKey: 'overall_potential',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Overall' />
        ),
        cell: ({ row }) => {
          const val = row.original.overall_potential;
          return val != null ? (
            <Badge variant='secondary'>{Number(val).toFixed(1)}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        accessorKey: 'employment_demand',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Employment' />
        ),
        cell: ({ row }) => {
          const val = (row.original as Record<string, unknown>)
            .employment_demand as number | null;
          return val != null ? (
            <span className='tabular-nums'>{val}/10</span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        accessorKey: 'income_salary_potential',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Salary' />
        ),
        cell: ({ row }) => {
          const val = (row.original as Record<string, unknown>)
            .income_salary_potential as number | null;
          return val != null ? (
            <span className='tabular-nums'>{val}/10</span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      // Include all 14 fields as columns (most hidden by default)
      ...SCORING_FIELDS.filter(
        (f) =>
          f.name !== 'employment_demand' && f.name !== 'income_salary_potential'
      ).map((f) => ({
        accessorKey: f.name,
        header: ({ column }: { column: any }) => (
          <DataTableColumnHeader
            column={column}
            title={f.label.split(' ').slice(0, 2).join(' ')}
          />
        ),
        cell: ({ row }: { row: any }) => {
          const val = (row.original as Record<string, unknown>)[f.name] as
            | number
            | null;
          return val != null ? (
            <span className='tabular-nums'>{val}/10</span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      })),
      {
        accessorKey: 'predictability_duration',
        header: 'Duration',
        cell: ({ row }) => {
          const val = (row.original as Record<string, unknown>)
            .predictability_duration as string;
          return val ? (
            <span className='text-sm'>{val}</span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const trend = row.original;
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
                <DropdownMenuItem onClick={() => handleEdit(trend)}>
                  <Pencil className='mr-2 h-4 w-4' /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setTrendToDelete(trend);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className='mr-2 h-4 w-4' /> Delete
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

  const tableData = trendsData?.results ?? [];

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const isPending = createTrend.isPending || updateTrend.isPending;

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
        <div className='max-w-xs'>
          <EntityPicker
            endpoint='/data-admin/courses/'
            queryKey='data-admin-courses'
            mapItem={(item) => ({
              id: item.id as string,
              name: item.name as string
            })}
            value={courseFilter}
            onChange={setCourseFilter}
            placeholder='Filter by course...'
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
                    No trends found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ServerPagination
          totalCount={trendsData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Edit/Create Sheet — FULL form with all 14 scoring fields */}
      <DataSheet
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        title={isEdit ? 'Edit Course Trend' : 'Add Course Trend'}
        description='All scores are 0-10. Higher = better.'
        size='lg'
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            {/* Course picker */}
            <FormField
              control={form.control}
              name='course'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course *</FormLabel>
                  <FormControl>
                    <EntityPicker
                      endpoint='/data-admin/courses/'
                      queryKey='data-admin-courses'
                      mapItem={(item) => ({
                        id: item.id as string,
                        name: item.name as string
                      })}
                      value={field.value || null}
                      onChange={(id) => field.onChange(id ?? '')}
                      placeholder='Select course...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overall potential + Predictability */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='overall_potential'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Potential (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        max={100}
                        step={0.1}
                        placeholder='Computed score'
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
                name='predictability_duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Predictability Duration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., 5 years, Long term'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* All 14 scoring fields */}
            <div className='space-y-2'>
              <h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
                Scoring Fields (0–10)
              </h3>
              <div className='grid grid-cols-2 gap-3'>
                {SCORING_FIELDS.map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name as keyof TrendFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs'>{f.label}</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={10}
                            placeholder='0-10'
                            value={(field.value as number | null) ?? ''}
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
                ))}
              </div>
            </div>

            <div className='flex justify-end gap-2 border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCloseDialog}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Save Changes' : 'Create Trend'}
              </Button>
            </div>
          </form>
        </Form>
      </DataSheet>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Trend'
        description={`Delete trend for "${trendToDelete?.course_name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteTrend.isPending}
      />
    </>
  );
}
