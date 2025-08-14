import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Ensure SameSite=Strict on our cookies by default if we set any via middleware.
  // Also enforce basic EU-only deploy hint via header for infra (not an access control).
  response.headers.set('X-Region-Policy', 'EU-only')

  // Disallow indexing for sensitive pages
  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/e/') || pathname.startsWith('/c/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // Do not log query params or headers that may contain PII. No logs here.
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


