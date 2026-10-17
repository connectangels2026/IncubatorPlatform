import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const email = req.nextUrl.searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ error: 'Missing id or email parameter' }, { status: 400 });
    }

    if (id) {
      const cleanId = id.replace(/^#/, '').trim().toLowerCase();
      
      // If full 36-char UUID
      if (cleanId.length === 36) {
        const { data, error } = await supabaseAdmin
          .from('applications')
          .select('*')
          .eq('id', cleanId)
          .is('deleted_at', null)
          .maybeSingle();

        if (error) throw error;
        if (data) return NextResponse.json({ success: true, data });
      }

      // If prefix search (e.g. #c40f0650-ffcf)
      const { data: list, error: listError } = await supabaseAdmin
        .from('applications')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (listError) throw listError;

      const found = (list || []).find(
        (a) => a.id.toLowerCase() === cleanId || a.id.toLowerCase().startsWith(cleanId)
      );

      if (found) {
        return NextResponse.json({ success: true, data: found });
      }
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select('*')
        .ilike('applicant_email', cleanEmail)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        return NextResponse.json({ success: true, data: data[0] });
      }
    }

    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
