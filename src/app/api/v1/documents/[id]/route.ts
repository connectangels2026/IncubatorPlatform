import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { calculateExpiryInfo } from '../route';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/v1/documents/:id - Get document metadata & details
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { id } = await context.params;
    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        startup:startups (id, name, sector, stage, founder_email)
      `)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (error || !document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const expiryInfo = calculateExpiryInfo(document.expiry_date);

    return NextResponse.json({
      success: true,
      data: {
        ...document,
        ...expiryInfo,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// PUT /api/v1/documents/:id - Update metadata OR create new version (amendment)
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { id } = await context.params;
    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    // Check existing document
    const { data: existing, error: findError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const body = await req.json();

    // Check if this is a version bump (amendment / new version)
    if (body.new_version || body.version_bump) {
      const nextVersion = (existing.version_number || 1) + 1;
      const newFileName = body.file_name || existing.file_name;
      const newFileUrl = body.file_url || existing.file_url;
      const newFileSizeKb = body.file_size_kb || existing.file_size_kb;

      const newVersionDoc = {
        organization_id: existing.organization_id,
        startup_id: existing.startup_id,
        application_id: existing.application_id,
        file_name: newFileName,
        file_url: newFileUrl,
        file_type: body.file_type || existing.file_type,
        file_size_kb: newFileSizeKb,
        document_type: body.document_type || existing.document_type,
        version_number: nextVersion,
        previous_version_id: existing.id,
        status: 'active',
        expiry_date: body.expiry_date !== undefined ? body.expiry_date : existing.expiry_date,
        is_public: body.is_public !== undefined ? body.is_public : existing.is_public,
        requires_signature: body.requires_signature !== undefined ? body.requires_signature : existing.requires_signature,
        is_signed: false, // New version resets signature requirement
        signed_at: null,
        signed_by: null,
        deleted_at: null,
      };

      const { data: createdVersion, error: insertError } = await supabaseAdmin
        .from('documents')
        .insert(newVersionDoc)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update old version status to 'superseded'
      await supabaseAdmin
        .from('documents')
        .update({ status: 'superseded', updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      return NextResponse.json({
        success: true,
        message: `Created document amendment version ${nextVersion}`,
        data: createdVersion,
      }, { status: 201 });
    }

    // Standard metadata update
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.file_name) updateData.file_name = body.file_name;
    if (body.document_type) updateData.document_type = body.document_type;
    if (body.expiry_date !== undefined) updateData.expiry_date = body.expiry_date;
    if (body.requires_signature !== undefined) updateData.requires_signature = body.requires_signature;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.status) updateData.status = body.status;

    const { data: updatedDoc, error: updateError } = await supabaseAdmin
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    const expiryInfo = calculateExpiryInfo(updatedDoc.expiry_date);

    return NextResponse.json({
      success: true,
      message: 'Document metadata updated successfully',
      data: {
        ...updatedDoc,
        ...expiryInfo,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/v1/documents/:id - Soft delete (archive) document
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { id } = await context.params;
    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { data: existing, error: findError } = await supabaseAdmin
      .from('documents')
      .select('id, file_name, status, deleted_at')
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { error: archiveError } = await supabaseAdmin
      .from('documents')
      .update({
        status: 'archived',
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (archiveError) throw archiveError;

    return NextResponse.json({
      success: true,
      message: `Document '${existing.file_name}' archived successfully (soft deleted)`,
      archived_id: id,
      archived_at: now,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
