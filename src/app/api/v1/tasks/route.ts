import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { TaskService } from '@/backend/services/taskService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

/**
 * GET /api/v1/tasks
 * Filter by: status, priority, due_date
 */
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;

    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const dueDate = searchParams.get('due_date') || undefined;
    const includeArchived = searchParams.get('include_archived') === 'true';
    const assignedToUser = searchParams.get('assigned_to_user_id') || undefined;
    const assignedToStartup = searchParams.get('assigned_to_startup_id') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await TaskService.listTasks(realOrgId, {
      status,
      priority,
      due_date: dueDate,
      include_archived: includeArchived,
      assigned_to_user_id: assignedToUser,
      assigned_to_startup_id: assignedToStartup,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      total: result.total,
      data: result.tasks,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/v1/tasks
 * Create task (supports user/startup assignment and mentorship session action point conversion)
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const createdTask = await TaskService.createTask({
      organization_id: realOrgId,
      title: body.title,
      description: body.description,
      task_type: body.task_type,
      assigned_to_user_id: body.assigned_to_user_id,
      assigned_to_startup_id: body.assigned_to_startup_id,
      assigned_by_user_id: body.assigned_by_user_id || user?.id || null,
      due_date: body.due_date,
      priority: body.priority,
      status: body.status,
      progress_percentage: body.progress_percentage,
      related_session_id: body.related_session_id,
      related_review_id: body.related_review_id,
      action_point_id: body.action_point_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Task created successfully',
        data: createdTask,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
