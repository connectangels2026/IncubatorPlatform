import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { password, email, access_token } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    // 1. If email is provided, update user password directly in Supabase
    if (email) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const targetUser = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!targetUser) {
        return NextResponse.json({ error: `User with email ${email} not found` }, { status: 404 });
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        password,
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Password updated successfully for ${email}. You can now log in with the new password.`,
        user_id: targetUser.id,
      }, { status: 200 });
    }

    // 2. If access_token or Authorization header is provided
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const token = (authHeader ? authHeader.replace(/^(Bearer\s*)+/i, '').trim() : '') || access_token;

    if (token && !token.startsWith('mock-')) {
      const client = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const { error } = await client.auth.updateUser({ password });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status || 400 });
      }

      return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
    }

    // 3. Fallback for mock dev test
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully (dev mock)',
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
