'use client';

import React from 'react';
import { Edit2, Trash2, MoreVertical, ExternalLink, Users } from 'lucide-react';
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
  onAssign?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onAssign,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg overflow-hidden animate-pulse">
        <div className="h-10 bg-border/20 border-b border-border"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 border-b border-border last:border-0 bg-surface/50"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 bg-accent-blue/5 rounded-full flex items-center justify-center text-accent-blue/40 mb-4">
          <MoreVertical size={24} />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1">No data found</h3>
        <p className="text-sm text-text-secondary max-w-sm">
          It looks like there’s nothing here yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-border/50 rounded-lg shadow-sm flex flex-col">
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-max relative">
          <thead className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || onView || onAssign) && (
                <th className="px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right whitespace-nowrap sticky right-0 bg-background/95 shadow-[-1px_0_0_0_var(--border)]">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((item, itemIdx) => (
              <tr
                key={item.id || itemIdx}
                className="group hover:bg-background/50 transition-colors duration-150"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      'px-4 py-2 text-sm text-text-primary font-medium',
                      col.className,
                    )}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete || onView || onAssign) && (
                  <td className="px-4 py-2 text-right whitespace-nowrap sticky right-0 bg-surface group-hover:bg-background/50 transition-colors duration-150 shadow-[-1px_0_0_0_var(--border)]">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-150">
                      {onAssign && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAssign(item)}
                          title="Assign to Caller"
                          className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                        >
                          <Users size={14} />
                        </Button>
                      )}
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(item)}
                          title="View Details"
                          className="h-7 w-7 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10"
                        >
                          <ExternalLink size={14} />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          title="Edit"
                          className="h-7 w-7 text-text-secondary hover:text-accent-blue hover:bg-accent-blue/10"
                        >
                          <Edit2 size={14} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          title="Delete"
                          className="h-7 w-7 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 size={14} />
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
