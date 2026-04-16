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
          'fixed left-0 top-0 h-screen bg-sidebar border-r border-border transition-all duration-300 z-50 flex flex-col',
          isSidebarCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          isSidebarCollapsed ? 'pl-20' : 'pl-64',
        )}
      >
        <Navbar />
        <main className="flex-1 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
