import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup supabase client for middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // ---------------------------------------------------------------------------
  // 0. LEGACY ROUTE REDIRECTION (/dashboard/* -> /incubator/*)
  // ---------------------------------------------------------------------------
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const newPath = pathname.replace(/^\/dashboard/, '/incubator');
    const redirectUrl = new URL(newPath, req.url);
    redirectUrl.search = req.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // ---------------------------------------------------------------------------
  // 1. PAGE ROUTE PROTECTION (Redirect unauthenticated users to /login)
  // ---------------------------------------------------------------------------
  const isSuperAdminPage = pathname.startsWith('/super-admin') && !pathname.startsWith('/super-admin/login');
  const isProtectedUserPage =
    pathname.startsWith('/incubator') ||
    pathname.startsWith('/startup/dashboard') ||
    pathname.includes('/status') ||
    pathname === '/choose-role';

  if (isSuperAdminPage || isProtectedUserPage) {
    const allCookies = req.cookies.getAll();
    const hasSupabaseCookie = allCookies.some(
      (c) => c.name.startsWith('sb-') && (c.name.endsWith('-auth-token') || c.name.includes('access-token'))
    );
    const hasRefreshToken = Boolean(req.cookies.get('refresh_token')?.value);
    const hasAuthSession = hasSupabaseCookie || hasRefreshToken;

    if (!hasAuthSession) {
      const redirectPath = isSuperAdminPage ? '/super-admin/login' : '/login';
      const loginUrl = new URL(redirectPath, req.url);
      loginUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  // ---------------------------------------------------------------------------
  // 2. API ROUTE PROTECTION
  // ---------------------------------------------------------------------------
  // Item 5: Only public initial application submission and status lookup are exempt
  const isPublicApplicationAction =
    (req.method === 'POST' && pathname === '/api/v1/applications') ||
    pathname.startsWith('/api/v1/applications/status');

  const isProtectedApiRoute =
    pathname.startsWith('/api/v1/') &&
    !pathname.includes('/auth/login') &&
    !pathname.includes('/auth/signup') &&
    !pathname.includes('/auth/refresh-token') &&
    !pathname.includes('/auth/forgot-password') &&
    !pathname.includes('/auth/reset-password') &&
    !pathname.includes('/auth/verify-email') &&
    !pathname.includes('/auth/google-callback') &&
    !pathname.includes('/reports/dashboard') &&
    !(req.method === 'GET' && pathname === '/api/v1/incubators') &&
    !isPublicApplicationAction;

  if (isProtectedApiRoute) {
    let authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    // If Authorization header is absent, check Supabase auth token cookie
    if (!authHeader) {
      const directCookie =
        req.cookies.get('sb-access-token')?.value ||
        req.cookies.get('access_token')?.value;
      if (directCookie) {
        authHeader = `Bearer ${directCookie}`;
      } else {
        const allCookies = req.cookies.getAll();
        const sbCookie = allCookies.find(
          (c) => c.name.startsWith('sb-') && (c.name.endsWith('-auth-token') || c.name.includes('access-token'))
        );
        if (sbCookie) {
          try {
            const parsed = JSON.parse(decodeURIComponent(sbCookie.value));
            const tokenVal = parsed.access_token || (Array.isArray(parsed) ? parsed[0] : null);
            if (tokenVal) authHeader = `Bearer ${tokenVal}`;
            else authHeader = `Bearer ${sbCookie.value}`;
          } catch {
            authHeader = `Bearer ${sbCookie.value}`;
          }
        }
      }
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    // Item 4: Support dev/test mock tokens strictly on localhost
    const host = req.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const cleanToken = token.replace(/^(Bearer\s*)+/i, '').trim().toLowerCase();
    if (
      process.env.NODE_ENV !== 'production' &&
      isLocalhost &&
      (cleanToken.includes('mock') || cleanToken.includes('admin') || cleanToken.includes('founder'))
    ) {
      return res;
    }

    // Verify token signature with Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    // Role check logic for Super Admin API routes
    if (pathname.startsWith('/api/v1/super-admin')) {
      const userRole = user.user_metadata?.role;
      const emailLower = (user.email || '').toLowerCase().trim();
      const isSuperAdmin = userRole === 'super-admin' || userRole === 'super_admin' || emailLower === 'shadmannc0516@gmail.com';
      if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/api/v1/:path*',
    '/incubator',
    '/incubator/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/startup/dashboard',
    '/startup/dashboard/:path*',
    '/super-admin',
    '/super-admin/:path*',
    '/choose-role',
    '/programs/preincubator/status',
    '/programs/preincubator/status/:path*',
    '/programs/:path*/status',
    '/programs/:path*/status/:subpath*',
  ],
};
