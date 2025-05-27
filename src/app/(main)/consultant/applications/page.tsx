'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ApplicationTable from './components/ApplicationTable';
import { ConsultantStats } from '@/types/consultant';
import { useStateStore } from '@/stores/useStateStore';

export default function ConsultantApplicationsPage() {
  const { api } = useClientApi();
  const router = useRouter();
  const { consultant } = useStateStore();

  // Format currency to TZS
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch stats using the consultant ID
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['consultant-stats', consultant?.id],
    queryFn: async () => {
      if (!api || !consultant?.id)
        throw new Error('API not initialized or consultant not found');
      const response = await api.get(
        `/consultant/overview/${consultant.id}/stats/`
      );
      return response.data as ConsultantStats;
    },
    enabled: !!consultant?.id
  });

  if (isLoadingStats) {
    return (
      <PageContainer className='w-full'>
        <div className='flex h-96 items-center justify-center'>
          <p>Loading statistics...</p>
        </div>
      </PageContainer>
    );
  }

  // Calculate trends (same as overview page)
  const applicationTrend =
    (stats?.total_applications ?? 0) > 0 ? '+12.5%' : '0%';
  const pendingTrend = (stats?.pending_applications ?? 0) > 0 ? '+15.7%' : '0%';

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex w-full items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Applications</h1>
            <p className='text-muted-foreground'>
              Manage and monitor student applications
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats?.total_applications || 0}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <TrendingUp className='mr-1 h-4 w-4' />
                  {applicationTrend}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Total applications assigned <FileText className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                All applications in your queue
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats?.pending_applications || 0}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <AlertCircle className='mr-1 h-4 w-4' />
                  {pendingTrend}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Awaiting your review <Clock className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Applications to be approved/rejected
              </div>
              <div className='mt-2 grid w-full grid-cols-2 gap-2'>
                <div className='flex items-center gap-1.5 text-green-600 dark:text-green-400'>
                  <CheckCircle className='size-4' />
                  <span>{stats?.approved_applications || 0} Approved</span>
                </div>
                <div className='flex items-center gap-1.5 text-red-600 dark:text-red-400'>
                  <XCircle className='size-4' />
                  <span>{stats?.rejected_applications || 0} Rejected</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Waiting Verification</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats?.waiting_applications || 0}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Clock className='mr-1 h-4 w-4' />
                  {pendingTrend}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Under admin review <Clock className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Applications pending admin verification
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Completed Applications</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {stats?.completed_applications || 0}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <CheckCircle className='mr-1 h-4 w-4' />
                  {applicationTrend}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Successfully completed <CheckCircle className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Applications approved by admin
              </div>
              <div className='mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400'>
                <Banknote className='size-4' />
                <span>
                  Total Earnings: {formatCurrency(stats?.total_earnings || 0)}
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className='w-full overflow-hidden'>
          <CardContent className='p-0'>
            <div className='w-full overflow-x-auto'>
              <ApplicationTable />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
