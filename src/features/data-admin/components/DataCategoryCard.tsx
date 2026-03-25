'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface DataCategoryCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  description: string;
  subMetrics?: { label: string; value: number }[];
  href: string;
}

export function DataCategoryCard({
  title,
  icon: Icon,
  count,
  description,
  subMetrics,
  href
}: DataCategoryCardProps) {
  return (
    <Link href={href} className='group block'>
      <Card
        className={cn(
          'relative overflow-hidden transition-all',
          'hover:border-primary/30 hover:shadow-md',
          'group-focus-visible:ring-ring group-focus-visible:ring-2 group-focus-visible:ring-offset-2'
        )}
      >
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                <Icon className='text-primary h-5 w-5' />
              </div>
              <CardTitle className='text-base font-semibold'>{title}</CardTitle>
            </div>
            <ArrowRight className='text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div>
              <p className='text-3xl font-bold tracking-tight'>
                {count.toLocaleString()}
              </p>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </div>
            {subMetrics && subMetrics.length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {subMetrics.map((metric) => (
                  <Badge
                    key={metric.label}
                    variant='secondary'
                    className='text-xs font-normal'
                  >
                    {metric.label}: {metric.value.toLocaleString()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
