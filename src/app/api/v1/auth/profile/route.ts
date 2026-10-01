import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function PUT(req: NextRequest) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const body = await req.json();

    if (user?.id && !user.id.startsWith('mock-')) {
      const updatePayload: any = {
        user_metadata: body,
      };
      if (body.email) {
        updatePayload.email = body.email;
        updatePayload.email_confirm = true;
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, updatePayload);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, user: data.user }, { status: 200 });
    }

    // Mock response for dev/test
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: { ...user, ...body },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
