import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';

export const dynamic = 'force-dynamic';

const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

async function resolveDbUser(authUser: { id: string; email?: string }) {
  if (isValidUUID(authUser.id)) {
    const { data: byId } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, first_name, last_name, phone, role, organization_id')
      .eq('id', authUser.id)
      .maybeSingle();
    if (byId) return byId;
  }

  if (authUser.email) {
    const { data: byEmail } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, first_name, last_name, phone, role, organization_id')
      .ilike('email', authUser.email.trim())
      .maybeSingle();
    if (byEmail) return byEmail;
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await resolveDbUser(user);
    let existingApplication: any = null;

    if (dbUser?.id) {
      const { data: mentorRow } = await supabaseAdmin
        .from('mentors')
        .select(`
          id,
          organization_id,
          expertise_areas,
          industry_experience,
          company_background,
          years_of_experience,
          availability_hours_per_month,
          preferred_meeting_mode,
          timezone,
          availability_json,
          bio,
          linkedin_url,
          is_active,
          is_available,
          created_at,
          organization:organizations (
            id,
            name,
            city,
            state
          )
        `)
        .eq('user_id', dbUser.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mentorRow) {
        existingApplication = mentorRow;
      }
    }

    const fullName =
      dbUser?.full_name ||
      [dbUser?.first_name, dbUser?.last_name].filter(Boolean).join(' ').trim() ||
      '';

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser?.id || user.id,
        email: dbUser?.email || user.email || '',
        fullName,
        phone: dbUser?.phone || '',
        role: dbUser?.role || user.role || null,
      },
      existingApplication,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      full_name,
      phone,
      job_title,
      company_background,
      linkedin_url,
      expertise_areas,
      preferred_stages,
      years_of_experience,
      availability_hours_per_month,
      preferred_meeting_mode,
      timezone,
      bio,
      organization_id,
      invited_via_org_id,
    } = body;

    if (!full_name?.trim() || full_name.trim().length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!job_title?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }
    if (!company_background?.trim()) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 });
    }
    if (!linkedin_url?.trim()) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 });
    }
    if (!Array.isArray(expertise_areas) || expertise_areas.length === 0 || expertise_areas.length > 3) {
      return NextResponse.json({ error: 'Select between 1 and 3 domains of expertise' }, { status: 400 });
    }
    if (!Array.isArray(preferred_stages) || preferred_stages.length === 0) {
      return NextResponse.json({ error: 'Select at least one preferred startup stage' }, { status: 400 });
    }
    if (!bio?.trim() || bio.trim().length < 30 || bio.trim().length > 500) {
      return NextResponse.json({ error: 'Bio must be between 30 and 500 characters' }, { status: 400 });
    }
    if (!organization_id || !isValidUUID(organization_id)) {
      return NextResponse.json({ error: 'Please select a valid target incubator' }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('id', organization_id)
      .maybeSingle();

    if (orgError || !org) {
      return NextResponse.json({ error: 'Selected incubator organization was not found' }, { status: 404 });
    }

    const trimmedName = full_name.trim();
    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] || trimmedName;
    const lastName = nameParts.slice(1).join(' ') || null;

    let dbUser = await resolveDbUser(user);

    if (!dbUser) {
      const userIdToInsert = isValidUUID(user.id) ? user.id : undefined;
      const { data: createdUser, error: userCreateErr } = await supabaseAdmin
        .from('users')
        .insert({
          ...(userIdToInsert ? { id: userIdToInsert } : {}),
          organization_id: org.id,
          email: (user.email || '').trim().toLowerCase(),
          phone: phone.trim(),
          first_name: firstName,
          last_name: lastName,
          full_name: trimmedName,
          bio: bio.trim(),
          linkedin_url: linkedin_url.trim(),
          role: 'mentor',
          is_active: true,
          email_verified: true,
        })
        .select('id, email, full_name, first_name, last_name, phone, role, organization_id')
        .single();

      if (userCreateErr) throw userCreateErr;
      dbUser = createdUser;
    } else {
      const userUpdates: Record<string, any> = {
        full_name: trimmedName,
        first_name: firstName,
        last_name: lastName,
        phone: phone.trim(),
        bio: bio.trim(),
        linkedin_url: linkedin_url.trim(),
        updated_at: new Date().toISOString(),
      };
      if (!dbUser.role || dbUser.role === 'user' || dbUser.role === 'pending') {
        userUpdates.role = 'mentor';
      }
      await supabaseAdmin.from('users').update(userUpdates).eq('id', dbUser.id);
    }

    const { data: existingMentor } = await supabaseAdmin
      .from('mentors')
      .select('id, organization_id, is_active')
      .eq('user_id', dbUser.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (existingMentor) {
      return NextResponse.json(
        { error: 'You have already submitted a mentor application.', mentor_id: existingMentor.id },
        { status: 409 }
      );
    }

    const submittedAt = new Date().toISOString();
    const { data: createdMentor, error: insertError } = await supabaseAdmin
      .from('mentors')
      .insert({
        organization_id: org.id,
        user_id: dbUser.id,
        expertise_areas,
        industry_experience: preferred_stages.join(', '),
        company_background: company_background.trim(),
        years_of_experience: Math.min(50, Math.max(1, Number(years_of_experience) || 1)),
        availability_hours_per_month: Math.min(40, Math.max(2, Number(availability_hours_per_month) || 8)),
        preferred_meeting_mode: preferred_meeting_mode || 'video',
        timezone: timezone || 'Asia/Kolkata',
        availability_json: {
          application_status: 'pending',
          job_title: job_title.trim(),
          preferred_stages,
          invited_via_org_id: invited_via_org_id || null,
          submitted_at: submittedAt,
        },
        bio: bio.trim(),
        linkedin_url: linkedin_url.trim(),
        is_available: false,
        is_active: false,
      })
      .select(`
        *,
        organization:organizations (
          id,
          name,
          city,
          state
        )
      `)
      .single();

    if (insertError) throw insertError;

    // Best-effort notification to incubator admins
    try {
      const { data: admins } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('organization_id', org.id)
        .in('role', ['admin', 'incubator_admin', 'incubator'])
        .limit(5);

      if (admins && admins.length > 0) {
        await supabaseAdmin.from('notifications').insert(
          admins.map((admin) => ({
            organization_id: org.id,
            recipient_id: admin.id,
            title: 'New Mentor Application',
            message: `${trimmedName} (${job_title.trim()} at ${company_background.trim()}) applied to join ${org.name} as a mentor.`,
            notification_type: 'mentor_application',
            related_entity_type: 'mentor',
            related_entity_id: createdMentor.id,
          }))
        );
      }
    } catch (notifyErr) {
      console.warn('Mentor application notification skipped:', notifyErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Mentor application submitted successfully',
        data: createdMentor,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}

