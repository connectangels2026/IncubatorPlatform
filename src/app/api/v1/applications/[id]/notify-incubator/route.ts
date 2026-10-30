import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { verifyAuth } from '@/backend/middleware/auth';
import { NotificationService } from '@/backend/services/notificationService';

export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user } = await verifyAuth(req);

    // Retrieve application
    const { data: application, error: fetchErr } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchErr || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Security: Only applicant or staff can trigger notification
    const applicantEmail = (application.applicant_email || '').toLowerCase().trim();
    if (user?.email && user.role !== 'admin' && user.role !== 'super-admin') {
      if (user.email.toLowerCase().trim() !== applicantEmail) {
        return NextResponse.json({ error: 'Forbidden: You can only notify for your own application' }, { status: 403 });
      }
    }

    // Rule 1: Application must be accepted by incubator to send notifications
    const isAccepted =
      application.status === 'accepted' ||
      application.status === 'admitted' ||
      application.incubator_response_status === 'accepted';

    if (!isAccepted) {
      return NextResponse.json(
        { error: 'Notifications can only be sent after your application has been accepted by an incubator.' },
        { status: 400 }
      );
    }

    const currentFormData = application.form_data || {};

    // Rule 2: Maximum 5 notifications per day per application
    const today = new Date().toISOString().slice(0, 10);
    const notifyHistory = currentFormData.notify_incubator_history || {};
    const currentDailyCount = notifyHistory.date === today ? (notifyHistory.count || 0) : 0;

    if (currentDailyCount >= 5) {
      return NextResponse.json(
        {
          error: 'Daily notification limit reached (maximum 5 notifications per day). Please try again tomorrow.',
          dailyLimitReached: true,
          dailyCount: currentDailyCount,
        },
        { status: 429 }
      );
    }

    // Cooldown check (10 minutes)
    const lastNotified = currentFormData.last_incubator_notified_at;
    if (lastNotified) {
      const elapsed = Date.now() - new Date(lastNotified).getTime();
      if (elapsed < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${Math.ceil(remainingSeconds / 60)} minute(s) before sending another notification.`,
            remainingSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Identify target incubator organization
    const targetOrgId =
      application.selected_incubator_id ||
      application.organization_id ||
      currentFormData.selected_incubator_id;

    let incubatorRecipientId = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
    if (targetOrgId) {
      const { data: orgUsers } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('organization_id', targetOrgId)
        .limit(1);
      if (orgUsers && orgUsers.length > 0 && orgUsers[0].id) {
        incubatorRecipientId = orgUsers[0].id;
      }
    }

    const startupName = currentFormData.startup_name || currentFormData.name || application.applicant_name;
    const incubatorName = application.incubator_name_text || 'Incubator';

    // Dispatch notification to incubator
    await NotificationService.createNotification({
      organization_id: targetOrgId || null,
      recipient_id: incubatorRecipientId,
      title: `Dashboard Access Request: ${startupName}`,
      message: `${application.applicant_name} has requested dashboard access for ${startupName} (${application.id}).`,
      notification_type: 'dashboard_access_request',
      send_email: true,
      send_in_app: true,
      related_entity_type: 'application',
      related_entity_id: application.id,
      metadata: {
        startup_name: startupName,
        applicant_email: applicantEmail,
        application_id: application.id,
      },
    });

    // Update last_incubator_notified_at and daily count
    const updatedFormData = {
      ...currentFormData,
      last_incubator_notified_at: new Date().toISOString(),
      notify_incubator_history: {
        date: today,
        count: currentDailyCount + 1,
        last_notified_at: new Date().toISOString(),
      },
    };

    await supabaseAdmin
      .from('applications')
      .update({ form_data: updatedFormData })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${incubatorName} successfully.`,
      cooldownSeconds: 600,
      dailyCount: currentDailyCount + 1,
      remainingDaily: 5 - (currentDailyCount + 1),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to notify incubator' }, { status: 500 });
  }
}
