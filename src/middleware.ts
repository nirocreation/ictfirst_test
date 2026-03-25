import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session_token')?.value;
  const { pathname } = req.nextUrl;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');

  // 1. PUBLIC ASSETS: Ignore these completely
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. NO TOKEN CASE
  if (!token) {
    // If trying to access protected areas without a token, go to login
    if (pathname.startsWith('/student') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    // 3. VERIFY TOKEN
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as string;

    // 4. LOGIN REDIRECT: If already logged in, don't show the login page
    if (pathname === '/login') {
      const dest = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    // 5. ADMIN PROTECTION
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        console.warn(`🚨 Unauthorized Admin access attempt by: ${userRole}`);
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // 6. STUDENT PROTECTION
    if (pathname.startsWith('/student')) {
      // Admins are usually allowed to see student pages; otherwise check for 'student' only
      if (userRole !== 'student' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    // Token is likely expired or tampered with
    console.error("Middleware Auth Error:", error);
    const loginUrl = new URL('/login', req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session_token'); // Wipe the invalid token
    return response;
  }
}

// Ensure the middleware runs on the correct paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/login',
  ],
};