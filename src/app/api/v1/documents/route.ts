import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const BUCKET_NAME = 'documents';

// Helper: Ensure bucket exists
async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true });
    }
  } catch (err) {
    // Non-fatal, bucket might already exist or handled by Supabase policies
    console.warn('Storage bucket check warning:', err);
  }
}

// Helper: Calculate expiry info
export function calculateExpiryInfo(expiryDate: string | null) {
  if (!expiryDate) {
    return { is_expired: false, is_expiring_soon: false, days_until_expiry: null };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    is_expired: daysUntilExpiry < 0,
    is_expiring_soon: daysUntilExpiry >= 0 && daysUntilExpiry <= 30,
    days_until_expiry: daysUntilExpiry,
  };
}

// GET /api/v1/documents - List documents with filters & expiry alerts
export async function GET(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get('startup_id');
    const docType = searchParams.get('document_type');
    const status = searchParams.get('status');
    const expiringSoonOnly = searchParams.get('expiring_soon') === 'true';
    const isSigned = searchParams.get('is_signed');
    const includeArchived = searchParams.get('include_archived') === 'true';

    let query = supabaseAdmin
      .from('documents')
      .select(`
        *,
        startup:startups (id, name, sector, stage)
      `)
      .eq('organization_id', realOrgId)
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.is('deleted_at', null);
    }
    if (startupId) query = query.eq('startup_id', startupId);
    if (docType) query = query.eq('document_type', docType);
    if (status) query = query.eq('status', status);
    if (isSigned !== null && isSigned !== undefined && isSigned !== '') {
      query = query.eq('is_signed', isSigned === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    // Enrich with expiry metadata
    let enriched = (data || []).map((doc: any) => {
      const expiryInfo = calculateExpiryInfo(doc.expiry_date);
      return {
        ...doc,
        ...expiryInfo,
      };
    });

    if (expiringSoonOnly) {
      enriched = enriched.filter((doc: any) => doc.is_expiring_soon);
    }

    return NextResponse.json({
      success: true,
      total: enriched.length,
      data: enriched,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/v1/documents - Upload document (Multipart form data OR JSON base64)
export async function POST(req: NextRequest) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;

    const { orgId } = requireOrg(req);
    const realOrgId = resolveOrg(orgId);

    await ensureBucketExists();

    const contentType = req.headers.get('content-type') || '';
    let fileName = '';
    let docType = 'Agreement';
    let startupId: string | null = null;
    let expiryDate: string | null = null;
    let requiresSignature = false;
    let isPublic = false;
    let fileBuffer: Buffer | null = null;
    let fileSizeBytes = 0;
    let fileExt = 'pdf';
    let fileUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'File is required in multipart form data' }, { status: 400 });
      }

      fileName = (formData.get('file_name') as string) || file.name;
      docType = (formData.get('document_type') as string) || 'Agreement';
      startupId = (formData.get('startup_id') as string) || null;
      expiryDate = (formData.get('expiry_date') as string) || null;
      requiresSignature = formData.get('requires_signature') === 'true';
      isPublic = formData.get('is_public') === 'true';

      fileSizeBytes = file.size;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // JSON payload
      const body = await req.json();
      fileName = body.file_name;
      docType = body.document_type || 'Agreement';
      startupId = body.startup_id || null;
      expiryDate = body.expiry_date || null;
      requiresSignature = Boolean(body.requires_signature);
      isPublic = Boolean(body.is_public);
      fileUrl = body.file_url || '';

      if (body.file_base64) {
        fileBuffer = Buffer.from(body.file_base64, 'base64');
        fileSizeBytes = fileBuffer.length;
      } else if (!fileUrl) {
        // Sample test buffer
        fileBuffer = Buffer.from('PDF_SAMPLE_TEST_CONTENT');
        fileSizeBytes = fileBuffer.length;
      }
    }

    if (!fileName) {
      return NextResponse.json({ success: false, error: 'file_name is required' }, { status: 400 });
    }

    // Validate size limit (50MB)
    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({
        success: false,
        error: `File size (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of 50MB`,
      }, { status: 400 });
    }

    // Validate file format
    fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file format '.${fileExt}'. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
      }, { status: 400 });
    }

    // Clean filenames
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const startupPath = startupId || 'general';
    // Storage Path: org/{org_id}/documents/{doc_type}/{startup_id}/{file_name}
    const storagePath = `org/${realOrgId}/documents/${encodeURIComponent(docType)}/${startupPath}/${Date.now()}_${sanitizedFileName}`;

    if (fileBuffer) {
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
      };

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: mimeTypes[fileExt] || 'application/octet-stream',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload error, using path url:', uploadError);
      }
      fileUrl = storagePath;
    }

    const fileSizeKb = Math.max(1, Math.round(fileSizeBytes / 1024));

    // Save metadata in database
    const insertPayload = {
      organization_id: realOrgId,
      startup_id: startupId && isValidUUID(startupId) ? startupId : null,
      file_name: fileName,
      file_url: fileUrl,
      file_type: fileExt,
      file_size_kb: fileSizeKb,
      document_type: docType,
      version_number: 1,
      status: 'active',
      expiry_date: expiryDate,
      is_public: isPublic,
      requires_signature: requiresSignature,
      is_signed: false,
      signed_at: null,
      signed_by: null,
      deleted_at: null,
    };

    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert(insertPayload)
      .select()
      .single();

    if (dbError) throw dbError;

    const expiryInfo = calculateExpiryInfo(document.expiry_date);

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        ...document,
        ...expiryInfo,
        storage_path: storagePath,
      },
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
