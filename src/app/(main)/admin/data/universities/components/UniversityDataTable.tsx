// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
  Landmark,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { ServerPagination } from '@/features/data-admin/components/ServerPagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import {
  TableFilters,
  type FilterDef
} from '@/features/data-admin/components/TableFilters';
import {
  useUniversities,
  useDeleteUniversity
} from '@/features/data-admin/hooks/use-universities';
import type { DataUniversity } from '@/features/data-admin/types';

const CATEGORY_OPTIONS = [
  { label: 'Public', value: 'PUBLIC', icon: Landmark },
  { label: 'Private', value: 'PRIVATE', icon: Building2 }
];

const SCHOLARSHIP_OPTIONS = [
  { label: 'Full', value: 'FULL' },
  { label: 'Tuition', value: 'TUITION' },
  { label: 'Half', value: 'HALF' },
  { label: 'None', value: 'NONE' }
];

const scholarshipColorMap: Record<string, string> = {
  FULL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  TUITION: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  HALF: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  NONE: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400'
};

interface UniversityDataTableProps {
  onEdit: (university: DataUniversity) => void;
}

const universityFilters: FilterDef[] = [
  {
    key: 'country',
    label: 'Country',
    type: 'entity',
    endpoint: '/data-admin/countries/',
    queryKey: 'data-admin-countries'
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'PUBLIC', label: 'Public' },
      { value: 'PRIVATE', label: 'Private' }
    ]
  },
  {
    key: 'institution_type',
    label: 'Institution Type',
    type: 'select',
    options: [
      { value: 'university', label: 'University' },
      { value: 'college', label: 'College' },
      { value: 'institute', label: 'Institute' }
    ]
  },
  { key: 'scholarship', label: 'Scholarship', type: 'boolean' }
];

export function UniversityDataTable({ onEdit }: UniversityDataTableProps) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize)
    };
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return params;
  }, [filterValues, page, pageSize]);

  const { data: universitiesData, isLoading } = useUniversities(queryParams);
  const deleteUniversity = useDeleteUniversity();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ranking: false,
    website_link: false
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [universityToDelete, setUniversityToDelete] =
    useState<DataUniversity | null>(null);

  const handleDeleteConfirm = () => {
    if (!universityToDelete) return;
    deleteUniversity.mutate(universityToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setUniversityToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataUniversity>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label='Select row'
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <div className='flex max-w-[280px] items-center gap-2'>
            <GraduationCap className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='truncate font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'country_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Country' />
        ),
        cell: ({ row }) => (
          <span className='text-sm'>{row.original.country_name ?? '-'}</span>
        ),
        filterFn: (row, id, filterValue) => {
          if (!filterValue || filterValue.length === 0) return true;
          return filterValue.includes(row.original.country_name);
        }
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Category' />
        ),
        cell: ({ row }) => {
          const category = row.getValue('category') as string;
          const isPublic = category === 'PUBLIC';
          return (
            <Badge
              variant='outline'
              className={cn(
                'font-normal',
                isPublic
                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400'
              )}
            >
              {isPublic ? (
                <Landmark className='mr-1 h-3 w-3' />
              ) : (
                <Building2 className='mr-1 h-3 w-3' />
              )}
              {category}
            </Badge>
          );
        },
        filterFn: (row, id, filterValue) => {
          if (!filterValue || filterValue.length === 0) return true;
          return filterValue.includes(row.getValue(id));
        }
      },
      {
        accessorKey: 'scholarship',
        header: 'Scholarship',
        cell: ({ row }) => {
          const value = row.getValue('scholarship') as string;
          const colorClass =
            scholarshipColorMap[value] ?? scholarshipColorMap.NONE;
          return (
            <Badge
              variant='secondary'
              className={cn('font-normal', colorClass)}
            >
              {value}
            </Badge>
          );
        },
        filterFn: (row, id, filterValue) => {
          if (!filterValue || filterValue.length === 0) return true;
          return filterValue.includes(row.getValue(id));
        }
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-xs'>
            {row.getValue('code')}
          </span>
        ),
        enableSorting: false
      },
      {
        accessorKey: 'courses_count',
        header: 'Courses',
        cell: ({ row }) => {
          const count = row.original.courses_count ?? 0;
          return (
            <Badge variant='secondary'>
              <BookOpen className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          );
        },
        enableSorting: false
      },
      {
        id: 'ranking',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Ranking' />
        ),
        cell: ({ row }) => {
          const ranking = row.original.ranking;
          return ranking?.global_rank ? (
            <span className='text-sm tabular-nums'>#{ranking.global_rank}</span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        accessorKey: 'website_link',
        header: 'Website',
        cell: ({ row }) => {
          const url = row.original.website_link;
          return url ? (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary inline-flex items-center gap-1 text-sm hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className='h-3 w-3' />
              Link
            </a>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        },
        enableSorting: false
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const university = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(university)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setUniversityToDelete(university);
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
    [onEdit]
  );

  const tableData = universitiesData?.results ?? [];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-[250px]' />
          <Skeleton className='h-8 w-[100px]' />
          <Skeleton className='h-8 w-[100px]' />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder='Search universities...'
          filters={[
            {
              columnId: 'category',
              title: 'Category',
              options: CATEGORY_OPTIONS
            },
            {
              columnId: 'scholarship',
              title: 'Scholarship',
              options: SCHOLARSHIP_OPTIONS
            }
          ]}
        />
        <TableFilters
          filters={universityFilters}
          values={filterValues}
          onChange={(key, val) =>
            setFilterValues((prev) => ({ ...prev, [key]: val }))
          }
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='hover:bg-muted/50 cursor-pointer'
                    onClick={() => onEdit(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === 'select' ||
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
                    No universities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ServerPagination
          totalCount={universitiesData?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete University'
        description={`Are you sure you want to delete "${universityToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteUniversity.isPending}
      />
    </>
  );
}
