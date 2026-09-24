import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../lib/supabase';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export async function verifyAuth(req: NextRequest): Promise<{ user: AuthenticatedUser | null; errorResponse?: NextResponse }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 }),
    };
  }

  const token = authHeader.split(' ')[1];
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
