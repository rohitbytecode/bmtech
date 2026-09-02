'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-accent-blue text-white hover:bg-accent-blue/90',
      secondary: 'bg-surface text-text-primary border border-border hover:bg-background',
      outline: 'bg-transparent border border-border text-text-primary hover:bg-surface',
      ghost: 'bg-transparent hover:bg-surface text-text-secondary hover:text-text-primary',
    };

    const sizes = {
      sm: 'h-7 px-2.5 text-xs font-medium',
      md: 'h-8 px-3 text-sm font-medium',
      lg: 'h-10 px-5 text-sm font-medium',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {props.children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
