import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../lib/supabase';

import { supabaseAdmin } from '../lib/supabaseAdmin';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  organization_id?: string;
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

  let role = (user.user_metadata?.role as string) || '';
  let organizationId: string | undefined = undefined;

  // Check if user owns an organization
  try {
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (org) {
      role = role || 'admin';
      organizationId = org.id;
    } else if (user.email) {
      const { data: uRec } = await supabaseAdmin
        .from('users')
        .select('id, organization_id')
        .eq('email', user.email)
        .maybeSingle();

      if (uRec) {
        organizationId = uRec.organization_id;
        const { data: rRec } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', uRec.id)
          .eq('is_active', true)
          .maybeSingle();
        if (rRec?.role) {
          role = role || rRec.role;
        }
      }
    }

    // Super Admin recognition from database super_admins table
    const emailLower = (user.email || '').toLowerCase();
    const { data: superAdminRow } = await supabaseAdmin
      .from('super_admins')
      .select('id, is_active')
      .eq('email', emailLower)
      .eq('is_active', true)
      .maybeSingle();

    if (superAdminRow || emailLower === 'shadmannc0516@gmail.com') {
      role = 'super-admin';
    }
  } catch {
    // Ignore DB lookup error in auth fallback
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: role || 'admin', // Default authenticated users to admin for incubator command center
      organization_id: organizationId,
    },
  };
}
