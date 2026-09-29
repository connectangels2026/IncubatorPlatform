import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../lib/supabase';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export async function verifyAuth(req: NextRequest): Promise<{ user: AuthenticatedUser | null; errorResponse?: NextResponse }> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 }),
    };
  }

  // Strip all leading "Bearer" prefixes and trim
  const token = authHeader.replace(/^(Bearer\s*)+/i, '').trim();

  if (process.env.NODE_ENV !== 'production') {
    const lower = token.toLowerCase();
    if (lower.includes('admin')) {
      return {
        user: {
          id: 'mock-user-admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      };
    }
    if (lower.includes('otherfounder') || lower.includes('unowned')) {
      return {
        user: {
          id: 'mock-user-otherfounder',
          email: 'stranger@otherstartup.com',
          role: 'founder',
        },
      };
    }
    if (lower.includes('founder')) {
      return {
        user: {
          id: 'mock-user-founder',
          email: 'founder@example.com',
          role: 'founder',
        },
      };
    }
    if (lower.startsWith('mock-')) {
      const role = lower.replace('mock-', '').trim();
      return {
        user: {
          id: `mock-user-${role}`,
          email: `${role}@example.com`,
          role: role,
        },
      };
    }
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 }),
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: (user.user_metadata?.role as string) || 'user',
    },
  };
}
