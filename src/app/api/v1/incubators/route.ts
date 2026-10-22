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
      website,
      city,
      description,
      founderName,
      tier = 'free',
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Organization name is required' }, { status: 400 });
    }

    const cleanTier = ['free', 'pro', 'enterprise'].includes(tier) ? tier : 'free';
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug || 'incubator'}-${Math.random().toString(36).substring(2, 7)}`;

    const maxStartups = cleanTier === 'enterprise' ? 9999 : cleanTier === 'pro' ? 100 : 20;
    const maxMentors = cleanTier === 'enterprise' ? 9999 : cleanTier === 'pro' ? 25 : 10;

    const { data: newOrg, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: name.trim(),
        slug,
        website: website?.trim() || null,
        city: city?.trim() || null,
        description: description?.trim() || null,
        founder_name: founderName?.trim() || user?.email?.split('@')[0] || 'Founder',
        founder_email: user?.email || null,
        auth_user_id: user?.id || null,
        subscription_tier: cleanTier,
        subscription_status: 'active',
        max_startups_allowed: maxStartups,
        max_mentors_allowed: maxMentors,
        is_active: true,
        is_verified: false,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Failed to create organization:', orgError);
      return NextResponse.json({ success: false, error: orgError.message }, { status: 500 });
    }

    // Link user if user exists in public.users
    if (user?.email) {
      await supabaseAdmin
        .from('users')
        .update({
          organization_id: newOrg.id,
          role: 'admin',
        })
        .eq('email', user.email);
    }

    return NextResponse.json({ success: true, data: newOrg });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

