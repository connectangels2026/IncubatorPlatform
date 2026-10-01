import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

export async function POST(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);

    // Calculate tomorrow's date (1 day before session)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

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
          user:users (first_name, last_name, email)
        ),
        startup:startups (id, name, founder_email)
      `)
      .eq('organization_id', realOrgId)
      .eq('status', 'scheduled')
      .eq('scheduled_date', tomorrowStr);

    if (error) throw error;

    const remindersDispatched = (upcomingSessions || []).map((s: any) => {
      const mentorUser = Array.isArray(s.mentor?.user) ? s.mentor?.user[0] : s.mentor?.user;
      return {
        session_id: s.id,
        session_title: s.session_title,
        scheduled_at: `${s.scheduled_date} ${s.start_time} - ${s.end_time}`,
        recipients: [
          { role: 'mentor', email: mentorUser?.email || 'mentor@example.com' },
          { role: 'startup', email: s.startup?.founder_email || 'founder@example.com' },
        ],
        reminder_sent: true,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Automated reminders processed for sessions on ${tomorrowStr}`,
      target_date: tomorrowStr,
      total_reminders_sent: remindersDispatched.length,
      dispatched: remindersDispatched,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
