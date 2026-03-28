// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  TableFilters,
  type FilterDef
} from '@/features/data-admin/components/TableFilters';
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
import { useCourseOfferings } from '@/features/data-admin/hooks/use-course-offerings';
import type { DataCourseOffering } from '@/features/data-admin/types';

const requirementFilters: FilterDef[] = [
  {
    key: 'university',
    label: 'University',
    type: 'entity',
    endpoint: '/data-admin/universities/',
    queryKey: 'data-admin-universities',
    mapItem: (item) => ({ value: String(item.id), label: String(item.name) })
  },
  {
    key: 'course',
    label: 'Course',
    type: 'entity',
    endpoint: '/data-admin/courses/',
    queryKey: 'data-admin-courses',
    mapItem: (item) => ({ value: String(item.id), label: String(item.name) })
  }
];

export default function RequirementsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
      has_requirements: 'true'
    };
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return params;
  }, [filterValues, page, pageSize]);
  const { data, isLoading } = useCourseOfferings(queryParams);

  const offeringsWithReqs = data?.results ?? [];

  const columns = useMemo<ColumnDef<DataCourseOffering>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Offering' />
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <ClipboardList className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='max-w-[200px] truncate font-medium'>
              {row.getValue('name')}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'course_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course' />
        ),
        cell: ({ row }) => (
          <span className='text-sm'>{row.getValue('course_name') ?? '--'}</span>
        )
      },
      {
        accessorKey: 'university_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='University' />
        ),
        cell: ({ row }) => (
          <span className='text-sm'>
            {row.getValue('university_name') ?? '--'}
          </span>
        )
      },
      {
        accessorKey: 'has_requirements',
        header: 'Status',
        cell: () => (
          <Badge
            variant='default'
            className='bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
          >
            Has Requirements
          </Badge>
        ),
        enableSorting: false
      }
    ],
    []
  );

  const table = useReactTable({
    data: offeringsWithReqs,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      <div className='flex flex-wrap items-center gap-2'>
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder='Filter offerings with requirements...'
        />
        <TableFilters
          filters={requirementFilters}
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
                  No offerings with requirements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ServerPagination
        totalCount={data?.count ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
