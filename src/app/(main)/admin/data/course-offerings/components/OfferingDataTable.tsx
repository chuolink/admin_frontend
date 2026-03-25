'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
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
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Library,
  CheckCircle2,
  XCircle,
  Receipt
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import {
  useCourseOfferings,
  useDeleteCourseOffering
} from '@/features/data-admin/hooks/use-course-offerings';
import type { DataCourseOffering } from '@/features/data-admin/types';
import { formatCurrency } from '@/lib/utils';
import { OfferingFormDialog } from './OfferingFormDialog';

export default function OfferingDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    expense_count: false,
    has_requirements: false
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Edit state
  const [editOffering, setEditOffering] = useState<DataCourseOffering | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete state
  const [deleteOffering, setDeleteOffering] =
    useState<DataCourseOffering | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useCourseOfferings();
  const deleteMutation = useDeleteCourseOffering();

  const handleDelete = () => {
    if (!deleteOffering) return;
    deleteMutation.mutate(deleteOffering.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeleteOffering(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataCourseOffering>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Library className='text-muted-foreground h-4 w-4 shrink-0' />
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
          <div
            className='max-w-[180px] truncate text-sm'
            title={row.getValue('course_name') ?? ''}
          >
            {row.getValue('course_name') ?? '--'}
          </div>
        )
      },
      {
        accessorKey: 'university_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='University' />
        ),
        cell: ({ row }) => (
          <div
            className='max-w-[180px] truncate text-sm'
            title={row.getValue('university_name') ?? ''}
          >
            {row.getValue('university_name') ?? '--'}
          </div>
        ),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        }
      },
      {
        accessorKey: 'duration',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Duration' />
        ),
        cell: ({ row }) => {
          const years = row.getValue('duration') as number;
          return (
            <span className='text-sm'>
              {years ? `${years} yr${years !== 1 ? 's' : ''}` : '--'}
            </span>
          );
        }
      },
      {
        accessorKey: 'fee',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Fee' />
        ),
        cell: ({ row }) => {
          const fee = row.getValue('fee') as number | null;
          return (
            <span className='text-sm tabular-nums'>
              {fee ? formatCurrency(fee) : '--'}
            </span>
          );
        }
      },
      {
        accessorKey: 'is_active',
        header: 'Active',
        cell: ({ row }) => {
          const isActive = row.getValue('is_active') as boolean;
          return (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={
                isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(String(row.getValue(id)));
        }
      },
      {
        accessorKey: 'has_requirements',
        header: 'Reqs',
        cell: ({ row }) => {
          const hasReqs = row.getValue('has_requirements') as boolean;
          return hasReqs ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground/40 h-4 w-4' />
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'expense_count',
        header: 'Expenses',
        cell: ({ row }) => {
          const count = row.getValue('expense_count') as number;
          return count > 0 ? (
            <Badge variant='outline'>
              <Receipt className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>--</span>
          );
        },
        enableSorting: false
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const offering = row.original;
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
                <DropdownMenuItem
                  onClick={() => {
                    setEditOffering(offering);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setDeleteOffering(offering);
                    setDeleteDialogOpen(true);
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

  const tableData = data?.results ?? [];

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
    getPaginationRowModel: getPaginationRowModel(),
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
          searchPlaceholder='Search offerings...'
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
                  >
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
                    No course offerings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* Edit Dialog */}
      <OfferingFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditOffering(null);
        }}
        mode='edit'
        offering={editOffering}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteOffering(null);
        }}
        title={`Delete "${deleteOffering?.name}"?`}
        description='This will permanently remove this offering and all associated requirements and expenses.'
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
