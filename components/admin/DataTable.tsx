'use client';

import React from 'react';
import { Edit2, Trash2, MoreVertical, ExternalLink, Users, CheckCircle, XCircle } from 'lucide-react';
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
  onApprove?: (item: T) => void;
  onReject?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  onAssign,
  onApprove,
  onReject,
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
              {(onEdit || onDelete || onView || onAssign || onApprove || onReject) && (
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
                {(onEdit || onDelete || onView || onAssign || onApprove || onReject) && (
                  <td className="px-4 py-2 text-right whitespace-nowrap sticky right-0 bg-surface group-hover:bg-background/50 transition-colors duration-150 shadow-[-1px_0_0_0_var(--border)] hover:z-50 focus-within:z-50 z-10">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-150">
                      {onApprove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(item)}
                          title="Mark as Qualified"
                          className="h-7 w-7 text-accent-blue hover:text-accent-blue hover:bg-accent-blue/10"
                        >
                          <CheckCircle size={14} />
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(item)}
                          title="Mark as Rejected"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        >
                          <XCircle size={14} />
                        </Button>
                      )}
                      {(onAssign || onView || onEdit || onDelete) && (
                        <ActionDropdown>
                          {onAssign && (
                            <button
                              onClick={() => onAssign(item)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-background transition-colors text-left"
                            >
                              <Users size={14} className="text-emerald-500" /> Assign
                            </button>
                          )}
                          {onView && (
                            <button
                              onClick={() => onView(item)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-background transition-colors text-left"
                            >
                              <ExternalLink size={14} className="text-accent-blue" /> View Details
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(item)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-background transition-colors text-left"
                            >
                              <Edit2 size={14} className="text-text-secondary" /> Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(item)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </ActionDropdown>
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

function ActionDropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [openUpwards, setOpenUpwards] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 160);
    }
    setOpen(!open);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={toggleOpen}
        className="h-7 w-7 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-background transition-colors border border-border"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className={cn(
          "absolute right-0 w-40 rounded-md bg-surface border border-border shadow-lg z-50 py-1 flex flex-col items-stretch overflow-hidden",
          openUpwards ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
