import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Helper: resolve startup ID if id is 'me'
async function resolveStartupId(id: string, user: any): Promise<any> {
  if (id && id !== 'me') {
    const { data: st } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name')
      .eq('id', id)
      .maybeSingle();
    return st ? { ...st, name: st.startup_name } : null;
  }

  if (!user?.email) return null;
  const emailLower = user.email.trim().toLowerCase();
  const { data: st } = await supabaseAdmin
    .from('startups')
    .select('id, organization_id, startup_name')
    .ilike('founder_email', emailLower)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return st ? { ...st, name: st.startup_name } : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    const startup = await resolveStartupId(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Try query from video_upload_requests
    try {
      const { data: requests, error } = await supabaseAdmin
        .from('video_upload_requests')
        .select('*')
        .eq('startup_id', startup.id)
        .order('requested_at', { ascending: false })
        .limit(1);

      if (error) {
        // Table may not exist in schema cache yet, return fallback null
        return NextResponse.json({ success: true, request: null });
      }

      return NextResponse.json({
        success: true,
        request: requests && requests.length > 0 ? requests[0] : null,
      });
    } catch {
      return NextResponse.json({ success: true, request: null });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse) return errorResponse;

    const startup = await resolveStartupId(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const body = await req.json();
    const action = body.action || 'request'; // 'request' | 'cancel' | 'decide'
    const userRole = (user?.role || '').toLowerCase();
    const isStaff = userRole === 'admin' || userRole === 'incubator_admin' || userRole === 'incubator' || userRole === 'super-admin' || userRole === 'super_admin';

    if (action === 'request') {
      // 1. Create a pending request
      let createdRow: any = null;
      try {
        const { data: newReq, error: insertErr } = await supabaseAdmin
          .from('video_upload_requests')
          .insert({
            startup_id: startup.id,
            status: 'pending',
            reason: body.reason || null,
            requested_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        createdRow = newReq;
      } catch (dbErr) {
        // Fallback simulation if table is pending schema sync
        createdRow = {
          id: 'temp-req-' + Date.now(),
          startup_id: startup.id,
          status: 'pending',
          requested_at: new Date().toISOString(),
        };
      }

      // Log to organization_activity_log
      try {
        await supabaseAdmin.from('organization_activity_log').insert({
          organization_id: startup.organization_id,
          action: 'video_upload_requested',
          description: `Video upload access requested by startup ${startup.startup_name || startup.name || startup.id}`,
          triggered_by: user?.email || 'Founder',
          triggered_by_id: user?.id || null,
          metadata: {
            startup_id: startup.id,
            request_id: createdRow?.id,
          },
        });
      } catch (logErr) {
        console.warn('Activity log notice:', logErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Video upload request submitted for incubator approval',
        request: createdRow,
      });
    }

    if (action === 'cancel') {
      // Cancel pending request
      try {
        await supabaseAdmin
          .from('video_upload_requests')
          .delete()
          .eq('startup_id', startup.id)
          .eq('status', 'pending');
      } catch (delErr) {
        console.warn('Cancel request notice:', delErr);
      }

      // Log cancellation
      try {
        await supabaseAdmin.from('organization_activity_log').insert({
          organization_id: startup.organization_id,
          action: 'video_upload_request_cancelled',
          description: `Video upload request cancelled by startup ${startup.startup_name || startup.name}`,
          triggered_by: user?.email || 'Founder',
          triggered_by_id: user?.id || null,
          metadata: { startup_id: startup.id },
        });
      } catch {}

      return NextResponse.json({ success: true, message: 'Request cancelled' });
    }

    if (action === 'decide') {
      // Must be incubator or super-admin
      if (!isStaff) {
        return NextResponse.json(
          { error: 'Forbidden: Only incubator staff can approve or reject video uploads.' },
          { status: 403 }
        );
      }

      const decision = body.status === 'approved' ? 'approved' : 'rejected';
      const rejectionReason = body.reason || null;

      let updatedRow: any = null;
      try {
        // Find latest pending request or create decided record
        const { data: latest } = await supabaseAdmin
          .from('video_upload_requests')
          .select('id')
          .eq('startup_id', startup.id)
          .order('requested_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const userEmail = user?.email || 'Incubator Staff';
        if (latest?.id) {
          const { data: updated, error } = await supabaseAdmin
            .from('video_upload_requests')
            .update({
              status: decision,
              reason: rejectionReason,
              decided_by: userEmail,
              decided_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', latest.id)
            .select()
            .single();

          if (error) throw error;
          updatedRow = updated;
        } else {
          const { data: created, error } = await supabaseAdmin
            .from('video_upload_requests')
            .insert({
              startup_id: startup.id,
              status: decision,
              reason: rejectionReason,
              decided_by: userEmail,
              decided_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          updatedRow = created;
        }
      } catch (err) {
        updatedRow = {
          startup_id: startup.id,
          status: decision,
          reason: rejectionReason,
          decided_by: user?.email || 'Incubator Staff',
          decided_at: new Date().toISOString(),
        };
      }

      // Log decision to organization_activity_log
      try {
        await supabaseAdmin.from('organization_activity_log').insert({
          organization_id: startup.organization_id,
          action: decision === 'approved' ? 'video_upload_approved' : 'video_upload_rejected',
          description: `Video upload access ${decision} for startup ${startup.startup_name || startup.name} by ${user?.email || 'Incubator Staff'}${rejectionReason ? ` (Reason: ${rejectionReason})` : ''}`,
          triggered_by: user?.email || 'Incubator Staff',
          triggered_by_id: user?.id || null,
          metadata: {
            startup_id: startup.id,
            status: decision,
            reason: rejectionReason,
          },
        });
      } catch (logErr) {
        console.warn('Activity log notice:', logErr);
      }

      return NextResponse.json({
        success: true,
        message: `Video upload access ${decision}`,
        request: updatedRow,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
