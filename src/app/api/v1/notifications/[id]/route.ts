import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);
const DEMO_USER_ID = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const userId = user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_ID;

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (error || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const userId = user?.id && isValidUUID(user.id) ? user.id : DEMO_USER_ID;

    // Check if notification exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from('notifications')
      .select('id, recipient_id')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Role check: Admin or recipient can delete
    const role = user?.role?.toLowerCase() || '';
    const isAdmin = role === 'admin' || role === 'super-admin';
    if (!isAdmin && existing.recipient_id !== userId) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own notifications' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
      id,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
