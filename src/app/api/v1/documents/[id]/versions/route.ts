import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/v1/documents/:id/versions - Get complete version history
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { data: currentDoc, error: findError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !currentDoc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    // Trace lineage: Collect all versions related to this document
    // Strategy: find all documents that share the same root or parent chain or same startup + filename/doc_type
    let rootId = currentDoc.id;
    let traceDoc = currentDoc;

    // Follow previous_version_id backwards to find root
    while (traceDoc.previous_version_id) {
      const { data: prev } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('id', traceDoc.previous_version_id)
        .single();
      if (prev) {
        rootId = prev.id;
        traceDoc = prev;
      } else {
        break;
      }
    }

    // Now query all documents in the organization that belong to this version tree or base name
    const { data: allDocs, error: allDocsError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('organization_id', currentDoc.organization_id)
      .eq('document_type', currentDoc.document_type)
      .order('version_number', { ascending: true });

    if (allDocsError) throw allDocsError;

    // Filter versions that are either part of the chain or matching startup and document
    const baseName = currentDoc.file_name.replace(/_v\d+/i, '').split('.')[0];
    const versions = (allDocs || []).filter((doc: any) => {
      if (doc.id === currentDoc.id) return true;
      if (doc.previous_version_id === currentDoc.id || currentDoc.previous_version_id === doc.id) return true;
      if (currentDoc.startup_id && doc.startup_id === currentDoc.startup_id) {
        const docBase = doc.file_name.replace(/_v\d+/i, '').split('.')[0];
        return docBase === baseName;
      }
      return false;
    });

    // Sort by version_number ascending
    versions.sort((a: any, b: any) => (a.version_number || 1) - (b.version_number || 1));

    return NextResponse.json({
      success: true,
      document_id: currentDoc.id,
      current_version: currentDoc.version_number || 1,
      total_versions: versions.length,
      versions: versions.map((v: any) => ({
        id: v.id,
        version_number: v.version_number || 1,
        file_name: v.file_name,
        file_url: v.file_url,
        file_size_kb: v.file_size_kb,
        document_type: v.document_type,
        status: v.status,
        is_signed: v.is_signed,
        signed_at: v.signed_at,
        created_at: v.created_at,
        is_current: v.id === currentDoc.id,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
