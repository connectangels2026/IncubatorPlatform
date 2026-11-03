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

  try {
    // 1. Check superadmin table
    const { data: saRow, error: saErr } = await supabaseAdmin
      .from('superadmin')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (!saErr && saRow?.id) {
      return true;
    }

    // 2. Fallback check for super_admins table
    const { data: legacyRow } = await supabaseAdmin
      .from('super_admins')
      .select('id, email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (legacyRow?.id) {
      return true;
    }
  } catch (err) {
    console.warn('Super Admin DB check warning:', err);
  }

  // 3. Fallback for hardcoded default super admin
  return DEFAULT_SUPERADMIN_EMAILS.includes(cleanEmail);
}

