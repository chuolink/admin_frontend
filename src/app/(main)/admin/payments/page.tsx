'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PaymentTable from './components/PaymentTable';
import { PaymentResponse, PaymentStats } from '@/types/payment';

export default function PaymentsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  // Fetch initial data
  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/payments/stats/');
      return response.data as PaymentStats;
    }
  });

  const handleExport = () => {
    // Export functionality
    if (api) {
      window.open('/payments/export', '_blank');
    }
  };

  const handleAddNew = () => {
    router.push('/payments/new');
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading payment statistics...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !stats) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading payment statistics. Please try again later.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Payments</h1>
            <p className='text-muted-foreground'>
              Manage and track all payment transactions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Payments
              </CardTitle>
              <FileText className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.total_payments}</div>
              <p className='text-muted-foreground text-xs'>
                Total amount:{' '}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'TZS'
                }).format(stats.total_amount)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Payments
              </CardTitle>
              <Clock className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.pending_payments}</div>
              <p className='text-muted-foreground text-xs'>
                Awaiting processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Successful Payments
              </CardTitle>
              <CheckCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.success_payments}</div>
              <p className='text-muted-foreground text-xs'>
                Completed payments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Failed Payments
              </CardTitle>
              <XCircle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.failed_payments}</div>
              <p className='text-muted-foreground text-xs'>
                Failed transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className='w-full overflow-hidden'>
          <CardContent className='p-0'>
            <div className='w-full overflow-x-auto'>
              <PaymentTable onExport={handleExport} onAddNew={handleAddNew} />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
