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
    const isMine = searchParams.get('mine') === 'true';

    if (isMine && (user?.id || userEmail)) {
      // Direct "mine=true" request by founder/applicant
      if (user?.id && userEmail) {
        query = query.or(`created_by.eq.${user.id},applicant_email.ilike.${userEmail}`);
      } else if (userEmail) {
        query = query.ilike('applicant_email', userEmail);
      } else if (user?.id) {
        query = query.eq('created_by', user.id);
      }
    } else if (role === 'super-admin' || rawOrgId === 'all') {
      // Super admin or explicit 'all' shows all applications
    } else if (effectiveOrgId && (role === 'admin' || role === 'incubator_admin' || role === 'incubator')) {
      // Incubator view: show applications assigned or accepted by this incubator
      query = query.or(`organization_id.eq.${effectiveOrgId},selected_incubator_id.eq.${effectiveOrgId},form_data->>selected_incubator_id.eq.${effectiveOrgId}`);
    } else if (userEmail || user?.id) {
      // Founder view: show applications submitted by this applicant email or user id
      if (user?.id && userEmail) {
        query = query.or(`created_by.eq.${user.id},applicant_email.ilike.${userEmail}`);
      } else if (userEmail) {
        query = query.ilike('applicant_email', userEmail);
      } else if (user?.id) {
        query = query.eq('created_by', user.id);
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
      applications: data || [],
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

    // Issue 1: Admin / Incubator Admin accounts must NOT create startup records or applications
    const callerRole = (user?.role || '').toLowerCase();
    if (callerRole === 'admin' || callerRole === 'incubator_admin' || callerRole === 'incubator' || callerRole === 'super-admin' || callerRole === 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden: Incubator administrators and Super Admins cannot submit startup applications.' },
        { status: 403 }
      );
    }

    // Check database users table for role by email
    const emailToCheck = (user?.email || cleanEmail).toLowerCase().trim();
    if (emailToCheck) {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('email', emailToCheck)
        .maybeSingle();

      const dbRole = (dbUser?.role || '').toLowerCase();
      if (dbRole === 'admin' || dbRole === 'incubator_admin' || dbRole === 'incubator' || dbRole === 'super-admin' || dbRole === 'super_admin') {
        return NextResponse.json(
          { error: 'Forbidden: Incubator administrators and Super Admins cannot submit startup applications.' },
          { status: 403 }
        );
      }
    }

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

    // Resolve user ID for created_by (must exist in public.users to satisfy foreign key)
    let createdByUserId: string | null = null;
    const targetUserId = user?.id;

    if (targetUserId) {
      // 1. Check if auth user ID exists in public.users
      const { data: userById } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', targetUserId)
        .maybeSingle();

      if (userById?.id) {
        createdByUserId = userById.id;
      }
    }

    if (!createdByUserId && cleanEmail) {
      // 2. Check if user with this email exists in public.users
      const { data: userByEmail } = await supabaseAdmin
        .from('users')
        .select('id')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (userByEmail?.id) {
        createdByUserId = userByEmail.id;
      }
    }

    if (!createdByUserId && targetUserId && cleanEmail) {
      // 3. Auto-provision record into public.users so foreign key constraint is satisfied
      try {
        const { data: newUser } = await supabaseAdmin
          .from('users')
          .insert({
            id: targetUserId,
            email: cleanEmail,
            full_name: body.applicant_name,
            role: 'founder',
          })
          .select('id')
          .maybeSingle();

        if (newUser?.id) {
          createdByUserId = newUser.id;
        }
      } catch (userProvisionErr) {
        console.warn('Auto-provisioning public.users record skipped/failed:', userProvisionErr);
      }
    }

    // 4. Final safety guard: If the resolved ID does not exist in public.users, set null to prevent foreign key violation
    if (createdByUserId) {
      const { data: verifyUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', createdByUserId)
        .maybeSingle();

      if (!verifyUser?.id) {
        createdByUserId = null;
      }
    }

    // Link to existing startup if founder already has one and synchronize application fields
    let startupId: string | null = null;
    try {
      const { data: existingStartup } = await supabaseAdmin
        .from('startups')
        .select('*')
        .ilike('founder_email', cleanEmail)
        .maybeSingle();

      const fd = body.form_data || {};
      const desc =
        fd.businessDescription ||
        fd.description ||
        fd.solutionOverview ||
        fd.oneSentencePitch ||
        fd.problemStatement ||
        fd.problemSolved ||
        body.pitch ||
        null;
      const founderName = body.applicant_name || fd.fullName || fd.founderName || fd.founder_name || null;
      const website = fd.website || fd.companyWebsite || fd.websiteUrl || fd.url || fd.prototypeLink || null;
      const phone = body.applicant_phone || fd.phone || fd.phoneNumber || null;
      const sector = fd.industryVertical || fd.sector || null;

      if (existingStartup?.id) {
        startupId = existingStartup.id;
        const updates: Record<string, any> = {};
        if (desc && (!existingStartup.description || existingStartup.description.trim() === '')) updates.description = desc;
        if (founderName && (!existingStartup.founder_name || existingStartup.founder_name.toLowerCase() === 'founder')) {
          updates.founder_name = founderName;
        }
        if (!updates.founder_name && (!existingStartup.founder_name || existingStartup.founder_name.toLowerCase() === 'founder')) {
          const { data: uData } = await supabaseAdmin.from('users').select('full_name').ilike('email', cleanEmail).maybeSingle();
          if (uData?.full_name?.trim() && uData.full_name.trim().toLowerCase() !== 'founder') {
            updates.founder_name = uData.full_name.trim();
          }
        }
        if (website && (!existingStartup.website || existingStartup.website.trim() === '')) updates.website = website;
        if (phone) updates.founder_phone = phone;
        if (sector) updates.sector = sector;
        if (fd.prototypeLink) updates.demo_url = fd.prototypeLink;

        const funding = fd.externalFundingRaised || fd.fundingRequired;
        if (funding && (!existingStartup.funding_raised || Number(existingStartup.funding_raised) === 0)) {
          const parsed = parseFloat(String(funding).replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) updates.funding_raised = parsed;
        }
        const annualRev = fd.revenue12Months || fd.projectedRevenue12M;
        if (annualRev && (!existingStartup.annual_revenue || Number(existingStartup.annual_revenue) === 0)) {
          const parsedRev = parseFloat(String(annualRev).replace(/[^0-9.]/g, ''));
          if (!isNaN(parsedRev) && parsedRev > 0) {
            updates.annual_revenue = parsedRev;
            updates.mrr = Math.round(parsedRev / 12);
            updates.monthly_revenue = Math.round(parsedRev / 12);
          }
        }
        if (fd.ideaStage && (!existingStartup.stage || existingStartup.stage === 'Idea')) {
          updates.stage = fd.ideaStage;
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          await supabaseAdmin.from('startups').update(updates).eq('id', startupId);
        }
      }
    } catch (startupErr) {
      console.warn('Startup lookup/sync error:', startupErr);
    }

    // Resolve uploaded documents & prototype links
    const uploadedDocs: any[] = Array.isArray(body.uploaded_documents) ? [...body.uploaded_documents] : [];
    if (body.form_data?.prototypeLink && typeof body.form_data.prototypeLink === 'string') {
      uploadedDocs.push({
        name: 'Prototype',
        url: body.form_data.prototypeLink,
        type: 'prototype',
      });
    }

    // 3. Organization ID must stay NULL until an incubator accepts the application
    const payload: any = {
      organization_id: null,

      startup_id: startupId,
      startup_name: body.startup_name || body.form_data?.startup_name || body.form_data?.businessName || body.form_data?.name || `${body.applicant_name}'s Startup`,
      applicant_name: body.applicant_name,
      applicant_email: cleanEmail,
      applicant_phone: body.applicant_phone || null,
      application_type: body.application_type || 'pre-incubator',
      cohort_name: body.cohort_name || 'Cohort 2026',
      form_data: body.form_data || {},
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      created_by: createdByUserId,
      score: null,
      uploaded_documents: uploadedDocs,
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

    const startupName = body.form_data?.startup_name || body.form_data?.businessName || body.form_data?.name || `${body.applicant_name}'s Startup`;
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
