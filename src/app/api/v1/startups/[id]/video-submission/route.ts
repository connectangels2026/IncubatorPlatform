import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

export const dynamic = 'force-dynamic';

const PRIVATE_VIDEO_BUCKET = 'startup-videos-review';
const PUBLIC_BUCKET = 'documents';

const isValidUUID = (s?: string | null) =>
  Boolean(s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s));

// Resolve startup by UUID or 'me'
async function resolveStartup(id: string, user: any) {
  if (id && id !== 'me' && isValidUUID(id)) {
    const { data: st, error } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name, founder_id, founder_email, demo_video_url')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error resolving startup by id:', error);
    }
    if (st) {
      return { ...st, name: st.startup_name };
    }
  }

  if (!user?.email) return null;
  const emailLower = user.email.trim().toLowerCase();

  const { data: st, error } = await supabaseAdmin
    .from('startups')
    .select('id, organization_id, startup_name, founder_id, founder_email, demo_video_url')
    .ilike('founder_email', emailLower)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error resolving startup by founder email:', error);
  }
  if (st) {
    return { ...st, name: st.startup_name };
  }

  // Fallback: lookup by user.id if UUID
  if (user?.id && isValidUUID(user.id)) {
    const { data: stById } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name, founder_id, founder_email, demo_video_url')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (stById) {
      return { ...stById, name: stById.startup_name };
    }
  }

  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User authentication required' }, { status: 401 });
    }

    const startup = await resolveStartup(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Permission check: owning founder or incubator staff/super admin
    const userRole = (user?.role || '').toLowerCase();
    const isOrgMember = Boolean(
      user?.organization_id &&
      startup.organization_id &&
      user.organization_id === startup.organization_id
    );
    const isStaff =
      isOrgMember ||
      userRole.includes('admin') ||
      userRole.includes('incubator') ||
      userRole === 'super-admin' ||
      userRole === 'super_admin';

    const isOwner =
      (user?.email && startup.founder_email && user.email.toLowerCase() === startup.founder_email.toLowerCase()) ||
      (user?.id && startup.founder_id && user.id === startup.founder_id);

    if (!isStaff && !isOwner && id !== 'me') {
      return NextResponse.json({ error: 'Forbidden: Access denied to this startup video submission' }, { status: 403 });
    }

    // Query latest submission from startup_video_submissions
    const { data: submissions, error: subErr } = await supabaseAdmin
      .from('startup_video_submissions')
      .select('*')
      .eq('startup_id', startup.id)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (subErr) {
      console.error('Error fetching startup_video_submissions:', subErr);
      return NextResponse.json({ success: true, submission: null, video_url: null });
    }

    const latest = submissions && submissions.length > 0 ? submissions[0] : null;

    if (!latest) {
      return NextResponse.json({
        success: true,
        submission: null,
        video_url: startup.demo_video_url || null,
        startup_name: startup.startup_name || startup.name || 'Startup',
      });
    }

    let videoUrl = latest.published_url || startup.demo_video_url || null;

    // If file is stored in private bucket, generate a signed URL for playback
    if (latest.file_path) {
      try {
        const { data: signedData } = await supabaseAdmin.storage
          .from(PRIVATE_VIDEO_BUCKET)
          .createSignedUrl(latest.file_path, 3600); // 1 hour validity

        if (signedData?.signedUrl) {
          videoUrl = signedData.signedUrl;
        }
      } catch (signErr) {
        console.warn('Failed to generate signed video URL:', signErr);
      }
    }

    return NextResponse.json({
      success: true,
      submission: latest,
      video_url: videoUrl,
      startup_name: startup.startup_name || startup.name || 'Startup',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: User authentication required' }, { status: 401 });
    }

    const startup = await resolveStartup(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const body = await req.json();
    const action = body.action || 'decide'; // 'cancel' | 'decide'

    const userRole = (user?.role || '').toLowerCase();
    const isOrgMember = Boolean(
      user?.organization_id &&
      startup.organization_id &&
      user.organization_id === startup.organization_id
    );
    const isStaff =
      isOrgMember ||
      userRole.includes('admin') ||
      userRole.includes('incubator') ||
      userRole === 'super-admin' ||
      userRole === 'super_admin';

    const isOwner =
      (user?.email && startup.founder_email && user.email.toLowerCase() === startup.founder_email.toLowerCase()) ||
      (user?.id && startup.founder_id && user.id === startup.founder_id);

    // 1. Cancel action (by founder or staff)
    if (action === 'cancel') {
      if (!isStaff && !isOwner && id !== 'me') {
        return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
      }

      const { data: latest } = await supabaseAdmin
        .from('startup_video_submissions')
        .select('*')
        .eq('startup_id', startup.id)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest) {
        await supabaseAdmin
          .from('startup_video_submissions')
          .delete()
          .eq('id', latest.id);

        try {
          await supabaseAdmin.from('organization_activity_log').insert({
            organization_id: startup.organization_id,
            action: 'startup_video_cancelled',
            description: `Cancelled video review submission for startup ${startup.startup_name || startup.name}`,
            triggered_by: user.email,
            triggered_by_id: user.id,
            metadata: { startup_id: startup.id, submission_id: latest.id },
          });
        } catch {}
      }

      return NextResponse.json({ success: true, message: 'Submission cancelled successfully.' });
    }

    // 2. Decide action (Approve / Reject) -> ONLY INCUBATOR STAFF
    if (action === 'decide') {
      if (!isStaff) {
        return NextResponse.json(
          { error: 'Forbidden: Only incubator administrators can approve or reject video submissions.' },
          { status: 403 }
        );
      }

      const decisionStatus = body.status; // 'approved' | 'rejected'
      if (decisionStatus !== 'approved' && decisionStatus !== 'rejected') {
        return NextResponse.json({ error: "Invalid status: must be 'approved' or 'rejected'" }, { status: 400 });
      }

      // Fetch the latest submission
      const { data: latest } = await supabaseAdmin
        .from('startup_video_submissions')
        .select('*')
        .eq('startup_id', startup.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest) {
        return NextResponse.json({ error: 'No video submission found to review.' }, { status: 404 });
      }

      const reviewerName = user.email || 'Incubator Staff';
      const recipientId = isValidUUID(startup.founder_id)
        ? startup.founder_id
        : 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';

      if (decisionStatus === 'approved') {
        // Publish video: copy or move from private bucket to public documents bucket
        let publishedUrl = '';

        try {
          const { data: fileData, error: dlErr } = await supabaseAdmin.storage
            .from(PRIVATE_VIDEO_BUCKET)
            .download(latest.file_path);

          if (dlErr || !fileData) {
            throw new Error(`Failed to download file from private bucket: ${dlErr?.message}`);
          }

          const fileBuffer = Buffer.from(await fileData.arrayBuffer());
          const publicPath = `startups/${startup.id}/demo_video/${Date.now()}_published.mp4`;

          const { error: upErr } = await supabaseAdmin.storage
            .from(PUBLIC_BUCKET)
            .upload(publicPath, fileBuffer, {
              contentType: 'video/mp4',
              upsert: true,
            });

          if (upErr) {
            throw new Error(`Failed to publish video to public storage: ${upErr.message}`);
          }

          const { data: pubData } = supabaseAdmin.storage.from(PUBLIC_BUCKET).getPublicUrl(publicPath);
          publishedUrl = pubData?.publicUrl || publicPath;
        } catch (copyErr: any) {
          console.error('Failed to publish video file:', copyErr);
          return NextResponse.json(
            { error: `Could not publish video: ${copyErr.message}` },
            { status: 500 }
          );
        }

        // Update submission
        const { data: updatedSub, error: updateErr } = await supabaseAdmin
          .from('startup_video_submissions')
          .update({
            status: 'approved',
            published_url: publishedUrl,
            reviewed_by: reviewerName,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', latest.id)
          .select()
          .single();

        if (updateErr) {
          console.error('Error updating submission record:', updateErr);
        }

        // Update startups table demo_video_url
        await supabaseAdmin
          .from('startups')
          .update({ demo_video_url: publishedUrl })
          .eq('id', startup.id);

        // Notify startup founder
        try {
          await NotificationService.createNotification({
            organization_id: startup.organization_id,
            recipient_id: recipientId,
            recipient_name: startup.startup_name || startup.name || 'Founder',
            recipient_email: startup.founder_email,
            title: 'Product demo video approved',
            message: 'Your product demo video has been approved and published to your public profile.',
            notification_type: 'general',
            send_in_app: true,
            related_entity_type: 'startup',
            related_entity_id: startup.id,
          });
        } catch (notifErr) {
          console.warn('Founder approval notification failed:', notifErr);
        }

        // Log to organization_activity_log
        try {
          await supabaseAdmin.from('organization_activity_log').insert({
            organization_id: startup.organization_id,
            action: 'startup_video_approved',
            description: `Approved product demo video for startup ${startup.startup_name || startup.name}. Published URL: ${publishedUrl}`,
            triggered_by: user.email,
            triggered_by_id: user.id,
            metadata: {
              startup_id: startup.id,
              submission_id: latest.id,
              published_url: publishedUrl,
            },
          });
        } catch (logErr) {
          console.warn('Activity log notice:', logErr);
        }

        return NextResponse.json({
          success: true,
          submission: updatedSub || { ...latest, status: 'approved', published_url: publishedUrl },
          published_url: publishedUrl,
          message: 'Product demo video approved and published.',
        });
      } else {
        // REJECT FLOW
        const reason = (body.reason || '').trim();
        if (!reason) {
          return NextResponse.json(
            { error: 'A reason is required when rejecting a video submission.' },
            { status: 400 }
          );
        }

        const { data: updatedSub, error: updateErr } = await supabaseAdmin
          .from('startup_video_submissions')
          .update({
            status: 'rejected',
            reason,
            reviewed_by: reviewerName,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', latest.id)
          .select()
          .single();

        if (updateErr) {
          console.error('Error updating submission record for rejection:', updateErr);
        }

        // Notify startup founder with reason
        try {
          await NotificationService.createNotification({
            organization_id: startup.organization_id,
            recipient_id: recipientId,
            recipient_name: startup.startup_name || startup.name || 'Founder',
            recipient_email: startup.founder_email,
            title: 'Product demo video rejected',
            message: `Your video was not approved: ${reason}`,
            notification_type: 'general',
            send_in_app: true,
            related_entity_type: 'startup',
            related_entity_id: startup.id,
          });
        } catch (notifErr) {
          console.warn('Founder rejection notification failed:', notifErr);
        }

        // Log to organization_activity_log
        try {
          await supabaseAdmin.from('organization_activity_log').insert({
            organization_id: startup.organization_id,
            action: 'startup_video_rejected',
            description: `Rejected product demo video for startup ${startup.startup_name || startup.name}. Reason: ${reason}`,
            triggered_by: user.email,
            triggered_by_id: user.id,
            metadata: {
              startup_id: startup.id,
              submission_id: latest.id,
              reason,
            },
          });
        } catch (logErr) {
          console.warn('Activity log notice:', logErr);
        }

        return NextResponse.json({
          success: true,
          submission: updatedSub || { ...latest, status: 'rejected', reason },
          message: 'Product demo video submission rejected.',
        });
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
