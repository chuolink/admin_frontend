import { ButtonHTMLAttributes, forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl disabled:cursor-not-allowed disabled:opacity-70 transition-all',
  {
    variants: {
      variant: {
        default:
          'border-2 font-semibold text-background bg-primary border-primary',
        full3:
          'border-2 font-semibold text-background font-medium bg-[#F9F6E0] border-[#F9F6E0] ',
        full4: 'text-black bg-primary border-primary',
        outline:
          'border-2 font-semibold text-primaryLight bg-inherit border-primaryLight',
        outline1:
          'border text-black dark:text-primaryLight1 bg-inherit border-primary dark:border-primaryLight1',
        outline2:
          'border text-white bg-black bg-opacity-60 border-primaryLight border-opacity-70   ',
        full1: ' text-black  bg-[#C4C4C4] border-[#C4C4C4] border',

        full2: 'text-primary bg-black border-black border-2 '
      },
      size: {
        default: 'h-16 py-2 px-4 w-full',
        small: 'h-10 py-2 px-1 w-full text-xs'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// eslint-disable-next-line react/display-name
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

export { Button, buttonVariants };
