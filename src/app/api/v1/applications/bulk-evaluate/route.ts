import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    // Role check: Only admins can bulk score
    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can evaluate applications' }, { status: 403 });
    }

    const body = await req.json();
    const evaluations = body.evaluations;

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return NextResponse.json({ error: 'evaluations array is required' }, { status: 400 });
    }

    const results = [];
    for (const item of evaluations) {
      if (!item.id || item.score === undefined) continue;

      const { data, error } = await supabaseAdmin
        .from('applications')
        .update({
          score: Number(item.score),
          reviewer_comments: item.comments || null,
          reviewed_at: new Date().toISOString(),
          status: 'under_review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
        .select()
        .single();

      if (!error && data) {
        results.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk evaluation processed successfully for ${results.length} applications`,
      evaluated_count: results.length,
      data: results,
    }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
