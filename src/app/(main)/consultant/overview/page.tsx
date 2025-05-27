'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
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
import { Response } from '@/types/consultant';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { ConsultantStats, Consultant } from '@/types/consultant';
import OnboardingModal from '@/features/consultant/components/onboarding-modal';
import { useSession } from 'next-auth/react';
import { useStateStore } from '@/stores/useStateStore';

interface SessionUser {
  name?: string | null;
  email?: string | null;
}

export default function ConsultantOverview() {
  const { data: session } = useSession();
  const { api } = useClientApi();
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

  // Then, fetch stats using the consultant ID
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
    enabled: !!consultant?.id // Only run this query if we have a consultant ID
  });

  if (isLoadingStats) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <p>Loading statistics...</p>
      </div>
    );
  }

  const userName = (session?.user as SessionUser)?.name || '';
  const userEmail = (session?.user as SessionUser)?.email || '';

  // Calculate trends (you can replace these with actual trend calculations)
  const applicationTrend =
    (stats?.total_applications ?? 0) > 0 ? '+12.5%' : '0%';
  const earningsTrend = (stats?.total_earnings ?? 0) > 0 ? '+8.3%' : '0%';
  const withdrawalTrend = (stats?.total_withdrawals ?? 0) > 0 ? '-5.2%' : '0%';
  const pendingTrend = (stats?.pending_applications ?? 0) > 0 ? '+15.7%' : '0%';

  return (
    <div className='w-full space-y-6'>
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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_applications?.length ? (
              <div className='space-y-4'>
                {stats.recent_applications.map((app) => (
                  <div
                    key={app.id}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='font-medium'>{`${app.application.student.user.first_name} ${app.application.student.user.last_name}`}</p>
                      <p className='text-muted-foreground text-sm'>
                        {app.application.university.name}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        ${app.application.budget || 0}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {app.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>No recent applications</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_withdrawals?.length ? (
              <div className='space-y-4'>
                {stats.recent_withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='font-medium'>
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {withdrawal.status}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>${withdrawal.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground'>No recent withdrawals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
