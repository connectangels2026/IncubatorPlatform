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

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const { data: mentor, error } = await supabaseAdmin
      .from('mentors')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          email,
          phone,
          profile_picture_url
        )
      `)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (error || !mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: mentor,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.mentor_type !== undefined) {
      updates.mentor_type = body.mentor_type === 'subject_matter_expert' || body.mentor_type === 'sme' || body.mentor_type === 'SME'
        ? 'subject_matter_expert'
        : 'general';
    }
    if (body.primary_expertise !== undefined) updates.primary_expertise = body.primary_expertise;
    if (body.specialization_details !== undefined) updates.specialization_details = body.specialization_details;
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.company_background !== undefined) updates.company_background = body.company_background;
    if (body.years_of_experience !== undefined) updates.years_of_experience = Number(body.years_of_experience);
    if (body.preferred_meeting_mode !== undefined) updates.preferred_meeting_mode = body.preferred_meeting_mode;
    if (body.timezone !== undefined) updates.timezone = body.timezone;
    if (body.calendar_url !== undefined) updates.calendar_url = body.calendar_url;
    if (body.linkedin_url !== undefined) updates.linkedin_url = body.linkedin_url;
    if (body.is_available !== undefined) updates.is_available = Boolean(body.is_available);
    if (body.availability_hours_per_month !== undefined) updates.availability_hours_per_month = Number(body.availability_hours_per_month);

    if (body.expertise_areas !== undefined) {
      updates.expertise_areas = Array.isArray(body.expertise_areas)
        ? body.expertise_areas
        : typeof body.expertise_areas === 'string'
        ? body.expertise_areas.split(',').map((e: string) => e.trim()).filter(Boolean)
        : [];
      if (!updates.primary_expertise && updates.expertise_areas.length > 0) {
        updates.primary_expertise = updates.expertise_areas[0];
      }
    }

    if (body.availability_json !== undefined) {
      updates.availability_json = body.availability_json;
    }

    const { data: updatedMentor, error: updateError } = await supabaseAdmin
      .from('mentors')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          email,
          phone,
          profile_picture_url
        )
      `)
      .single();

    if (updateError) throw updateError;
    if (!updatedMentor) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: updatedMentor,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Only admins can deactivate mentors
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can deactivate mentors' },
        { status: 403 }
      );
    }

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    // Soft delete: is_active = false
    const { data: mentor, error } = await supabaseAdmin
      .from('mentors')
      .update({ is_active: false, is_available: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select()
      .single();

    if (error) throw error;
    if (!mentor) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Mentor deactivated successfully',
      data: mentor,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
