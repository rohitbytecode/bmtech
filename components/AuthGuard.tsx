'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'team' | 'client')[];
  fallback?: ReactNode;
}

/**
 * AuthGuard component ensures only authenticated users can access protected routes.
 * Redirects unauthenticated users to login with a return URL.
 * Redirects unauthorized users (insufficient role) to /unauthorized.
 */
export default function AuthGuard({
  children,
  allowedRoles,
  fallback,
}: AuthGuardProps) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      // Still loading, don't redirect yet
      return;
    }

    if (!user) {
      // Not logged in, redirect to login page with return URL
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
      return;
    }

    // User is logged in, check role permissions
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.includes(role as any);

      if (!hasRequiredRole) {
        // User doesn't have required role
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, role, allowedRoles, router, pathname]);

  // Show fallback or loading state
  if (loading || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-slate-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(role as any);

    if (!hasRequiredRole) {
      // Prevent rendering content before redirect
      return null;
    }
  }

  return <>{children}</>;
}
