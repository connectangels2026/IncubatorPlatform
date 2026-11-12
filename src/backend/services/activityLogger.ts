import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export interface ActivityLogInput {
  organization_id?: string | null;
  user_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  description?: string;
  details?: Record<string, any>;
}

/**
 * Best-effort audit logger writing to activity_logs and organization_activity_log.
 */
export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    await supabaseAdmin.from('activity_logs').insert({
      organization_id: input.organization_id || null,
      user_id: input.user_id || null,
      actor_email: input.actor_email || null,
      action: input.action,
      entity_type: input.entity_type || null,
      entity_id: input.entity_id || null,
      details: input.details || {},
    });
  } catch {
    // Non-blocking if activity_logs table is pending migration
  }

  if (input.organization_id) {
    try {
      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: input.organization_id,
        action: input.action,
        description: input.description || input.action.replace(/_/g, ' '),
        triggered_by: input.actor_email || 'System',
        triggered_by_id: input.user_id || null,
        metadata: {
          entity_type: input.entity_type || null,
          entity_id: input.entity_id || null,
          ...(input.details || {}),
        },
      });
    } catch {
      // Non-blocking
    }
  }
}

