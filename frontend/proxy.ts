import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set this to true to enable password protection
const ENABLE_PASSWORD_PROTECTION = process.env.ENABLE_PASSWORD_PROTECTION === 'true';
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'slza2026';

export default function proxy(request: NextRequest) {
  // Skip password protection if disabled
  if (!ENABLE_PASSWORD_PROTECTION) {
    return NextResponse.next();
  }

  // Allow access to API routes (CRITICAL for calculators to work!)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow access to password page and its assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname.startsWith('/favicon') ||
    request.nextUrl.pathname === '/site-password'
  ) {
    return NextResponse.next();
  }

  // Check if user has valid password cookie
  const passwordCookie = request.cookies.get('site_access');
  
  if (passwordCookie?.value === SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to password page
  const url = request.nextUrl.clone();
  url.pathname = '/site-password';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
