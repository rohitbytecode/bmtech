'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  hideFooter?: boolean;
}

export function ModalForm({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Save Changes',
  isSubmitting = false,
  disabled = false,
  hideFooter = false,
}: ModalFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-3xl overflow-hidden relative animate-in zoom-in-95 duration-300"
      >
        <div className="p-8 border-b border-border bg-background flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h2>
            {description && <p className="text-sm text-text-secondary">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-border transition-colors outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>

          {!hideFooter && (
            <div className="p-8 pt-0 flex flex-col sm:flex-row items-center justify-end gap-4 bg-surface">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting || disabled}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || disabled}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
