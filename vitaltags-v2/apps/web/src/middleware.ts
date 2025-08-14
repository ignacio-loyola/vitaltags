import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Get the session cookie
  const sessionCookie = request.cookies.get('vt_sess')
  
  // Check if this is a protected route
  const isProtectedRoute = pathname.startsWith('/dashboard')
  
  // If it's a protected route and there's no session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If user has session and tries to access auth pages, redirect to dashboard
  if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  const response = NextResponse.next()

  // Ensure SameSite=Strict on our cookies by default if we set any via middleware.
  // Also enforce basic EU-only deploy hint via header for infra (not an access control).
  response.headers.set('X-Region-Policy', 'EU-only')

  // Disallow indexing for sensitive pages
  if (pathname.startsWith('/e/') || pathname.startsWith('/c/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // Do not log query params or headers that may contain PII. No logs here.
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


