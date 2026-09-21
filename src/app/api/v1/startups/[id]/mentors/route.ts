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
    if (!body.mentor_id) {
      return NextResponse.json({ error: 'Validation Error: mentor_id is required' }, { status: 400 });
    }

    const mentorType = body.mentor_type || 'Lead';
    const alloc = await StartupService.allocateMentor(id, body.mentor_id, mentorType);
    return NextResponse.json({ success: true, data: alloc }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
