'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  color?: string;
}

interface SectionAnalyticsProps {
  stats: StatItem[];
}

export function SectionAnalytics({ stats }: SectionAnalyticsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className='flex items-center gap-4 px-6 py-4'>
              {Icon && (
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    stat.color ?? 'bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      stat.color ? 'text-current' : 'text-primary'
                    )}
                  />
                </div>
              )}
              <div className='min-w-0'>
                <p className='text-muted-foreground text-sm'>{stat.label}</p>
                <p className='text-2xl font-bold tracking-tight'>
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
