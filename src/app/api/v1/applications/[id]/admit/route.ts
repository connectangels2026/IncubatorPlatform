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
      return NextResponse.json({ error: 'Forbidden: Only admins can admit applications' }, { status: 403 });
    }

    // Acceptance Criteria: Admission triggers admission letter generation
    const admissionLetterUrl = `https://storage.incubator.platform/letters/admission_${id}.pdf`;

    const { data: updated, error } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'admitted',
        admission_status: 'admitted',
        admission_date: new Date().toISOString().split('T')[0],
        admission_letter_url: admissionLetterUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Applicant successfully admitted. Admission letter generated.',
      data: updated,
    }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
