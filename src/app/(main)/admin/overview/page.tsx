'use client';

import { useQuery } from '@tanstack/react-query';
import useClientApi from '@/lib/axios/clientSide';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconSchool,
  IconCash,
  IconFileText
} from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Stats Components
const RevenueStats = ({
  total_revenue,
  revenueGrowth,
  current_month_revenue,
  previous_month_revenue
}: {
  total_revenue: number;
  revenueGrowth: number;
  current_month_revenue: number;
  previous_month_revenue: number;
}) => {
  const formattedGrowth = isFinite(revenueGrowth)
    ? revenueGrowth.toFixed(1)
    : '0.0';
  const isPositive = revenueGrowth >= 0;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {formatCurrency(total_revenue)}
        </CardTitle>
        <CardAction>
          <Badge
            variant='outline'
            className={isPositive ? 'text-green-600' : 'text-red-600'}
          >
            {isPositive ? (
              <IconTrendingUp className='size-4' />
            ) : (
              <IconTrendingDown className='size-4' />
            )}
            {formattedGrowth}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          {isPositive ? 'Revenue increasing' : 'Revenue decreasing'}
          {isPositive ? (
            <IconTrendingUp className='size-4 text-green-600' />
          ) : (
            <IconTrendingDown className='size-4 text-red-600' />
          )}
        </div>
        <div className='text-muted-foreground'>
          {formatCurrency(current_month_revenue)} this month vs{' '}
          {formatCurrency(previous_month_revenue)} last month
        </div>
      </CardFooter>
    </Card>
  );
};

const StudentStats = ({
  total_students,
  userGrowth,
  current_month_students,
  previous_month_students
}: {
  total_students: number;
  userGrowth: number;
  current_month_students: number;
  previous_month_students: number;
}) => {
  const formattedGrowth = isFinite(userGrowth) ? userGrowth.toFixed(1) : '0.0';
  const isPositive = userGrowth >= 0;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardDescription>Total Users</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {total_students}
        </CardTitle>
        <CardAction>
          <Badge
            variant='outline'
            className={isPositive ? 'text-green-600' : 'text-red-600'}
          >
            {isPositive ? (
              <IconTrendingUp className='size-4' />
            ) : (
              <IconTrendingDown className='size-4' />
            )}
            {formattedGrowth}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          {isPositive ? 'Growing user base' : 'Declining user base'}
          {isPositive ? (
            <IconTrendingUp className='size-4 text-green-600' />
          ) : (
            <IconTrendingDown className='size-4 text-red-600' />
          )}
        </div>
        <div className='text-muted-foreground'>
          {current_month_students} new users this month vs{' '}
          {previous_month_students} last month
        </div>
      </CardFooter>
    </Card>
  );
};

const ApplicationStats = ({
  active_applications,
  application_growth,
  current_month_applications,
  previous_month_applications
}: {
  active_applications: number;
  application_growth: number;
  current_month_applications: number;
  previous_month_applications: number;
}) => {
  const formattedGrowth = isFinite(application_growth)
    ? application_growth.toFixed(1)
    : '0.0';
  const isPositive = application_growth >= 0;

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardDescription>Active Applications</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {active_applications}
        </CardTitle>
        <CardAction>
          <Badge
            variant='outline'
            className={isPositive ? 'text-green-600' : 'text-red-600'}
          >
            {isPositive ? (
              <IconTrendingUp className='size-4' />
            ) : (
              <IconTrendingDown className='size-4' />
            )}
            {formattedGrowth}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          {isPositive ? 'Applications increasing' : 'Applications decreasing'}
          <IconFileText className='size-4' />
        </div>
        <div className='text-muted-foreground'>
          {current_month_applications} applications this month vs{' '}
          {previous_month_applications} last month
        </div>
      </CardFooter>
    </Card>
  );
};

const PendingActionsStats = ({
  pending_payments,
  pending_withdrawals
}: {
  pending_payments: number;
  pending_withdrawals: number;
}) => (
  <Card className='@container/card'>
    <CardHeader>
      <CardDescription>Pending Actions</CardDescription>
      <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
        {pending_payments + pending_withdrawals}
      </CardTitle>
      <CardAction>
        <Badge variant='outline'>
          <IconCash />
          Needs Review
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className='flex-col items-start gap-1.5 text-sm'>
      <div className='line-clamp-1 flex gap-2 font-medium'>
        {pending_payments} payments, {pending_withdrawals} withdrawals
        <IconCash className='size-4' />
      </div>
      <div className='text-muted-foreground'>Require immediate attention</div>
    </CardFooter>
  </Card>
);

// Chart Components
const RevenueChart = ({
  revenue_trend
}: {
  revenue_trend: Array<{ month: string; revenue: number }>;
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                {label}
              </span>
              <span className='text-muted-foreground font-bold'>
                {formatCurrency(payload[0].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Last 6 months revenue</CardDescription>
      </CardHeader>
      <div className='h-[300px] p-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={revenue_trend}>
            <defs>
              <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='month'
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='revenue'
              stroke='#8884d8'
              fill='url(#revenueGradient)'
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const UserGrowthChart = ({
  user_growth
}: {
  user_growth: Array<{ month: string; users: number }>;
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                {label}
              </span>
              <span className='text-muted-foreground font-bold'>
                {payload[0].value} users
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>Monthly new users</CardDescription>
      </CardHeader>
      <div className='h-[300px] p-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={user_growth}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='month'
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey='users' fill='#82ca9d' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const DailyTransactionsChart = ({
  daily_transactions
}: {
  daily_transactions: Array<{ date: string; count: number }>;
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                {new Date(label).toLocaleDateString()}
              </span>
              <span className='text-muted-foreground font-bold'>
                {payload[0].value} transactions
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Transactions</CardTitle>
        <CardDescription>Last 30 days activity</CardDescription>
      </CardHeader>
      <div className='h-[300px] p-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={daily_transactions}>
            <defs>
              <linearGradient
                id='transactionGradient'
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='date'
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short'
                })
              }
            />
            <YAxis
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='count'
              stroke='#8884d8'
              fill='url(#transactionGradient)'
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const PaymentDistributionChart = ({
  payment_distribution
}: {
  payment_distribution: Array<{ status: string; count: number }>;
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                {payload[0].name}
              </span>
              <span className='text-muted-foreground font-bold'>
                {payload[0].value} payments
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const total = payment_distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status Distribution</CardTitle>
        <CardDescription>Current payment statuses</CardDescription>
      </CardHeader>
      <div className='h-[300px] p-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={payment_distribution}
              dataKey='count'
              nameKey='status'
              cx='50%'
              cy='50%'
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {payment_distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign='bottom'
              height={36}
              formatter={(value) => (
                <span className='text-muted-foreground text-xs'>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const ApplicationStatusChart = ({
  application_distribution,
  application_trend,
  avg_processing_days = 0,
  success_rate = 0,
  total_applications = 0,
  approved_applications = 0
}: {
  application_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  application_trend: Array<{ month: string; applications: number }>;
  avg_processing_days?: number;
  success_rate?: number;
  total_applications?: number;
  approved_applications?: number;
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                {label}
              </span>
              <span className='text-muted-foreground font-bold'>
                {payload[0].value} applications
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>
          Current application statuses and trends
        </CardDescription>
      </CardHeader>
      <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
        <div className='h-[250px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={application_distribution || []}
                dataKey='count'
                nameKey='status'
                cx='50%'
                cy='50%'
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {(application_distribution || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign='bottom'
                height={36}
                formatter={(value) => (
                  <span className='text-muted-foreground text-xs'>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='h-[250px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={application_trend || []}>
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='month'
                className='text-muted-foreground text-xs'
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className='text-muted-foreground text-xs'
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='applications'
                fill='#8884d8'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className='px-4 pb-4'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-sm'>
              Total Applications
            </span>
            <span className='text-2xl font-bold'>{total_applications}</span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-sm'>
              Approved Applications
            </span>
            <span className='text-2xl font-bold'>{approved_applications}</span>
            <span className='text-muted-foreground text-xs'>
              {Number(success_rate).toFixed(1)}% success rate
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-muted-foreground text-sm'>
              Average Processing Time
            </span>
            <span className='text-2xl font-bold'>
              {Number(avg_processing_days).toFixed(1)} days
            </span>
          </div>
          {(application_distribution || []).map((status, index) => (
            <div key={status.status} className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {status.status}
              </span>
              <span className='text-2xl font-bold'>{status.count}</span>
              <span className='text-muted-foreground text-xs'>
                {Number(status.percentage).toFixed(1)}% of total
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const DailyApplicationsChart = ({
  daily_applications
}: {
  daily_applications: Array<{
    date: string;
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    revoked: number;
  }>;
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background rounded-lg border p-2 shadow-sm'>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex flex-col'>
              <span className='text-muted-foreground text-[0.70rem] uppercase'>
                {new Date(label).toLocaleDateString()}
              </span>
              <span className='text-muted-foreground font-bold'>
                Total: {payload[0].payload.total} applications
              </span>
              <div className='mt-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-blue-500' />
                  <span className='text-xs'>
                    Pending: {payload[0].payload.pending}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-green-500' />
                  <span className='text-xs'>
                    Approved: {payload[0].payload.approved}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-red-500' />
                  <span className='text-xs'>
                    Rejected: {payload[0].payload.rejected}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-yellow-500' />
                  <span className='text-xs'>
                    Cancelled: {payload[0].payload.cancelled}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-gray-500' />
                  <span className='text-xs'>
                    Revoked: {payload[0].payload.revoked}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Applications</CardTitle>
        <CardDescription>Last 30 days application activity</CardDescription>
      </CardHeader>
      <div className='h-[300px] p-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={daily_applications}>
            <defs>
              <linearGradient id='pendingGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='approvedGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#22c55e' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#22c55e' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='rejectedGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#ef4444' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='date'
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short'
                })
              }
            />
            <YAxis
              className='text-muted-foreground text-xs'
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='pending'
              stackId='1'
              stroke='#3b82f6'
              fill='url(#pendingGradient)'
              strokeWidth={2}
            />
            <Area
              type='monotone'
              dataKey='approved'
              stackId='1'
              stroke='#22c55e'
              fill='url(#approvedGradient)'
              strokeWidth={2}
            />
            <Area
              type='monotone'
              dataKey='rejected'
              stackId='1'
              stroke='#ef4444'
              fill='url(#rejectedGradient)'
              strokeWidth={2}
            />
            <Legend
              verticalAlign='bottom'
              height={36}
              formatter={(value) => (
                <span className='text-muted-foreground text-xs capitalize'>
                  {value}
                </span>
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default function OverviewPage() {
  const { api } = useClientApi();

  const {
    data: dashboardData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api?.get('/admin/overview/');
      return response?.data;
    },
    enabled: !!api
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data. Please try again later.</div>;
  }

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  const {
    total_revenue = 0,
    current_month_revenue = 0,
    previous_month_revenue = 0,
    revenue_growth = 0,
    total_students = 0,
    current_month_students = 0,
    previous_month_students = 0,
    student_growth = 0,
    active_applications = 0,
    current_month_applications = 0,
    previous_month_applications = 0,
    application_growth = 0,
    pending_payments = 0,
    pending_withdrawals = 0,
    total_referrals = 0,
    user_growth = [],
    revenue_trend = [],
    application_trend = [],
    payment_distribution = [],
    withdrawal_distribution = [],
    application_distribution = [],
    daily_transactions = [],
    daily_applications = [],
    total_applications = 0,
    approved_applications = 0,
    success_rate = 0,
    avg_processing_days = 0
  } = dashboardData;

  return (
    <div className='flex flex-1 flex-col space-y-2'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Admin Dashboard Overview
        </h2>
      </div>

      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        <RevenueStats
          total_revenue={total_revenue}
          revenueGrowth={revenue_growth}
          current_month_revenue={current_month_revenue}
          previous_month_revenue={previous_month_revenue}
        />
        <StudentStats
          total_students={total_students}
          userGrowth={student_growth}
          current_month_students={current_month_students}
          previous_month_students={previous_month_students}
        />
        <ApplicationStats
          active_applications={active_applications}
          application_growth={application_growth}
          current_month_applications={current_month_applications}
          previous_month_applications={previous_month_applications}
        />
        <PendingActionsStats
          pending_payments={pending_payments}
          pending_withdrawals={pending_withdrawals}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-4'>
          <RevenueChart revenue_trend={revenue_trend} />
        </div>
        <div className='col-span-4 md:col-span-3'>
          <UserGrowthChart user_growth={user_growth} />
        </div>
        <div className='col-span-4'>
          <DailyTransactionsChart daily_transactions={daily_transactions} />
        </div>
        <div className='col-span-4 md:col-span-3'>
          <PaymentDistributionChart
            payment_distribution={payment_distribution}
          />
        </div>
        <div className='col-span-7'>
          <ApplicationStatusChart
            application_distribution={application_distribution}
            application_trend={application_trend}
            avg_processing_days={avg_processing_days}
            success_rate={success_rate}
            total_applications={total_applications}
            approved_applications={approved_applications}
          />
        </div>
        <div className='col-span-4'>
          <DailyApplicationsChart daily_applications={daily_applications} />
        </div>
      </div>
    </div>
  );
}
