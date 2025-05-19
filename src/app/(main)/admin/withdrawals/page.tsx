'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import WithdrawalTable from './components/WithdrawalTable';
import { WithdrawalResponse, WithdrawalStats } from '@/types/withdrawal';

export default function WithdrawalsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  // Fetch initial data
  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['withdrawal-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/admin/withdrawals/stats/');
      return response.data as WithdrawalStats;
    }
  });

  const handleExport = () => {
    // Export functionality
    if (api) {
      window.open('/withdrawals/export', '_blank');
    }
  };

  const handleAddNew = () => {
    router.push('/withdrawals/new');
  };

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading withdrawal statistics...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !stats) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p className='text-red-500'>
            Error loading withdrawal statistics. Please try again later.
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
            <h1 className='text-3xl font-bold'>Withdrawals</h1>
            <p className='text-muted-foreground'>
              Manage and track all withdrawal transactions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.total_withdrawals}
              </div>
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
              <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.processing_withdrawals}
              </div>
              <p className='text-muted-foreground text-xs'>
                Awaiting processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.success_withdrawals}
              </div>
              <p className='text-muted-foreground text-xs'>
                Completed withdrawals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats.failed_withdrawals}
              </div>
              <p className='text-muted-foreground text-xs'>
                Failed transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawals Table */}
        <Card className='w-full overflow-hidden'>
          <CardContent className='p-0'>
            <div className='w-full overflow-x-auto'>
              <WithdrawalTable
                onExport={handleExport}
                onAddNew={handleAddNew}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
