'use client';

import React from 'react';
import { Edit2, Trash2, MoreVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
        <div className="h-14 bg-border/20 border-b border-border"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-border last:border-0 bg-surface/50"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-surface border border-border rounded-xl p-20 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 bg-accent-blue/5 rounded-full flex items-center justify-center text-accent-blue/40 mb-6">
          <MoreVertical size={40} />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">No data found</h3>
        <p className="text-text-secondary max-w-sm">
          It looks like there’s nothing here yet. Add your first entry to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-xl overflow-hidden shadow-2xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-background border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'px-6 py-5 text-sm font-semibold text-text-secondary uppercase tracking-wider',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-5 text-sm font-semibold text-text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, itemIdx) => (
              <tr
                key={item.id || itemIdx}
                className="group hover:bg-background transition-colors duration-200"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-6 py-5 text-text-primary font-medium whitespace-nowrap',
                      col.className,
                    )}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(item)}
                          className="h-8 w-8 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10"
                        >
                          <ExternalLink size={16} />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 border-border hover:border-accent-blue hover:text-accent-blue"
                        >
                          <Edit2 size={16} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          className="h-8 w-8 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
