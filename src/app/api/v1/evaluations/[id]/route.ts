import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const DEFAULT_EVALUATOR_ID = 'c9ab009d-110b-4f79-bfc1-171c5c718cd0';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);
const resolveEvaluatorId = (id: string | null | undefined) => (id && isValidUUID(id) ? id : DEFAULT_EVALUATOR_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    // 1. Fetch current evaluation
    const { data: evaluation, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .select('*, application:applications(id, status)')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (evalError || !evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // 2. Evaluator permission check (evaluator can update their own score; admin can update any)
    const role = user?.role?.toLowerCase() || '';
    const currentEvaluator = resolveEvaluatorId(user?.id);
    const isAdmin = role === 'admin' || role === 'super-admin';

    if (!isAdmin && evaluation.evaluator_id !== currentEvaluator) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own evaluation' }, { status: 403 });
    }

    // 3. Application Lock check
    const appStatus = (evaluation.application?.status || '').toLowerCase();
    const lockedStatuses = ['admitted', 'rejected', 'withdrawn'];
    if (lockedStatuses.includes(appStatus)) {
      return NextResponse.json(
        { error: 'Evaluation locked: Application decision has already been finalized' },
        { status: 400 }
      );
    }

    // 4. Validate score against criteria max_score if score is updated
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.score !== undefined) {
      const numericScore = Number(body.score);
      if (isNaN(numericScore) || numericScore < 0) {
        return NextResponse.json({ error: 'score must be a non-negative number' }, { status: 400 });
      }

      // Check criteria max_score
      const { data: criteria } = await supabaseAdmin
        .from('evaluation_criteria')
        .select('max_score')
        .eq('id', evaluation.criteria_id)
        .single();

      if (criteria && numericScore > criteria.max_score) {
        return NextResponse.json(
          { error: `Score ${numericScore} exceeds maximum allowed score of ${criteria.max_score}` },
          { status: 400 }
        );
      }
      updates.score = numericScore;
    }

    if (body.comments !== undefined) {
      updates.comments = body.comments;
    }

    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Evaluation score updated successfully',
      data: updatedData,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
