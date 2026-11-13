import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const PRIVATE_DOCS_BUCKET = 'startup-documents-private';
const PRIVATE_VIDEO_BUCKET = 'startup-videos-review';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rawPath = req.nextUrl.searchParams.get('path')?.trim();
    if (!rawPath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Determine bucket from path prefix
    const bucket =
      req.nextUrl.searchParams.get('bucket') ||
      (rawPath.includes('/demo_video/') || rawPath.includes('/elevator_video/')
        ? PRIVATE_VIDEO_BUCKET
        : PRIVATE_DOCS_BUCKET);

    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(rawPath, 3600);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Could not generate signed URL' }, { status: 404 });
    }

    return NextResponse.json({ success: true, signed_url: data.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
