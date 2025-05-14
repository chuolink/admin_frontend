'use client';

import { DataTable } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IconCheck, IconX, IconEye } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import useClientApi from '@/lib/axios/clientSide';

const columns = [
  {
    header: 'ID',
    accessorKey: 'id'
  },
  {
    header: 'Student',
    accessorKey: 'student_name'
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => formatCurrency(row.original.amount)
  },
  {
    header: 'Payment Method',
    accessorKey: 'payment_method',
    cell: ({ row }) => {
      const method = row.original.payment_method;
      return (
        <Badge variant={method === 'bank' ? 'default' : 'secondary'}>
          {method === 'bank' ? 'Bank Transfer' : 'Mobile Money'}
        </Badge>
      );
    }
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === 'completed'
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
  },
  {
    header: 'Date',
    accessorKey: 'created_at',
    cell: ({ row }) => formatDate(row.original.created_at)
  },
  {
    header: 'Actions',
    cell: ({ row }) => {
      const status = row.original.status;
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
                <DialogTitle>Payment Details</DialogTitle>
              </DialogHeader>
              <PaymentDetails payment={row.original} />
            </DialogContent>
          </Dialog>
          {status === 'pending' && (
            <>
              <Button
                size='sm'
                variant='outline'
                className='text-green-600'
                onClick={() => handleApprove(row.original.id, fetchData)}
              >
                <IconCheck className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='text-red-600'
                onClick={() => handleReject(row.original.id, fetchData)}
              >
                <IconX className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>
      );
    }
  }
];

function PaymentDetails({ payment }) {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>Student Information</h3>
          <p>Name: {payment.student_name}</p>
          <p>Email: {payment.student_email}</p>
          <p>Phone: {payment.student_phone}</p>
        </div>
        <div>
          <h3 className='font-semibold'>Payment Information</h3>
          <p>Amount: {formatCurrency(payment.amount)}</p>
          <p>Status: {payment.status}</p>
          <p>Date: {formatDate(payment.created_at)}</p>
        </div>
      </div>
      <div>
        <h3 className='font-semibold'>Payment Method Details</h3>
        {payment.payment_method === 'bank' ? (
          <>
            <p>Bank Name: {payment.bank_name}</p>
            <p>Account Number: {payment.account_number}</p>
            <p>Account Name: {payment.account_name}</p>
            {payment.branch_code && <p>Branch Code: {payment.branch_code}</p>}
          </>
        ) : (
          <>
            <p>Provider: {payment.provider?.toUpperCase()}</p>
            <p>Phone Number: {payment.phone_number}</p>
          </>
        )}
      </div>
      {payment.notes && (
        <div>
          <h3 className='font-semibold'>Notes</h3>
          <p className='whitespace-pre-wrap'>{payment.notes}</p>
        </div>
      )}
    </div>
  );
}

async function handleApprove(paymentId: string, onSuccess) {
  const { api } = useClientApi();
  if (!api) {
    toast.error('Not authenticated');
    return;
  }
  try {
    await api.post(`/api/v1/admin/payments/${paymentId}/approve/`);
    toast.success('Payment approved successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to approve payment');
    console.error('Error approving payment:', error);
  }
}

async function handleReject(paymentId: string, onSuccess) {
  const { api } = useClientApi();
  if (!api) {
    toast.error('Not authenticated');
    return;
  }
  try {
    await api.post(`/api/v1/admin/payments/${paymentId}/reject/`);
    toast.success('Payment rejected successfully');
    onSuccess?.();
  } catch (error) {
    toast.error('Failed to reject payment');
    console.error('Error rejecting payment:', error);
  }
}

export default function PaymentsPage() {
  const { api } = useClientApi();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_payments: 0,
    total_volume: 0,
    pending_payments: 0,
    failed_payments: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!api) return;
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        api.get('/api/v1/admin/payments/'),
        api.get('/api/v1/admin/payments/stats/')
      ]);
      setPayments(paymentsRes.data);
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
  }, [api]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Payments Management</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total_payments}</div>
            <p className='text-muted-foreground text-xs'>All time payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(stats.total_volume)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Total payment volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending_payments}</div>
            <p className='text-muted-foreground text-xs'>
              Payments awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Failed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.failed_payments}</div>
            <p className='text-muted-foreground text-xs'>
              Failed payment attempts
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns.map((col) => {
          if (col.header === 'Actions') {
            return {
              ...col,
              cell: ({ row }) => {
                const status = row.original.status;
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
                          <DialogTitle>Payment Details</DialogTitle>
                        </DialogHeader>
                        <PaymentDetails payment={row.original} />
                      </DialogContent>
                    </Dialog>
                    {status === 'pending' && (
                      <>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-green-600'
                          onClick={() =>
                            handleApprove(row.original.id, fetchData)
                          }
                        >
                          <IconCheck className='h-4 w-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-red-600'
                          onClick={() =>
                            handleReject(row.original.id, fetchData)
                          }
                        >
                          <IconX className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                  </div>
                );
              }
            };
          }
          return col;
        })}
        data={payments}
        searchKey='student_name'
      />
    </div>
  );
}
