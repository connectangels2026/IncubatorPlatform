import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

const isValidUUID = (s?: string | null): s is string =>
  typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ['under_review', 'forwarded', 'admitted', 'accepted', 'rejected'],
  forwarded: ['under_review', 'accepted', 'admitted', 'rejected', 'submitted'],
  under_review: ['forwarded', 'admitted', 'accepted', 'rejected', 'submitted'],
  accepted: ['under_review', 'admitted', 'rejected', 'forwarded'],
  admitted: ['under_review', 'rejected', 'accepted'],
  rejected: ['under_review', 'forwarded', 'admitted', 'accepted', 'submitted'],
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Role check: Applicant can see only their own application
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      if (application.applicant_email?.toLowerCase() !== user?.email?.toLowerCase()) {
        return NextResponse.json({ error: 'Forbidden: Applicants can only view their own application' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Only admins, super-admins, and incubator staff can update application status
    const role = user?.role?.toLowerCase() || '';
    let isStaff =
      role === 'admin' ||
      role === 'super-admin' ||
      role === 'super_admin' ||
      role === 'incubator_admin' ||
      role === 'incubator';

    if (!isStaff && user?.email) {
      const emailLower = user.email.toLowerCase();
      const orgFilter = user.organization_id && isValidUUID(user.organization_id)
        ? `founder_email.ilike.${emailLower},id.eq.${user.organization_id}`
        : `founder_email.ilike.${emailLower}`;

      const { data: matchedOrg } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .or(orgFilter)
        .maybeSingle();

      if (matchedOrg) {
        isStaff = true;
      }
    }

    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden: Only admins can review or update applications' }, { status: 403 });
    }

    const { data: currentApp, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('status, form_data, organization_id, selected_incubator_id')
      .eq('id', id)
      .single();

    if (fetchError || !currentApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await req.json();
    const newStatus = body.status;

    if (newStatus && newStatus !== currentApp.status) {
      const allowedNext = VALID_TRANSITIONS[currentApp.status] || [];
      if (!allowedNext.includes(newStatus)) {
        return NextResponse.json({
          error: `Invalid status transition: cannot transition from '${currentApp.status}' to '${newStatus}'. Allowed: [${allowedNext.join(', ')}]`,
        }, { status: 400 });
      }
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
      ...body,
    };

    const isDashboardAction =
      body.action === 'assign_dashboard' ||
      body.admission_status === 'dashboard_assigned' ||
      body.dashboard_access_granted === true;

    if (isDashboardAction) {
      updatePayload.admission_status = 'dashboard_assigned';
      const currentFd = currentApp.form_data || {};
      updatePayload.form_data = {
        ...currentFd,
        ...(body.form_data || {}),
        dashboard_access_granted: true,
        dashboard_assigned_at: new Date().toISOString(),
      };
      if (!updatePayload.status && (currentApp.status === 'accepted' || currentApp.status === 'admitted')) {
        updatePayload.status = currentApp.status;
      }
    }

    // Handle Re-accept action for Super Admin and Incubator
    const isReacceptAction = body.action === 'reaccept';
    if (isReacceptAction) {
      const isSuperAdminReaccept = body.reaccept_by === 'super_admin' || body.super_admin_status === 'pending';
      if (isSuperAdminReaccept) {
        updatePayload.status = 'submitted';
        updatePayload.super_admin_status = 'pending';
        updatePayload.super_admin_reviewed_at = null;
        updatePayload.admission_status = 'pending';
        updatePayload.reviewer_comments = null;
      } else {
        updatePayload.status = 'accepted';
        updatePayload.admission_status = 'admitted';
        updatePayload.incubator_response_status = 'accepted';
        updatePayload.incubator_responded_at = new Date().toISOString();
        updatePayload.reviewed_at = new Date().toISOString();
      }
      delete updatePayload.reaccept_by;
    }

    if (body.feedback) {
      updatePayload.reviewer_comments = body.feedback;
      delete updatePayload.feedback;
    }
    delete updatePayload.notify_applicant;
    delete updatePayload.selected_id;
    delete updatePayload.action;
    delete updatePayload.dashboard_access_granted;

    const selectedIncId = body.selected_incubator_id || body.selected_id || (newStatus === 'forwarded' ? body.organization_id : null);

    if (selectedIncId) {
      updatePayload.selected_incubator_id = selectedIncId; // Save to actual DB column
      const currentFd = currentApp.form_data || {};
      updatePayload.form_data = {
        ...currentFd,
        ...(body.form_data || {}),
        selected_incubator_id: selectedIncId,
        selected_id: selectedIncId,
      };

      if (!body.incubator_name_text) {
        const { data: orgData } = await supabaseAdmin
          .from('organizations')
          .select('name')
          .eq('id', selectedIncId)
          .maybeSingle();
        if (orgData?.name) {
          updatePayload.incubator_name_text = orgData.name;
        }
      }

      // During initial forwarding, keep organization_id null until incubator accepts
      if (newStatus === 'forwarded') {
        updatePayload.organization_id = currentApp.organization_id || null;
      }
    }

    // When incubator accepts or admits the startup, update incubator status & admission
    if (newStatus === 'accepted' || newStatus === 'admitted') {
      updatePayload.incubator_response_status = 'accepted';
      updatePayload.admission_status = 'admitted';
      updatePayload.incubator_responded_at = new Date().toISOString();
      updatePayload.reviewed_at = new Date().toISOString();
      // Safely assign reviewed_by only if the user ID exists in public.users table
      if (user?.id && isValidUUID(user.id)) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (dbUser?.id) {
          updatePayload.reviewed_by = dbUser.id;
        } else if (user?.email) {
          const { data: dbUserByEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .ilike('email', user.email)
            .maybeSingle();
          if (dbUserByEmail?.id) {
            updatePayload.reviewed_by = dbUserByEmail.id;
          } else {
            delete updatePayload.reviewed_by;
          }
        } else {
          delete updatePayload.reviewed_by;
        }
      } else {
        delete updatePayload.reviewed_by;
      }

      const acceptingOrgId =
        body.organization_id ||
        currentApp.selected_incubator_id ||
        currentApp.form_data?.selected_incubator_id ||
        currentApp.form_data?.selected_id ||
        selectedIncId ||
        user?.organization_id;

      if (acceptingOrgId) {
        updatePayload.organization_id = acceptingOrgId;
      }
    }

    // When rejected by Super Admin or Incubator
    if (newStatus === 'rejected') {
      updatePayload.status = 'rejected';
      updatePayload.admission_status = 'rejected';
      updatePayload.reviewed_at = new Date().toISOString();

      if (body.super_admin_status === 'rejected') {
        updatePayload.super_admin_status = 'rejected';
        updatePayload.super_admin_reviewed_at = new Date().toISOString();
      } else {
        updatePayload.incubator_response_status = 'rejected';
        updatePayload.incubator_responded_at = new Date().toISOString();
      }

      if (user?.id && isValidUUID(user.id)) {
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (dbUser?.id) {
          updatePayload.reviewed_by = dbUser.id;
        } else if (user?.email) {
          const { data: dbUserByEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .ilike('email', user.email)
            .maybeSingle();
          if (dbUserByEmail?.id) {
            updatePayload.reviewed_by = dbUserByEmail.id;
          } else {
            delete updatePayload.reviewed_by;
          }
        } else {
          delete updatePayload.reviewed_by;
        }
      } else {
        delete updatePayload.reviewed_by;
      }
    }

    // Filter updatePayload to only actual database columns
    const ALLOWED_DB_COLUMNS = new Set([
      'organization_id',
      'startup_id',
      'application_type',
      'cohort_name',
      'applicant_name',
      'applicant_email',
      'applicant_phone',
      'form_data',
      'status',
      'score',
      'reviewer_comments',
      'reviewed_by',
      'reviewed_at',
      'uploaded_documents',
      'admission_status',
      'admission_letter_url',
      'admission_date',
      'mou_signed',
      'mou_signed_date',
      'mou_document_url',
      'submitted_at',
      'created_at',
      'updated_at',
      'deleted_at',
      'created_by',
      'super_admin_status',
      'super_admin_notes',
      'incubator_response_status',
      'super_admin_reviewed_at',
      'incubator_responded_at',
      'incubator_name_text',
      'selected_incubator_id',
    ]);

    const sanitizedDbPayload: any = {};
    for (const [key, val] of Object.entries(updatePayload)) {
      if (ALLOWED_DB_COLUMNS.has(key)) {
        sanitizedDbPayload[key] = val;
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('applications')
      .update(sanitizedDbPayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Application update DB error:', updateError);
      if (updateError.code === '23505') {
        const incName = sanitizedDbPayload.incubator_name_text || 'this incubator';
        return NextResponse.json(
          {
            success: false,
            error: `This applicant already has an application registered with "${incName}". Multiple applications for the same incubator are not allowed.`,
            code: 'DUPLICATE_INCUBATOR_APPLICATION',
          },
          { status: 409 }
        );
      }
      throw updateError;
    }

    // When admitted or accepted by Incubator, create organization & assign organization_id to user
    if ((newStatus === 'admitted' || newStatus === 'accepted') && updated) {
      try {
        const applicantEmail = (updated.applicant_email || '').toLowerCase().trim();
        const startupName = updated.form_data?.startup_name || updated.form_data?.name || `${updated.applicant_name}'s Startup`;
        const slug = startupName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `org-${Date.now()}`;

        let orgId = updated.organization_id;
        // Check if organization already exists to prevent duplicate creation on retry
        const { data: existingOrg } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .ilike('founder_email', applicantEmail)
          .maybeSingle();

        if (existingOrg) {
          orgId = existingOrg.id;
        } else {
          const { data: newOrg } = await supabaseAdmin
            .from('organizations')
            .insert({
              name: startupName,
              slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
                founder_name: updated.applicant_name,
                founder_email: applicantEmail,
                is_verified: true,
              })
              .select('id')
              .single();
          if (newOrg) orgId = newOrg.id;
        }

        if (orgId) {
          await supabaseAdmin.from('users').update({ organization_id: orgId }).ilike('email', applicantEmail);

          // Ensure startup record exists for this organization & founder
          const { data: existingStartup } = await supabaseAdmin
            .from('startups')
            .select('id')
            .eq('organization_id', orgId)
            .ilike('founder_email', applicantEmail)
            .maybeSingle();

          let startupId = existingStartup?.id;
          if (!startupId) {
            const { data: newStartup } = await supabaseAdmin
              .from('startups')
              .insert({
                organization_id: orgId,
                name: startupName,
                founder_email: applicantEmail,
                founder_phone: updated.applicant_phone || null,
                sector: updated.form_data?.industryVertical || 'AI & DeepTech',
                stage: updated.form_data?.businessStage || 'Idea Phase',
                problem_statement: updated.form_data?.problemStatement || null,
                solution_description: updated.form_data?.oneSentencePitch || updated.form_data?.solutionOverview || null,
                target_market: updated.form_data?.targetAudience || null,
                founder_id: updated.created_by || null,
                is_active: true,
              })
              .select('id')
              .single();
            if (newStartup?.id) startupId = newStartup.id;
          }

          const appUpdates: any = { organization_id: orgId };
          if (startupId) appUpdates.startup_id = startupId;

          await supabaseAdmin.from('applications').update(appUpdates).eq('id', id);
          updated.organization_id = orgId;
          if (startupId) updated.startup_id = startupId;
        }
      } catch (orgErr) {
        console.warn('Auto-create organization on admission error:', orgErr);
      }
    }

    // Trigger non-duplicate notifications to founder when assigned, accepted, or dashboard assigned
    if ((newStatus || isDashboardAction) && updated) {
      try {
        const startupName = updated.form_data?.startup_name || updated.form_data?.name || updated.applicant_name;
        const incubatorName = updated.incubator_name_text || 'Partner Incubator';

        // Resolve founder user ID
        let recipientId = updated.created_by;
        const isValidUUID = (u: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(u);
        if (!recipientId || !isValidUUID(recipientId)) {
          const { data: founderUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .ilike('email', updated.applicant_email)
            .maybeSingle();
          if (founderUser?.id && isValidUUID(founderUser.id)) {
            recipientId = founderUser.id;
          }
        }
        if (!recipientId || !isValidUUID(recipientId)) {
          recipientId = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
        }

        let notifTitle = `Application Status: ${newStatus ? newStatus.toUpperCase() : 'UPDATED'}`;
        let notifMessage = `Your application for ${startupName} status has been updated.`;
        let notifType = 'application_decision';

        if (isDashboardAction) {
          notifTitle = `Dashboard Access Assigned: ${incubatorName}`;
          notifMessage = `Congratulations! ${incubatorName} has assigned dashboard access for ${startupName}. You can now access your founder cohort dashboard!`;
          notifType = 'dashboard_assigned';
        } else if (newStatus === 'forwarded') {
          notifTitle = `Application Assigned to ${incubatorName}`;
          notifMessage = `Your application for ${startupName} has been evaluated by the Super Admin and forwarded to ${incubatorName} for cohort admission review.${updated.super_admin_notes ? ` Notes: "${updated.super_admin_notes}"` : ''}`;
          notifType = 'application_forwarded';
        } else if (newStatus === 'accepted' || newStatus === 'admitted') {
          notifTitle = `Congratulations! Accepted by ${incubatorName}`;
          notifMessage = `Great news! ${incubatorName} has approved your application for ${startupName}. Dashboard access will be activated by the incubator shortly.`;
          notifType = 'application_accepted';
        } else if (newStatus === 'rejected') {
          notifTitle = `Application Update: ${incubatorName}`;
          notifMessage = `Thank you for your interest in ${incubatorName}. Your application for ${startupName} was not selected for this cohort cycle.${updated.super_admin_notes || updated.reviewer_comments ? ` Notes: "${updated.super_admin_notes || updated.reviewer_comments}"` : ''}`;
          notifType = 'application_rejected';
        } else if (isReacceptAction) {
          const isSuperAdminReaccept = body.reaccept_by === 'super_admin';
          if (isSuperAdminReaccept) {
            notifTitle = `Application Reopened: Arba360`;
            notifMessage = `Your application for ${startupName} has been reopened for review by Arba360 Central Admissions.`;
          } else {
            notifTitle = `Application Re-accepted: ${incubatorName}`;
            notifMessage = `Congratulations! ${incubatorName} has re-accepted your application for ${startupName}.`;
          }
          notifType = 'application_reaccepted';
        }

        await NotificationService.createNotification({
          organization_id: updated.organization_id || null,
          recipient_id: recipientId,
          recipient_name: updated.applicant_name,
          recipient_email: updated.applicant_email,
          title: notifTitle,
          message: notifMessage,
          notification_type: notifType,
          send_email: true,
          send_in_app: true,
          related_entity_type: 'application',
          related_entity_id: updated.id,
          metadata: {
            startup_name: startupName,
            incubator_name: incubatorName,
            status: newStatus,
            super_admin_notes: updated.super_admin_notes,
            reviewer_comments: updated.reviewer_comments,
          },
        });

        // Notify target incubator organization when forwarded
        const targetIncubatorOrgId = updated.selected_incubator_id || selectedIncId;
        if (newStatus === 'forwarded' && targetIncubatorOrgId && isValidUUID(targetIncubatorOrgId)) {
          let incRecipientId = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
          const { data: incUsers } = await supabaseAdmin
            .from('users')
            .select('id, email, first_name')
            .eq('organization_id', targetIncubatorOrgId)
            .limit(1);

          if (incUsers && incUsers.length > 0 && incUsers[0].id) {
            incRecipientId = incUsers[0].id;
          }

          const incTitle = `New Application Forwarded: ${startupName}`;
          const incMsg = `Super Admin forwarded ${startupName}'s application to your incubator for review.${updated.super_admin_notes ? ` Notes: "${updated.super_admin_notes}"` : ''}`;

          await NotificationService.createNotification({
            organization_id: targetIncubatorOrgId,
            recipient_id: incRecipientId,
            recipient_name: incubatorName,
            title: incTitle,
            message: incMsg,
            notification_type: 'application_forwarded',
            send_email: true,
            send_in_app: true,
            related_entity_type: 'application',
            related_entity_id: updated.id,
            metadata: {
              startup_name: startupName,
              applicant_name: updated.applicant_name,
              applicant_email: updated.applicant_email,
              application_id: updated.id,
              status: 'forwarded',
              forwarded_at: new Date().toISOString(),
              super_admin_notes: updated.super_admin_notes,
              reviewer_comments: updated.reviewer_comments,
            },
          });
        }
      } catch (notifErr) {
        console.warn('Failed to dispatch application decision notification:', notifErr);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
