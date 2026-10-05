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
 * GET /api/v1/tasks/:id
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const task = await TaskService.getTaskById(id, realOrgId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/v1/tasks/:id
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

    const updatedTask = await TaskService.updateTask(id, realOrgId, body);

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/v1/tasks/:id
 * Soft delete / archive task
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);

    const archivedTask = await TaskService.archiveTask(id, realOrgId);

    return NextResponse.json({
      success: true,
      message: 'Task archived successfully',
      data: archivedTask,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
