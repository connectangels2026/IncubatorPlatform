import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    const rawOrgId = req.headers.get('x-org-id') || req.nextUrl.searchParams.get('org_id');
    if (authError && !rawOrgId) return authError;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const applicationType = searchParams.get('application_type');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabaseAdmin
      .from('applications')
      .select('*, organization:organizations!organization_id(id, name, slug)', { count: 'exact' })
      .is('deleted_at', null);

    const role = user?.role?.toLowerCase() || '';
    const userEmail = user?.email?.toLowerCase();
    const effectiveOrgId = (rawOrgId && isValidUUID(rawOrgId)) ? rawOrgId : (user?.organization_id && isValidUUID(user.organization_id) ? user.organization_id : null);

    if (role === 'super-admin' || rawOrgId === 'all') {
      // Super admin or explicit 'all' shows all applications
    } else if (effectiveOrgId) {
      // Incubator view: show applications forwarded/assigned to this incubator
      query = query.eq('organization_id', effectiveOrgId);
    } else if (userEmail) {
      // Founder view: show applications submitted by this applicant email
      query = query.eq('applicant_email', userEmail);
    }

    if (status) query = query.eq('status', status);
    if (applicationType) query = query.eq('application_type', applicationType);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);
    if (search) query = query.or(`applicant_name.ilike.%${search}%,applicant_email.ilike.%${search}%`);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      organization_id: rawOrgId || 'all',
      total: count ?? data?.length ?? 0,
      data: data || [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.applicant_name || !body.applicant_email) {
      return NextResponse.json(
        { error: 'Validation Error: applicant_name and applicant_email are required' },
        { status: 400 }
      );
    }

    // Try optional auth or fallback to guest applicant
    const { user } = await verifyAuth(req);
    const cleanEmail = body.applicant_email.toLowerCase().trim();
    const targetIncubatorName = (body.incubator_name || body.incubator_name_text || body.form_data?.incubatorName || '').trim();

    // 1. Enforce 5-application limit on backend
    const { data: existingApps, error: countErr } = await supabaseAdmin
      .from('applications')
      .select('id, incubator_name_text')
      .ilike('applicant_email', cleanEmail)
      .is('deleted_at', null);

    if (countErr) throw countErr;

    if (existingApps && existingApps.length >= 5) {
      return NextResponse.json(
        { error: 'Application Limit Reached (5/5). You cannot submit applications to more than 5 incubators.' },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate applications to the same incubator
    if (targetIncubatorName && existingApps) {
      const isDuplicate = existingApps.some(
        (a) => (a.incubator_name_text || '').trim().toLowerCase() === targetIncubatorName.toLowerCase()
      );
      if (isDuplicate) {
        return NextResponse.json(
          { error: `You have already applied to "${targetIncubatorName}". Duplicate applications to the same incubator are prevented.` },
          { status: 400 }
        );
      }
    }

    // 3. Organization ID must stay NULL until an incubator accepts the application
    const payload: any = {
      organization_id: null,
      applicant_name: body.applicant_name,
      applicant_email: cleanEmail,
      applicant_phone: body.applicant_phone || null,
      application_type: body.application_type || 'Incubator',
      cohort_name: body.cohort_name || 'Cohort 2026',
      form_data: body.form_data || {},
      status: 'submitted',
      score: null,
      uploaded_documents: [],
      mou_signed: false,
      incubator_name_text: targetIncubatorName || null,
      super_admin_status: 'pending',
    };

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    const startupName = body.form_data?.startup_name || body.form_data?.businessName || body.form_data?.name || body.applicant_name;
    const incubatorName = targetIncubatorName || 'Incubator';

    // 1. Send confirmation email to Startup Applicant
    try {
      const recipientId = user?.id && isValidUUID(user.id) ? user.id : 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
      await NotificationService.createNotification({
        organization_id: null,
        recipient_id: recipientId,
        recipient_name: body.applicant_name,
        recipient_email: body.applicant_email,
        title: `Application Received: ${startupName} to ${incubatorName}`,
        message: `Thank you for submitting your application to ${incubatorName} for the ${payload.application_type} program. The committee has received your submission.`,
        notification_type: 'application_submission',
        send_email: true,
        send_in_app: true,
        related_entity_type: 'application',
        related_entity_id: data.id,
        metadata: {
          startup_name: startupName,
          cohort: data.cohort_name,
          program: payload.application_type,
          incubator: incubatorName,
        },
      });
    } catch (applicantNotifErr) {
      console.warn('Failed to dispatch applicant confirmation notification:', applicantNotifErr);
    }

    // 2. Alert Incubator Admin if matching organization exists
    try {
      const { data: orgFound } = await supabaseAdmin
        .from('organizations')
        .select('name, email, founder_email')
        .ilike('name', `%${targetIncubatorName}%`)
        .maybeSingle();

      const adminEmail = orgFound?.founder_email || orgFound?.email;
      if (adminEmail) {
        await NotificationService.createNotification({
          organization_id: null,
          recipient_id: 'dfdb0d1a-24a3-4062-98aa-0d723fc23725',
          recipient_name: orgFound?.name || 'Incubator Admin',
          recipient_email: adminEmail,
          title: `New Application Received: ${startupName}`,
          message: `A new application has been submitted by ${body.applicant_name} (${body.applicant_email}) for the ${payload.application_type} program.`,
          notification_type: 'application_submission',
          send_email: true,
          send_in_app: true,
          related_entity_type: 'application',
          related_entity_id: data.id,
          metadata: {
            startup_name: startupName,
            applicant: body.applicant_name,
            email: body.applicant_email,
            program: payload.application_type,
          },
        });
      }
    } catch (adminNotifErr) {
      console.warn('Failed to dispatch incubator admin notification:', adminNotifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. Confirmation notification dispatched.',
      data,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
