import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { TaskService } from '@/backend/services/taskService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

export async function GET(req: NextRequest) {
  return handleTaskReminders(req);
}

export async function POST(req: NextRequest) {
  return handleTaskReminders(req);
}

async function handleTaskReminders(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const searchParams = req.nextUrl.searchParams;
    const targetDate = searchParams.get('date') || undefined;

    const summary = await TaskService.sendDueTaskReminders(realOrgId, targetDate);

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      summary,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
