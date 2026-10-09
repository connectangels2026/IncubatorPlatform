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
    if (authError) return authError;
    const rawOrgId = req.headers.get('x-org-id') || req.nextUrl.searchParams.get('org_id');
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
      .select('*, organization:organizations(id, name, slug)', { count: 'exact' })
      .is('deleted_at', null);

    if (rawOrgId && rawOrgId !== 'all' && isValidUUID(rawOrgId)) {
      query = query.eq('organization_id', rawOrgId);
    }

    // Role check: Applicants can only see their own applications
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      if (user?.email) {
        query = query.eq('applicant_email', user.email.toLowerCase());
      }
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
    const { orgId: headerOrgId } = requireOrg(req);

    // Resolve target incubator organization
    let targetOrgId = body.organization_id || headerOrgId;
    let organizationRecord: any = null;

    if (body.incubator_slug) {
      const { data: orgBySlug } = await supabaseAdmin
        .from('organizations')
        .select('id, name, email, founder_email')
        .eq('slug', body.incubator_slug)
        .maybeSingle();
      if (orgBySlug) {
        targetOrgId = orgBySlug.id;
        organizationRecord = orgBySlug;
      }
    }

    if (!targetOrgId || !isValidUUID(targetOrgId)) {
      targetOrgId = DEFAULT_ORG_ID;
    }

    if (!organizationRecord) {
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('id, name, email, founder_email')
        .eq('id', targetOrgId)
        .maybeSingle();
      organizationRecord = orgData;
    }

    const payload = {
      organization_id: targetOrgId,
      applicant_name: body.applicant_name,
      applicant_email: body.applicant_email.toLowerCase().trim(),
      applicant_phone: body.applicant_phone || null,
      application_type: body.application_type || 'Incubator',
      cohort_name: body.cohort_name || 'Cohort 2026',
      form_data: body.form_data || {},
      status: 'submitted',
      score: null,
      uploaded_documents: [],
      mou_signed: false,
    };

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    const startupName = body.form_data?.startup_name || body.form_data?.businessName || body.form_data?.name || body.applicant_name;
    const incubatorName = organizationRecord?.name || 'Incubator';

    // 1. Send confirmation email to Startup Applicant
    try {
      const recipientId = user?.id && isValidUUID(user.id) ? user.id : 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
      await NotificationService.createNotification({
        organization_id: targetOrgId,
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

    // 2. Send alert email to Incubator Admin
    try {
      const adminEmail = organizationRecord?.founder_email || organizationRecord?.email;
      if (adminEmail) {
        await NotificationService.createNotification({
          organization_id: targetOrgId,
          recipient_id: 'dfdb0d1a-24a3-4062-98aa-0d723fc23725',
          recipient_name: organizationRecord.name || 'Incubator Admin',
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
