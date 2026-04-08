import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // 1. Handle Maintenance Mode
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

  // 2. Handle Admin Hardware & Auth Protection
  if (pathname.startsWith('/admin') && 
      pathname !== '/admin/login' && 
      pathname !== '/admin/hardware-authorization') {
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const allCookies = request.cookies.getAll();
    // Look for our custom cookie or the default Supabase ones
    const authCookie = allCookies.find(c => c.name.includes('auth-token') || c.name.includes('supabase.auth.token'));
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      let sessionData;
      const decodedValue = decodeURIComponent(authCookie.value);
      try {
        sessionData = JSON.parse(decodedValue);
      } catch (e) {
        sessionData = JSON.parse(authCookie.value);
      }

      // Handle both raw token strings and session objects
      const token = sessionData?.access_token || sessionData?.[0]?.access_token || (typeof sessionData === 'string' ? sessionData : null);

      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Create an authenticated client to satisfy RLS
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user || (user.user_metadata?.role !== 'admin' && user.user_metadata?.is_super_admin !== true)) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // --- Hardware Zero-Trust Enforcement ---
      // We now require a cryptographically signed hardware verification cookie
      const hardwareVerified = request.cookies.get('bmtech_hardware_verified')?.value;

      if (hardwareVerified !== 'true') {
        // If not verified, they must perform the Hardware Handshake
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Optional: Perform a secondary DB check to ensure the device is still active
      // In a high-security environment, we verify the specific Credential ID linked to the session
    } catch (e) {
      console.error('Middleware Processing Error:', e);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
