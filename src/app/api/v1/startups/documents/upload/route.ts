import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

export const dynamic = 'force-dynamic';

const PUBLIC_BUCKET = 'documents';
const PRIVATE_VIDEO_BUCKET = 'startup-videos-review';
const MAX_DOC_SIZE = 20 * 1024 * 1024; // 20MB for PDF/PPT
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB for MP4

// Ensure storage buckets exist
async function ensureBuckets() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const existing = buckets?.map((b) => b.name) || [];
    if (!existing.includes(PUBLIC_BUCKET)) {
      await supabaseAdmin.storage.createBucket(PUBLIC_BUCKET, { public: true });
    }
    if (!existing.includes(PRIVATE_VIDEO_BUCKET)) {
      await supabaseAdmin.storage.createBucket(PRIVATE_VIDEO_BUCKET, { public: false });
    }
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized: User email required' }, { status: 401 });
    }

    const emailLower = user.email.trim().toLowerCase();

    // 1. Fetch startup
    const { data: startup } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name, name, founder_id, founder_email')
      .or(`founder_email.ilike.${emailLower},founder_id.eq.${user.id}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = (formData.get('type') as string) || 'pitch_deck'; // 'pitch_deck' | 'business_plan' | 'demo_video'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileSize = file.size;

    await ensureBuckets();

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 2. Branch for demo video vs documents
    if (docType === 'demo_video') {
      if (fileExt !== 'mp4') {
        return NextResponse.json({ error: 'Invalid file format. Only MP4 videos are allowed.' }, { status: 400 });
      }
      if (fileSize > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: 'File size exceeds maximum 200MB limit.' }, { status: 400 });
      }

      const storagePath = `startups/${startup.id}/demo_video/${Date.now()}_${sanitizedName}`;

      // Upload to PRIVATE bucket
      const { error: uploadError } = await supabaseAdmin.storage
        .from(PRIVATE_VIDEO_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (uploadError) {
        console.error('Video upload failed:', uploadError);
        return NextResponse.json({ error: `Video upload error: ${uploadError.message}` }, { status: 500 });
      }

      // Insert row into startup_video_submissions with status 'pending'
      const { data: submission, error: subErr } = await supabaseAdmin
        .from('startup_video_submissions')
        .insert({
          startup_id: startup.id,
          file_path: storagePath,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subErr) {
        console.error('Failed to create video submission record:', subErr);
      }

      // Notify Incubator Admin
      try {
        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('id, email, full_name, name')
          .eq('organization_id', startup.organization_id)
          .limit(5);

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            await NotificationService.createNotification({
              organization_id: startup.organization_id,
              recipient_id: admin.id,
              recipient_name: admin.full_name || admin.name || 'Incubator Admin',
              recipient_email: admin.email,
              title: 'Product demo video submitted',
              message: `${startup.startup_name || startup.name || 'Startup'} submitted a product demo video for review.`,
              notification_type: 'general',
              send_in_app: true,
              related_entity_type: 'startup',
              related_entity_id: startup.id,
            });
          }
        }
      } catch (notifErr) {
        console.warn('Video notification warning:', notifErr);
      }

      // Log to organization_activity_log
      try {
        await supabaseAdmin.from('organization_activity_log').insert({
          organization_id: startup.organization_id,
          action: 'startup_video_submitted',
          description: `Submitted product demo video (${fileName}) for incubator review.`,
          triggered_by: user.email,
          triggered_by_id: user.id,
          metadata: {
            startup_id: startup.id,
            submission_id: submission?.id,
            file_name: fileName,
            file_size: fileSize,
            storage_path: storagePath,
          },
        });
      } catch (logErr) {
        console.warn('Activity log notice:', logErr);
      }

      // Create signed URL for founder preview
      const { data: signedData } = await supabaseAdmin.storage
        .from(PRIVATE_VIDEO_BUCKET)
        .createSignedUrl(storagePath, 3600);

      return NextResponse.json({
        success: true,
        submission,
        url: signedData?.signedUrl || storagePath,
        file_name: fileName,
        file_size: fileSize,
        file_type: 'mp4',
        message: 'Product demo video submitted for incubator review.',
      });
    }

    // Pitch deck or Business plan
    const allowedDocExts = ['pdf', 'ppt', 'pptx'];
    if (!allowedDocExts.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF, PPT, and PPTX documents are supported.' },
        { status: 400 }
      );
    }
    if (fileSize > MAX_DOC_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 20MB limit.' }, { status: 400 });
    }

    const storagePath = `startups/${startup.id}/${docType}/${Date.now()}_${sanitizedName}`;
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PUBLIC_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeMap[fileExt] || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage.from(PUBLIC_BUCKET).getPublicUrl(storagePath);
    const publicUrl = publicData?.publicUrl || storagePath;

    // Log to organization_activity_log
    try {
      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: startup.organization_id,
        action: `${docType}_uploaded`,
        description: `Uploaded ${docType.replace('_', ' ')} (${fileName}) for startup ${startup.startup_name || startup.name}`,
        triggered_by: user.email,
        triggered_by_id: user.id,
        metadata: {
          startup_id: startup.id,
          doc_type: docType,
          file_name: fileName,
          file_size: fileSize,
          url: publicUrl,
        },
      });
    } catch (logErr) {
      console.warn('Activity log notice:', logErr);
    }

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
