'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useState, useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

interface AreaGraphProps {
  data: Array<{
    month: string;
    revenue?: number;
    users?: number;
  }>;
  title?: string;
  description?: string;
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--primary)'
  },
  users: {
    label: 'Users',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function AreaGraph({ data, title, description }: AreaGraphProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const dataKey = data[0]?.revenue !== undefined ? 'revenue' : 'users';
  const label = dataKey === 'revenue' ? 'Revenue' : 'Users';
  const total = data.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{title || `${label} Trend`}</CardTitle>
        <CardDescription>
          {description ||
            `Showing ${label.toLowerCase()} for the last 6 months`}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0
              }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
                tickFormatter={(value) => {
                  if (dataKey === 'revenue') {
                    return `$${value.toLocaleString()}`;
                  }
                  return value.toLocaleString();
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='dot' />}
              />
              <Area
                type='monotone'
                dataKey={dataKey}
                stroke='var(--primary)'
                fill='var(--primary)'
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Total {label}:{' '}
              {dataKey === 'revenue'
                ? formatCurrency(total)
                : total.toLocaleString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
