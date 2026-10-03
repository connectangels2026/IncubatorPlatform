import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// GET /api/v1/reports/mentorship - Mentorship sessions, completed hours, & ratings
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { data: sessions, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .select('*')
      .eq('organization_id', realOrgId);

    if (error) throw error;

    const all = sessions || [];
    const completedSessions = all.filter((s) => s.status === 'completed');
    const totalMinutes = completedSessions.reduce((sum, s) => sum + (Number(s.duration_minutes) || 60), 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    const ratedSessions = all.filter(
      (s) => (s.startup_rating ?? s.feedback_score) !== null && (s.startup_rating ?? s.feedback_score) !== undefined
    );
    const avgRating =
      ratedSessions.length > 0
        ? Number(
            (
              ratedSessions.reduce((sum, s) => sum + Number(s.startup_rating ?? s.feedback_score), 0) /
              ratedSessions.length
            ).toFixed(1)
          )
        : 0;

    const statusCounts: Record<string, number> = {};
    all.forEach((s) => {
      const st = s.status || 'scheduled';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_sessions: all.length,
          completed_sessions: completedSessions.length,
          completion_rate_pct: all.length > 0 ? Number(((completedSessions.length / all.length) * 100).toFixed(1)) : 0,
          total_mentoring_hours: totalHours,
          average_feedback_rating: avgRating,
        },
        session_status_breakdown: statusCounts,
        recent_sessions: all.slice(0, 10),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
