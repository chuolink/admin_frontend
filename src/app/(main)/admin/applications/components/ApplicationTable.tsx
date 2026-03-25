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
import { Application, ApplicationResponse } from '@/types/application';
import {
  Eye,
  MoreHorizontal,
  Trash2,
  Pencil,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Ban
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

const statusOptions = [
  { label: 'Pending', value: 'PENDING', icon: Clock },
  { label: 'Approved', value: 'APPROVED', icon: CheckCircle },
  { label: 'Admitted', value: 'ADMITTED', icon: CheckCircle },
  { label: 'Submitted', value: 'SUBMITTED', icon: Send },
  { label: 'Full Paid', value: 'FULL_PAID', icon: CheckCircle },
  { label: 'Rejected', value: 'REJECTED', icon: XCircle },
  { label: 'Expired', value: 'EXPIRED', icon: Clock },
  { label: 'Cancelled', value: 'CANCELLED', icon: Ban },
  { label: 'Revoked', value: 'REVOKED', icon: Ban }
];

const sentOptions = [
  { label: 'Sent', value: 'true', icon: Send },
  { label: 'Not Sent', value: 'false', icon: Clock }
];

const STATUS_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  APPROVED: 'default',
  ADMITTED: 'default',
  SUBMITTED: 'default',
  FULL_PAID: 'default',
  REJECTED: 'destructive',
  EXPIRED: 'secondary',
  CANCELLED: 'secondary',
  REVOKED: 'secondary'
};

interface ApplicationTableProps {
  onExport?: () => void;
  onAddNew?: () => void;
}

export default function ApplicationTable({ onAddNew }: ApplicationTableProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    is_sent: false
  });
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
    return params;
  }, [globalFilter, sorting, pagination]);

  const { data, isLoading } = useQuery<ApplicationResponse>({
    queryKey: ['applications', queryParams],
    queryFn: async () => {
      const response = await api!.get('/admin/applications/', {
        params: queryParams
      });
      return response.data;
    },
    enabled: !!api
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!api) throw new Error('API not initialized');
      await api.delete(`/admin/applications/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
    },
    onError: () => toast.error('Failed to delete application')
  });

  const columns = useMemo<ColumnDef<Application>[]>(
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
        accessorKey: 'app_id',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='ID' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground font-mono text-xs'>
            {row.getValue('app_id')}
          </span>
        ),
        enableSorting: false
      },
      {
        id: 'student',
        accessorFn: (row) => {
          const s = row.student as any;
          return s?.user
            ? `${s.user.first_name || ''} ${s.user.last_name || ''}`.trim()
            : s?.name || '';
        },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Student' />
        ),
        cell: ({ row }) => {
          const student = row.original.student as any;
          const name = student?.user
            ? `${student.user.first_name || ''} ${student.user.last_name || ''}`.trim()
            : student?.name || '';
          const email = student?.user?.email || student?.email || '';
          return (
            <div className='min-w-0'>
              <div className='truncate font-medium'>{name}</div>
              <div className='text-muted-foreground truncate text-xs'>
                {email}
              </div>
            </div>
          );
        }
      },
      {
        id: 'university',
        accessorFn: (row) => row.university?.name || '',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='University' />
        ),
        cell: ({ row }) => (
          <span className='truncate text-sm'>
            {row.original.university?.name || 'N/A'}
          </span>
        )
      },
      {
        id: 'course',
        accessorFn: (row) =>
          row.courses && row.courses.length > 0 ? row.courses[0].name : '',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Course' />
        ),
        cell: ({ row }) => {
          const courses = row.original.courses;
          if (!courses || courses.length === 0)
            return (
              <span className='text-muted-foreground text-sm'>No course</span>
            );
          return (
            <div className='min-w-0'>
              <div className='truncate text-sm'>{courses[0].name}</div>
              {courses.length > 1 && (
                <span className='text-muted-foreground text-[10px]'>
                  +{courses.length - 1} more
                </span>
              )}
            </div>
          );
        }
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
              {status.toLowerCase()}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        id: 'is_sent',
        accessorFn: (row) => String(row.is_sent),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Sent' />
        ),
        cell: ({ row }) => {
          const sent = row.original.is_sent;
          return (
            <Badge variant={sent ? 'default' : 'outline'}>
              {sent ? 'Sent' : 'Draft'}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Created' />
        ),
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string;
          return (
            <span className='text-muted-foreground text-sm'>
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const app = row.original;
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
                  onClick={() => router.push(`/admin/applications/${app.id}`)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/applications/${app.id}/edit`)
                  }
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    if (confirm('Delete this application?')) {
                      deleteMutation.mutate(app.id);
                    }
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
        searchPlaceholder='Search applications...'
        filters={[
          { columnId: 'status', title: 'Status', options: statusOptions },
          { columnId: 'is_sent', title: 'Sent', options: sentOptions }
        ]}
      >
        {onAddNew && (
          <Button size='sm' className='h-8' onClick={onAddNew}>
            New Application
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
                  className='cursor-pointer'
                  onClick={() =>
                    router.push(`/admin/applications/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (
                          cell.column.id === 'select' ||
                          cell.column.id === 'actions'
                        )
                          e.stopPropagation();
                      }}
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
