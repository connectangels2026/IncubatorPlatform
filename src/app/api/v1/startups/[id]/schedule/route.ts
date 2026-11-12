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

    // 2. Query mentor sessions for this startup (mentor_sessions table)
    try {
      const { data: mentorSessions, error: msErr } = await supabaseAdmin
        .from('mentor_sessions')
        .select('*')
        .eq('startup_id', startup.id)
        .order('starts_at', { ascending: true });

      if (!msErr && Array.isArray(mentorSessions)) {
        for (const ms of mentorSessions) {
          items.push({
            id: ms.id,
            type: '1-on-1 Session',
            title: ms.topic || 'Mentorship Session',
            speaker: ms.mentor_name ? `Mentor: ${ms.mentor_name}` : undefined,
            timing: ms.starts_at ? new Date(ms.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Upcoming',
            starts_at: ms.starts_at || new Date().toISOString(),
            link: ms.link || '#',
            source: 'mentor_session',
          });
        }
      }
    } catch (e) {
      console.warn('Could not query mentor_sessions table:', e);
    }

    // 3. Fallback: also check mentorship_sessions table if present
    try {
      const { data: legacySessions } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('*')
        .eq('startup_id', startup.id)
        .order('scheduled_date', { ascending: true });

      if (Array.isArray(legacySessions)) {
        for (const ls of legacySessions) {
          if (!items.some((it) => it.id === ls.id)) {
            const dateStr = ls.scheduled_date ? `${ls.scheduled_date}T${ls.start_time || '00:00:00'}` : new Date().toISOString();
            items.push({
              id: ls.id,
              type: '1-on-1 Session',
              title: ls.session_title || 'Mentorship Session',
              speaker: ls.meeting_location ? `Location: ${ls.meeting_location}` : undefined,
              timing: ls.scheduled_date ? `${ls.scheduled_date} ${ls.start_time || ''}` : 'Upcoming',
              starts_at: dateStr,
              link: ls.meeting_link || '#',
              source: 'mentorship_session',
            });
          }
        }
      }
    } catch {}

    // Sort merged schedule by date
    items.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    return NextResponse.json({ success: true, schedule: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

