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
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileCheck,
  Kanban,
  AlertTriangle,
  CalendarCheck,
  Phone,
  UserSearch,
  ArrowRight,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { PIPELINE_STAGES } from '@/features/pipeline/types';
import Link from 'next/link';

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4'
];

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
    // Existing stats
    total_revenue = 0,
    current_month_revenue = 0,
    previous_month_revenue = 0,
    revenue_growth = 0,
    total_students = 0,
    current_month_students = 0,
    previous_month_students = 0,
    student_growth = 0,
    active_applications = 0,
    application_growth = 0,
    pending_payments = 0,
    pending_withdrawals = 0,
    revenue_trend = [],
    application_distribution = [],
    // New pipeline/CRM stats (will be populated when backend supports them)
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
    pipeline_funnel = [],
    action_items = []
  } = data ?? {};

  const revenueFormatted = isFinite(revenue_growth)
    ? revenue_growth.toFixed(1)
    : '0.0';
  const revenuePositive = revenue_growth >= 0;
  const studentFormatted = isFinite(student_growth)
    ? student_growth.toFixed(1)
    : '0.0';
  const studentPositive = student_growth >= 0;

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Operations overview — lead acquisition through student departure
          </p>
        </div>

        {/* Top-level KPI Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Revenue</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {formatCurrency(total_revenue)}
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className={
                    revenuePositive ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {revenuePositive ? (
                    <TrendingUp className='h-4 w-4' />
                  ) : (
                    <TrendingDown className='h-4 w-4' />
                  )}
                  {revenueFormatted}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                {formatCurrency(current_month_revenue)} this month vs{' '}
                {formatCurrency(previous_month_revenue)} last month
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Students</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {total_students}
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className={
                    studentPositive ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {studentPositive ? (
                    <TrendingUp className='h-4 w-4' />
                  ) : (
                    <TrendingDown className='h-4 w-4' />
                  )}
                  {studentFormatted}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1 text-sm'>
              <div className='text-muted-foreground'>
                {current_month_students} new this month vs{' '}
                {previous_month_students} last month
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Pipeline
              </CardTitle>
              <Kanban className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{pipeline_students}</div>
              <p className='text-muted-foreground text-xs'>
                {pre_application_count} pre-app, {post_application_count}{' '}
                post-app
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Actions
              </CardTitle>
              <AlertTriangle className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {pending_payments + pending_withdrawals + pending_documents}
              </div>
              <p className='text-muted-foreground text-xs'>
                {pending_payments} payments, {pending_documents} documents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Operations Row */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>Leads</CardTitle>
              <UserSearch className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{total_leads}</div>
              <p className='text-muted-foreground text-xs'>{new_leads} new</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>Conversions</CardTitle>
              <TrendingUp className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{converted_leads}</div>
              <p className='text-muted-foreground text-xs'>Leads to students</p>
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
              <div className='text-xl font-bold'>{total_calls_this_week}</div>
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
              <div className='text-xl font-bold'>{todays_consultations}</div>
              <p className='text-muted-foreground text-xs'>Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>Documents</CardTitle>
              <FileCheck className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{pending_documents}</div>
              <p className='text-muted-foreground text-xs'>Awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium'>
                Applications
              </CardTitle>
              <Users className='text-muted-foreground h-3.5 w-3.5' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>{active_applications}</div>
              <p className='text-muted-foreground text-xs'>Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Pipeline Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Funnel</CardTitle>
              <CardDescription>Students per pipeline stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                {pipeline_funnel.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={pipeline_funnel}
                      layout='vertical'
                      margin={{ left: 120 }}
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
                        width={110}
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
                        Pipeline data will appear here once students are added
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                {revenue_trend.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={revenue_trend}>
                      <CartesianGrid
                        strokeDasharray='3 3'
                        className='stroke-muted'
                      />
                      <XAxis
                        dataKey='month'
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        tickFormatter={(v) => formatCurrency(v)}
                      />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar
                        dataKey='revenue'
                        fill='#22c55e'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <div className='space-y-2 text-center'>
                      <CreditCard className='text-muted-foreground mx-auto h-8 w-8' />
                      <p className='text-muted-foreground text-sm'>
                        Revenue data will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Distribution + Action Items */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Current distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[250px]'>
                {application_distribution.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={application_distribution}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={80}
                        label={({
                          name,
                          percent
                        }: {
                          name: string;
                          percent: number;
                        }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {application_distribution.map(
                          (_: unknown, index: number) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign='bottom' height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>
                      No application data yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {pending_documents > 0 && (
                  <ActionItem
                    href='/admin/documents'
                    icon={<FileCheck className='h-4 w-4 text-amber-500' />}
                    title={`${pending_documents} documents awaiting verification`}
                    subtitle='Review uploaded student documents'
                  />
                )}
                {pending_payments > 0 && (
                  <ActionItem
                    href='/admin/payments'
                    icon={<CreditCard className='h-4 w-4 text-blue-500' />}
                    title={`${pending_payments} payments pending`}
                    subtitle='Review and process payments'
                  />
                )}
                {pending_withdrawals > 0 && (
                  <ActionItem
                    href='/admin/withdrawals'
                    icon={<CreditCard className='h-4 w-4 text-purple-500' />}
                    title={`${pending_withdrawals} withdrawals pending`}
                    subtitle='Process consultant withdrawals'
                  />
                )}
                {todays_consultations > 0 && (
                  <ActionItem
                    href='/admin/consultations'
                    icon={<CalendarCheck className='h-4 w-4 text-green-500' />}
                    title={`${todays_consultations} consultations today`}
                    subtitle='Upcoming scheduled consultations'
                  />
                )}
                {new_leads > 0 && (
                  <ActionItem
                    href='/admin/leads'
                    icon={<UserSearch className='h-4 w-4 text-indigo-500' />}
                    title={`${new_leads} new leads`}
                    subtitle='Leads awaiting first contact'
                  />
                )}
                {overdue_payments > 0 && (
                  <ActionItem
                    href='/admin/payments'
                    icon={<AlertTriangle className='h-4 w-4 text-red-500' />}
                    title={`${overdue_payments} overdue payments`}
                    subtitle='Payments past due date'
                  />
                )}
                {!pending_documents &&
                  !pending_payments &&
                  !pending_withdrawals &&
                  !todays_consultations &&
                  !new_leads &&
                  !overdue_payments && (
                    <div className='flex items-center gap-3 py-4'>
                      <Clock className='text-muted-foreground h-5 w-5' />
                      <p className='text-muted-foreground text-sm'>
                        No urgent action items. All caught up!
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

function ActionItem({
  href,
  icon,
  title,
  subtitle
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <div className='hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors'>
        {icon}
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium'>{title}</p>
          <p className='text-muted-foreground text-xs'>{subtitle}</p>
        </div>
        <ArrowRight className='text-muted-foreground h-4 w-4 shrink-0' />
      </div>
    </Link>
  );
}
