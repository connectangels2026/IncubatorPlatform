import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { verifyAuth } from '@/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase organizations fetch error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      name,
      slug: customSlug,
      description,
      logo_url,
      primary_color,
      secondary_color,
      founder_name,
      founderName,
      founder_email,
      billing_email,
      phone,
      website,
      address,
      city,
      state,
      country,
      postal_code,
      tier = 'free',
      billing_cycle = 'annual',
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Organization name is required' }, { status: 400 });
    }

    const cleanTier = ['free', 'pro', 'enterprise'].includes(tier) ? tier : 'free';
    const cleanCycle = billing_cycle === 'monthly' ? 'monthly' : 'annual';

    // Generate or sanitize slug
    const rawSlug = customSlug || name;
    const baseSlug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const finalSlug = `${baseSlug || 'incubator'}-${Math.random().toString(36).substring(2, 6)}`;

    const maxStartups = cleanTier === 'enterprise' ? 9999 : cleanTier === 'pro' ? 100 : 20;
    const maxMentors = cleanTier === 'enterprise' ? 9999 : cleanTier === 'pro' ? 25 : 10;

    const now = new Date();
    const endsAt = new Date(now);
    if (cleanCycle === 'monthly') {
      endsAt.setDate(endsAt.getDate() + 30);
    } else {
      endsAt.setDate(endsAt.getDate() + 365);
    }

    const primaryEmail = (founder_email || user?.email || '')?.trim() || null;
    const billEmail = (billing_email || primaryEmail)?.trim() || null;
    const resolvedFounder = (founder_name || founderName || user?.email?.split('@')[0] || 'Director')?.trim();

    const insertPayload: Record<string, any> = {
      name: name.trim(),
      slug: finalSlug,
      description: description?.trim() || null,
      logo_url: logo_url?.trim() || null,
      primary_color: primary_color?.trim() || '#1A2151',
      secondary_color: secondary_color?.trim() || '#0066ff',
      founder_name: resolvedFounder,
      founder_email: primaryEmail,
      email: primaryEmail,
      billing_email: billEmail,
      phone: phone?.trim() || null,
      website: website?.trim() || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      country: country?.trim() || null,
      postal_code: postal_code?.trim() || null,
      auth_user_id: user?.id || null,
      subscription_tier: cleanTier,
      subscription_status: 'active',
      subscription_started_at: now.toISOString(),
      subscription_ends_at: endsAt.toISOString(),
      max_startups_allowed: maxStartups,
      max_mentors_allowed: maxMentors,
      is_active: true,
      is_verified: false,
      billing_cycle: cleanCycle,
    };

    // Insert into organizations, with fallback if billing_cycle column does not exist yet
    let result = await supabaseAdmin.from('organizations').insert(insertPayload).select().single();

    if (result.error && result.error.message?.includes('billing_cycle')) {
      delete insertPayload.billing_cycle;
      result = await supabaseAdmin.from('organizations').insert(insertPayload).select().single();
    }

    if (result.error) {
      console.error('Failed to create organization:', result.error);
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    const newOrg = result.data;

    // Link user in public.users table with organization_id and admin role
    if (user?.email) {
      await supabaseAdmin
        .from('users')
        .update({
          organization_id: newOrg.id,
          role: 'admin',
        })
        .eq('email', user.email);
    }

    // Also update auth user metadata if possible
    if (user?.id) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          role: 'admin',
          organization_id: newOrg.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: newOrg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


