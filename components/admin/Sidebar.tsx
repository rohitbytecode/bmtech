'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuSections = [
  {
    title: 'Business',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
      { name: 'Services', icon: Briefcase, href: '/admin/services' },
      { name: 'Portfolio', icon: FileText, href: '/admin/portfolio' },
      { name: 'Packages', icon: Package, href: '/admin/packages' },
      { name: 'Monthly Packages', icon: Package, href: '/admin/monthly-packages' },
      { name: 'Leads (Inbound)', icon: Users, href: '/admin/leads' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Strategies', icon: Briefcase, href: '/admin/marketing/strategies' },
      { name: 'Prospects', icon: Users, href: '/admin/marketing/prospects' },
      { name: 'Caller', icon: FileText, href: '/admin/marketing/caller' },
      { name: 'Qualified Leads', icon: FileText, href: '/admin/marketing/qualified' },
      { name: 'Rejected', icon: FileText, href: '/admin/marketing/rejected' },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

import { authService } from '@/services/authService';

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw new Error(error);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect
      router.push('/admin/login');
    }
  };

  return (
    <>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-xl font-bold text-accent-blue tracking-tight">
            BMTech <span className="text-text-primary">Admin</span>
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg bg-surface border border-border hover:bg-border transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-6 overflow-y-auto custom-scrollbar" data-lenis-prevent>
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 group relative',
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary font-medium',
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      'shrink-0',
                      isActive ? 'text-accent-blue' : 'text-text-secondary group-hover:text-text-primary',
                    )}
                  />
                  {!isCollapsed && <span>{item.name}</span>}

                  {isCollapsed && (
                    <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-surface border border-border text-text-primary px-2 py-1 rounded text-xs whitespace-nowrap transition-all z-[60]">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all duration-200',
            isCollapsed && 'justify-center',
          )}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );
}
