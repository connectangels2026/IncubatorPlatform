import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    let signerName = 'Founder';
    try {
      const body = await req.json();
      if (body.signer_name) signerName = body.signer_name;
    } catch {}

    const now = new Date().toISOString();
    const mouDocumentUrl = `https://supabase.storage/mou/signed_mou_${id}.pdf`;

    const { data: updated, error } = await supabaseAdmin
      .from('applications')
      .update({
        mou_signed: true,
        mou_signed_date: now,
        mou_document_url: mouDocumentUrl,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `MoU successfully executed and recorded for ${signerName}.`,
      data: updated,
    }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}
