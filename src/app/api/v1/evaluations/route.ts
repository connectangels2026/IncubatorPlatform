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

export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const applicationId = searchParams.get('application_id');
    const evaluatorId = searchParams.get('evaluator_id');

    let query = supabaseAdmin
      .from('evaluations')
      .select(`
        *,
        criteria:evaluation_criteria (
          id,
          name,
          max_score,
          weight,
          application_type
        )
      `)
      .eq('organization_id', realOrgId)
      .order('created_at', { ascending: false });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }
    if (evaluatorId) {
      query = query.eq('evaluator_id', resolveEvaluatorId(evaluatorId));
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      total: data?.length || 0,
      data: data || [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { application_id, criteria_id, score, comments } = body;

    if (!application_id || !criteria_id || score === undefined) {
      return NextResponse.json(
        { error: 'Validation Error: application_id, criteria_id, and score are required' },
        { status: 400 }
      );
    }

    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0) {
      return NextResponse.json({ error: 'score must be a non-negative number' }, { status: 400 });
    }

    // 1. Verify Application exists and is not locked
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, status, organization_id')
      .eq('id', application_id)
      .eq('organization_id', realOrgId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found for this organization' }, { status: 404 });
    }

    // Lock scores after application decision is finalized
    const lockedStatuses = ['admitted', 'rejected', 'withdrawn'];
    if (lockedStatuses.includes((application.status || '').toLowerCase())) {
      return NextResponse.json(
        { error: 'Evaluation locked: Application decision has already been finalized' },
        { status: 400 }
      );
    }

    // 2. Verify Criteria exists, is active, and validate max_score
    const { data: criteria, error: critError } = await supabaseAdmin
      .from('evaluation_criteria')
      .select('id, max_score, weight, is_active')
      .eq('id', criteria_id)
      .eq('organization_id', realOrgId)
      .single();

    if (critError || !criteria) {
      return NextResponse.json({ error: 'Evaluation criteria not found' }, { status: 404 });
    }

    if (!criteria.is_active) {
      return NextResponse.json({ error: 'Cannot evaluate against inactive/archived criteria' }, { status: 400 });
    }

    if (numericScore > criteria.max_score) {
      return NextResponse.json(
        { error: `Score ${numericScore} exceeds maximum allowed score of ${criteria.max_score}` },
        { status: 400 }
      );
    }

    const evaluatorId = resolveEvaluatorId(user?.id);

    // 3. Upsert evaluation for (application_id, criteria_id, evaluator_id) if existing, or insert
    const { data: existing } = await supabaseAdmin
      .from('evaluations')
      .select('id')
      .eq('application_id', application_id)
      .eq('criteria_id', criteria_id)
      .eq('evaluator_id', evaluatorId)
      .maybeSingle();

    let resultData;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('evaluations')
        .update({
          score: numericScore,
          comments: comments || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('evaluations')
        .insert({
          organization_id: realOrgId,
          application_id,
          criteria_id,
          evaluator_id: evaluatorId,
          score: numericScore,
          comments: comments || null,
        })
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluation score recorded successfully',
      data: resultData,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
