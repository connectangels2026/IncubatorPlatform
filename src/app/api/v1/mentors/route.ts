import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const expertise = searchParams.get('expertise')?.trim().toLowerCase();
    const isAvailableParam = searchParams.get('is_available');
    const search = searchParams.get('search')?.trim().toLowerCase();

    let query = supabaseAdmin
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
      .eq('organization_id', realOrgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (isAvailableParam !== null) {
      query = query.eq('is_available', isAvailableParam === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    let mentors = data || [];

    // Filter by expertise (checks JSON array expertise_areas and primary_expertise)
    if (expertise) {
      mentors = mentors.filter((m) => {
        const primary = (m.primary_expertise || '').toLowerCase();
        const areas = Array.isArray(m.expertise_areas)
          ? m.expertise_areas.map((a: any) => String(a).toLowerCase())
          : [];
        return primary.includes(expertise) || areas.some((a: string) => a.includes(expertise));
      });
    }

    // Filter by search keyword across name, email, bio, company
    if (search) {
      mentors = mentors.filter((m) => {
        const u = m.user || {};
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        const bio = (m.bio || '').toLowerCase();
        const company = (m.company_background || '').toLowerCase();
        return (
          fullName.includes(search) ||
          email.includes(search) ||
          bio.includes(search) ||
          company.includes(search)
        );
      });
    }

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      total: mentors.length,
      data: mentors,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Only admins can create mentors
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can create mentor profiles' },
        { status: 403 }
      );
    }

    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { user_id, expertise_areas, bio, company_background, years_of_experience, availability_hours_per_month } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'Validation Error: user_id is required' }, { status: 400 });
    }

    // Verify user exists and belongs to org
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, organization_id, email, first_name, last_name')
      .eq('id', user_id)
      .eq('organization_id', realOrgId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found in this organization' },
        { status: 404 }
      );
    }

    // Check if mentor profile already exists for this user
    const { data: existingMentor } = await supabaseAdmin
      .from('mentors')
      .select('id')
      .eq('user_id', user_id)
      .eq('organization_id', realOrgId)
      .maybeSingle();

    if (existingMentor) {
      return NextResponse.json(
        { error: 'Mentor profile already exists for this user', mentor_id: existingMentor.id },
        { status: 409 }
      );
    }

    // Expertise areas stored as JSON array
    const formattedExpertise = Array.isArray(expertise_areas)
      ? expertise_areas
      : typeof expertise_areas === 'string'
      ? expertise_areas.split(',').map((e) => e.trim()).filter(Boolean)
      : [];

    const hoursCapacity = availability_hours_per_month !== undefined ? Number(availability_hours_per_month) : 10;

    const { data: mentor, error: insertError } = await supabaseAdmin
      .from('mentors')
      .insert({
        organization_id: realOrgId,
        user_id,
        expertise_areas: formattedExpertise,
        primary_expertise: formattedExpertise[0] || body.primary_expertise || null,
        bio: bio || null,
        company_background: company_background || null,
        years_of_experience: years_of_experience ? Number(years_of_experience) : null,
        availability_hours_per_month: hoursCapacity,
        availability_json: body.availability_json || {},
        is_available: body.is_available !== undefined ? Boolean(body.is_available) : true,
        is_active: true,
      })
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

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      message: 'Mentor profile created successfully',
      data: mentor,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
