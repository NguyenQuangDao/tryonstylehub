import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';
 

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // API routes are handled separately
  const isApiRoute = pathname.startsWith('/api');

  // Allow access to public routes and API routes
  if (isPublicPath || isApiRoute) {
    // If user is already logged in and trying to access login/register, redirect to home
    if (isPublicPath && token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!token) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token validity
  const payload = await verifyToken(token);
  if (!payload) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for protected areas
  const isAdminArea = pathname.startsWith('/admin');
  const isSellerArea = pathname.startsWith('/seller');

  const role = (payload as any).role as string | undefined;
  if (isAdminArea) {
    if (role && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (isSellerArea) {
    const isRegisterShop = pathname.startsWith('/seller/register-shop');
    if (!isRegisterShop) {
      if (role && role !== 'SELLER') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
