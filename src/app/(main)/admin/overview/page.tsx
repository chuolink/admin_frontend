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
  Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Stats Components
const RevenueStats = ({
  total_revenue,
  revenueGrowth
}: {
  total_revenue: number;
  revenueGrowth: number;
}) => (
  <Card className='@container/card'>
    <CardHeader>
      <CardDescription>Total Revenue</CardDescription>
      <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
        {formatCurrency(total_revenue)}
      </CardTitle>
      <CardAction>
        <Badge variant='outline'>
          {revenueGrowth >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
          {revenueGrowth.toFixed(1)}%
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className='flex-col items-start gap-1.5 text-sm'>
      <div className='line-clamp-1 flex gap-2 font-medium'>
        {revenueGrowth >= 0 ? 'Revenue increasing' : 'Revenue decreasing'}
        {revenueGrowth >= 0 ? (
          <IconTrendingUp className='size-4' />
        ) : (
          <IconTrendingDown className='size-4' />
        )}
      </div>
      <div className='text-muted-foreground'>Last 30 days revenue trend</div>
    </CardFooter>
  </Card>
);

const StudentStats = ({
  total_students,
  userGrowth,
  new_users
}: {
  total_students: number;
  userGrowth: number;
  new_users: number;
}) => (
  <Card className='@container/card'>
    <CardHeader>
      <CardDescription>Total Students</CardDescription>
      <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
        {total_students}
      </CardTitle>
      <CardAction>
        <Badge variant='outline'>
          {userGrowth >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
          {userGrowth.toFixed(1)}%
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className='flex-col items-start gap-1.5 text-sm'>
      <div className='line-clamp-1 flex gap-2 font-medium'>
        {userGrowth >= 0 ? 'Growing user base' : 'Declining user base'}
        {userGrowth >= 0 ? (
          <IconTrendingUp className='size-4' />
        ) : (
          <IconTrendingDown className='size-4' />
        )}
      </div>
      <div className='text-muted-foreground'>
        {new_users} new users this month
      </div>
    </CardFooter>
  </Card>
);

const ApplicationStats = ({
  active_applications
}: {
  active_applications: number;
}) => (
  <Card className='@container/card'>
    <CardHeader>
      <CardDescription>Active Applications</CardDescription>
      <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
        {active_applications}
      </CardTitle>
      <CardAction>
        <Badge variant='outline'>
          <IconFileText />
          Pending
        </Badge>
      </CardAction>
    </CardHeader>
    <CardFooter className='flex-col items-start gap-1.5 text-sm'>
      <div className='line-clamp-1 flex gap-2 font-medium'>
        Applications need review <IconFileText className='size-4' />
      </div>
      <div className='text-muted-foreground'>Across all universities</div>
    </CardFooter>
  </Card>
);

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
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Revenue Trend</CardTitle>
      <CardDescription>Last 6 months revenue</CardDescription>
    </CardHeader>
    <div className='h-[300px] p-4'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={revenue_trend}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='month' />
          <YAxis />
          <Tooltip />
          <Area
            type='monotone'
            dataKey='revenue'
            stroke='#8884d8'
            fill='#8884d8'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const UserGrowthChart = ({
  user_growth
}: {
  user_growth: Array<{ month: string; users: number }>;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>User Growth</CardTitle>
      <CardDescription>Monthly new users</CardDescription>
    </CardHeader>
    <div className='h-[300px] p-4'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={user_growth}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='month' />
          <YAxis />
          <Tooltip />
          <Bar dataKey='users' fill='#82ca9d' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const DailyTransactionsChart = ({
  daily_transactions
}: {
  daily_transactions: Array<{ date: string; count: number }>;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Daily Transactions</CardTitle>
      <CardDescription>Last 30 days activity</CardDescription>
    </CardHeader>
    <div className='h-[300px] p-4'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={daily_transactions}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Area
            type='monotone'
            dataKey='count'
            stroke='#8884d8'
            fill='#8884d8'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

const PaymentDistributionChart = ({
  payment_distribution
}: {
  payment_distribution: Array<{ status: string; count: number }>;
}) => (
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
            label
          >
            {payment_distribution.map(
              (entry: { status: string; count: number }, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              )
            )}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

export default function OverviewPage() {
  const { api } = useClientApi();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api?.get('/admin/overview/');
      return response?.data;
    },
    enabled: !!api
  });

  if (isLoading || !dashboardData) {
    return <div>Loading...</div>;
  }

  const {
    total_revenue,
    total_students,
    new_users,
    pending_payments,
    pending_withdrawals,
    active_applications,
    total_referrals,
    user_growth,
    revenue_trend,
    payment_distribution,
    withdrawal_distribution,
    application_distribution,
    daily_transactions
  } = dashboardData;

  // Calculate growth percentages
  const revenueGrowth =
    revenue_trend.length >= 2
      ? ((revenue_trend[revenue_trend.length - 1].revenue -
          revenue_trend[revenue_trend.length - 2].revenue) /
          revenue_trend[revenue_trend.length - 2].revenue) *
        100
      : 0;

  const userGrowth =
    user_growth.length >= 2
      ? ((user_growth[user_growth.length - 1].users -
          user_growth[user_growth.length - 2].users) /
          user_growth[user_growth.length - 2].users) *
        100
      : 0;

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
          revenueGrowth={revenueGrowth}
        />
        <StudentStats
          total_students={total_students}
          userGrowth={userGrowth}
          new_users={new_users}
        />
        <ApplicationStats active_applications={active_applications} />
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
      </div>
    </div>
  );
}
