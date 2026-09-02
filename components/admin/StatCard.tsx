import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-lg bg-surface border border-border flex items-start gap-4 relative overflow-hidden transition-colors duration-200 hover:border-accent-blue/30',
        className,
      )}
    >
      <div className="h-10 w-10 shrink-0 bg-accent-blue/10 border border-accent-blue/20 rounded-md flex items-center justify-center text-accent-blue">
        <Icon size={20} />
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
        <div className="flex items-end gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">{value}</h2>
          {trend && (
            <span
              className={cn(
                'text-[11px] font-semibold mb-1 px-2 py-0.5 rounded-sm',
                trend.isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10',
              )}
            >
              {trend.isUp ? '+' : '-'}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
