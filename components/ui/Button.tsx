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
      primary: 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20 hover:shadow-2xl hover:shadow-accent-blue/40 relative overflow-hidden group',
      secondary: 'bg-surface text-text-primary border border-border hover:bg-surface/80',
      outline: 'bg-transparent border border-accent-blue text-accent-blue hover:bg-accent-blue/10',
      ghost: 'bg-transparent hover:bg-accent-blue/10 text-text-primary',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg font-semibold',
      icon: 'h-10 w-10 p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95 cursor-pointer hover:-translate-y-0.5',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {/* Glow effect overlay for primary buttons */}
        {variant === 'primary' && (
          <span className="absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25)_0%,transparent_70%)] pointer-events-none" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">{props.children}</span>
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
