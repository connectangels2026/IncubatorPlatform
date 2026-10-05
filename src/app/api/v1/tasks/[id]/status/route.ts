import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { TaskService, TaskStatus } from '@/backend/services/taskService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/v1/tasks/:id/status
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedTask = await TaskService.updateTaskStatus(
      id,
      realOrgId,
      body.status as TaskStatus,
      body.progress_percentage
    );

    return NextResponse.json({
      success: true,
      message: `Task status updated to ${body.status}`,
      data: updatedTask,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
