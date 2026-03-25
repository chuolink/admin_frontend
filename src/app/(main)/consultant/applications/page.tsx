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
import ApplicationTable from './components/ApplicationTable';
import { type ConsultantStats } from '@/types/consultant';
import { useStateStore } from '@/stores/useStateStore';

export default function ConsultantApplicationsPage() {
  const { api } = useClientApi();
  const { consultant } = useStateStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const { data: stats } = useQuery<ConsultantStats>({
    queryKey: ['consultant-stats', consultant?.id],
    queryFn: async () => {
      const response = await api!.get(
        `/consultant/overview/${consultant!.id}/stats/`
      );
      return response.data;
    },
    enabled: !!api && !!consultant?.id
  });

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Applications</h1>
          <p className='text-muted-foreground'>
            Manage and monitor student applications
          </p>
        </div>

        {stats && (
          <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
            <Card className='@container/card'>
              <CardHeader>
                <CardDescription>Total Applications</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.total_applications}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <TrendingUp className='mr-1 h-4 w-4' />
                    All
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
                  {stats.pending_applications}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <AlertCircle className='mr-1 h-4 w-4' />
                    Action
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Awaiting your review <Clock className='size-4' />
                </div>
                <div className='mt-2 grid w-full grid-cols-2 gap-2'>
                  <div className='flex items-center gap-1.5 text-green-600 dark:text-green-400'>
                    <CheckCircle className='size-4' />
                    <span>{stats.approved_applications} Approved</span>
                  </div>
                  <div className='flex items-center gap-1.5 text-red-600 dark:text-red-400'>
                    <XCircle className='size-4' />
                    <span>{stats.rejected_applications} Rejected</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className='@container/card'>
              <CardHeader>
                <CardDescription>Waiting Verification</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.waiting_applications}
                </CardTitle>
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
                <CardDescription>Completed</CardDescription>
                <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {stats.completed_applications}
                </CardTitle>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Successfully completed <CheckCircle className='size-4' />
                </div>
                <div className='mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400'>
                  <Banknote className='size-4' />
                  <span>Earnings: {formatCurrency(stats.total_earnings)}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        <ApplicationTable />
      </div>
    </PageContainer>
  );
}
