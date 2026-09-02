'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
  type: 'select' | 'search';
}

interface FilterBarProps {
  filters: FilterDefinition[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function FilterBar({ filters, values, onChange, onClear }: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded-lg border border-border/50 mb-4 shadow-sm">
      {filters.map((filter) => {
        if (filter.type === 'search') {
          return (
            <div key={filter.key} className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary"
                size={14}
              />
              <input
                type="text"
                placeholder={filter.label}
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="h-8 w-full pl-8 pr-3 bg-background border border-border rounded-md text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent-blue/40"
              />
            </div>
          );
        }

        return (
          <div key={filter.key} className="relative min-w-[140px]">
            <select
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="h-8 w-full pl-3 pr-8 bg-background border border-border rounded-md text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue/40 appearance-none cursor-pointer"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 px-2 text-xs text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 gap-1 ml-auto"
        >
          <X size={14} /> Clear
        </Button>
      )}
    </div>
  );
}
