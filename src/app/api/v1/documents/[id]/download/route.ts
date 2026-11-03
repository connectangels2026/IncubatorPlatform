import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const BUCKET_NAME = 'documents';

// GET /api/v1/documents/:id/download - Get signed secure download URL with ownership check
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { id } = await context.params;

    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select('id, organization_id, startup_id, file_name, file_url, file_type, file_size_kb, status, deleted_at')
      .eq('id', id)
      .single();

    if (error || !document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Ownership check: staff or user belonging to document organization
    const role = user?.role?.toLowerCase() || '';
    const isStaff = role === 'admin' || role === 'super-admin' || role === 'super_admin' || role === 'incubator_admin' || role === 'incubator';
    if (!isStaff && user?.organization_id && document.organization_id && user.organization_id !== document.organization_id) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not have access to this document' }, { status: 403 });
    }

    if (error || !document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    if (document.deleted_at) {
      return NextResponse.json({
        success: false,
        error: 'Document is archived and cannot be downloaded',
      }, { status: 400 });
    }

    let downloadUrl = document.file_url;

    // If file_url is a Supabase storage path, generate a signed download URL valid for 1 hour
    if (document.file_url && !document.file_url.startsWith('http')) {
      const { data: signedData, error: signError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(document.file_url, 3600); // 1 hour

      if (!signError && signedData?.signedUrl) {
        downloadUrl = signedData.signedUrl;
      }
    }

    return NextResponse.json({
      success: true,
      document_id: document.id,
      file_name: document.file_name,
      file_type: document.file_type,
      file_size_kb: document.file_size_kb,
      download_url: downloadUrl,
      expires_in_seconds: 3600,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
