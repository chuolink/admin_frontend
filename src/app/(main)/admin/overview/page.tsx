'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import useClientApi from '@/lib/axios/clientSide';
import PageContainer from '@/components/layout/page-container';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  CircleDollarSign,
  UserSearch,
  Kanban,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CalendarCheck,
  PhoneCall,
  FileCheck,
  AlertTriangle,
  CreditCard,
  ListTodo,
  Target,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

/* ===== Constants ===== */

const FUNNEL_COLOR = '#6366f1';
const LEAD_COLORS = ['#3b82f6', '#22c55e', '#8b5cf6'];
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280'];

const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 8,
  fontSize: 12,
  padding: '8px 12px',
  background: 'var(--popover, #fff)',
  color: 'var(--popover-foreground, #111)',
  border: '1px solid var(--border, #e5e7eb)',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
};

const METRIC_COLORS = {
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-500/10',
    iconText: 'text-blue-600 dark:text-blue-400'
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/10',
    iconText: 'text-emerald-600 dark:text-emerald-400'
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-500/10',
    iconText: 'text-violet-600 dark:text-violet-400'
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/10',
    iconText: 'text-amber-600 dark:text-amber-400'
  }
} as const;

type MetricColor = keyof typeof METRIC_COLORS;

/* ===== Page Component ===== */

export default function AdminOverviewPage() {
  const { api } = useClientApi();
  const [isClient, setIsClient] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date()
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dateParams = dateRange?.from
    ? {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        ...(dateRange.to
          ? { end_date: format(dateRange.to, 'yyyy-MM-dd') }
          : {})
      }
    : {};

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', dateParams],
    queryFn: async () => {
      const response = await api?.get('/admin/overview/', {
        params: dateParams
      });
      return response?.data;
    },
    enabled: !!api
  });

  if (isLoading) return <DashboardSkeleton />;

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

  const periodLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : 'all time';

  // Chart data
  const leadFunnelData = [
    { name: 'Total Leads', value: total_leads, fill: LEAD_COLORS[0] },
    { name: 'Converted', value: converted_leads, fill: LEAD_COLORS[1] },
    {
      name: 'In Pipeline',
      value: pipeline_students,
      fill: LEAD_COLORS[2]
    }
  ];

  const otherPhaseCount = Math.max(
    0,
    pipeline_students - pre_application_count - post_application_count
  );
  const phaseData = [
    pre_application_count > 0 && {
      name: 'Pre-Application',
      count: pre_application_count
    },
    post_application_count > 0 && {
      name: 'Post-Application',
      count: post_application_count
    },
    otherPhaseCount > 0 && { name: 'Other Phases', count: otherPhaseCount }
  ].filter(Boolean) as { name: string; count: number }[];

  // Fallback funnel data from phase counts when backend doesn't return pipeline_funnel
  const funnelData =
    pipeline_funnel.length > 0
      ? pipeline_funnel
      : pipeline_students > 0
        ? [
            pre_application_count > 0 && {
              stage: 'Pre-Application',
              count: pre_application_count
            },
            post_application_count > 0 && {
              stage: 'Post-Application',
              count: post_application_count
            },
            otherPhaseCount > 0 && {
              stage: 'Consultation / Other',
              count: otherPhaseCount
            }
          ].filter(Boolean)
        : [];

  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground text-sm'>
              Overview for {periodLabel}
            </p>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder='Select date range'
          />
        </div>

        {/* KPI Metrics */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <MetricCard
            title='Students'
            value={total_students}
            change={student_growth}
            subtitle={`${current_month_students} new this period`}
            icon={GraduationCap}
            href='/admin/students'
            color='blue'
          />
          <MetricCard
            title='Revenue'
            value={formatCurrency(current_month_revenue)}
            change={revenue_growth}
            subtitle={`${formatCurrency(total_revenue)} total`}
            icon={CircleDollarSign}
            href='/admin/payments'
            color='emerald'
          />
          <MetricCard
            title='Leads'
            value={total_leads}
            subtitle={`${conversionRate}% conversion · ${new_leads} new`}
            icon={UserSearch}
            href='/admin/leads'
            color='violet'
          />
          <MetricCard
            title='Pipeline'
            value={pipeline_students}
            subtitle={`${pre_application_count} pre · ${post_application_count} post`}
            icon={Kanban}
            href='/admin/pipeline'
            color='amber'
          />
        </div>

        {/* Charts Row */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Pipeline Funnel */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pipeline Funnel
              </CardTitle>
              <CardDescription className='text-xs'>
                Students in each pipeline stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground h-[300px]'>
                {isClient && funnelData.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={funnelData}
                      layout='vertical'
                      margin={{ left: 4, right: 16, top: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        horizontal={false}
                        stroke='currentColor'
                        strokeOpacity={0.1}
                      />
                      <XAxis
                        type='number'
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                      />
                      <YAxis
                        type='category'
                        dataKey='stage'
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                        width={100}
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar
                        dataKey='count'
                        fill={FUNNEL_COLOR}
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={Kanban}
                    message='Pipeline data appears once students are added'
                    href='/admin/pipeline'
                    linkLabel='Go to Pipeline'
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lead Conversion */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Lead Conversion
              </CardTitle>
              <CardDescription className='text-xs'>
                From lead acquisition to pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground h-[300px]'>
                {isClient && total_leads > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={leadFunnelData}
                      margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        vertical={false}
                        stroke='currentColor'
                        strokeOpacity={0.1}
                      />
                      <XAxis
                        dataKey='name'
                        tick={{ fill: 'currentColor', fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: 'currentColor', fontSize: 11 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey='value' radius={[6, 6, 0, 0]} barSize={52}>
                        {leadFunnelData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={UserSearch}
                    message='Lead data will appear once you start tracking'
                    href='/admin/leads'
                    linkLabel='Go to Leads'
                  />
                )}
              </div>
              {total_leads > 0 && (
                <p className='text-muted-foreground mt-1 flex items-center gap-1.5 text-xs'>
                  <TrendingUp className='h-3.5 w-3.5 text-emerald-500' />
                  {conversionRate}% of leads converted to students
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* Phase Distribution */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Phase Distribution
              </CardTitle>
              <CardDescription className='text-xs'>
                Students by processing phase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-[220px]'>
                {isClient && phaseData.length > 0 ? (
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={phaseData}
                        cx='50%'
                        cy='50%'
                        innerRadius={50}
                        outerRadius={85}
                        dataKey='count'
                        nameKey='name'
                        strokeWidth={3}
                        stroke='hsl(var(--card))'
                      >
                        {phaseData.map((_e, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={Target}
                    message='No pipeline phase data yet'
                  />
                )}
              </div>
              {phaseData.length > 0 && (
                <div className='flex flex-wrap gap-x-4 gap-y-1 border-t pt-3'>
                  {phaseData.map((entry, i) => (
                    <div
                      key={entry.name}
                      className='flex items-center gap-1.5 text-xs'
                    >
                      <div
                        className='h-2 w-2 rounded-full'
                        style={{
                          backgroundColor: PIE_COLORS[i % PIE_COLORS.length]
                        }}
                      />
                      <span className='text-muted-foreground'>
                        {entry.name}
                      </span>
                      <span className='font-medium tabular-nums'>
                        {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity & Quick Access */}
          <Card className='lg:col-span-2'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Activity & Quick Access
              </CardTitle>
              <CardDescription className='text-xs'>
                Operational pulse and navigation
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='divide-y'>
                <PulseRow
                  icon={CalendarCheck}
                  label='Consultations today'
                  value={todays_consultations}
                  href='/admin/consultations'
                  accent={todays_consultations > 0}
                />
                <PulseRow
                  icon={PhoneCall}
                  label='Calls this week'
                  value={total_calls_this_week}
                  href='/admin/sales-calls'
                />
                <PulseRow
                  icon={Users}
                  label='New leads'
                  value={new_leads}
                  href='/admin/leads'
                  accent={new_leads > 0}
                />
                <PulseRow
                  icon={CreditCard}
                  label='Pending payments'
                  value={pending_payments}
                  href='/admin/payments'
                  accent={pending_payments > 0}
                />
                <PulseRow
                  icon={FileCheck}
                  label='Pending documents'
                  value={pending_documents}
                  href='/admin/documents'
                  accent={pending_documents > 0}
                />
                {overdue_payments > 0 && (
                  <PulseRow
                    icon={AlertTriangle}
                    label='Overdue payments'
                    value={overdue_payments}
                    href='/admin/payments'
                    accent
                    accentType='danger'
                  />
                )}
                {pending_withdrawals > 0 && (
                  <PulseRow
                    icon={CreditCard}
                    label='Pending withdrawals'
                    value={pending_withdrawals}
                    href='/admin/withdrawals'
                    accent
                  />
                )}
                <PulseRow
                  icon={ListTodo}
                  label='Staff tasks'
                  href='/admin/tasks'
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

/* ===== Helper Components ===== */

function MetricCard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  href,
  color
}: {
  title: string;
  value: string | number;
  change?: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: MetricColor;
}) {
  const { iconBg, iconText } = METRIC_COLORS[color];

  return (
    <Link href={href}>
      <Card className='hover:bg-muted/40 cursor-pointer transition-all hover:shadow-sm'>
        <CardContent className='p-5'>
          <div className='flex items-center justify-between'>
            <div className={cn('rounded-lg p-2', iconBg)}>
              <Icon className={cn('h-4 w-4', iconText)} />
            </div>
            {change !== undefined && change !== 0 && (
              <Badge
                variant='outline'
                className={cn(
                  'gap-0.5 text-[11px] font-medium',
                  change > 0
                    ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                    : 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                )}
              >
                {change > 0 ? (
                  <TrendingUp className='h-3 w-3' />
                ) : (
                  <TrendingDown className='h-3 w-3' />
                )}
                {change > 0 ? '+' : ''}
                {change.toFixed(0)}%
              </Badge>
            )}
          </div>
          <p className='mt-3 text-2xl font-semibold tabular-nums'>{value}</p>
          <p className='text-muted-foreground mt-0.5 text-xs'>{subtitle}</p>
          <p className='text-muted-foreground/70 mt-2 text-[11px] font-medium tracking-wider uppercase'>
            {title}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function PulseRow({
  icon: Icon,
  label,
  value,
  href,
  accent,
  accentType = 'default'
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number;
  href: string;
  accent?: boolean;
  accentType?: 'default' | 'danger';
}) {
  const iconColor = accent
    ? accentType === 'danger'
      ? 'text-red-600 dark:text-red-400'
      : 'text-blue-600 dark:text-blue-400'
    : 'text-muted-foreground';

  return (
    <Link href={href}>
      <div
        className={cn(
          'hover:bg-muted/50 flex items-center justify-between px-6 py-3 transition-colors',
          accent && accentType === 'danger' && 'bg-red-50/40 dark:bg-red-950/10'
        )}
      >
        <div className='flex items-center gap-3'>
          <Icon className={cn('h-4 w-4', iconColor)} />
          <span className='text-sm'>{label}</span>
        </div>
        <div className='flex items-center gap-3'>
          {value !== undefined && (
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                accent && accentType === 'danger'
                  ? 'text-red-600 dark:text-red-400'
                  : ''
              )}
            >
              {value}
            </span>
          )}
          <ArrowRight className='text-muted-foreground/40 h-3.5 w-3.5' />
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  message,
  href,
  linkLabel
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='space-y-2 text-center'>
        <Icon className='text-muted-foreground/40 mx-auto h-8 w-8' />
        <p className='text-muted-foreground text-sm'>{message}</p>
        {href && linkLabel && (
          <Link href={href}>
            <Badge variant='outline' className='mt-2 cursor-pointer'>
              {linkLabel}
              <ArrowRight className='ml-1 h-3 w-3' />
            </Badge>
          </Link>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <PageContainer className='w-full'>
      <div className='w-full space-y-6'>
        {/* Header skeleton */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='bg-muted h-7 w-32 animate-pulse rounded' />
            <div className='bg-muted mt-2 h-4 w-48 animate-pulse rounded' />
          </div>
          <div className='bg-muted h-9 w-44 animate-pulse rounded' />
        </div>

        {/* KPI skeleton */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-5'>
                <div className='space-y-3'>
                  <div className='bg-muted h-8 w-8 animate-pulse rounded-lg' />
                  <div className='bg-muted h-7 w-20 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-28 animate-pulse rounded' />
                  <div className='bg-muted h-3 w-16 animate-pulse rounded' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='pb-2'>
                <div className='bg-muted h-4 w-28 animate-pulse rounded' />
                <div className='bg-muted mt-1 h-3 w-40 animate-pulse rounded' />
              </CardHeader>
              <CardContent>
                <div className='bg-muted h-[300px] animate-pulse rounded' />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom skeleton */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <Card>
            <CardContent className='p-6'>
              <div className='bg-muted h-[260px] animate-pulse rounded' />
            </CardContent>
          </Card>
          <Card className='lg:col-span-2'>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='bg-muted h-8 animate-pulse rounded' />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
