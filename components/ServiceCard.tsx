'use client';
import { LucideIcon, Check, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  iconName: string;
  features?: string[];
  cta?: string;
  onCtaClick?: () => void;
}

export default function ServiceCard({
  title,
  description,
  iconName,
  features,
  cta,
  onCtaClick,
}: ServiceCardProps) {
  // @ts-expect-error - dynamic icon resolution
  const Icon = Icons[iconName] as LucideIcon;

  return (
    <div className="group p-6 rounded-2xl bg-surface/80 dark:bg-slate-900 border border-border dark:border-slate-800 hover:border-accent-blue/50 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-blue/10 dark:bg-blue-950/50 text-accent-blue dark:text-blue-400 group-hover:bg-accent-blue group-hover:text-white transition-colors duration-300">
          {Icon ? <Icon size={24} /> : null}
        </div>
        <h3 className="text-xl font-bold mb-3 text-foreground dark:text-white group-hover:text-accent-blue dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        {description && (!features || features.length === 0) && (
          <p className="text-text-secondary dark:text-slate-400 leading-relaxed text-sm">{description}</p>
        )}
        {features && features.length > 0 && (
          <ul className="space-y-2.5 my-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary dark:text-slate-400">
                <span className="w-5 h-5 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-accent-blue" />
                </span>
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cta && (
        <div className="pt-4 mt-auto">
          {onCtaClick ? (
            <button
              onClick={onCtaClick}
              className="w-full h-11 rounded-xl font-bold text-sm bg-surface border border-border text-foreground hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2 group/btn"
            >
              {cta}
              <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          ) : (
            <a
              href="#contact"
              className="w-full h-11 rounded-xl font-bold text-sm bg-surface border border-border text-foreground hover:border-accent-blue/40 hover:bg-accent-blue/5 transition-all hover:scale-[1.02] active:scale-95 inline-flex items-center justify-center gap-2 group/btn"
            >
              {cta}
              <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
