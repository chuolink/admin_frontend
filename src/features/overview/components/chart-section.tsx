'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconChartLine,
  IconChartPie,
  IconChartBar,
  IconCreditCard
} from '@tabler/icons-react';
import { RecentSales } from './recent-sales';

interface ChartSectionProps {
  data: {
    revenue_data?: any[];
    student_distribution?: any[];
    course_enrollment?: any[];
    recent_transactions?: any[];
  };
}

export function ChartSection({ data }: ChartSectionProps) {
  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartLine className='h-5 w-5' />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.revenue_data?.length ? (
              <div className='h-[300px]'>
                {/* Add your revenue chart component here */}
              </div>
            ) : (
              <div className='text-muted-foreground flex h-[300px] flex-col items-center justify-center gap-2'>
                <IconChartLine className='h-12 w-12 opacity-50' />
                <p>No revenue data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartPie className='h-5 w-5' />
              Student Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.student_distribution?.length ? (
              <div className='h-[300px]'>
                {/* Add your pie chart component here */}
              </div>
            ) : (
              <div className='text-muted-foreground flex h-[300px] flex-col items-center justify-center gap-2'>
                <IconChartPie className='h-12 w-12 opacity-50' />
                <p>No student data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconChartBar className='h-5 w-5' />
              Course Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.course_enrollment?.length ? (
              <div className='h-[300px]'>
                {/* Add your bar chart component here */}
              </div>
            ) : (
              <div className='text-muted-foreground flex h-[300px] flex-col items-center justify-center gap-2'>
                <IconChartBar className='h-12 w-12 opacity-50' />
                <p>No enrollment data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconCreditCard className='h-5 w-5' />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales data={data?.recent_transactions || []} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
