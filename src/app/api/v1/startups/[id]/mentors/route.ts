import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { StartupService } from '@/modules/startups/services';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const mentors = await StartupService.getMentors(id);
    return NextResponse.json({ success: true, startup_id: id, data: mentors });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const startup = await StartupService.getStartupById(id, orgId!);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });

    const body = await req.json();
    const mentorId = body.mentor_id || body.id || ('m_' + Date.now());
    const mentorType = body.mentor_type || body.type || 'General';

    const alloc = await StartupService.allocateMentor(id, mentorId, mentorType, {
      name: body.name || body.mentor_name,
      domain: body.domain,
      notes: body.notes || body.feedback,
    });
    return NextResponse.json({ success: true, data: alloc }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
