'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'team' | 'client')[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login page
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && !allowedRoles.includes(role as any)) {
        // Logged in but insufficient role constraints
        router.push('/unauthorized');
      }
    }
  }, [user, loading, role, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(role as any))) {
    return null; // Prevents flashing content before redirect
  }

  return <>{children}</>;
}
