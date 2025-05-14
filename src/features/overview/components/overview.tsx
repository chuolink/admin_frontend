'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconBuildingBank,
  IconDeviceMobile,
  IconUserPlus,
  IconWallet
} from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OverviewData {
  total_revenue: number;
  total_students: number;
  new_users: number;
  pending_payments: number;
  pending_withdrawals: number;
  active_applications: number;
  total_referrals: number;
  user_growth: Array<{ month: string; users: number }>;
  revenue_trend: Array<{ month: string; revenue: number }>;
  payment_distribution: Array<{ status: string; count: number }>;
  withdrawal_distribution: Array<{ status: string; count: number }>;
  application_distribution: Array<{ status: string; count: number }>;
  daily_transactions: Array<{ date: string; count: number }>;
  daily_payments: Array<{ date: string; count: number }>;
  daily_withdrawals: Array<{ date: string; count: number }>;
}

interface OverviewProps {
  data?: OverviewData;
}

export default function Overview({ data }: OverviewProps) {
  if (!data) {
    return null;
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
    daily_transactions,
    daily_payments,
    daily_withdrawals
  } = data;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>System Overview</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <IconCreditCard className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(total_revenue)}
            </div>
            <p className='text-muted-foreground text-xs'>
              Total revenue from all transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Students
            </CardTitle>
            <IconUsers className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{total_students}</div>
            <p className='text-muted-foreground text-xs'>
              +{new_users} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Payments
            </CardTitle>
            <IconBuildingBank className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pending_payments}</div>
            <p className='text-muted-foreground text-xs'>
              Payments awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Withdrawals
            </CardTitle>
            <IconWallet className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pending_withdrawals}</div>
            <p className='text-muted-foreground text-xs'>
              Withdrawals awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Active Applications</CardTitle>
            <CardDescription>Applications requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{active_applications}</div>
            <p className='text-muted-foreground text-sm'>
              Applications that need review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Referrals</CardTitle>
            <CardDescription>Referral program statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{total_referrals}</div>
            <p className='text-muted-foreground text-sm'>
              Total referrals in the system
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 6 months revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaGraph data={revenue_trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New users per month</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaGraph data={user_growth} />
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <PieGraph data={application_distribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Payment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <PieGraph data={payment_distribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Status</CardTitle>
            <CardDescription>Withdrawal distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <PieGraph data={withdrawal_distribution} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='transactions' className='w-full'>
        <TabsList>
          <TabsTrigger value='transactions'>Transactions</TabsTrigger>
          <TabsTrigger value='payments'>Payments</TabsTrigger>
          <TabsTrigger value='withdrawals'>Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value='transactions'>
          <Card>
            <CardHeader>
              <CardTitle>Daily Transactions</CardTitle>
              <CardDescription>Last 30 days transaction volume</CardDescription>
            </CardHeader>
            <CardContent>
              <BarGraph data={daily_transactions} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='payments'>
          <Card>
            <CardHeader>
              <CardTitle>Daily Payments</CardTitle>
              <CardDescription>Last 30 days payment volume</CardDescription>
            </CardHeader>
            <CardContent>
              <BarGraph data={daily_payments} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='withdrawals'>
          <Card>
            <CardHeader>
              <CardTitle>Daily Withdrawals</CardTitle>
              <CardDescription>Last 30 days withdrawal volume</CardDescription>
            </CardHeader>
            <CardContent>
              <BarGraph data={daily_withdrawals} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
