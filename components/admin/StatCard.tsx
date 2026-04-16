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
        'p-8 rounded-2xl bg-surface border border-border flex items-start gap-6 relative overflow-hidden group transition-all duration-300 hover:border-accent-blue/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent-blue/10',
        className,
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full -mr-16 -mt-16 group-hover:bg-accent-blue/10 transition-colors"></div>

      <div className="h-16 w-16 bg-accent-blue/10 border border-accent-blue/20 rounded-2xl flex items-center justify-center text-accent-blue group-hover:bg-accent-blue/20 group-hover:scale-110 transition-all duration-300">
        <Icon size={32} />
      </div>

      <div className="space-y-2 relative z-10">
        <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{label}</p>
        <div className="flex items-end gap-3 flex-wrap">
          <h2 className="text-4xl font-bold text-text-primary tracking-tight">{value}</h2>
          {trend && (
            <span
              className={cn(
                'text-sm font-semibold mb-1.5 px-2 py-0.5 rounded-full',
                trend.isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10',
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
