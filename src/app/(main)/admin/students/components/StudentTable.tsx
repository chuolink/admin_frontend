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
import { format, parseISO } from 'date-fns';
import { Student, StudentsResponse } from '@/types/student-details';
import { formatCurrency } from '@/lib/utils';
import {
  Eye,
  MoreHorizontal,
  Trash2,
  GitBranch,
  UserCircle,
  CircleCheck,
  CircleX,
  GraduationCap,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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

// Status filter options
const statusOptions = [
  { label: 'Active', value: 'true', icon: CircleCheck },
  { label: 'Inactive', value: 'false', icon: CircleX }
];

// Subscription type filter options
const subscriptionOptions = [
  { label: 'Premium', value: 'premium', icon: Crown },
  { label: 'Standard', value: 'standard', icon: Star },
  { label: 'Basic', value: 'basic', icon: Zap }
];

// Education filter options
const educationOptions = [
  { label: 'Form Four', value: 'form_four', icon: GraduationCap },
  { label: 'Form Six', value: 'form_six', icon: GraduationCap },
  { label: 'Diploma', value: 'diploma', icon: GraduationCap },
  { label: 'Degree', value: 'degree', icon: GraduationCap }
];

interface StudentsTableProps {
  onExport?: () => void;
  onAddNew?: () => void;
}

export default function StudentsTable({
  onExport,
  onAddNew
}: StudentsTableProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    education_level: false,
    referral_count: false
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  // Build query params from table state
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

  // Fetch data
  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['students', queryParams],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/students/', {
        params: queryParams
      });
      return response.data;
    },
    enabled: !!api
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!api) throw new Error('API not initialized');
      await api.delete(`/admin/students/${studentId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete student');
    }
  });

  // Column definitions
  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'user_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Student' />
        ),
        cell: ({ row }) => {
          const name = row.getValue('user_name') as string;
          const email = row.original.user_email;
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          return (
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium'>
                {initials}
              </div>
              <div className='min-w-0'>
                <div className='truncate font-medium'>{name}</div>
                <div className='text-muted-foreground truncate text-xs'>
                  {email}
                </div>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'user.phone_number',
        id: 'phone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Phone' />
        ),
        accessorFn: (row) => row.user.phone_number,
        cell: ({ row }) => {
          const phone = row.original.user.phone_number;
          return (
            <span className='text-muted-foreground text-sm'>
              {phone || 'N/A'}
            </span>
          );
        },
        enableSorting: false
      },
      {
        accessorKey: 'status',
        id: 'status',
        accessorFn: (row) => String(row.user.is_active),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
          const isActive = row.original.user.is_active;
          return (
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
        enableSorting: false
      },
      {
        accessorKey: 'education_level',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Education' />
        ),
        cell: ({ row }) => {
          const level = row.getValue('education_level') as string;
          return (
            <span className='text-sm'>
              {level
                ? level
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                : 'Not Set'}
            </span>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        id: 'subscription',
        accessorFn: (row) => row.subscription?.type || 'basic',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Plan' />
        ),
        cell: ({ row }) => {
          const type = row.original.subscription?.type || 'basic';
          const status = row.original.subscription?.status || 'none';
          const variant =
            type === 'premium'
              ? 'default'
              : type === 'standard'
                ? 'secondary'
                : 'outline';
          return (
            <div className='flex flex-col gap-0.5'>
              <Badge variant={variant} className='w-fit text-xs capitalize'>
                {type}
              </Badge>
              {status !== 'none' && (
                <span
                  className={`text-[10px] ${status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}
                >
                  {status}
                </span>
              )}
            </div>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'reg_prog',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Progress' />
        ),
        cell: ({ row }) => {
          const progress = row.getValue('reg_prog') as number;
          return (
            <div className='flex items-center gap-2'>
              <Progress value={progress} className='h-2 w-16' />
              <span className='text-muted-foreground text-xs'>{progress}%</span>
            </div>
          );
        }
      },
      {
        id: 'applications',
        accessorFn: (row) => row.no_abroad_apps || 0,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Apps' />
        ),
        cell: ({ row }) => {
          const count = row.original.no_abroad_apps || 0;
          return (
            <span className='text-sm font-medium'>
              {count > 0 ? count : '-'}
            </span>
          );
        }
      },
      {
        id: 'payments',
        accessorFn: (row) => row.payments?.total_amount || 0,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Payments' />
        ),
        cell: ({ row }) => {
          const amount = row.original.payments?.total_amount || 0;
          const count = row.original.payments?.total_count || 0;
          if (amount === 0)
            return <span className='text-muted-foreground text-sm'>None</span>;
          return (
            <div>
              <div className='text-sm font-medium'>
                {formatCurrency(amount)}
              </div>
              <div className='text-muted-foreground text-[10px]'>
                {count} payment{count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'referral_count',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Referrals' />
        ),
        cell: ({ row }) => {
          const count = row.getValue('referral_count') as number;
          return <span className='text-sm'>{count}</span>;
        }
      },
      {
        id: 'joined',
        accessorFn: (row) => row.user.date_joined,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Joined' />
        ),
        cell: ({ row }) => {
          const date = row.original.user.date_joined;
          if (!date) return <span className='text-muted-foreground'>N/A</span>;
          return (
            <span className='text-muted-foreground text-sm'>
              {format(parseISO(date), 'MMM d, yyyy')}
            </span>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                  <span className='sr-only'>Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/students/${student.id}`)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/pipeline?student=${student.id}`)
                  }
                >
                  <GitBranch className='mr-2 h-4 w-4' />
                  Pipeline
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/students/${student.id}`)}
                >
                  <UserCircle className='mr-2 h-4 w-4' />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete ${student.user_name}?`
                      )
                    ) {
                      deleteMutation.mutate(student.id.toString());
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
      <div className='space-y-4 p-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-[250px]' />
          <Skeleton className='h-8 w-[100px]' />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
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
        searchPlaceholder='Search students by name or email...'
        filters={[
          { columnId: 'status', title: 'Status', options: statusOptions },
          {
            columnId: 'subscription',
            title: 'Plan',
            options: subscriptionOptions
          }
        ]}
      >
        {onAddNew && (
          <Button size='sm' className='h-8' onClick={onAddNew}>
            Add Student
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
                    router.push(`/admin/students/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        // Don't navigate for select/actions columns
                        if (
                          cell.column.id === 'select' ||
                          cell.column.id === 'actions'
                        ) {
                          e.stopPropagation();
                        }
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
                  No students found.
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
