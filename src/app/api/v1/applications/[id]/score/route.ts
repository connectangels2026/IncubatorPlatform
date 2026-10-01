import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id: applicationId } = await params;
    const realOrgId = resolveOrg(orgId);

    // 1. Verify Application exists
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, status, organization_id')
      .eq('id', applicationId)
      .eq('organization_id', realOrgId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found for this organization' }, { status: 404 });
    }

    // 2. Fetch all evaluations for this application
    const { data: evaluations, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .select(`
        id,
        score,
        comments,
        evaluator_id,
        created_at,
        updated_at,
        criteria:evaluation_criteria (
          id,
          name,
          max_score,
          weight,
          application_type,
          is_active
        )
      `)
      .eq('application_id', applicationId)
      .eq('organization_id', realOrgId);

    if (evalError) throw evalError;

    if (!evaluations || evaluations.length === 0) {
      return NextResponse.json({
        success: true,
        application_id: applicationId,
        application_status: application.status,
        total_score: null,
        message: 'No evaluations submitted yet for this application',
        evaluator_count: 0,
        criteria_breakdown: [],
      });
    }

    // 3. Group evaluations by criteria_id
    const criteriaMap = new Map<string, {
      criteria_id: string;
      criteria_name: string;
      max_score: number;
      weight: number;
      scores: number[];
      evaluations: any[];
    }>();

    const distinctEvaluators = new Set<string>();

    for (const ev of evaluations) {
      if (ev.evaluator_id) distinctEvaluators.add(ev.evaluator_id);

      const crit = Array.isArray(ev.criteria) ? ev.criteria[0] : ev.criteria;
      const criteriaId = crit?.id || 'unknown';
      const criteriaName = crit?.name || 'Unknown Criteria';
      const weight = crit?.weight !== undefined ? Number(crit.weight) : 1;
      const maxScore = crit?.max_score !== undefined ? Number(crit.max_score) : 100;

      if (!criteriaMap.has(criteriaId)) {
        criteriaMap.set(criteriaId, {
          criteria_id: criteriaId,
          criteria_name: criteriaName,
          max_score: maxScore,
          weight,
          scores: [],
          evaluations: [],
        });
      }

      const entry = criteriaMap.get(criteriaId)!;
      entry.scores.push(Number(ev.score));
      entry.evaluations.push({
        id: ev.id,
        evaluator_id: ev.evaluator_id,
        score: Number(ev.score),
        comments: ev.comments,
        created_at: ev.created_at,
        updated_at: ev.updated_at,
      });
    }

    // 4. Calculate weighted total: SUM(avg_score * weight) / SUM(weight)
    let weightedSum = 0;
    let totalWeight = 0;
    const criteriaBreakdown = [];

    for (const [, item] of criteriaMap.entries()) {
      const avgScore = item.scores.reduce((a, b) => a + b, 0) / item.scores.length;
      weightedSum += avgScore * item.weight;
      totalWeight += item.weight;

      criteriaBreakdown.push({
        criteria_id: item.criteria_id,
        criteria_name: item.criteria_name,
        max_score: item.max_score,
        weight: item.weight,
        average_score: Math.round(avgScore * 100) / 100,
        evaluations_count: item.scores.length,
        evaluations: item.evaluations,
      });
    }

    const totalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;

    return NextResponse.json({
      success: true,
      application_id: applicationId,
      application_status: application.status,
      total_score: totalScore,
      total_weight: totalWeight,
      evaluator_count: distinctEvaluators.size,
      formula: 'SUM(average_score * weight) / SUM(weight)',
      criteria_breakdown: criteriaBreakdown,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
