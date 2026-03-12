'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  CreditCard,
  FileCheck,
  Kanban,
  AlertTriangle,
  CalendarCheck,
  Phone,
  UserSearch,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const { api } = useClientApi();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api?.get('/admin/overview/');
      return response?.data;
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
    total_revenue = 0,
    current_month_revenue = 0,
    revenue_growth = 0,
    total_students = 0,
    current_month_students = 0,
    student_growth = 0,
    active_applications = 0,
    pending_payments = 0,
    pending_withdrawals = 0,
    pipeline_students = 0,
    pre_application_count = 0,
    post_application_count = 0,
    pending_documents = 0,
    overdue_payments = 0,
    todays_consultations = 0,
    total_leads = 0,
    new_leads = 0,
    converted_leads = 0,
    total_calls_this_week = 0,
    pipeline_funnel = []
  } = data ?? {};

  const conversionRate =
    total_leads > 0 ? ((converted_leads / total_leads) * 100).toFixed(0) : '0';
  const totalActions = pending_documents + pending_payments + overdue_payments;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Chuolink operations at a glance
          </p>
        </div>

        {/* Row 1: Key Business Metrics */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <KpiCard
            title='Active Pipeline'
            value={pipeline_students}
            subtitle={`${pre_application_count} pre-app \u00b7 ${post_application_count} post-app`}
            icon={<Kanban className='h-4 w-4' />}
            href='/admin/pipeline'
          />
          <KpiCard
            title='Total Leads'
            value={total_leads}
            subtitle={`${new_leads} new \u00b7 ${conversionRate}% conversion`}
            icon={<UserSearch className='h-4 w-4' />}
            href='/admin/leads'
          />
          <KpiCard
            title='Students'
            value={total_students}
            subtitle={`${current_month_students} new this month`}
            icon={<GraduationCap className='h-4 w-4' />}
            href='/admin/students'
            badge={
              student_growth > 0 ? `+${student_growth.toFixed(0)}%` : undefined
            }
          />
          <KpiCard
            title='Revenue'
            value={formatCurrency(current_month_revenue)}
            subtitle={`${formatCurrency(total_revenue)} total`}
            icon={<CircleDollarSign className='h-4 w-4' />}
            href='/admin/payments'
            badge={
              revenue_growth > 0 ? `+${revenue_growth.toFixed(0)}%` : undefined
            }
          />
        </div>

        {/* Row 2: Daily Operations */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
          <MiniCard
            title='Pending Docs'
            value={pending_documents}
            icon={<FileCheck className='h-3.5 w-3.5' />}
            href='/admin/documents'
            urgent={pending_documents > 0}
          />
          <MiniCard
            title='Consultations Today'
            value={todays_consultations}
            icon={<CalendarCheck className='h-3.5 w-3.5' />}
          />
          <MiniCard
            title='Calls This Week'
            value={total_calls_this_week}
            icon={<Phone className='h-3.5 w-3.5' />}
          />
          <MiniCard
            title='Active Applications'
            value={active_applications}
            icon={<ClipboardList className='h-3.5 w-3.5' />}
            href='/admin/applications'
          />
          <MiniCard
            title='Overdue Payments'
            value={overdue_payments}
            icon={<AlertTriangle className='h-3.5 w-3.5' />}
            href='/admin/payments'
            urgent={overdue_payments > 0}
          />
        </div>

        {/* Row 3: Pipeline Funnel + Action Items */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Pipeline Funnel</CardTitle>
              <CardDescription>
                Students currently in each pipeline stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[320px]'>
                {pipeline_funnel.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={pipeline_funnel}
                      layout='vertical'
                      margin={{ left: 130 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        className='stroke-muted'
                      />
                      <XAxis
                        type='number'
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                      />
                      <YAxis
                        type='category'
                        dataKey='stage'
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip />
                      <Bar
                        dataKey='count'
                        fill='#6366f1'
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <div className='space-y-2 text-center'>
                      <Kanban className='text-muted-foreground mx-auto h-8 w-8' />
                      <p className='text-muted-foreground text-sm'>
                        Pipeline data appears once students are added
                      </p>
                      <Link href='/admin/pipeline'>
                        <Badge
                          variant='outline'
                          className='mt-2 cursor-pointer'
                        >
                          Go to Pipeline
                          <ArrowRight className='ml-1 h-3 w-3' />
                        </Badge>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
              <CardDescription>
                {totalActions > 0
                  ? `${totalActions} items require action`
                  : 'All clear'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {pending_documents > 0 && (
                  <ActionItem
                    href='/admin/documents'
                    icon={<FileCheck className='h-4 w-4 text-amber-500' />}
                    title={`${pending_documents} docs to review`}
                  />
                )}
                {overdue_payments > 0 && (
                  <ActionItem
                    href='/admin/payments'
                    icon={<AlertTriangle className='h-4 w-4 text-red-500' />}
                    title={`${overdue_payments} overdue payments`}
                  />
                )}
                {pending_payments > 0 && (
                  <ActionItem
                    href='/admin/payments'
                    icon={<CreditCard className='h-4 w-4 text-blue-500' />}
                    title={`${pending_payments} payments pending`}
                  />
                )}
                {pending_withdrawals > 0 && (
                  <ActionItem
                    href='/admin/withdrawals'
                    icon={<CreditCard className='h-4 w-4 text-purple-500' />}
                    title={`${pending_withdrawals} withdrawals pending`}
                  />
                )}
                {new_leads > 0 && (
                  <ActionItem
                    href='/admin/leads'
                    icon={<UserSearch className='h-4 w-4 text-indigo-500' />}
                    title={`${new_leads} new leads to contact`}
                  />
                )}
                {todays_consultations > 0 && (
                  <ActionItem
                    href='/admin/leads'
                    icon={<CalendarCheck className='h-4 w-4 text-green-500' />}
                    title={`${todays_consultations} consultations today`}
                  />
                )}
                {totalActions === 0 &&
                  !new_leads &&
                  !todays_consultations &&
                  !pending_withdrawals && (
                    <p className='text-muted-foreground py-8 text-center text-sm'>
                      No urgent items. All caught up!
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  href,
  badge
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
}) {
  const content = (
    <Card
      className={
        href ? 'hover:bg-muted/30 cursor-pointer transition-colors' : ''
      }
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <span className='text-muted-foreground'>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className='flex items-baseline gap-2'>
          <span className='text-2xl font-bold tabular-nums'>{value}</span>
          {badge && (
            <Badge variant='outline' className='text-green-600'>
              <TrendingUp className='mr-0.5 h-3 w-3' />
              {badge}
            </Badge>
          )}
        </div>
        <p className='text-muted-foreground mt-1 text-xs'>{subtitle}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function MiniCard({
  title,
  value,
  icon,
  href,
  urgent
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href?: string;
  urgent?: boolean;
}) {
  const content = (
    <Card
      className={
        urgent
          ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20'
          : href
            ? 'hover:bg-muted/30 cursor-pointer transition-colors'
            : ''
      }
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
        <CardTitle className='text-xs font-medium'>{title}</CardTitle>
        <span className='text-muted-foreground'>{icon}</span>
      </CardHeader>
      <CardContent>
        <div className='text-xl font-bold tabular-nums'>{value}</div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function ActionItem({
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
      <div className='hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors'>
        {icon}
        <p className='min-w-0 flex-1 text-sm'>{title}</p>
        <ArrowUpRight className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
      </div>
    </Link>
  );
}
