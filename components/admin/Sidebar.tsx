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

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Services', icon: Briefcase, href: '/admin/services' },
  { name: 'Portfolio', icon: FileText, href: '/admin/portfolio' },
  { name: 'Packages', icon: Package, href: '/admin/packages' },
  { name: 'Monthly Packages', icon: Package, href: '/admin/monthly-packages' },
  { name: 'Leads', icon: Users, href: '/admin/leads' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
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

      <nav className="flex-1 px-4 mt-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
              )}
            >
              <Icon
                size={20}
                className={cn(
                  'shrink-0',
                  isActive ? 'text-white' : 'text-text-secondary group-hover:text-text-primary',
                )}
              />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}

              {isCollapsed && (
                <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-surface border border-border text-text-primary px-2 py-1 rounded text-xs whitespace-nowrap transition-all z-[60]">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all duration-200',
            isCollapsed && 'justify-center',
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );
}
