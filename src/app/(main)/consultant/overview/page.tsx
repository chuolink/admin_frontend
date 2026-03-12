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
  AlertCircle,
  Users,
  Phone,
  CalendarCheck,
  UserSearch,
  Kanban,
  ArrowRight
} from 'lucide-react';
import { PIPELINE_STAGES } from '@/features/pipeline/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ConsultantOverview() {
  const { api } = useClientApi();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['consultant-stats'],
    queryFn: async () => {
      if (!api) throw new Error('API not initialized');
      const response = await api.get('/consultant/dashboard/stats/');
      return response.data;
    },
    enabled: !!api
  });

  if (isLoading) {
    return (
      <PageContainer className='w-full'>
        <p className='text-muted-foreground py-12 text-center'>
          Loading dashboard...
        </p>
      </PageContainer>
    );
  }

  const {
    total_applications = 0,
    pending_applications = 0,
    approved_applications = 0,
    rejected_applications = 0,
    waiting_applications = 0,
    completed_applications = 0,
    total_earnings = 0,
    // New CRM/pipeline stats
    my_leads = 0,
    new_leads = 0,
    my_pipeline_students = 0,
    my_calls_this_week = 0,
    upcoming_consultations = 0,
    overdue_follow_ups = 0,
    pipeline_summary = []
  } = stats ?? {};

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>Your activity overview</p>
        </div>

        {/* Application Stats */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {total_applications}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <FileText className='mr-1 h-4 w-4' />
                  All
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                Applications in your queue
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {pending_applications}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <AlertCircle className='mr-1 h-4 w-4' />
                  Action
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='grid w-full grid-cols-2 gap-2'>
                <div className='flex items-center gap-1.5 text-green-600 dark:text-green-400'>
                  <CheckCircle className='size-4' />
                  <span>{approved_applications} Approved</span>
                </div>
                <div className='flex items-center gap-1.5 text-red-600 dark:text-red-400'>
                  <XCircle className='size-4' />
                  <span>{rejected_applications} Rejected</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Completed</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {completed_applications}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <CheckCircle className='mr-1 h-4 w-4' />
                  Done
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='flex items-center gap-1.5 text-green-600 dark:text-green-400'>
                <Banknote className='size-4' />
                <span>Earnings: {formatCurrency(total_earnings)}</span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>My Pipeline</CardTitle>
              <Kanban className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{my_pipeline_students}</div>
              <p className='text-muted-foreground text-xs'>
                Students in pipeline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CRM Quick Stats */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>My Leads</CardTitle>
              <UserSearch className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{my_leads}</div>
              <p className='text-muted-foreground text-xs'>{new_leads} new</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>
                Calls (Week)
              </CardTitle>
              <Phone className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{my_calls_this_week}</div>
              <p className='text-muted-foreground text-xs'>Sales calls</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>
                Consultations
              </CardTitle>
              <CalendarCheck className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{upcoming_consultations}</div>
              <p className='text-muted-foreground text-xs'>Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>Follow-ups</CardTitle>
              <Clock className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{overdue_follow_ups}</div>
              <p className='text-muted-foreground text-xs'>Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Summary + Quick Actions */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Summary</CardTitle>
              <CardDescription>Your students by stage</CardDescription>
            </CardHeader>
            <CardContent>
              {pipeline_summary.length > 0 ? (
                <div className='space-y-2'>
                  {pipeline_summary.map(
                    (item: { stage: string; count: number; label: string }) => (
                      <div
                        key={item.stage}
                        className='flex items-center justify-between rounded-lg border p-2'
                      >
                        <span className='text-sm'>{item.label}</span>
                        <Badge variant='outline'>{item.count}</Badge>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className='flex items-center justify-center py-8'>
                  <div className='space-y-2 text-center'>
                    <Kanban className='text-muted-foreground mx-auto h-8 w-8' />
                    <p className='text-muted-foreground text-sm'>
                      No pipeline students assigned yet
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Items needing your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {pending_applications > 0 && (
                  <QuickAction
                    href='/consultant/applications'
                    icon={<FileText className='h-4 w-4 text-amber-500' />}
                    title={`${pending_applications} applications pending review`}
                  />
                )}
                {overdue_follow_ups > 0 && (
                  <QuickAction
                    href='/consultant/leads'
                    icon={<Clock className='h-4 w-4 text-red-500' />}
                    title={`${overdue_follow_ups} overdue follow-ups`}
                  />
                )}
                {upcoming_consultations > 0 && (
                  <QuickAction
                    href='/consultant/pipeline'
                    icon={<CalendarCheck className='h-4 w-4 text-green-500' />}
                    title={`${upcoming_consultations} upcoming consultations`}
                  />
                )}
                {new_leads > 0 && (
                  <QuickAction
                    href='/consultant/leads'
                    icon={<UserSearch className='h-4 w-4 text-indigo-500' />}
                    title={`${new_leads} new leads to contact`}
                  />
                )}
                {!pending_applications &&
                  !overdue_follow_ups &&
                  !upcoming_consultations &&
                  !new_leads && (
                    <div className='flex items-center gap-3 py-4'>
                      <CheckCircle className='h-5 w-5 text-green-500' />
                      <p className='text-muted-foreground text-sm'>
                        All caught up! No urgent items.
                      </p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function QuickAction({
  href,
  icon,
  title
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link href={href}>
      <div className='hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors'>
        {icon}
        <p className='flex-1 text-sm font-medium'>{title}</p>
        <ArrowRight className='text-muted-foreground h-4 w-4' />
      </div>
    </Link>
  );
}
