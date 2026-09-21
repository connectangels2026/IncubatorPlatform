import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidToken } from '@/backend/lib/session';

// Setup supabase client for middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if route is protected API route
  const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/v1/') && 
    !req.nextUrl.pathname.includes('/auth/login') && 
    !req.nextUrl.pathname.includes('/auth/signup') &&
    !req.nextUrl.pathname.includes('/auth/refresh-token') &&
    !req.nextUrl.pathname.includes('/auth/google-callback');

  if (isProtectedApiRoute) {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 1. Check Token against our Redis Active Sessions (Step 4 & 5 Requirement)
    const isSessionActive = await isValidToken(token);
    if (!isSessionActive) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    // 2. Verify token signature with Supabase (verifyJWT Requirement)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 3. Role check logic for Super Admin API routes
    if (req.nextUrl.pathname.startsWith('/api/v1/super-admin')) {
      const userRole = user.user_metadata?.role;
      if (userRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/api/v1/:path*'],
};

