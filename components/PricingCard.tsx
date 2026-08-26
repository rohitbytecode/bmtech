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
        'h-full flex flex-col p-10 rounded-3xl border transition-all duration-500 relative overflow-hidden group',
        'hover:-translate-y-2 hover:shadow-2xl',
        highlighted
          ? 'bg-surface border-accent-blue/50 shadow-2xl shadow-accent-blue/20 scale-105 hover:shadow-accent-blue/40'
          : 'bg-surface border-border hover:border-accent-blue/50 hover:shadow-accent-blue/10',
      )}
    >
      {/* Top accent bar for highlighted card */}
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-blue via-rose-500 to-orange-500" />
      )}

      {highlighted && (
        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-gradient-to-r from-accent-blue to-rose-600 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-lg shadow-accent-blue/30">
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
            'w-full rounded-xl transition-all duration-300 group-hover:scale-[1.02]',
            highlighted && 'bg-gradient-to-r from-accent-blue to-rose-600 hover:from-rose-600 hover:to-accent-blue shadow-[0_0_15px_rgba(219,53,69,0.3)] hover:shadow-[0_0_25px_rgba(219,53,69,0.5)] border-0 text-white',
          )}
        >
          Choose Plan
        </Button>
      </a>
    </div>
  );
}
