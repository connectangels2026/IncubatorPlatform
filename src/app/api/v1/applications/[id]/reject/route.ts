import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const role = user?.role?.toLowerCase() || '';
    if (role !== 'admin' && role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can reject applications' }, { status: 403 });
    }

    let comments = null;
    try {
      const body = await req.json();
      comments = body.reason || body.reviewer_comments || null;
    } catch {}

    const { data: updated, error } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'rejected',
        admission_status: 'rejected',
        reviewer_comments: comments,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Application marked as rejected',
      data: updated,
    }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
