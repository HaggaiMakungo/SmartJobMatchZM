import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🔒 Middleware running for:', request.nextUrl.pathname);
  
  const token = request.cookies.get('zedsafe_auth_token')?.value || 
                request.cookies.get('access_token')?.value;
  
  console.log('Token found:', !!token);
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect to login if accessing dashboard without token
  if (isDashboard && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth pages with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
};
