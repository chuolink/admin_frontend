'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';

interface RecentSale {
  id: string;
  amount: number;
  status: string;
  student: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: string;
}

interface RecentSalesProps {
  data?: RecentSale[];
}

export function RecentSales({ data = [] }: RecentSalesProps) {
  if (!data.length) {
    return (
      <div className='flex h-[200px] items-center justify-center'>
        <p className='text-muted-foreground'>No recent sales data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {data.map((sale) => (
        <div key={sale.id} className='flex items-center'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={sale.student.avatar} alt={sale.student.name} />
            <AvatarFallback>
              {sale.student.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='ml-4 space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {sale.student.name}
            </p>
            <p className='text-muted-foreground text-sm'>
              {sale.student.email}
            </p>
          </div>
          <div className='ml-auto font-medium'>
            {formatCurrency(sale.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
