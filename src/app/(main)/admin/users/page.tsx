'use client';

import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  IconEye,
  IconChevronDown,
  IconChevronUp,
  IconEdit
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import useClientApi from '@/lib/axios/clientSide';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AdminUser,
  AdminUserFilters,
  AdminUserStats,
  UserDetailsProps,
  UserFiltersProps
} from '@/types';

const columnHelper = createColumnHelper<AdminUser>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('full_name', {
    header: 'Name',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('subscription_status', {
    header: 'Subscription',
    cell: (info) => {
      const status = info.getValue();
      return (
        <Badge
          variant={
            status === 'Free Trial'
              ? 'warning'
              : status === 'No Subscription'
                ? 'destructive'
                : 'success'
          }
        >
          {status}
        </Badge>
      );
    }
  }),
  columnHelper.accessor('total_referrals', {
    header: 'Referrals',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('total_earnings', {
    header: 'Earnings',
    cell: (info) => formatCurrency(info.getValue())
  }),
  columnHelper.accessor('total_withdrawals', {
    header: 'Withdrawals',
    cell: (info) => formatCurrency(info.getValue())
  }),
  columnHelper.accessor('last_activity', {
    header: 'Last Activity',
    cell: (info) => formatDate(info.getValue())
  }),
  columnHelper.accessor('is_active', {
    header: 'Status',
    cell: (info) => (
      <Badge variant={info.getValue() ? 'success' : 'destructive'}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </Badge>
    )
  }),
  columnHelper.accessor('actions', {
    header: 'Actions',
    cell: (info) => {
      const user = info.row.original;
      return (
        <div className='flex space-x-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button size='sm' variant='outline'>
                <IconEye className='h-4 w-4' />
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-3xl'>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              <UserDetails user={user} onUpdate={fetchData} />
            </DialogContent>
          </Dialog>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleEdit(user.id)}
          >
            <IconEdit className='h-4 w-4' />
          </Button>
        </div>
      );
    }
  })
];

function UserDetails({ user, onUpdate }: UserDetailsProps) {
  const [notes, setNotes] = useState(user.notes || '');
  const { api } = useClientApi();

  const handleUpdateNotes = async () => {
    try {
      await api.patch(`/api/v1/admin/users/${user.id}/`, {
        notes
      });
      toast.success('Notes updated successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update notes');
    }
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>User Information</h3>
          <p>Name: {user.full_name}</p>
          <p>Email: {user.email}</p>
          <p>Joined: {formatDate(user.created_at)}</p>
          <p>Last Login: {formatDate(user.last_activity)}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Account Information</h3>
          <p>Status: {user.is_active ? 'Active' : 'Inactive'}</p>
          <p>Subscription: {user.subscription_status}</p>
          <p>Total Referrals: {user.total_referrals}</p>
          <p>Total Earnings: {formatCurrency(user.total_earnings)}</p>
          <p>Total Withdrawals: {formatCurrency(user.total_withdrawals)}</p>
        </div>
      </div>
      <div>
        <h3 className='mb-2 font-semibold'>Admin Notes</h3>
        <textarea
          className='w-full rounded border p-2'
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='Add notes about this user...'
        />
        <Button onClick={handleUpdateNotes} className='mt-2'>
          Update Notes
        </Button>
      </div>
    </div>
  );
}

function UserFilters({ filters, onChange }: UserFiltersProps) {
  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-5'>
      <div className='space-y-2'>
        <Label>Status</Label>
        <Select
          value={filters.is_active}
          onValueChange={(value) => onChange({ ...filters, is_active: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Statuses</SelectItem>
            <SelectItem value='true'>Active</SelectItem>
            <SelectItem value='false'>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Subscription</Label>
        <Select
          value={filters.subscription_status}
          onValueChange={(value) =>
            onChange({ ...filters, subscription_status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='All Subscriptions' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Subscriptions</SelectItem>
            <SelectItem value='free_trial'>Free Trial</SelectItem>
            <SelectItem value='not_registered'>Not Registered</SelectItem>
            <SelectItem value='basic'>Basic</SelectItem>
            <SelectItem value='premium'>Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Min Referrals</Label>
        <Input
          type='number'
          placeholder='Minimum referrals'
          value={filters.min_referrals}
          onChange={(e) =>
            onChange({ ...filters, min_referrals: e.target.value })
          }
        />
      </div>
      <div className='space-y-2'>
        <Label>Last Activity</Label>
        <Select
          value={filters.last_activity}
          onValueChange={(value) =>
            onChange({ ...filters, last_activity: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Any time' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>Any time</SelectItem>
            <SelectItem value='7'>Last 7 days</SelectItem>
            <SelectItem value='30'>Last 30 days</SelectItem>
            <SelectItem value='90'>Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Search</Label>
        <Input
          placeholder='Search by name, email...'
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { api } = useClientApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats>({
    total_users: 0,
    active_users: 0,
    free_trial_users: 0,
    premium_users: 0,
    total_referrals: 0
  });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AdminUserFilters>({
    is_active: '',
    subscription_status: '',
    min_referrals: '',
    last_activity: '',
    search: '',
    ordering: '-date_joined',
    page: 1,
    pageSize: 20
  });

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.is_active) params.append('is_active', filters.is_active);
    if (filters.subscription_status)
      params.append('subscription_status', filters.subscription_status);
    if (filters.min_referrals)
      params.append('min_referrals', filters.min_referrals);
    if (filters.last_activity)
      params.append('last_activity', filters.last_activity);
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    params.append('page', filters.page.toString());
    params.append('page_size', filters.pageSize.toString());
    return params.toString();
  };

  const fetchData = async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get<AdminUserResponse>(`/api/v1/admin/users/?${buildQuery()}`),
        api.get<AdminUserStats>('/api/v1/admin/users/stats/')
      ]);
      setUsers(usersRes.data.results);
      setTotal(usersRes.data.count);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [JSON.stringify(filters)]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: Math.ceil(total / filters.pageSize),
    state: {
      pagination: {
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize
      }
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: filters.page - 1,
          pageSize: filters.pageSize
        });
        setFilters((f) => ({
          ...f,
          page: newState.pageIndex + 1,
          pageSize: newState.pageSize
        }));
      }
    },
    manualPagination: true
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Users Management</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_users}</div>
            <p className='text-muted-foreground text-xs'>
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.active_users}</div>
            <p className='text-muted-foreground text-xs'>
              Currently active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Free Trial Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.free_trial_users}</div>
            <p className='text-muted-foreground text-xs'>Users in free trial</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.premium_users}</div>
            <p className='text-muted-foreground text-xs'>Premium subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_referrals}</div>
            <p className='text-muted-foreground text-xs'>All time referrals</p>
          </CardContent>
        </Card>
      </div>

      <UserFilters filters={filters} onChange={setFilters} />

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <IconChevronUp className='ml-2 h-4 w-4' />,
                          desc: <IconChevronDown className='ml-2 h-4 w-4' />
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
