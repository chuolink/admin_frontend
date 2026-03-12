'use client';

import { cn } from '@/lib/utils';

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
}

export function Main({ fixed, className, children, ...props }: MainProps) {
  return (
    <main
      className={cn(
        'px-4 py-6',
        fixed && 'flex grow flex-col overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}
