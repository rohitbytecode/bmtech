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
      { name: 'Team', icon: Users, href: '/admin/team' },
      { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRole = async () => {
      const { data } = await supabase.auth.getSession();
      const role = data?.session?.user?.user_metadata?.role;
      const isSuperAdmin = data?.session?.user?.user_metadata?.is_super_admin === true;
      if (isSuperAdmin || role === 'admin') {
        setUserRole('admin');
      } else if (role === 'caller') {
        setUserRole('caller');
      } else {
        setUserRole('user');
      }
    };
    fetchRole();
  }, []);

  const displayedSections = React.useMemo(() => {
    if (userRole === 'caller') {
      return [
        {
          title: 'Marketing',
          items: [
            { name: 'My Calls', icon: FileText, href: '/admin/marketing/caller' },
          ],
        },
        {
          title: 'System',
          items: [
            { name: 'Settings', icon: Settings, href: '/admin/settings' },
          ],
        },
      ];
    }
    
    // For Admins and other roles, return all sections but hide the Caller dashboard
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => item.name !== 'Caller' && item.name !== 'My Calls')
    }));
  }, [userRole]);

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
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        {!isCollapsed && (
          <span className="text-lg font-bold text-accent-blue tracking-tight">
            BMTech <span className="text-text-primary">Admin</span>
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md bg-surface border border-border/60 hover:bg-border/50 transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-5 overflow-y-auto custom-scrollbar" data-lenis-prevent>
        {displayedSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 pb-1 text-[10px] font-semibold text-text-secondary uppercase tracking-widest">
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
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 group relative',
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border/40',
                  )}
                  title={isCollapsed ? item.name : undefined}
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
