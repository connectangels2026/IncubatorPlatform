import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';
import { logActivity } from '@/backend/services/activityLogger';

export const dynamic = 'force-dynamic';

const PRIVATE_VIDEO_BUCKET = 'startup-videos-review';
const PUBLIC_BUCKET = 'documents';

const isValidUUID = (s?: string | null) =>
  Boolean(s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s));

async function resolveStartup(id: string, user: any) {
  const selectCols = 'id, organization_id, startup_name, founder_id, founder_email, demo_video_url, elevator_video_url';
  if (id && id !== 'me' && isValidUUID(id)) {
    let { data: st } = await supabaseAdmin.from('startups').select(selectCols).eq('id', id).maybeSingle();
    if (!st) {
      const retry = await supabaseAdmin
        .from('startups')
        .select('id, organization_id, startup_name, founder_id, founder_email, demo_video_url')
        .eq('id', id)
        .maybeSingle();
      st = retry.data as any;
    }
    if (st) return { ...st, name: st.startup_name };
  }

  if (!user?.email) return null;
  const emailLower = user.email.trim().toLowerCase();

  let { data: st } = await supabaseAdmin
    .from('startups')
    .select(selectCols)
    .ilike('founder_email', emailLower)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!st) {
    const retry = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name, founder_id, founder_email, demo_video_url')
      .ilike('founder_email', emailLower)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    st = retry.data as any;
  }
  if (st) return { ...st, name: st.startup_name };

  if (user?.id && isValidUUID(user.id)) {
    const { data: stById } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name, founder_id, founder_email, demo_video_url')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (stById) return { ...stById, name: stById.startup_name };
  }

  return null;
}

async function resolvePlaybackUrl(sub: any, fallbackUrl?: string | null): Promise<string | null> {
  if (sub?.file_path) {
    try {
      const { data: signedData } = await supabaseAdmin.storage
        .from(PRIVATE_VIDEO_BUCKET)
        .createSignedUrl(sub.file_path, 3600);
      if (signedData?.signedUrl) return signedData.signedUrl;
    } catch {}
  }
  return sub?.published_url || fallbackUrl || null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startup = await resolveStartup(id, user);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const userRole = (user?.role || '').toLowerCase();
    const isOrgMember = Boolean(user?.organization_id && startup.organization_id && user.organization_id === startup.organization_id);
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: allSubs, error: subErr } = await supabaseAdmin
      .from('startup_video_submissions')
      .select('*')
      .eq('startup_id', startup.id)
      .order('submitted_at', { ascending: false })
      .limit(20);

    if (subErr) {
      return NextResponse.json({
        success: true,
        submission: null,
        video_url: null,
        submissions: { demo: null, elevator: null },
        video_urls: { demo: startup.demo_video_url || null, elevator: (startup as any).elevator_video_url || null },
        startup_name: startup.startup_name || startup.name || 'Startup',
      });
    }

    const rows = allSubs || [];
    const demoSub = rows.find((r: any) => !r.kind || r.kind === 'demo') || null;
    const elevatorSub = rows.find((r: any) => r.kind === 'elevator') || null;

    const [demoUrl, elevatorUrl] = await Promise.all([
      resolvePlaybackUrl(demoSub, startup.demo_video_url),
      resolvePlaybackUrl(elevatorSub, (startup as any).elevator_video_url),
    ]);

    const requestedKind = req.nextUrl.searchParams.get('kind') === 'elevator' ? 'elevator' : 'demo';

    return NextResponse.json({
      success: true,
      submission: requestedKind === 'elevator' ? elevatorSub : demoSub,
      video_url: requestedKind === 'elevator' ? elevatorUrl : demoUrl,
      submissions: { demo: demoSub, elevator: elevatorSub },
      video_urls: { demo: demoUrl, elevator: elevatorUrl },
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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startup = await resolveStartup(id, user);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const body = await req.json();
    const action = body.action || 'decide';
    const targetKind: 'demo' | 'elevator' = body.kind === 'elevator' ? 'elevator' : 'demo';
    const submissionId: string | undefined = body.submission_id;

    const userRole = (user?.role || '').toLowerCase();
    const isOrgMember = Boolean(user?.organization_id && startup.organization_id && user.organization_id === startup.organization_id);
    const isStaff =
      isOrgMember ||
      userRole.includes('admin') ||
      userRole.includes('incubator') ||
      userRole === 'super-admin' ||
      userRole === 'super_admin';
    const isOwner =
      (user?.email && startup.founder_email && user.email.toLowerCase() === startup.founder_email.toLowerCase()) ||
      (user?.id && startup.founder_id && user.id === startup.founder_id);

    // 1. Cancel pending submission
    if (action === 'cancel') {
      if (!isStaff && !isOwner && id !== 'me') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data: pendingRows } = await supabaseAdmin
        .from('startup_video_submissions')
        .select('*')
        .eq('startup_id', startup.id)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(10);

      const target = (pendingRows || []).find((r: any) =>
        submissionId ? r.id === submissionId : targetKind === 'elevator' ? r.kind === 'elevator' : !r.kind || r.kind === 'demo'
      );

      if (target) {
        await supabaseAdmin.from('startup_video_submissions').delete().eq('id', target.id);
        await logActivity({
          organization_id: startup.organization_id,
          user_id: user.id || null,
          actor_email: user.email,
          action: 'startup_video_cancelled',
          entity_type: 'startup',
          entity_id: startup.id,
          description: `Cancelled ${targetKind === 'elevator' ? 'elevator pitch' : 'product demo'} submission`,
          details: { submission_id: target.id, kind: targetKind },
        });
      }

      return NextResponse.json({ success: true, message: 'Submission cancelled successfully.' });
    }

    // 2. Approve / Reject (Incubator staff only)
    if (action === 'decide') {
      if (!isStaff) {
        return NextResponse.json({ error: 'Forbidden: Only incubator administrators can review videos.' }, { status: 403 });
      }

      const decisionStatus = body.status;
      if (decisionStatus !== 'approved' && decisionStatus !== 'rejected') {
        return NextResponse.json({ error: "Invalid status: must be 'approved' or 'rejected'" }, { status: 400 });
      }

      const { data: subRows } = await supabaseAdmin
        .from('startup_video_submissions')
        .select('*')
        .eq('startup_id', startup.id)
        .order('submitted_at', { ascending: false })
        .limit(20);

      const target = (subRows || []).find((r: any) =>
        submissionId ? r.id === submissionId : targetKind === 'elevator' ? r.kind === 'elevator' : !r.kind || r.kind === 'demo'
      );

      if (!target) {
        return NextResponse.json({ error: 'No video submission found to review.' }, { status: 404 });
      }

      const kindLabel = (target.kind || targetKind) === 'elevator' ? 'Elevator pitch' : 'Product demo video';
      const isElevator = (target.kind || targetKind) === 'elevator';
      const reviewerName = user.email || 'Incubator Staff';
      const recipientId = isValidUUID(startup.founder_id)
        ? startup.founder_id
        : 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';

      if (decisionStatus === 'approved') {
        let publishedUrl = '';
        try {
          const { data: fileData, error: dlErr } = await supabaseAdmin.storage
            .from(PRIVATE_VIDEO_BUCKET)
            .download(target.file_path);
          if (dlErr || !fileData) throw new Error(dlErr?.message || 'Download failed');

          const fileBuffer = Buffer.from(await fileData.arrayBuffer());
          const folder = isElevator ? 'elevator_video' : 'demo_video';
          const publicPath = `startups/${startup.id}/${folder}/${Date.now()}_published.mp4`;

          const { error: upErr } = await supabaseAdmin.storage
            .from(PUBLIC_BUCKET)
            .upload(publicPath, fileBuffer, { contentType: 'video/mp4', upsert: true });
          if (upErr) throw new Error(upErr.message);

          const { data: pubData } = supabaseAdmin.storage.from(PUBLIC_BUCKET).getPublicUrl(publicPath);
          publishedUrl = pubData?.publicUrl || publicPath;
        } catch (copyErr: any) {
          return NextResponse.json({ error: `Could not publish video: ${copyErr.message}` }, { status: 500 });
        }

        const { data: updatedSub } = await supabaseAdmin
          .from('startup_video_submissions')
          .update({
            status: 'approved',
            published_url: publishedUrl,
            reviewed_by: reviewerName,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', target.id)
          .select()
          .single();

        const targetCol = isElevator ? { elevator_video_url: publishedUrl } : { demo_video_url: publishedUrl };
        await supabaseAdmin.from('startups').update(targetCol).eq('id', startup.id);

        try {
          await NotificationService.createNotification({
            organization_id: startup.organization_id,
            recipient_id: recipientId,
            recipient_name: startup.startup_name || startup.name || 'Founder',
            recipient_email: startup.founder_email,
            title: `${kindLabel} approved`,
            message: `Your ${kindLabel.toLowerCase()} has been approved and is now live on your profile.`,
            notification_type: 'general',
            send_in_app: true,
            related_entity_type: 'startup',
            related_entity_id: startup.id,
          });
        } catch {}

        await logActivity({
          organization_id: startup.organization_id,
          user_id: user.id || null,
          actor_email: user.email,
          action: isElevator ? 'startup_elevator_video_approved' : 'startup_video_approved',
          entity_type: 'startup',
          entity_id: startup.id,
          description: `Approved ${kindLabel.toLowerCase()} for startup ${startup.startup_name || startup.name}`,
          details: { submission_id: target.id, kind: isElevator ? 'elevator' : 'demo', published_url: publishedUrl },
        });

        return NextResponse.json({
          success: true,
          submission: updatedSub || { ...target, status: 'approved', published_url: publishedUrl },
          published_url: publishedUrl,
          kind: isElevator ? 'elevator' : 'demo',
          message: `${kindLabel} approved and published.`,
        });
      } else {
        const reason = (body.reason || '').trim();
        if (!reason) {
          return NextResponse.json({ error: 'A reason is required when rejecting a video submission.' }, { status: 400 });
        }

        const { data: updatedSub } = await supabaseAdmin
          .from('startup_video_submissions')
          .update({
            status: 'rejected',
            reason,
            reviewed_by: reviewerName,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', target.id)
          .select()
          .single();

        try {
          await NotificationService.createNotification({
            organization_id: startup.organization_id,
            recipient_id: recipientId,
            recipient_name: startup.startup_name || startup.name || 'Founder',
            recipient_email: startup.founder_email,
            title: `${kindLabel} rejected`,
            message: `Your ${kindLabel.toLowerCase()} was not approved: ${reason}`,
            notification_type: 'general',
            send_in_app: true,
            related_entity_type: 'startup',
            related_entity_id: startup.id,
          });
        } catch {}

        await logActivity({
          organization_id: startup.organization_id,
          user_id: user.id || null,
          actor_email: user.email,
          action: isElevator ? 'startup_elevator_video_rejected' : 'startup_video_rejected',
          entity_type: 'startup',
          entity_id: startup.id,
          description: `Rejected ${kindLabel.toLowerCase()} for startup ${startup.startup_name || startup.name}. Reason: ${reason}`,
          details: { submission_id: target.id, kind: isElevator ? 'elevator' : 'demo', reason },
        });

        return NextResponse.json({
          success: true,
          submission: updatedSub || { ...target, status: 'rejected', reason },
          kind: isElevator ? 'elevator' : 'demo',
          message: `${kindLabel} submission rejected.`,
        });
      }
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
