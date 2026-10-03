import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id: startupId } = await params;
    const realOrgId = resolveOrg(orgId);

    // Verify startup exists
    const { data: startup, error: startupErr } = await supabaseAdmin
      .from('startups')
      .select('id, name, sector, stage')
      .eq('id', startupId)
      .eq('organization_id', realOrgId)
      .single();

    if (startupErr || !startup) {
      return NextResponse.json({ error: 'Startup not found for this organization' }, { status: 404 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('startup_reviews')
      .select('*')
      .eq('startup_id', startupId)
      .eq('organization_id', realOrgId)
      .order('review_period_start', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      startup_id: startupId,
      startup_name: startup.name,
      total_reviews: reviews?.length || 0,
      data: reviews || [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}
