import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';
import { logActivity } from '@/backend/services/activityLogger';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { rating, feedback_score, score, feedback, type, scores } = body;
    const rawRating = rating !== undefined ? rating : feedback_score !== undefined ? feedback_score : score;
    const isMentor = type === 'mentor';

    if (!isMentor) {
      if (rawRating === undefined || rawRating === null) {
        return NextResponse.json({ error: 'Validation Error: rating is required (1-5)' }, { status: 400 });
      }
      const numericRating = Number(rawRating);
      if (isNaN(numericRating) || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return NextResponse.json(
          { error: 'Validation Error: rating must be an integer between 1 and 5' },
          { status: 400 }
        );
      }
    }

    const { data: sessionRow } = await supabaseAdmin
      .from('mentorship_sessions')
      .select(`
        id, organization_id, startup_id, mentor_id, session_title,
        startup:startups (id, startup_name),
        mentor:mentors (id, user_id, user:users (id, full_name, first_name, last_name, email))
      `)
      .eq('id', id)
      .maybeSingle();

    if (!sessionRow) {
      return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });
    }

    const effectiveOrgId = sessionRow.organization_id || realOrgId;
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (isMentor) {
      updates.mentor_feedback = String(feedback || '').trim() || 'Session reviewed.';
      if (scores && typeof scores === 'object') {
        updates.mentor_feedback_scores = scores;
      }
    } else {
      updates.startup_rating = Number(rawRating);
      updates.startup_feedback = String(feedback || '').trim() || null;
    }

    let { data: updatedSession, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .update(updates)
      .eq('id', id)
      .select('id, startup_rating, startup_feedback, mentor_feedback, status, updated_at')
      .single();

    if (error && (error as any).code === '42703' && updates.mentor_feedback_scores !== undefined) {
      delete updates.mentor_feedback_scores;
      const retry = await supabaseAdmin
        .from('mentorship_sessions')
        .update(updates)
        .eq('id', id)
        .select('id, startup_rating, startup_feedback, mentor_feedback, status, updated_at')
        .single();
      updatedSession = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    if (!updatedSession) return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });

    const mRow = Array.isArray((sessionRow as any).mentor) ? (sessionRow as any).mentor[0] : (sessionRow as any).mentor;
    const mUser = Array.isArray(mRow?.user) ? mRow.user[0] : mRow?.user;
    const sRow = Array.isArray((sessionRow as any).startup) ? (sessionRow as any).startup[0] : (sessionRow as any).startup;
    const startupName = sRow?.startup_name || 'Startup';

    if (isMentor) {
      const mentorName =
        mUser?.full_name ||
        [mUser?.first_name, mUser?.last_name].filter(Boolean).join(' ').trim() ||
        'Mentor';
      try {
        await supabaseAdmin.from('startup_activity').insert({
          startup_id: sessionRow.startup_id,
          author_id: user?.id || null,
          author_name: mentorName,
          author_role: 'Mentor',
          type: 'mentor_feedback',
          title: `Mentor Feedback · ${sessionRow.session_title || 'Mentorship Session'}`,
          body: updates.mentor_feedback,
          scores: scores && typeof scores === 'object' ? scores : {},
        });
      } catch {}
    } else {
      // Notify mentor when startup rates & reviews the session
      if (mRow?.user_id && isValidUUID(mRow.user_id)) {
        try {
          await NotificationService.createNotification({
            organization_id: effectiveOrgId,
            recipient_id: mRow.user_id,
            recipient_email: mUser?.email || undefined,
            title: `New ${updates.startup_rating}★ Rating from ${startupName}`,
            message: `${startupName} rated "${sessionRow.session_title || 'Session'}" ${updates.startup_rating}/5${updates.startup_feedback ? `: "${updates.startup_feedback}"` : '.'}`,
            notification_type: 'mentor_feedback',
            send_email: true,
            send_in_app: true,
            related_entity_type: 'mentorship_session',
            related_entity_id: id,
          });
        } catch {}
      }
    }

    await logActivity({
      organization_id: effectiveOrgId,
      user_id: user?.id || null,
      actor_email: user?.email || null,
      action: isMentor ? 'mentor_feedback_submitted' : 'startup_session_rated',
      entity_type: 'mentorship_session',
      entity_id: id,
      description: isMentor
        ? `Mentor submitted feedback for ${startupName}`
        : `${startupName} rated session ${updates.startup_rating}/5`,
      details: isMentor
        ? { scores: scores || null }
        : { rating: updates.startup_rating, has_comment: Boolean(updates.startup_feedback) },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        ...updatedSession,
        feedback_score: updatedSession.startup_rating,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
