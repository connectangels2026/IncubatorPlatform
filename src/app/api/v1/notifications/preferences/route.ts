import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { NotificationService } from '@/backend/services/notificationService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);
const DEMO_USER_ID = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const userId = user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_ID;

    const preferences = await NotificationService.getPreferences(userId);

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      user_id: userId,
      preferences,
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
    const userId = user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_ID;
    const body = await req.json();

    const allowedKeys = [
      'email_notifications',
      'in_app_notifications',
      'application_updates',
      'mentorship_updates',
      'reminder_alerts',
      'marketing_emails',
    ];

    const updates: Record<string, boolean> = {};
    for (const key of allowedKeys) {
      if (typeof body[key] === 'boolean') {
        updates[key] = body[key];
      }
    }

    const updated = await NotificationService.setPreferences(userId, updates);

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      organization_id: realOrgId,
      user_id: userId,
      preferences: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
