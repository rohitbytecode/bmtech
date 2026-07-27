'use client';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  iconName: string;
}

export default function ServiceCard({ title, description, iconName }: ServiceCardProps) {
  // @ts-ignore
  const Icon = Icons[iconName] as LucideIcon;

  return (
    <div className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {Icon ? <Icon size={24} /> : null}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
