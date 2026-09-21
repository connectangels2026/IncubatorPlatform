import { NextRequest, NextResponse } from 'next/server';

export function requireOrg(req: NextRequest): { orgId: string | null; errorResponse?: NextResponse } {
  // Support header x-org-id or query param org_id
  const orgId = req.headers.get('x-org-id') || req.nextUrl.searchParams.get('org_id');

  if (!orgId) {
    return {
      orgId: null,
      errorResponse: NextResponse.json(
        { error: 'Tenant Isolation Error: Missing organization identifier (x-org-id)' },
        { status: 400 }
      ),
    };
  }

  return { orgId };
}
