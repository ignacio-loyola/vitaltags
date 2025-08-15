import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  const cspDirectives = [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'),
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Apply CSP to all pages except emergency pages (which need to load fast)
  if (!request.nextUrl.pathname.startsWith('/e/')) {
    response.headers.set('Content-Security-Policy', cspDirectives);
  }

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');

  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Caching headers for emergency pages
  if (request.nextUrl.pathname.startsWith('/e/')) {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  }

  // Auth check for owner routes
  if (request.nextUrl.pathname.startsWith('/(owner)') || request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, robots.txt, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};