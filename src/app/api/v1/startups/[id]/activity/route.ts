import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { StartupService } from '@/backend/services/startupService';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse || !user) return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startup = await StartupService.getStartup(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    try {
      const { data: logs, error } = await supabaseAdmin
        .from('startup_activity')
        .select('*')
        .eq('startup_id', startup.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not query startup_activity:', error);
        return NextResponse.json({ success: true, activities: [] });
      }

      return NextResponse.json({ success: true, activities: logs || [] });
    } catch {
      return NextResponse.json({ success: true, activities: [] });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, errorResponse } = await verifyAuth(req);
    if (errorResponse || !user) return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startup = await StartupService.getStartup(id, user);
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Role verification
    const role = (user.role || '').toLowerCase();
    const isSuperAdmin = role === 'super-admin' || role === 'super_admin';
    const isStaff = isSuperAdmin || role === 'admin' || role === 'incubator_admin' || role === 'incubator';
    const isOwner =
      Boolean(startup.founder_id && startup.founder_id === user.id) ||
      Boolean(startup.founder_email && startup.founder_email.toLowerCase() === (user.email || '').toLowerCase());

    if (!isSuperAdmin && !isStaff && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to post activity for this startup' }, { status: 403 });
    }

    const body = await req.json();
    const noteText = (body.body || body.message || body.quote || '').trim();
    if (!noteText) {
      return NextResponse.json({ error: 'Activity body cannot be empty' }, { status: 400 });
    }

    const authorRole = isStaff ? 'Incubator' : 'Founder';
    const authorMetadata = (user as any)?.user_metadata;
    const authorName =
      authorMetadata?.full_name ||
      authorMetadata?.name ||
      user.email?.split('@')[0] ||
      (isStaff ? 'Incubator Staff' : 'Founder');

    const newRecord = {
      startup_id: startup.id,
      parent_id: body.parent_id || null,
      author_id: user.id || null,
      author_name: authorName,
      author_role: authorRole,
      type: body.type || 'note',
      title: body.title || (body.parent_id ? 'Reply' : 'Activity Update'),
      body: noteText,
      scores: body.scores && typeof body.scores === 'object' ? body.scores : {},
    };

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('startup_activity')
      .insert(newRecord)
      .select()
      .single();

    if (insErr) {
      console.error('Failed to insert into startup_activity:', insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // Log to organization_activity_log
    try {
      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: startup.organization_id,
        action: body.parent_id ? 'startup_activity_reply' : 'startup_activity_created',
        description: `${authorName} (${authorRole}) posted on ${startup.name || startup.startup_name}: "${noteText.slice(0, 80)}"`,
        triggered_by: user.email || 'User',
        triggered_by_id: user.id || null,
        metadata: {
          startup_id: startup.id,
          activity_id: inserted.id,
          parent_id: body.parent_id || null,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, activity: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
