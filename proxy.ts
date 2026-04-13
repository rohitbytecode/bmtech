import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // 1. Maintenance Mode
  if (isMaintenanceMode && pathname !== '/maintenance') {
    if (pathname.includes('.') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-maintenance-mode', 'true');

    return NextResponse.rewrite(new URL('/maintenance', request.url), {
      request: { headers: requestHeaders },
    });
  }

  // 2. Admin Protection
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login' &&
    pathname !== '/admin/enroll' &&
    pathname !== '/admin/hardware-authorization'
  ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const allCookies = request.cookies.getAll();

    const authCookie = allCookies.find(
      (c) =>
        c.name.includes('auth-token') ||
        c.name.includes('supabase.auth.token')
    );

    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      let sessionData;
      const decodedValue = decodeURIComponent(authCookie.value);

      try {
        sessionData = JSON.parse(decodedValue);
      } catch {
        sessionData = JSON.parse(authCookie.value);
      }

      const token =
        sessionData?.access_token ||
        sessionData?.[0]?.access_token ||
        (typeof sessionData === 'string' ? sessionData : null);

      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (
        error ||
        !user ||
        (user.user_metadata?.role !== 'admin' &&
          user.user_metadata?.is_super_admin !== true)
      ) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Hardware Verification
      // Hardware verification DISABLED (temporary bypass)
      // BMTECH_2026

      // const hardwareVerified = request.cookies.get(
      //   'bmtech_hardware_verified'
      // )?.value;

      // if (hardwareVerified !== 'true' || request.cookies.get('bmtech_device_trusted')?.value !== 'true') {
      //   return NextResponse.redirect(new URL('/admin/login', request.url));
      // }
    } catch (e) {
      console.error('Proxy Error:', e);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// ✅ Correct config export
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};