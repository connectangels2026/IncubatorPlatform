import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { StartupService } from '@/backend/services/startupService';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    const startup = await StartupService.getStartup(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const items: any[] = [];

    // 1. Query upcoming organization events
    if (startup.organization_id) {
      try {
        const { data: events, error: evErr } = await supabaseAdmin
          .from('events')
          .select('*')
          .eq('organization_id', startup.organization_id)
          .order('starts_at', { ascending: true });

        if (!evErr && Array.isArray(events)) {
          for (const ev of events) {
            items.push({
              id: ev.id,
              type: ev.type || 'Event',
              title: ev.title,
              speaker: ev.location ? `Location: ${ev.location}` : undefined,
              timing: ev.starts_at ? new Date(ev.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Upcoming',
              starts_at: ev.starts_at || new Date().toISOString(),
              link: ev.link || '#',
              source: 'event',
            });
          }
        }
      } catch (e) {
        console.warn('Could not query events table:', e);
      }
    }

    // 2. Query mentorship_sessions for this startup (exclude cancelled and declined)
    try {
      const { data: mentorSessions } = await supabaseAdmin
        .from('mentorship_sessions')
        .select(`
          *,
          mentor:mentors (
            id,
            calendar_url,
            user:users (
              id,
              first_name,
              last_name,
              full_name,
              email
            )
          )
        `)
        .eq('startup_id', startup.id)
        .not('status', 'in', '("cancelled","declined")')
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (Array.isArray(mentorSessions)) {
        for (const ms of mentorSessions) {
          const mUser = Array.isArray(ms.mentor?.user) ? ms.mentor.user[0] : ms.mentor?.user;
          const mentorName =
            mUser?.full_name ||
            [mUser?.first_name, mUser?.last_name].filter(Boolean).join(' ').trim() ||
            ms.mentor_name ||
            'Mentor';
          const startFormatted = String(ms.start_time || '').slice(0, 5);
          const endFormatted = String(ms.end_time || '').slice(0, 5);
          const dateStr = ms.scheduled_date ? `${ms.scheduled_date}T${ms.start_time || '00:00:00'}` : new Date().toISOString();

          items.push({
            id: ms.id,
            type: '1-on-1 Session',
            title: ms.session_title || 'Mentorship Session',
            speaker: `Mentor: ${mentorName}`,
            timing: ms.scheduled_date
              ? `${ms.scheduled_date} · ${startFormatted}${endFormatted ? `-${endFormatted}` : ''}`
              : 'Upcoming',
            starts_at: dateStr,
            scheduled_date: ms.scheduled_date,
            start_time: startFormatted,
            end_time: endFormatted,
            mentor_id: ms.mentor_id,
            status: ms.status || 'requested',
            meeting_mode: ms.meeting_mode || 'online',
            link: ms.meeting_link || ms.mentor?.calendar_url || '#',
            source: 'mentorship_session',
          });
        }
      }
    } catch (e) {
      console.warn('Could not query mentorship_sessions table:', e);
    }

    // Sort merged schedule by date
    items.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    return NextResponse.json({ success: true, schedule: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

