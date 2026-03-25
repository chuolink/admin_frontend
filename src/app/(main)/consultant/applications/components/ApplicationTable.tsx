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
import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Pencil,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { type ConsultantApplication, type Response } from '@/types/consultant';
import { useStateStore, type StateStore } from '@/stores/useStateStore';

const statusOptions = [
  { label: 'Pending', value: 'PENDING', icon: Clock },
  { label: 'Approved', value: 'APPROVED', icon: CheckCircle },
  { label: 'Rejected', value: 'REJECTED', icon: XCircle },
  { label: 'Waiting', value: 'WAITING', icon: Loader2 },
  { label: 'Completed', value: 'COMPLETED', icon: CheckCircle2 }
];

const STATUS_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  APPROVED: 'default',
  REJECTED: 'destructive',
  WAITING: 'secondary',
  COMPLETED: 'default'
};

const PAYMENT_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'outline',
  success: 'default',
  failed: 'destructive',
  cancelled: 'destructive'
};

export default function ApplicationTable() {
  const { api } = useClientApi();
  const router = useRouter();

  const paymentStatusFilter = useStateStore(
    (s: StateStore) => s.paymentStatusFilter
  );
  const setPaymentStatusFilter = useStateStore(
    (s: StateStore) => s.setPaymentStatusFilter
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15
  });

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize
    };
    if (globalFilter) params.search = globalFilter;
    if (sorting.length > 0) {
      params.ordering = sorting
        .map((s) => (s.desc ? '-' : '') + s.id)
        .join(',');
    }
    columnFilters.forEach((filter) => {
      if (
        filter.id === 'status' &&
        Array.isArray(filter.value) &&
        (filter.value as string[]).length > 0
      ) {
        params.status = (filter.value as string[]).join(',');
      }
    });
    if (paymentStatusFilter === 'not_paid') {
      params['not_paid'] = 'true';
    } else if (paymentStatusFilter === 'paid') {
      params['not_paid'] = 'false';
    } else if (paymentStatusFilter === 'pending') {
      params['not_paid'] = 'pending';
    }
    return params;
  }, [globalFilter, sorting, pagination, columnFilters, paymentStatusFilter]);

  const { data, isLoading } = useQuery<Response<ConsultantApplication>>({
    queryKey: ['consultant-applications', queryParams],
    queryFn: async () => {
      const response = await api!.get('/consultant/application/', {
        params: queryParams
      });
      return response.data;
    },
    enabled: !!api,
    staleTime: 30000
  });

  const columns = useMemo<ColumnDef<ConsultantApplication>[]>(
    () => [
      {
        id: 'app_id',
        accessorFn: (row) => row.application.app_id,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='App ID' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-sm'>
            {row.original.application.app_id}
          </span>
        )
      },
      {
        id: 'student_name',
        accessorFn: (row) =>
          `${row.application.student.user.first_name} ${row.application.student.user.last_name}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Student' />
        ),
        cell: ({ row }) => {
          const student = row.original.application.student;
          const name =
            `${student.user.first_name} ${student.user.last_name}`.trim();
          return (
            <div className='flex flex-col'>
              <span className='font-medium'>{name}</span>
              <span className='text-muted-foreground text-xs'>
                {student.user.email}
              </span>
            </div>
          );
        }
      },
      {
        id: 'university',
        accessorFn: (row) => row.application.university.name,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='University' />
        ),
        cell: ({ row }) => (
          <span
            className='block max-w-[200px] truncate text-sm'
            title={row.original.application.university.name}
          >
            {row.original.application.university.name}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge variant={STATUS_BADGE[status] || 'secondary'}>
              {status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'paid_fee',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Fee' />
        ),
        cell: ({ row }) => {
          const paid = row.getValue('paid_fee') as boolean;
          return paid ? (
            <Badge variant='default'>Paid</Badge>
          ) : (
            <Badge variant='destructive'>Not Paid</Badge>
          );
        },
        enableSorting: false
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
        id: 'payment_status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Payment' />
        ),
        cell: ({ row }) => {
          const payment = row.original.payment;
          if (!payment) {
            return <Badge variant='outline'>No Payment</Badge>;
          }
          const status = payment.status;
          return (
            <Badge
              variant={PAYMENT_BADGE[status] || 'outline'}
              className='capitalize'
            >
              {status}
            </Badge>
          );
        },
        enableSorting: false
      },
      {
        id: 'actions',
        cell: ({ row }) => (
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
                onClick={() =>
                  router.push(
                    `/consultant/applications/${row.original.id}/edit`
                  )
                }
              >
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false
      }
    ],
    [router]
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
        searchPlaceholder='Search applications...'
        filters={[
          { columnId: 'status', title: 'Status', options: statusOptions }
        ]}
      >
        <Select
          value={paymentStatusFilter || 'all'}
          onValueChange={(val) =>
            setPaymentStatusFilter(val === 'all' ? '' : val)
          }
        >
          <SelectTrigger className='h-8 w-[180px]'>
            <CreditCard className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Payment Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Payments</SelectItem>
            <SelectItem value='not_paid'>Not Paid</SelectItem>
            <SelectItem value='paid'>Paid</SelectItem>
            <SelectItem value='pending'>Pending Control</SelectItem>
          </SelectContent>
        </Select>
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
                  No applications found.
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
