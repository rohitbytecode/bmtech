import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled in environment variables
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // If maintenance mode is off, proceed normally
  if (!isMaintenanceMode) {
    return NextResponse.next();
  }

  // If we are already on the maintenance page, don't rewrite to avoid infinite loops,
  // but still inject the header so the layout can hide the header section.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-maintenance-mode', 'true');

  if (request.nextUrl.pathname === '/maintenance') {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Rewrite all other requests to the maintenance page and pass the header
  return NextResponse.rewrite(new URL('/maintenance', request.url), {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Note: "admin" has been explicitly removed so all administration routes 
     * are ALSO disabled during maintenance mode.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
