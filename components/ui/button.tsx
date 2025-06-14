import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl shadow-sm transition-transform duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/95 hover:scale-[1.02]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/95 hover:scale-[1.02]',
        outline: 'border border-input bg-background hover:bg-accent/50 hover:text-accent-foreground hover:scale-[1.02]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-[1.02]',
        ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline hover:scale-[1.02]',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-4 py-1 text-sm',
        lg: 'px-6 py-2 text-lg',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
