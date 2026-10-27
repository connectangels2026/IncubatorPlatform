import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { verifyAuth } from '@/backend/middleware/auth';
import { NotificationService } from '@/backend/services/notificationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user } = await verifyAuth(req);
    const body = await req.json();
    const replyText = (body.message || body.reply || '').trim();

    if (!replyText) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    // Retrieve application
    const { data: application, error: fetchErr } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchErr || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Security: Only the applicant or authenticated user can reply
    const applicantEmail = (application.applicant_email || '').toLowerCase().trim();
    if (user?.email && user.role !== 'admin' && user.role !== 'super-admin') {
      if (user.email.toLowerCase().trim() !== applicantEmail) {
        return NextResponse.json({ error: 'Forbidden: You can only reply to your own application' }, { status: 403 });
      }
    }

    const currentFormData = application.form_data || {};
    const existingReplies = Array.isArray(currentFormData.rejection_replies) ? currentFormData.rejection_replies : [];

    const newReply = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: (user as any)?.name || application.applicant_name || 'Founder',
      sender_email: user?.email || applicantEmail,
      sender_role: 'founder',
      message: replyText,
      created_at: new Date().toISOString(),
    };

    const updatedFormData = {
      ...currentFormData,
      rejection_replies: [...existingReplies, newReply],
      last_reply_at: new Date().toISOString(),
    };

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({
        form_data: updatedFormData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Optional notification to incubator admin or super admin
    if (application.organization_id) {
      try {
        await NotificationService.createNotification({
          organization_id: application.organization_id,
          recipient_id: 'dfdb0d1a-24a3-4062-98aa-0d723fc23725',
          title: `Founder Reply: ${application.applicant_name}`,
          message: `Founder responded to application review: "${replyText.slice(0, 100)}..."`,
          notification_type: 'founder_reply',
          send_email: false,
          send_in_app: true,
          related_entity_type: 'application',
          related_entity_id: id,
        });
      } catch (notifErr) {
        console.warn('Reply notification error:', notifErr);
      }
    }

    return NextResponse.json({ success: true, data: updated, reply: newReply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to submit reply' }, { status: 500 });
  }
}
