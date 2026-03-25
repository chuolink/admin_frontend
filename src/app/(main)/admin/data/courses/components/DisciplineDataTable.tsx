'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, Layers, BookOpen } from 'lucide-react';
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
  useDisciplines,
  useDeleteDiscipline
} from '@/features/data-admin/hooks/use-courses';
import type { DataDiscipline } from '@/features/data-admin/types';
import { DisciplineFormDialog } from './DisciplineFormDialog';

export default function DisciplineDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Edit state
  const [editDiscipline, setEditDiscipline] = useState<DataDiscipline | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete state
  const [deleteDiscipline, setDeleteDiscipline] =
    useState<DataDiscipline | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useDisciplines();
  const deleteMutation = useDeleteDiscipline();

  const handleDelete = () => {
    if (!deleteDiscipline) return;
    deleteMutation.mutate(deleteDiscipline.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeleteDiscipline(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<DataDiscipline>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Layers className='text-muted-foreground h-4 w-4' />
            <span className='font-medium'>{row.getValue('name')}</span>
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
        accessorKey: 'courses_count',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Courses' />
        ),
        cell: ({ row }) => {
          const count = (row.getValue('courses_count') as number) ?? 0;
          return (
            <Badge variant='outline'>
              <BookOpen className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const discipline = row.original;
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
                    setEditDiscipline(discipline);
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
                    setDeleteDiscipline(discipline);
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
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-[250px]' />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
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
          searchPlaceholder='Search disciplines...'
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
                    No disciplines found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      {/* Edit Dialog */}
      <DisciplineFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditDiscipline(null);
        }}
        mode='edit'
        discipline={editDiscipline}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteDiscipline(null);
        }}
        title={`Delete "${deleteDiscipline?.name}"?`}
        description='This action cannot be undone. All courses under this discipline will be unlinked.'
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
