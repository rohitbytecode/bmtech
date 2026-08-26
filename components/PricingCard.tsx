'use client';
import { Check, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export default function PricingCard({ name, price, features, highlighted }: PricingCardProps) {
  return (
    <div
      className={cn(
        'h-full flex flex-col p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden group',
        'hover:-translate-y-1 hover:shadow-lg',
        highlighted
          ? 'bg-surface border-accent-blue shadow-2xl shadow-accent-blue/15 scale-105'
          : 'bg-surface border-border hover:border-accent-blue/30',
      )}
    >
      {/* Top accent bar for highlighted card */}
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
      )}

      {highlighted && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-lg">
          <Sparkles size={12} />
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-1">{name}</h3>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-bold text-foreground">{price}</p>
        </div>
        <p className="text-sm text-text-secondary mt-2">Comprehensive setup &amp; support</p>
      </div>

      {/* Separator */}
      <div className={cn(
        'h-px mb-6',
        highlighted ? 'bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent' : 'bg-border/60',
      )} />

      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm text-text-secondary">
            <span className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center mr-3 shrink-0 mt-0.5',
              highlighted ? 'bg-accent-blue/15' : 'bg-accent-blue/8',
            )}>
              <Check size={12} className="text-accent-blue" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a href="#contact" className="block w-full mt-auto">
        <Button
          variant={highlighted ? 'primary' : 'outline'}
          className={cn(
            'w-full rounded-xl',
            highlighted && 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20',
          )}
        >
          Choose Plan
        </Button>
      </a>
    </div>
  );
}
