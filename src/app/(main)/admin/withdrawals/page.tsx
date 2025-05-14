'use client';

import { useState, useEffect, useMemo } from 'react';
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
  IconCheck,
  IconX,
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

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('user_name', {
    header: 'User',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => formatCurrency(info.getValue())
  }),
  columnHelper.accessor('bank_name', {
    header: 'Bank',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('account_number', {
    header: 'Account Number',
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      return (
        <Badge
          variant={
            status === 'approved'
              ? 'success'
              : status === 'pending'
                ? 'warning'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    }
  }),
  columnHelper.accessor('created_at', {
    header: 'Requested Date',
    cell: (info) => formatDate(info.getValue())
  }),
  columnHelper.accessor('actions', {
    header: 'Actions',
    cell: (info) => {
      const withdrawal = info.row.original;
      const status = withdrawal.status;
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
                <DialogTitle>Withdrawal Details</DialogTitle>
              </DialogHeader>
              <WithdrawalDetails withdrawal={withdrawal} onUpdate={fetchData} />
            </DialogContent>
          </Dialog>
          {status === 'pending' && (
            <>
              <Button
                size='sm'
                variant='outline'
                className='text-green-600'
                onClick={() => handleApprove(withdrawal.id, fetchData)}
              >
                <IconCheck className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='text-red-600'
                onClick={() => handleReject(withdrawal.id, fetchData)}
              >
                <IconX className='h-4 w-4' />
              </Button>
            </>
          )}
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleEdit(withdrawal.id)}
          >
            <IconEdit className='h-4 w-4' />
          </Button>
        </div>
      );
    }
  })
];

function WithdrawalDetails({ withdrawal, onUpdate }) {
  const [notes, setNotes] = useState(withdrawal.notes || '');
  const { api } = useClientApi();

  const handleUpdateNotes = async () => {
    try {
      await api.patch(`/api/v1/admin/withdrawals/${withdrawal.id}/`, {
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
          <p>Name: {withdrawal.user_name}</p>
          <p>Email: {withdrawal.user_email}</p>
          <p>Phone: {withdrawal.user_phone}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Withdrawal Information</h3>
          <p>Amount: {formatCurrency(withdrawal.amount)}</p>
          <p>Bank: {withdrawal.bank_name}</p>
          <p>Account: {withdrawal.account_number}</p>
          <p>Status: {withdrawal.status}</p>
          <p>Requested: {formatDate(withdrawal.created_at)}</p>
        </div>
      </div>
      <div>
        <h3 className='mb-2 font-semibold'>Admin Notes</h3>
        <textarea
          className='w-full rounded border p-2'
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='Add notes about this withdrawal...'
        />
        <Button onClick={handleUpdateNotes} className='mt-2'>
          Update Notes
        </Button>
      </div>
    </div>
  );
}

async function handleApprove(withdrawalId, onSuccess) {
  const { api } = useClientApi();
  if (!api) {
    toast.error('Not authenticated');
    return;
  }
  try {
    await api.post(`/api/v1/admin/withdrawals/${withdrawalId}/approve/`);
    toast.success('Withdrawal approved successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to approve withdrawal');
    console.error('Error approving withdrawal:', error);
  }
}

async function handleReject(withdrawalId, onSuccess) {
  const { api } = useClientApi();
  if (!api) {
    toast.error('Not authenticated');
    return;
  }
  try {
    await api.post(`/api/v1/admin/withdrawals/${withdrawalId}/reject/`);
    toast.success('Withdrawal rejected successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to reject withdrawal');
    console.error('Error rejecting withdrawal:', error);
  }
}

function WithdrawalFilters({ filters, onChange }) {
  return (
    <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-5'>
      <div className='space-y-2'>
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Statuses</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='approved'>Approved</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Bank</Label>
        <Input
          placeholder='Filter by bank name'
          value={filters.bank}
          onChange={(e) => onChange({ ...filters, bank: e.target.value })}
        />
      </div>
      <div className='space-y-2'>
        <Label>Amount Range</Label>
        <div className='flex space-x-2'>
          <Input
            type='number'
            placeholder='Min'
            value={filters.minAmount}
            onChange={(e) =>
              onChange({ ...filters, minAmount: e.target.value })
            }
          />
          <Input
            type='number'
            placeholder='Max'
            value={filters.maxAmount}
            onChange={(e) =>
              onChange({ ...filters, maxAmount: e.target.value })
            }
          />
        </div>
      </div>
      <div className='space-y-2'>
        <Label>Date Range</Label>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(value) => onChange({ ...filters, dateRange: value })}
        />
      </div>
      <div className='space-y-2'>
        <Label>Search</Label>
        <Input
          placeholder='Search by user, bank, account...'
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function WithdrawalsPage() {
  const { api } = useClientApi();
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    total_withdrawals: 0,
    pending_withdrawals: 0,
    approved_withdrawals: 0,
    rejected_withdrawals: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    bank: '',
    minAmount: '',
    maxAmount: '',
    search: '',
    dateRange: null,
    ordering: '-created_at',
    page: 1,
    pageSize: 20
  });

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.bank) params.append('bank_name', filters.bank);
    if (filters.minAmount) params.append('amount__gte', filters.minAmount);
    if (filters.maxAmount) params.append('amount__lte', filters.maxAmount);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateRange) {
      if (filters.dateRange.from)
        params.append('created_at__gte', filters.dateRange.from.toISOString());
      if (filters.dateRange.to)
        params.append('created_at__lte', filters.dateRange.to.toISOString());
    }
    if (filters.ordering) params.append('ordering', filters.ordering);
    params.append('page', filters.page.toString());
    params.append('page_size', filters.pageSize.toString());
    return params.toString();
  };

  const fetchData = async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [withdrawalsRes, statsRes] = await Promise.all([
        api.get(`/api/v1/admin/withdrawals/?${buildQuery()}`),
        api.get('/api/v1/admin/withdrawals/stats/')
      ]);
      setWithdrawals(withdrawalsRes.data.results);
      setTotal(withdrawalsRes.data.count);
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
    data: withdrawals,
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
        <h1 className='text-3xl font-bold'>Withdrawals Management</h1>
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
            <CardTitle className='text-sm font-medium'>
              Total Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_withdrawals}</div>
            <p className='text-muted-foreground text-xs'>
              All time withdrawals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.pending_withdrawals}
            </div>
            <p className='text-muted-foreground text-xs'>Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Approved Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.approved_withdrawals}
            </div>
            <p className='text-muted-foreground text-xs'>
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Rejected Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.rejected_withdrawals}
            </div>
            <p className='text-muted-foreground text-xs'>Rejected requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.total_amount)}
            </div>
            <p className='text-muted-foreground text-xs'>All time amount</p>
          </CardContent>
        </Card>
      </div>

      <WithdrawalFilters filters={filters} onChange={setFilters} />

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
