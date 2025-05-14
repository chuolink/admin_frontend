'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBuildingBank, IconDeviceMobile } from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';
import { TransactionStats as TransactionStatsType } from '@/types';

interface TransactionStatsProps {
  stats: TransactionStatsType;
}

export function TransactionStats({ stats }: TransactionStatsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Transactions
          </CardTitle>
          <IconBuildingBank className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats?.total_transactions}</div>
          <p className='text-muted-foreground text-xs'>All time transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Volume</CardTitle>
          <IconBuildingBank className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {formatCurrency(stats?.total_volume)}
          </div>
          <p className='text-muted-foreground text-xs'>
            Total transaction volume
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Pending Transactions
          </CardTitle>
          <IconDeviceMobile className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {stats?.pending_transactions}
          </div>
          <p className='text-muted-foreground text-xs'>
            Transactions awaiting processing
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Failed Transactions
          </CardTitle>
          <IconDeviceMobile className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats?.failed_transactions}</div>
          <p className='text-muted-foreground text-xs'>
            Failed transaction attempts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
