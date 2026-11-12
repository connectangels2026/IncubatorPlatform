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
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const callerRole = (user?.role || '').toLowerCase();
    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const expertise = searchParams.get('expertise')?.trim().toLowerCase();
    const isAvailableParam = searchParams.get('is_available');
    const statusParam = searchParams.get('status')?.trim().toLowerCase();
    const search = searchParams.get('search')?.trim().toLowerCase();
    const typeParam = searchParams.get('type')?.trim().toLowerCase();

    let query = supabaseAdmin
      .from('mentors')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          full_name,
          email,
          phone,
          profile_picture_url
        )
      `)
      .eq('organization_id', realOrgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (statusParam) {
      if (statusParam === 'active') query = query.eq('is_active', true);
    } else if (isAvailableParam !== null) {
      query = query.eq('is_active', true);
    }

    if (isAvailableParam !== null) {
      query = query.eq('is_available', isAvailableParam === 'true');
    }

    // Filter by mentor type (general / subject_matter_expert / sme)
    if (typeParam) {
      if (typeParam === 'sme' || typeParam === 'subject_matter_expert') {
        query = query.in('mentor_type', ['subject_matter_expert', 'sme', 'SME']);
      } else if (typeParam === 'general') {
        query = query.in('mentor_type', ['general', 'General']);
      }
    }

    const [mentorsRes, sessionsRes, allocationsRes, startupsCountRes] = await Promise.all([
      query,
      supabaseAdmin
        .from('mentorship_sessions')
        .select('id, mentor_id, startup_id, scheduled_date, start_time, end_time, duration_minutes, status, startup_rating')
        .eq('organization_id', realOrgId),
      supabaseAdmin
        .from('startup_mentors')
        .select('mentor_id, startup_id, status, startup:startups(id, startup_name)')
        .eq('organization_id', realOrgId)
        .eq('status', 'active'),
      supabaseAdmin
        .from('startups')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', realOrgId)
        .is('deleted_at', null),
    ]);

    if (mentorsRes.error) throw mentorsRes.error;

    let mentors = mentorsRes.data || [];

    if (statusParam) {
      mentors = mentors.filter((m: any) => {
        const effectiveStatus = (m.status || (m.is_active ? 'active' : 'pending')).toLowerCase();
        return effectiveStatus === statusParam;
      });
    }

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
        const fullName = `${u.first_name || ''} ${u.last_name || ''} ${u.full_name || ''}`.toLowerCase();
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

    // Compute per-mentor and org-wide real aggregates from DB rows
    const todayIso = new Date().toISOString().split('T')[0];
    const monthPrefix = todayIso.slice(0, 7);
    const allSessions = sessionsRes.data || [];
    const allAllocs = allocationsRes.data || [];

    const matchedByMentor = new Map<string, string[]>();
    const uniqueMatchedStartups = new Set<string>();
    for (const al of allAllocs) {
      if (!al.mentor_id || !al.startup_id) continue;
      uniqueMatchedStartups.add(al.startup_id);
      const stObj = Array.isArray(al.startup) ? al.startup[0] : al.startup;
      const stName = stObj?.startup_name || 'Startup';
      const arr = matchedByMentor.get(al.mentor_id) || [];
      if (!arr.includes(stName)) arr.push(stName);
      matchedByMentor.set(al.mentor_id, arr);
    }

    const orgRatings: number[] = [];
    let orgCompletedSessions = 0;
    let orgCompletedMinutes = 0;

    const enrichedMentors = mentors.map((m: any) => {
      const mSessions = allSessions.filter((s: any) => s.mentor_id === m.id);
      const activeMonthSessions = mSessions.filter(
        (s: any) =>
          String(s.scheduled_date || '').startsWith(monthPrefix) &&
          !['cancelled', 'declined'].includes(String(s.status || '').toLowerCase())
      );
      const upcomingSessions = mSessions.filter(
        (s: any) =>
          String(s.scheduled_date || '') >= todayIso &&
          ['requested', 'scheduled'].includes(String(s.status || '').toLowerCase())
      );
      const completedSessions = mSessions.filter(
        (s: any) => String(s.status || '').toLowerCase() === 'completed'
      );

      let completedMin = 0;
      for (const s of completedSessions) {
        orgCompletedSessions += 1;
        const mins =
          typeof s.duration_minutes === 'number' && s.duration_minutes > 0 ? s.duration_minutes : 60;
        completedMin += mins;
        orgCompletedMinutes += mins;
      }

      const ratingVals = mSessions
        .map((s: any) => Number(s.startup_rating))
        .filter((r: number) => !Number.isNaN(r) && r >= 1 && r <= 5);
      for (const r of ratingVals) orgRatings.push(r);

      const hideOtherRatings = callerRole === 'mentor' && m.user_id !== user?.id;
      const avgRating =
        !hideOtherRatings && ratingVals.length > 0
          ? Number((ratingVals.reduce((a, b) => a + b, 0) / ratingVals.length).toFixed(1))
          : 0;

      const weeklyGrid = m.availability_json?.weekly_grid || {};
      const weeklySlotCount = Object.values(weeklyGrid).reduce(
        (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      );
      const openSlotsCount = m.is_available && m.is_active ? Math.max(0, weeklySlotCount - upcomingSessions.length) : 0;
      const matchedList = matchedByMentor.get(m.id) || [];

      return {
        ...m,
        average_rating: avgRating,
        total_reviews: hideOtherRatings ? 0 : ratingVals.length,
        sessions_count: activeMonthSessions.length,
        upcoming_count: upcomingSessions.length,
        completed_sessions_count: completedSessions.length,
        completed_hours: Number((completedMin / 60).toFixed(1)),
        open_slots_count: openSlotsCount,
        matched_startups: matchedList,
        matched_count: matchedList.length,
        max_hours_per_month: m.availability_hours_per_month || 10,
        company: m.company_background || '',
        title: m.job_title || m.availability_json?.job_title || '',
      };
    });

    const totalStartups = startupsCountRes.count || 0;
    const avgFounderRating =
      orgRatings.length > 0
        ? Number((orgRatings.reduce((a, b) => a + b, 0) / orgRatings.length).toFixed(1))
        : 0;

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      total: enrichedMentors.length,
      data: enrichedMentors,
      org_stats: {
        totalActiveMentors: enrichedMentors.filter((m: any) => m.is_active).length,
        availableMentors: enrichedMentors.filter((m: any) => m.is_active && m.is_available).length,
        completedSessionsCount: orgCompletedSessions,
        completedHours: Number((orgCompletedMinutes / 60).toFixed(1)),
        avgFounderRating,
        totalReviews: orgRatings.length,
        matchedStartupsCount: uniqueMatchedStartups.size,
        totalStartupsCount: totalStartups,
        matchVelocityPct: totalStartups > 0 ? Math.min(100, Math.round((uniqueMatchedStartups.size / totalStartups) * 100)) : 0,
      },
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

    const {
      user_id,
      mentor_type,
      expertise_areas,
      primary_expertise,
      specialization_details,
      bio,
      company_background,
      years_of_experience,
      availability_hours_per_month,
    } = body;

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
    const resolvedType = mentor_type === 'subject_matter_expert' || mentor_type === 'sme' || mentor_type === 'SME'
      ? 'subject_matter_expert'
      : 'general';

    const { data: mentor, error: insertError } = await supabaseAdmin
      .from('mentors')
      .insert({
        organization_id: realOrgId,
        user_id,
        mentor_type: resolvedType,
        expertise_areas: formattedExpertise,
        primary_expertise: primary_expertise || formattedExpertise[0] || null,
        specialization_details: specialization_details || null,
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
