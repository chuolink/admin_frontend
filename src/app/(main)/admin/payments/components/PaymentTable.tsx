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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Loader2,
  Building2,
  Smartphone,
  Wallet,
  Plus
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
import { type Payment, type PaymentResponse } from '@/types/payment';

interface PaymentTableProps {
  onAddNew?: () => void;
}

const statusOptions = [
  { label: 'Pending', value: 'pending', icon: Clock },
  { label: 'Processing', value: 'processing', icon: Loader2 },
  { label: 'Success', value: 'success', icon: CheckCircle },
  { label: 'Failed', value: 'failed', icon: XCircle },
  { label: 'Cancelled', value: 'cancelled', icon: Ban },
  { label: 'Refunded', value: 'refunded', icon: RotateCcw }
];

const modeOptions = [
  { label: 'Bank', value: 'bank', icon: Building2 },
  { label: 'Mobile', value: 'mobile', icon: Smartphone },
  { label: 'Balance', value: 'balance', icon: Wallet }
];

const STATUS_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'outline',
  processing: 'secondary',
  success: 'default',
  failed: 'destructive',
  cancelled: 'secondary',
  refunded: 'outline'
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function PaymentTable({ onAddNew }: PaymentTableProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: pagination.pageIndex + 1,
      page_size: pagination.pageSize
    };
    if (globalFilter) params.search = globalFilter;
    if (sorting.length > 0) {
      params.ordering = sorting
        .map((s) => (s.desc ? '-' : '') + s.id)
        .join(',');
    }
    columnFilters.forEach((filter) => {
      if (
        (filter.id === 'status' || filter.id === 'mode') &&
        Array.isArray(filter.value) &&
        (filter.value as string[]).length > 0
      ) {
        params[filter.id] = (filter.value as string[]).join(',');
      }
    });
    return params;
  }, [globalFilter, sorting, pagination, columnFilters]);

  const { data, isLoading } = useQuery<PaymentResponse>({
    queryKey: ['payments', queryParams],
    queryFn: async () => {
      const response = await api!.get('/admin/payments/', {
        params: queryParams
      });
      return response.data;
    },
    enabled: !!api
  });

  const deleteMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      await api!.delete(`/admin/payments/${paymentId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success('Payment deleted successfully');
    },
    onError: () => toast.error('Failed to delete payment')
  });

  const columns = useMemo<ColumnDef<Payment>[]>(
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
        id: 'user',
        accessorKey: 'user',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='User' />
        ),
        cell: ({ row }) => {
          const payment = row.original;
          const name =
            payment.student?.name ||
            `${payment.user.first_name} ${payment.user.last_name}`;
          const email = payment.student?.email || payment.user.email;
          return (
            <div className='flex flex-col'>
              <span className='font-medium'>{name}</span>
              <span className='text-muted-foreground text-xs'>{email}</span>
            </div>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Amount' />
        ),
        cell: ({ row }) => (
          <span className='font-medium tabular-nums'>
            {formatCurrency(row.original.amount)}
          </span>
        )
      },
      {
        accessorKey: 'mode',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Mode' />
        ),
        cell: ({ row }) => {
          const mode = row.getValue('mode') as string;
          return (
            <Badge variant='secondary' className='capitalize'>
              {mode}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              variant={STATUS_BADGE[status] || 'secondary'}
              className='capitalize'
            >
              {status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Date' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {format(new Date(row.getValue('created_at')), 'MMM d, yyyy')}
          </span>
        )
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const payment = row.original;
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
                  onClick={() => router.push(`/admin/payments/${payment.id}`)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/payments/${payment.id}/edit`)
                  }
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => deleteMutation.mutate(payment.id)}
                  disabled={deleteMutation.isPending}
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
    [router, deleteMutation]
  );

  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    pageCount: data ? Math.ceil(data.count / pagination.pageSize) : -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
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
    <div className='flex flex-col gap-4'>
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        searchPlaceholder='Search payments...'
        filters={[
          { columnId: 'status', title: 'Status', options: statusOptions },
          { columnId: 'mode', title: 'Mode', options: modeOptions }
        ]}
      >
        {onAddNew && (
          <Button size='sm' onClick={onAddNew}>
            <Plus className='mr-2 h-4 w-4' />
            Add New
          </Button>
        )}
      </DataTableToolbar>

      <div className='rounded-md border'>
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
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
