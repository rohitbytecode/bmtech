'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { Navbar } from '@/components/admin/Navbar';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-accent-blue selection:text-white">
      <div
        className={cn(
          'fixed left-0 top-0 h-screen border-r border-border/60 transition-all duration-300 z-50 flex flex-col',
          isSidebarCollapsed ? 'w-16' : 'w-60',
        )}
        style={{ backgroundColor: 'var(--sidebar)' }}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'pl-16' : 'pl-60',
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6 fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
