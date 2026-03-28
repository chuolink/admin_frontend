// @ts-nocheck
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function StarRating({
  rating,
  max = 5,
  size = 'sm',
  showValue = false
}: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-muted-foreground/30'
          )}
        />
      ))}
      {showValue && (
        <span className='text-muted-foreground ml-1 text-sm'>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
