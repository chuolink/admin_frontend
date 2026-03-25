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
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
  GraduationCap,
  HelpCircle,
  Receipt,
  CheckCircle2,
  XCircle
} from 'lucide-react';
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
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/features/data-admin/components/DeleteConfirmDialog';
import {
  useCountries,
  useDeleteCountry
} from '@/features/data-admin/hooks/use-countries';
import type { CountryDetail } from '@/features/data-admin/hooks/use-countries';

interface CountryDataTableProps {
  onEdit: (country: CountryDetail) => void;
}

export function CountryDataTable({ onEdit }: CountryDataTableProps) {
  const { data: countriesData, isLoading } = useCountries({ page_size: 100 });
  const deleteCountry = useDeleteCountry();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<CountryDetail | null>(
    null
  );

  const handleDeleteConfirm = () => {
    if (!countryToDelete) return;
    deleteCountry.mutate(countryToDelete.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setCountryToDelete(null);
      }
    });
  };

  const columns = useMemo<ColumnDef<CountryDetail>[]>(
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
          <div className='flex items-center gap-2'>
            <Globe className='text-muted-foreground h-4 w-4 shrink-0' />
            <span className='font-medium'>{row.getValue('name')}</span>
          </div>
        )
      },
      {
        accessorKey: 'slug',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Code' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-sm'>
            {row.getValue('slug')}
          </span>
        )
      },
      {
        accessorKey: 'universities_count',
        header: 'Universities',
        cell: ({ row }) => {
          const count = row.original.universities_count ?? 0;
          return (
            <Badge variant='secondary'>
              <GraduationCap className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'faqs_count',
        header: 'FAQs',
        cell: ({ row }) => {
          const count = row.original.faqs_count ?? 0;
          return (
            <Badge variant='secondary'>
              <HelpCircle className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'expenses_count',
        header: 'Expenses',
        cell: ({ row }) => {
          const count = row.original.expenses_count ?? 0;
          return (
            <Badge variant='secondary'>
              <Receipt className='mr-1 h-3 w-3' />
              {count}
            </Badge>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'scholarship_only',
        header: 'Scholarship Only',
        cell: ({ row }) => {
          const value = row.getValue('scholarship_only') as boolean;
          return value ? (
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          ) : (
            <XCircle className='text-muted-foreground/40 h-4 w-4' />
          );
        },
        enableSorting: false
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
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const country = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(country)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    setCountryToDelete(country);
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

  const tableData = countriesData?.results ?? [];

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
          searchPlaceholder='Search countries...'
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
                    No countries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='Delete Country'
        description={`Are you sure you want to delete "${countryToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isPending={deleteCountry.isPending}
      />
    </>
  );
}
