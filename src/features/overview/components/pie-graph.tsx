'use client';

import * as React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
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

interface PieGraphProps {
  data: Array<{
    status: string;
    count: number;
  }>;
  title?: string;
  description?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const chartConfig = {
  count: {
    label: 'Count',
    color: 'var(--primary)'
  }
} satisfies ChartConfig;

export function PieGraph({ data, title, description }: PieGraphProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>{title || 'Status Distribution'}</CardTitle>
        <CardDescription>
          {description || 'Current status distribution'}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='count'
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent indicator='dot' />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Total Items: {total.toLocaleString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
