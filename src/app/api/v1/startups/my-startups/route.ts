import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'User email required' }, { status: 401 });
    }

    const emailLower = user.email.trim().toLowerCase();

    // Query all active startups where founder_id = user.id OR founder_email = user.email
    const { data: startups, error } = await supabaseAdmin
      .from('startups')
      .select(`
        id,
        name,
        startup_name,
        sector,
        stage,
        logo_url,
        initials,
        organization_id,
        created_at,
        organizations (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .or(`founder_id.eq.${user.id},founder_email.ilike.${emailLower}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[my-startups] Error fetching startups:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (startups || []).map((s: any) => ({
      id: s.id,
      name: s.startup_name || s.name || 'Untitled Startup',
      sector: s.sector || 'Technology',
      stage: s.stage || 'MVP',
      logo_url: s.logo_url || null,
      initials: s.initials || (s.startup_name || s.name || 'ST').slice(0, 2).toUpperCase(),
      incubator_name: s.organizations?.name || 'Assigned Incubator',
      organization_id: s.organization_id,
      created_at: s.created_at,
    }));

    return NextResponse.json({
      success: true,
      total: formatted.length,
      data: formatted,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
