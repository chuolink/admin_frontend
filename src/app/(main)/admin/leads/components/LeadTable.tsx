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
  type Lead,
  type LeadStatus,
  type LeadsResponse,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS
} from '@/features/leads/types';
import {
  MoreHorizontal,
  Pencil,
  Phone,
  CalendarPlus,
  TrendingUp,
  XCircle,
  UserPlus,
  Globe,
  Building2,
  PhoneCall,
  Users,
  Share2,
  Handshake,
  Clock,
  CheckCircle,
  Calendar,
  CalendarCheck,
  GraduationCap
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

const statusFilterOptions = [
  { label: 'New', value: 'NEW', icon: UserPlus },
  { label: 'Contacted', value: 'CONTACTED', icon: Phone },
  {
    label: 'Consultation Scheduled',
    value: 'CONSULTATION_SCHEDULED',
    icon: Calendar
  },
  {
    label: 'Consultation Done',
    value: 'CONSULTATION_DONE',
    icon: CalendarCheck
  },
  { label: 'Converted', value: 'CONVERTED', icon: CheckCircle },
  { label: 'Lost', value: 'LOST', icon: XCircle }
];

const sourceFilterOptions = [
  { label: 'School Visit', value: 'SCHOOL_VISIT', icon: Building2 },
  { label: 'Online', value: 'ONLINE', icon: Globe },
  { label: 'Office Visit', value: 'OFFICE_VISIT', icon: Building2 },
  { label: 'Sales Call', value: 'SALES_CALL', icon: PhoneCall },
  { label: 'Referral', value: 'REFERRAL', icon: Users },
  { label: 'Social Media', value: 'SOCIAL_MEDIA', icon: Share2 },
  { label: 'Third Party', value: 'THIRD_PARTY', icon: Handshake },
  { label: 'App Student', value: 'APP', icon: GraduationCap }
];

const STATUS_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  NEW: 'default',
  CONTACTED: 'secondary',
  CONSULTATION_SCHEDULED: 'outline',
  CONSULTATION_DONE: 'outline',
  CONVERTED: 'default',
  LOST: 'destructive'
};

interface LeadTableProps {
  onAddNew?: () => void;
  onEdit?: (lead: Lead) => void;
}

export default function LeadTable({ onAddNew, onEdit }: LeadTableProps) {
  const { api } = useClientApi();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    parent_name: false
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

  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leads', queryParams],
    queryFn: async () => {
      const response = await api!.get('/admin/leads/', {
        params: queryParams
      });
      return response.data;
    },
    enabled: !!api
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const response = await api!.patch(`/admin/leads/${id}/`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const sourceLabel = (val: string) =>
    LEAD_SOURCE_OPTIONS.find((o) => o.value === val)?.label ?? val;
  const statusLabel = (val: string) =>
    LEAD_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val;

  const columns = useMemo<ColumnDef<Lead>[]>(
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
        accessorKey: 'student_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Student' />
        ),
        cell: ({ row }) => (
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate font-medium'>
                {row.original.student_name}
              </span>
              {row.original.is_app_student && (
                <Badge
                  variant='outline'
                  className='shrink-0 border-green-200 px-1 py-0 text-[9px] leading-4 text-green-700 dark:border-green-800 dark:text-green-400'
                >
                  App
                </Badge>
              )}
            </div>
            {row.original.email && (
              <div className='text-muted-foreground truncate text-xs'>
                {row.original.email}
              </div>
            )}
          </div>
        )
      },
      {
        accessorKey: 'parent_name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Parent' />
        ),
        cell: ({ row }) => (
          <span className='text-sm'>{row.original.parent_name || '—'}</span>
        )
      },
      {
        accessorKey: 'phone_number',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Phone' />
        ),
        cell: ({ row }) => (
          <span className='text-sm'>{row.original.phone_number}</span>
        ),
        enableSorting: false
      },
      {
        accessorKey: 'source',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Source' />
        ),
        cell: ({ row }) => (
          <Badge variant='outline'>
            {sourceLabel(row.getValue('source') as string)}
          </Badge>
        ),
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
            <Badge variant={STATUS_BADGE[status] || 'secondary'}>
              {statusLabel(status)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id))
      },
      {
        accessorKey: 'follow_up_date',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Follow-up' />
        ),
        cell: ({ row }) => {
          const date = row.original.follow_up_date;
          if (!date) return <span className='text-muted-foreground'>—</span>;
          const isOverdue = new Date(date) <= new Date();
          return (
            <span
              className={`text-sm ${isOverdue ? 'font-medium text-red-600' : 'text-muted-foreground'}`}
            >
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
          );
        }
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Created' />
        ),
        cell: ({ row }) => (
          <span className='text-muted-foreground text-sm'>
            {format(new Date(row.original.created_at), 'MMM d, yyyy')}
          </span>
        )
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const lead = row.original;
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
              <DropdownMenuContent align='end' className='w-[200px]'>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(lead)}>
                    <Pencil className='mr-2 h-4 w-4' />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {lead.status === 'NEW' && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateStatus.mutate({
                        id: lead.id,
                        status: 'CONTACTED'
                      })
                    }
                  >
                    <Phone className='mr-2 h-4 w-4' />
                    Mark Contacted
                  </DropdownMenuItem>
                )}
                {(lead.status === 'CONTACTED' || lead.status === 'NEW') && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateStatus.mutate({
                        id: lead.id,
                        status: 'CONSULTATION_SCHEDULED'
                      })
                    }
                  >
                    <CalendarPlus className='mr-2 h-4 w-4' />
                    Schedule Consultation
                  </DropdownMenuItem>
                )}
                {lead.status !== 'CONVERTED' && lead.status !== 'LOST' && (
                  <DropdownMenuItem
                    onClick={() =>
                      updateStatus.mutate({
                        id: lead.id,
                        status: 'CONVERTED'
                      })
                    }
                  >
                    <TrendingUp className='mr-2 h-4 w-4' />
                    Mark Converted
                  </DropdownMenuItem>
                )}
                {lead.status !== 'LOST' && lead.status !== 'CONVERTED' && (
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={() =>
                      updateStatus.mutate({
                        id: lead.id,
                        status: 'LOST'
                      })
                    }
                  >
                    <XCircle className='mr-2 h-4 w-4' />
                    Mark Lost
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false
      }
    ],
    [onEdit, updateStatus]
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
        searchPlaceholder='Search leads...'
        filters={[
          { columnId: 'status', title: 'Status', options: statusFilterOptions },
          { columnId: 'source', title: 'Source', options: sourceFilterOptions }
        ]}
      >
        {onAddNew && (
          <Button size='sm' className='h-8' onClick={onAddNew}>
            <UserPlus className='mr-2 h-4 w-4' />
            Add Lead
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
                  onClick={() => router.push(`/admin/leads/${row.original.id}`)}
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
                  No leads found.
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
