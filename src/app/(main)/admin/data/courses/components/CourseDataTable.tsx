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
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  BookOpen,
  Library
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
  useCourses,
  useDeleteCourse
} from '@/features/data-admin/hooks/use-courses';
import type { DataCourse } from '@/features/data-admin/types';
import { CourseFormDialog } from './CourseFormDialog';

export default function CourseDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    slug: false,
    created_at: false
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Edit state
  const [editCourse, setEditCourse] = useState<DataCourse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete state
  const [deleteCourse, setDeleteCourse] = useState<DataCourse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useCourses();
  const deleteMutation = useDeleteCourse();

  const handleDelete = () => {
    if (!deleteCourse) return;
    deleteMutation.mutate(deleteCourse.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeleteCourse(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataCourse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <div className='flex max-w-[350px] items-center gap-2'>
            <BookOpen className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='truncate font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'slug',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Slug' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-sm'>
            {row.getValue('slug')}
          </span>
        )
      },
      {
        accessorKey: 'category_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Category' />
        ),
        cell: ({ row }) => {
          const categoryName = row.getValue('category_name') as
            | string
            | undefined;
          return categoryName ? (
            <Badge variant='secondary'>{categoryName}</Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>--</span>
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
        accessorKey: 'offerings_count',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Offerings' />
        ),
        cell: ({ row }) => {
          const count = (row.getValue('offerings_count') as number) ?? 0;
          return (
            <Badge variant='outline'>
              <Library className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          );
        }
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
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const course = row.original;
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
                    setEditCourse(course);
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
                    setDeleteCourse(course);
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
          searchPlaceholder='Search courses...'
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
                    No courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* Edit Dialog */}
      <CourseFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditCourse(null);
        }}
        mode='edit'
        course={editCourse}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteCourse(null);
        }}
        title={`Delete "${deleteCourse?.name}"?`}
        description='This action cannot be undone. All associated data will be permanently removed.'
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
