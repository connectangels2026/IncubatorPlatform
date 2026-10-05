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
  return handleReminders(req);
}

export async function POST(req: NextRequest) {
  return handleReminders(req);
}

async function handleReminders(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);

    // Calculate default tomorrow's date (1 day before session), or use custom query param
    const searchParams = req.nextUrl.searchParams;
    const targetDateParam = searchParams.get('date');
    let targetDateStr = targetDateParam;

    if (!targetDateStr) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDateStr = tomorrow.toISOString().split('T')[0];
    }

    const { data: upcomingSessions, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .select(`
        id,
        scheduled_date,
        start_time,
        end_time,
        session_title,
        meeting_link,
        status,
        mentor:mentors (
          id,
          user:users (id, first_name, last_name, email)
        ),
        startup:startups (id, name, founder_id, founder_email)
      `)
      .eq('organization_id', realOrgId)
      .eq('status', 'scheduled')
      .eq('scheduled_date', targetDateStr);

    if (error) throw error;

    const remindersDispatched = [];
    for (const s of (upcomingSessions as any[]) || []) {
      const startupObj = Array.isArray(s.startup) ? s.startup[0] : s.startup;
      const mentorObj = Array.isArray(s.mentor) ? s.mentor[0] : s.mentor;
      const mentorUser = Array.isArray(mentorObj?.user) ? mentorObj?.user[0] : mentorObj?.user;
      const mentorEmail = mentorUser?.email || 'mentor@example.com';
      const startupEmail = startupObj?.founder_email || 'founder@example.com';

      // Dispatch via NotificationService
      if (mentorUser?.id && isValidUUID(mentorUser.id)) {
        await NotificationService.createNotification({
          organization_id: realOrgId,
          recipient_id: mentorUser.id,
          recipient_name: mentorUser.first_name || 'Mentor',
          recipient_email: mentorEmail,
          title: `Reminder: Mentorship Session Tomorrow`,
          message: `Reminder: Your mentorship session "${s.session_title}" is scheduled for tomorrow (${s.scheduled_date}) at ${s.start_time}. Meeting Link: ${s.meeting_link || 'online'}`,
          notification_type: 'mentorship_reminder',
          send_email: true,
          send_in_app: true,
          related_entity_type: 'mentorship_session',
          related_entity_id: s.id,
          metadata: {
            partner_name: startupObj?.name || 'Startup',
            date: s.scheduled_date,
            time: `${s.start_time} - ${s.end_time}`,
            meeting_link: s.meeting_link,
          },
        });
      }

      if (startupObj?.founder_id && isValidUUID(startupObj.founder_id)) {
        await NotificationService.createNotification({
          organization_id: realOrgId,
          recipient_id: startupObj.founder_id,
          recipient_name: 'Founder',
          recipient_email: startupEmail,
          title: `Reminder: Mentorship Session Tomorrow`,
          message: `Reminder: Your mentorship session "${s.session_title}" is scheduled for tomorrow (${s.scheduled_date}) at ${s.start_time}. Meeting Link: ${s.meeting_link || 'online'}`,
          notification_type: 'mentorship_reminder',
          send_email: true,
          send_in_app: true,
          related_entity_type: 'mentorship_session',
          related_entity_id: s.id,
          metadata: {
            partner_name: mentorUser?.first_name || 'Mentor',
            date: s.scheduled_date,
            time: `${s.start_time} - ${s.end_time}`,
            meeting_link: s.meeting_link,
          },
        });
      }

      remindersDispatched.push({
        session_id: s.id,
        session_title: s.session_title,
        scheduled_at: `${s.scheduled_date} ${s.start_time} - ${s.end_time}`,
        recipients: [
          { role: 'mentor', email: mentorEmail },
          { role: 'startup', email: startupEmail },
        ],
        reminder_sent: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Automated reminders processed for sessions on ${targetDateStr}`,
      target_date: targetDateStr,
      total_reminders_sent: remindersDispatched.length,
      dispatched: remindersDispatched,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
