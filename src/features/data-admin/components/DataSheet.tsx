'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * DataSheet — A right-side sliding panel for viewing/editing data.
 * Wider than default Sheet (max-w-xl or max-w-2xl) with built-in scroll.
 * Used instead of Dialog for data management forms so the table stays visible.
 */

interface DataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Width preset */
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  /** Footer with action buttons */
  footer?: React.ReactNode;
}

const sizeClasses = {
  md: 'w-full sm:max-w-md',
  lg: 'w-full sm:max-w-lg',
  xl: 'w-full sm:max-w-xl'
};

export function DataSheet({
  open,
  onOpenChange,
  title,
  description,
  size = 'lg',
  children,
  footer
}: DataSheetProps) {
  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50' />
        <SheetPrimitive.Content
          className={cn(
            'bg-background fixed inset-y-0 right-0 z-50 flex h-full flex-col border-l shadow-lg transition ease-in-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'data-[state=closed]:duration-300 data-[state=open]:duration-500',
            sizeClasses[size]
          )}
        >
          {/* Header */}
          <div className='flex items-start justify-between gap-4 border-b px-6 py-4'>
            <div className='space-y-1'>
              <SheetPrimitive.Title className='text-lg font-semibold'>
                {title}
              </SheetPrimitive.Title>
              {description && (
                <SheetPrimitive.Description className='text-muted-foreground text-sm'>
                  {description}
                </SheetPrimitive.Description>
              )}
            </div>
            <SheetPrimitive.Close className='ring-offset-background focus:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'>
              <XIcon className='h-5 w-5' />
              <span className='sr-only'>Close</span>
            </SheetPrimitive.Close>
          </div>

          {/* Scrollable content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='px-6 py-4'>{children}</div>
          </div>

          {/* Footer */}
          {footer && <div className='border-t px-6 py-4'>{footer}</div>}
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
