import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Acceptance Criteria: Only admins can review/score applications
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can evaluate and score applications' }, { status: 403 });
    }

    const body = await req.json();
    const { score, team_score, market_score, tech_score, traction_score, comments } = body;

    // Calculate weighted total score if rubric breakdown is provided
    let finalScore = Number(score);
    if (team_score !== undefined && market_score !== undefined && tech_score !== undefined && traction_score !== undefined) {
      finalScore = Math.round(
        Number(team_score) * 0.3 +
        Number(market_score) * 0.25 +
        Number(tech_score) * 0.25 +
        Number(traction_score) * 0.2
      );
    }

    if (isNaN(finalScore)) {
      return NextResponse.json({ error: 'Score is required or invalid' }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('applications')
      .update({
        score: finalScore,
        reviewer_comments: comments || body.reviewer_comments || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id && !user.id.startsWith('mock-') ? user.id : null,
        status: 'under_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Evaluation scores submitted successfully',
      data: updated,
    }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
