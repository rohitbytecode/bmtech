"use client";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  iconName: string;
}

export default function ServiceCard({ title, description, iconName }: ServiceCardProps) {
  // @ts-ignore
  const Icon = Icons[iconName] as LucideIcon;

  return (
    <div className="group p-6 rounded-xl bg-surface border border-border hover:border-accent-blue transition-all duration-300 hover:shadow-lg hover:shadow-accent-blue/10">
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent-blue/10 text-accent-blue group-hover:bg-accent-blue group-hover:text-white transition-colors duration-300">
        {Icon ? <Icon size={24} /> : null}
      </div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-accent-blue transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
