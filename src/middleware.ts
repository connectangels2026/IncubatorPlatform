import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidToken } from './lib/session';

// Setup supabase client for middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if route is protected API route or Page route
  const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/v1/') && !req.nextUrl.pathname.includes('/auth/login') && !req.nextUrl.pathname.includes('/auth/signup');
  const isProtectedPageRoute = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/super-admin');

  if (isProtectedApiRoute || isProtectedPageRoute) {
    const authHeader = req.headers.get('Authorization');
    
    // Some routes might use cookies if you implement them later, but for now we expect Authorization header
    if (!authHeader) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    const token = authHeader.split(' ')[1];
    
    // 1. Check Token against our Redis Active Sessions (Step 4 & 5 Requirement)
    const isSessionActive = await isValidToken(token);
    if (!isSessionActive) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 2. Verify token signature with Supabase (verifyJWT Requirement)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 3. Role check logic (requireRole Requirement)
    if (req.nextUrl.pathname.startsWith('/super-admin')) {
      const userRole = user.user_metadata?.role;
      if (userRole !== 'admin') {
        if (isProtectedApiRoute) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/super-admin/:path*', '/api/v1/:path*'],
};

