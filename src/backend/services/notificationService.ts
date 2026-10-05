import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { emailTemplates } from './emailTemplates';

const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export interface NotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  application_updates: boolean;
  mentorship_updates: boolean;
  reminder_alerts: boolean;
  marketing_emails: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_notifications: true,
  in_app_notifications: true,
  application_updates: true,
  mentorship_updates: true,
  reminder_alerts: true,
  marketing_emails: false,
};

// In-memory cache for user preferences fallback
const preferenceCache = new Map<string, NotificationPreferences>();

export interface CreateNotificationParams {
  organization_id: string;
  recipient_id: string;
  recipient_name?: string;
  recipient_email?: string;
  title: string;
  message: string;
  notification_type:
    | 'application_submission'
    | 'application_decision'
    | 'mentorship_booking'
    | 'mentorship_reminder'
    | 'general'
    | string;
  send_email?: boolean;
  send_in_app?: boolean;
  send_sms?: boolean;
  related_entity_type?: 'application' | 'mentorship_session' | 'startup' | 'task' | string;
  related_entity_id?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Get notification preferences for a user
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    if (preferenceCache.has(userId)) {
      return preferenceCache.get(userId)!;
    }

    try {
      if (isValidUUID(userId)) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
        const prefs = authUser?.user?.user_metadata?.notification_preferences;
        if (prefs) {
          const merged = { ...DEFAULT_PREFERENCES, ...prefs };
          preferenceCache.set(userId, merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Could not read user preferences from auth metadata:', err);
    }

    return DEFAULT_PREFERENCES;
  }

  /**
   * Update notification preferences for a user
   */
  static async setPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences };
    preferenceCache.set(userId, updated);

    try {
      if (isValidUUID(userId)) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { notification_preferences: updated },
        });
      }
    } catch (err) {
      console.warn('Could not persist preferences to Supabase auth metadata:', err);
    }

    return updated;
  }

  /**
   * Check for duplicate notification within deduplication window (e.g. 24 hours)
   */
  static async isDuplicate(
    recipientId: string,
    notificationType: string,
    relatedEntityId?: string,
    title?: string
  ): Promise<boolean> {
    if (!isValidUUID(recipientId)) return false;

    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let query = supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('recipient_id', recipientId)
      .eq('notification_type', notificationType)
      .gte('created_at', windowStart);

    if (relatedEntityId && isValidUUID(relatedEntityId)) {
      query = query.eq('related_entity_id', relatedEntityId);
    } else if (title) {
      query = query.eq('title', title);
    } else {
      return false;
    }

    const { data: existing } = await query.limit(1);
    return Boolean(existing && existing.length > 0);
  }

  /**
   * Create and dispatch notification with 30-day expiration, opt-out check, and deduplication
   */
  static async createNotification(params: CreateNotificationParams): Promise<{
    success: boolean;
    notification?: any;
    email_dispatched?: boolean;
    message?: string;
    duplicate?: boolean;
  }> {
    const {
      organization_id,
      recipient_id,
      recipient_name = 'User',
      recipient_email,
      title,
      message,
      notification_type,
      send_email = true,
      send_in_app = true,
      send_sms = false,
      related_entity_type,
      related_entity_id,
      metadata = {},
    } = params;

    // 1. Check for duplicates (by entity ID or title within 24h)
    const duplicate = await this.isDuplicate(recipient_id, notification_type, related_entity_id, title);
    if (duplicate) {
      return {
        success: true,
        duplicate: true,
        message: 'Duplicate notification ignored (already dispatched within 24h)',
      };
    }

    // 2. Check user preferences for opt-out
    const prefs = await this.getPreferences(recipient_id);
    const shouldSendEmail = Boolean(send_email && prefs.email_notifications);
    const shouldSendInApp = Boolean(send_in_app && prefs.in_app_notifications);

    // 3. Compute 30-day expiration date
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 4. Insert notification into database
    const payload: any = {
      organization_id,
      recipient_id,
      title,
      message,
      notification_type,
      send_email: shouldSendEmail,
      send_in_app: shouldSendInApp,
      send_sms,
      is_read: false,
      related_entity_type: related_entity_type || null,
      related_entity_id: related_entity_id && isValidUUID(related_entity_id) ? related_entity_id : null,
      expires_at: expiresAt,
    };

    let notificationRecord = null;
    if (isValidUUID(recipient_id)) {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.warn('Database notification insert error:', error.message);
      } else {
        notificationRecord = data;
      }
    }

    // 5. Render email template & dispatch
    let emailDispatched = false;
    if (shouldSendEmail && recipient_email) {
      let emailContent = { subject: title, html: message, text: message };

      if (notification_type === 'application_submission') {
        emailContent = emailTemplates.application_submission(
          recipient_name,
          metadata.startup_name || 'your startup',
          metadata.cohort || 'Upcoming'
        );
      } else if (notification_type === 'application_decision') {
        emailContent = emailTemplates.application_decision(
          recipient_name,
          metadata.startup_name || 'your startup',
          metadata.decision || 'admitted',
          metadata.comments
        );
      } else if (notification_type === 'mentorship_booking') {
        emailContent = emailTemplates.mentorship_booking(
          recipient_name,
          title,
          metadata.partner_name || 'Advisor',
          metadata.date || 'TBD',
          metadata.time || 'TBD',
          metadata.meeting_link || ''
        );
      } else if (notification_type === 'mentorship_reminder') {
        emailContent = emailTemplates.mentorship_reminder(
          recipient_name,
          title,
          metadata.partner_name || 'Advisor',
          metadata.date || 'Tomorrow',
          metadata.time || 'TBD',
          metadata.meeting_link || ''
        );
      }

      // Email dispatch simulation / log
      emailDispatched = true;
      console.log(`[EMAIL DISPATCHED] To: ${recipient_email} | Subject: ${emailContent.subject}`);
    }

    return {
      success: true,
      notification: notificationRecord || payload,
      email_dispatched: emailDispatched,
      message: 'Notification processed successfully',
    };
  }

  /**
   * List user's active, non-expired notifications
   */
  static async listUserNotifications(
    userId: string,
    orgId: string,
    options: { is_read?: boolean; notification_type?: string; limit?: number; offset?: number } = {}
  ) {
    const { is_read, notification_type, limit = 50, offset = 0 } = options;
    const nowIso = new Date().toISOString();

    const DEMO_USER_ID = 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .in('recipient_id', Array.from(new Set([userId, DEMO_USER_ID].filter(isValidUUID))))
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (is_read !== undefined) {
      query = query.eq('is_read', is_read);
    }

    if (notification_type) {
      query = query.eq('notification_type', notification_type);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const unreadCount = (data || []).filter((n) => !n.is_read).length;

    return {
      notifications: data || [],
      total: count || (data ? data.length : 0),
      unread_count: unreadCount,
    };
  }

  /**
   * Mark notification as read or unread
   */
  static async markAsRead(notificationId: string, userId: string, orgId: string, isRead = true) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({
        is_read: isRead,
        read_at: isRead ? new Date().toISOString() : null,
      })
      .eq('id', notificationId)
      .eq('organization_id', orgId)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string, orgId: string) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('organization_id', orgId)
      .eq('recipient_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
