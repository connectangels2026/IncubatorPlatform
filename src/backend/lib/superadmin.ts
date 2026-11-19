import { supabaseAdmin } from './supabaseAdmin';

const DEFAULT_SUPERADMIN_EMAILS = ['shadmannc0516@gmail.com'];

/**
 * Checks if the given email belongs to a verified Super Admin.
 * Verifies against the public.superadmin database table.
 */
export async function isSuperAdminEmail(email?: string | null): Promise<boolean> {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return false;

  // 1. Instant check for hardcoded default super admin (avoids unnecessary DB roundtrip)
  if (DEFAULT_SUPERADMIN_EMAILS.includes(cleanEmail)) {
    return true;
  }

  try {
    // 2. Check superadmin and super_admins tables concurrently to avoid sequential roundtrips
    const [saRes, legacyRes] = await Promise.allSettled([
      supabaseAdmin
        .from('superadmin')
        .select('id')
        .ilike('email', cleanEmail)
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('super_admins')
        .select('id')
        .ilike('email', cleanEmail)
        .limit(1)
        .maybeSingle(),
    ]);

    if (saRes.status === 'fulfilled' && saRes.value.data?.id) {
      return true;
    }

    if (legacyRes.status === 'fulfilled' && legacyRes.value.data?.id) {
      return true;
    }
  } catch (err) {
    console.warn('Super Admin DB check warning:', err);
  }

  return false;
}

