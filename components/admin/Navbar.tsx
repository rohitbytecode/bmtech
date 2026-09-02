'use client';

import React from 'react';
import { User as UserIcon, Search, Bell, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();
  const pageTitle = pathname.split('/').pop() || 'Dashboard';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-primary capitalize">
          {formattedTitle}
        </h1>
      </div>

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-3 pl-4 border-l border-border h-10">
          <div className="text-right hidden sm:block">
            {loading ? (
              <div className="flex items-center justify-end">
                <Loader2 size={14} className="animate-spin text-text-secondary" />
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary">
                  {user?.email?.split('@')[0] || 'Admin User'}
                </p>
                <p className="text-xs text-text-secondary capitalize">{role}</p>
              </>
            )}
          </div>
          <div className="h-10 w-10 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center text-accent-blue cursor-pointer hover:bg-accent-blue/20 transition-colors">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
