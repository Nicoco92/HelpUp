import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const roleCookie = request.cookies.get('auth-role')?.value;
    
    if (pathname.startsWith('/dashboard/client') && roleCookie !== 'CLIENT') {
      return NextResponse.redirect(new URL(`/dashboard/${roleCookie?.toLowerCase() || 'login'}`, request.url));
    }
    
    if (pathname.startsWith('/dashboard/provider') && roleCookie !== 'PROVIDER') {
      return NextResponse.redirect(new URL(`/dashboard/${roleCookie?.toLowerCase() || 'login'}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
