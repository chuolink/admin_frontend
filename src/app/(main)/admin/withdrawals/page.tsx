'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import WithdrawalTable from './components/WithdrawalTable';
import { type WithdrawalStats } from '@/types/withdrawal';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function WithdrawalsPage() {
  const { api } = useClientApi();
  const router = useRouter();

  const { data: stats } = useQuery<WithdrawalStats>({
    queryKey: ['withdrawal-stats'],
    queryFn: async () => {
      const response = await api!.get('/admin/withdrawals/stats/');
      return response.data;
    },
    enabled: !!api
  });

  const handleAddNew = () => {
    router.push('/admin/withdrawals/new');
  };

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Withdrawals</h1>
          <p className='text-muted-foreground'>
            Manage and track all withdrawal transactions
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Withdrawals
              </CardTitle>
              <DollarSign className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.total_withdrawals ?? '--'}
              </div>
              <p className='text-muted-foreground text-xs'>
                {stats ? formatCurrency(stats.total_amount) : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Processing</CardTitle>
              <Clock className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-amber-600'>
                {stats?.processing_withdrawals ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Successful</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats?.success_withdrawals ?? '--'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Failed</CardTitle>
              <XCircle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats?.failed_withdrawals ?? '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        <WithdrawalTable onAddNew={handleAddNew} />
      </div>
    </PageContainer>
  );
}
