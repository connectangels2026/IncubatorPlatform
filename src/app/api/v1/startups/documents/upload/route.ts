import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';
import { StartupService } from '@/backend/services/startupService';
import { logActivity } from '@/backend/services/activityLogger';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const PUBLIC_BUCKET = 'documents';
const PRIVATE_DOCS_BUCKET = 'startup-documents-private';
const PRIVATE_VIDEO_BUCKET = 'startup-videos-review';

const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB for Pitch Deck & Business Plan
const MAX_ONE_PAGER_SIZE = 5 * 1024 * 1024; // 5MB for One-pager (PDF/PNG/JPG)
const MAX_DEMO_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB for Product Demo MP4
const MAX_ELEVATOR_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for Elevator Pitch MP4
const MAX_ELEVATOR_SECONDS = 60;

async function ensureBuckets() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const existing = buckets?.map((b) => b.name) || [];
    if (!existing.includes(PUBLIC_BUCKET)) {
      await supabaseAdmin.storage.createBucket(PUBLIC_BUCKET, { public: true });
    }
    if (!existing.includes(PRIVATE_DOCS_BUCKET)) {
      await supabaseAdmin.storage.createBucket(PRIVATE_DOCS_BUCKET, { public: false });
    }
    if (!existing.includes(PRIVATE_VIDEO_BUCKET)) {
      await supabaseAdmin.storage.createBucket(PRIVATE_VIDEO_BUCKET, { public: false });
    }
  } catch {}
}

/**
 * Best-effort MP4 duration parser inspecting the ISO BMFF `mvhd` atom.
 * Returns whole seconds or null if header atom isn't in standard offset.
 */
function parseMp4DurationSeconds(buf: Buffer): number | null {
  try {
    const idx = buf.indexOf(Buffer.from('mvhd'));
    if (idx < 0 || idx + 28 >= buf.length) return null;
    const version = buf.readUInt8(idx + 4);
    if (version === 0) {
      const timescale = buf.readUInt32BE(idx + 16);
      const duration = buf.readUInt32BE(idx + 20);
      if (timescale > 0) return Math.round(duration / timescale);
    } else if (version === 1 && idx + 36 < buf.length) {
      const timescale = buf.readUInt32BE(idx + 24);
      const durationHi = buf.readUInt32BE(idx + 28);
      const durationLo = buf.readUInt32BE(idx + 32);
      const duration = durationHi * 4294967296 + durationLo;
      if (timescale > 0) return Math.round(duration / timescale);
    }
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized: User email required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = (formData.get('type') as string) || 'pitch_deck'; // 'pitch_deck' | 'business_plan' | 'one_pager' | 'demo_video' | 'elevator_video'
    const requestedStartupId = (formData.get('startup_id') as string) || req.nextUrl.searchParams.get('startup_id') || 'me';
    const rawDuration = formData.get('duration_seconds');

    let startup = await StartupService.getStartup(requestedStartupId, user);
    if (!startup && requestedStartupId !== 'me') {
      startup = await StartupService.getStartup('me', user);
    }
    if (!startup) {
      const emailLower = (user.email || '').trim().toLowerCase();
      const { data: st } = await supabaseAdmin
        .from('startups')
        .select('*')
        .ilike('founder_email', emailLower)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      startup = st;
    }
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize = file.size;

    await ensureBuckets();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 1. Video submissions ('demo_video' or 'elevator_video')
    if (docType === 'demo_video' || docType === 'elevator_video') {
      const isElevator = docType === 'elevator_video';
      const kind = isElevator ? 'elevator' : 'demo';

      if (fileExt !== 'mp4') {
        return NextResponse.json({ error: 'Invalid file format. Only MP4 videos are allowed.' }, { status: 400 });
      }
      const maxBytes = isElevator ? MAX_ELEVATOR_VIDEO_SIZE : MAX_DEMO_VIDEO_SIZE;
      const maxMbLabel = isElevator ? '50MB' : '200MB';
      if (fileSize > maxBytes) {
        return NextResponse.json({ error: `File size exceeds maximum ${maxMbLabel} limit.` }, { status: 400 });
      }

      const clientDuration = rawDuration ? Math.round(Number(rawDuration)) : null;
      const serverDuration = parseMp4DurationSeconds(fileBuffer);
      const durationSeconds = serverDuration ?? clientDuration;

      if (isElevator && durationSeconds !== null && !Number.isNaN(durationSeconds) && durationSeconds > MAX_ELEVATOR_SECONDS) {
        return NextResponse.json({ error: 'Elevator pitch must be 60 seconds or less' }, { status: 400 });
      }

      const storagePath = `startups/${startup.id}/${docType}/${Date.now()}_${sanitizedName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(PRIVATE_VIDEO_BUCKET)
        .upload(storagePath, fileBuffer, { contentType: 'video/mp4', upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: `Video upload error: ${uploadError.message}` }, { status: 500 });
      }

      const insertPayload: Record<string, any> = {
        startup_id: startup.id,
        file_path: storagePath,
        status: 'pending',
        kind,
        duration_seconds: durationSeconds,
        submitted_at: new Date().toISOString(),
      };

      let { data: submission, error: subErr } = await supabaseAdmin
        .from('startup_video_submissions')
        .insert(insertPayload)
        .select()
        .single();

      // Safe fallback if migration adding kind/duration_seconds has not been applied yet
      if (subErr && (subErr as any).code === '42703') {
        delete insertPayload.kind;
        delete insertPayload.duration_seconds;
        const retry = await supabaseAdmin
          .from('startup_video_submissions')
          .insert(insertPayload)
          .select()
          .single();
        submission = retry.data;
        subErr = retry.error;
      }
      if (subErr) console.error('Failed to create video submission record:', subErr);

      const label = isElevator ? 'elevator pitch' : 'product demo video';
      try {
        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('id, email, full_name')
          .eq('organization_id', startup.organization_id)
          .in('role', ['admin', 'incubator_admin', 'incubator'])
          .limit(5);
        for (const admin of admins || []) {
          await NotificationService.createNotification({
            organization_id: startup.organization_id,
            recipient_id: admin.id,
            recipient_name: admin.full_name || 'Incubator Admin',
            recipient_email: admin.email,
            title: isElevator ? 'Elevator pitch submitted' : 'Product demo video submitted',
            message: `${startup.startup_name || startup.name || 'Startup'} submitted an ${label} for review.`,
            notification_type: 'general',
            send_in_app: true,
            related_entity_type: 'startup',
            related_entity_id: startup.id,
          });
        }
      } catch {}

      await logActivity({
        organization_id: startup.organization_id,
        user_id: user.id || null,
        actor_email: user.email,
        action: isElevator ? 'startup_elevator_video_submitted' : 'startup_video_submitted',
        entity_type: 'startup',
        entity_id: startup.id,
        description: `Submitted ${label} (${fileName}) for incubator review.`,
        details: { submission_id: submission?.id, kind, duration_seconds: durationSeconds, file_size: fileSize },
      });

      const { data: signedData } = await supabaseAdmin.storage
        .from(PRIVATE_VIDEO_BUCKET)
        .createSignedUrl(storagePath, 3600);

      return NextResponse.json({
        success: true,
        submission: submission || { ...insertPayload, id: undefined },
        url: signedData?.signedUrl || storagePath,
        file_name: fileName,
        file_size: fileSize,
        file_type: 'mp4',
        kind,
        duration_seconds: durationSeconds,
        message: `Your ${label} was submitted for incubator review.`,
      });
    }

    // 2. Private One-pager (PDF, PNG, JPG up to 5MB)
    if (docType === 'one_pager') {
      const allowedOnePager = ['pdf', 'png', 'jpg', 'jpeg'];
      if (!allowedOnePager.includes(fileExt)) {
        return NextResponse.json(
          { error: 'Invalid file format. Only PDF, PNG, and JPG files are allowed for One-pager.' },
          { status: 400 }
        );
      }
      if (fileSize > MAX_ONE_PAGER_SIZE) {
        return NextResponse.json({ error: 'File size exceeds maximum 5MB limit.' }, { status: 400 });
      }

      const storagePath = `startups/${startup.id}/one_pager/${Date.now()}_${sanitizedName}`;
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
      };

      const { error: uploadError } = await supabaseAdmin.storage
        .from(PRIVATE_DOCS_BUCKET)
        .upload(storagePath, fileBuffer, { contentType: mimeMap[fileExt] || 'application/octet-stream', upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 });
      }

      const { data: signedData } = await supabaseAdmin.storage
        .from(PRIVATE_DOCS_BUCKET)
        .createSignedUrl(storagePath, 3600);

      await logActivity({
        organization_id: startup.organization_id,
        user_id: user.id || null,
        actor_email: user.email,
        action: 'one_pager_uploaded',
        entity_type: 'startup',
        entity_id: startup.id,
        description: `Uploaded one-pager (${fileName}) for ${startup.startup_name || startup.name}`,
        details: { doc_type: 'one_pager', file_name: fileName, file_size: fileSize, storage_path: storagePath },
      });

      return NextResponse.json({
        success: true,
        url: storagePath,
        path: storagePath,
        signed_url: signedData?.signedUrl || null,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileExt,
        uploaded_at: new Date().toISOString(),
      });
    }

    // 3. Pitch deck or Business plan (PDF/PPT/PPTX up to 10MB)
    const allowedDocExts = ['pdf', 'ppt', 'pptx'];
    if (!allowedDocExts.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF, PPT, and PPTX documents are supported.' },
        { status: 400 }
      );
    }
    if (fileSize > MAX_DOC_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 10MB limit.' }, { status: 400 });
    }

    const storagePath = `startups/${startup.id}/${docType}/${Date.now()}_${sanitizedName}`;
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PUBLIC_BUCKET)
      .upload(storagePath, fileBuffer, { contentType: mimeMap[fileExt] || 'application/octet-stream', upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage.from(PUBLIC_BUCKET).getPublicUrl(storagePath);
    const publicUrl = publicData?.publicUrl || storagePath;

    await logActivity({
      organization_id: startup.organization_id,
      user_id: user.id || null,
      actor_email: user.email,
      action: `${docType}_uploaded`,
      entity_type: 'startup',
      entity_id: startup.id,
      description: `Uploaded ${docType.replace('_', ' ')} (${fileName}) for startup ${startup.startup_name || startup.name}`,
      details: { doc_type: docType, file_name: fileName, file_size: fileSize, url: publicUrl },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileExt,
      uploaded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
