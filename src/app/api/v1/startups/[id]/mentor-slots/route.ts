import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { StartupService } from '@/backend/services/startupService';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function addHour(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = Math.min(23, (parseInt(hStr, 10) || 9) + 1);
  return `${String(h).padStart(2, '0')}:${(mStr || '00').slice(0, 2)}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    const startup = await StartupService.getStartup(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const daysParam = Math.min(30, Math.max(7, Number(req.nextUrl.searchParams.get('days') || 14)));

    // Fetch only active mentor allocations for this startup
    const { data: allocations, error: allocErr } = await supabaseAdmin
      .from('startup_mentors')
      .select(`
        id,
        mentor_id,
        mentor_type,
        domain,
        status,
        mentor:mentors (
          id,
          user_id,
          is_active,
          is_available,
          availability_hours_per_month,
          preferred_meeting_mode,
          timezone,
          calendar_url,
          availability_json,
          company_background,
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
      .eq('status', 'active');

    if (allocErr) throw allocErr;

    const activeMentors = (allocations || [])
      .map((a: any) => ({ alloc: a, mentor: Array.isArray(a.mentor) ? a.mentor[0] : a.mentor }))
      .filter(({ mentor }) => {
        if (!mentor || !mentor.is_active || !mentor.is_available) return false;
        const mStatus = (mentor.status || 'active').toLowerCase();
        return mStatus === 'active';
      });

    if (activeMentors.length === 0) {
      return NextResponse.json({ success: true, mentors: [] });
    }

    const mentorIds = activeMentors.map(({ mentor }) => mentor.id);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startOfMonthStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    const { data: existingSessions } = await supabaseAdmin
      .from('mentorship_sessions')
      .select('id, mentor_id, scheduled_date, start_time, end_time, status')
      .in('mentor_id', mentorIds)
      .gte('scheduled_date', startOfMonthStr)
      .in('status', ['requested', 'scheduled', 'completed']);

    const sessionsList = existingSessions || [];

    const result = activeMentors.map(({ alloc, mentor }) => {
      const mUser = Array.isArray(mentor.user) ? mentor.user[0] : mentor.user;
      const mentorName =
        mUser?.full_name ||
        [mUser?.first_name, mUser?.last_name].filter(Boolean).join(' ').trim() ||
        mUser?.email?.split('@')[0] ||
        'Mentor';

      const availJson = mentor.availability_json || {};
      const weeklyGrid: Record<string, string[]> = availJson.weekly_grid || {};
      const vacationDate: string = availJson.vacation_date || '';
      const monthlyCap = Number(mentor.availability_hours_per_month || 10);

      const mentorSessions = sessionsList.filter((s: any) => s.mentor_id === mentor.id);
      const monthCount = mentorSessions.filter((s: any) => s.scheduled_date >= startOfMonthStr).length;
      const remainingCap = Math.max(0, monthlyCap - monthCount);

      const openSlots: Array<{
        date: string;
        day: string;
        start_time: string;
        end_time: string;
        label: string;
      }> = [];

      if (remainingCap > 0) {
        for (let offset = 0; offset < daysParam; offset++) {
          const d = new Date(today.getTime() + offset * 86400000);
          const dateStr = d.toISOString().split('T')[0];
          if (dateStr < todayStr) continue;
          if (vacationDate && dateStr <= vacationDate) continue;

          const dayShort = DAY_KEYS[d.getUTCDay()];
          const dayFull = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
          const rawSlots: any[] =
            weeklyGrid[dayShort] ||
            availJson[dayShort] ||
            availJson[dayFull] ||
            [];

          if (!Array.isArray(rawSlots) || rawSlots.length === 0) continue;

          for (const slotItem of rawSlots) {
            const rawStr: string = typeof slotItem === 'string' ? slotItem : slotItem?.start || '';
            if (!rawStr) continue;
            const startTime = rawStr.includes('-') ? rawStr.split('-')[0].trim().slice(0, 5) : rawStr.trim().slice(0, 5);
            const endTime = rawStr.includes('-')
              ? rawStr.split('-')[1].trim().slice(0, 5)
              : addHour(startTime);

            const isBooked = mentorSessions.some(
              (s: any) =>
                s.scheduled_date === dateStr &&
                ['requested', 'scheduled'].includes((s.status || '').toLowerCase()) &&
                String(s.start_time || '').slice(0, 5) === startTime
            );

            if (!isBooked) {
              openSlots.push({
                date: dateStr,
                day: dayShort,
                start_time: startTime,
                end_time: endTime,
                label: `${dayShort}, ${dateStr} · ${startTime}–${endTime}`,
              });
            }
          }
        }
      }

      return {
        mentor_id: mentor.id,
        allocation_id: alloc.id,
        name: mentorName,
        domain: alloc.domain || 'Advisory',
        mentor_type: alloc.mentor_type || 'General',
        company: mentor.company_background || '',
        timezone: mentor.timezone || 'Asia/Kolkata',
        preferred_meeting_mode: mentor.preferred_meeting_mode || 'video',
        monthly_cap: monthlyCap,
        booked_this_month: monthCount,
        remaining_slots_this_month: remainingCap,
        open_slots: openSlots,
      };
    });

    return NextResponse.json({ success: true, mentors: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

