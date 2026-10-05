import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { NotificationService } from '@/backend/services/notificationService';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

// Fallback user for dev / mock-admin tokens
const DEMO_USER_ID = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const realOrgId = resolveOrg(orgId);
    const userId = user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_ID;

    const searchParams = req.nextUrl.searchParams;
    const isReadParam = searchParams.get('is_read');
    const isRead = isReadParam !== null ? isReadParam === 'true' : undefined;
    const notificationType = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await NotificationService.listUserNotifications(userId, realOrgId, {
      is_read: isRead,
      notification_type: notificationType,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      organization_id: realOrgId,
      recipient_id: userId,
      total: result.total,
      unread_count: result.unread_count,
      data: result.notifications,
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

    const recipientId = body.recipient_id || (user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_ID);
    const {
      title,
      message,
      notification_type = 'general',
      send_email = true,
      send_in_app = true,
      send_sms = false,
      related_entity_type,
      related_entity_id,
      recipient_email,
      recipient_name,
      metadata,
    } = body;

    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Validation Error: title and message are required' },
        { status: 400 }
      );
    }

    const result = await NotificationService.createNotification({
      organization_id: realOrgId,
      recipient_id: recipientId,
      recipient_name,
      recipient_email,
      title,
      message,
      notification_type,
      send_email,
      send_in_app,
      send_sms,
      related_entity_type,
      related_entity_id,
      metadata,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.duplicate
          ? 'Notification already dispatched recently (deduplicated).'
          : 'Notification created successfully.',
        data: result.notification,
        email_dispatched: result.email_dispatched,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
