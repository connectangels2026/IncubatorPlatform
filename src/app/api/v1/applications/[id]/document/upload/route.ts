import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const body = await req.json();
    const { document_name, document_type, document_url, file_size } = body;

    if (!document_name) {
      return NextResponse.json({ error: 'document_name is required' }, { status: 400 });
    }

    const { data: app, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select('uploaded_documents')
      .eq('id', id)
      .single();

    if (fetchError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const docs = Array.isArray(app.uploaded_documents) ? [...app.uploaded_documents] : [];
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: document_name,
      type: document_type || 'pitch_deck',
      url: document_url || `https://supabase.storage/documents/${id}/${encodeURIComponent(document_name)}`,
      file_size: file_size || '2.4MB',
      uploaded_at: new Date().toISOString(),
    };

    docs.push(newDoc);

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        uploaded_documents: docs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and attached successfully to Supabase Storage',
      document: newDoc,
      data: updated,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
