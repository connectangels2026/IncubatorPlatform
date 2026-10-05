import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { TaskService } from '@/backend/services/taskService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/startups/:id/tasks
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;

    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const dueDate = searchParams.get('due_date') || undefined;
    const includeArchived = searchParams.get('include_archived') === 'true';

    const result = await TaskService.listStartupTasks(id, realOrgId, {
      status,
      priority,
      due_date: dueDate,
      include_archived: includeArchived,
    });

    return NextResponse.json({
      success: true,
      startup_id: id,
      organization_id: realOrgId,
      total: result.total,
      data: result.tasks,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
