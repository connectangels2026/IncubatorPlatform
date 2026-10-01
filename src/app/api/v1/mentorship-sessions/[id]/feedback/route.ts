import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/backend/middleware/auth';
import { requireOrg } from '@/backend/middleware/tenant';
import { handleApiError } from '@/backend/middleware/errorHandler';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';
const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const resolveOrg = (id: string | null) => (id && isValidUUID(id) ? id : DEFAULT_ORG_ID);

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { errorResponse: authError } = await verifyAuth(req);
    if (authError) return authError;
    const { orgId, errorResponse: tenantError } = requireOrg(req);
    if (tenantError) return tenantError;

    const { id } = await params;
    const realOrgId = resolveOrg(orgId);
    const body = await req.json();

    const { rating, feedback, type } = body;

    // Validate feedback rating: 1 to 5
    if (rating === undefined || rating === null) {
      return NextResponse.json({ error: 'Validation Error: rating is required' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: 'Validation Error: rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (type === 'mentor') {
      updates.mentor_feedback = feedback || null;
    } else {
      // Default to startup feedback
      updates.startup_rating = numericRating;
      updates.startup_feedback = feedback || null;
    }

    const { data: updatedSession, error } = await supabaseAdmin
      .from('mentorship_sessions')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', realOrgId)
      .select('id, startup_rating, startup_feedback, mentor_feedback, status, updated_at')
      .single();

    if (error) throw error;
    if (!updatedSession) return NextResponse.json({ error: 'Mentorship session not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: updatedSession,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
