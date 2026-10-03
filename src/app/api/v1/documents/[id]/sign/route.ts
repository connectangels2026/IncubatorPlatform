import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/v1/documents/:id/sign - Digitally sign document
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { data: document, error: findError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    if (document.deleted_at) {
      return NextResponse.json({
        success: false,
        error: 'Archived documents cannot be signed',
      }, { status: 400 });
    }

    if (document.is_signed) {
      return NextResponse.json({
        success: true,
        message: 'Document has already been signed',
        is_signed: true,
        signed_at: document.signed_at,
        data: document,
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const signerName = body.signer_name || 'Authorized Signatory';
    const signerEmail = body.signer_email || null;
    const signedAt = new Date().toISOString();

    const { data: updatedDoc, error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        is_signed: true,
        signed_at: signedAt,
        requires_signature: false, // Signature satisfied
        updated_at: signedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Document '${document.file_name}' successfully signed`,
      is_signed: true,
      signed_at: signedAt,
      signer: {
        name: signerName,
        email: signerEmail,
      },
      data: updatedDoc,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
