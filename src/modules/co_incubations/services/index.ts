import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

export interface CoIncubationRecord {
  id: string;
  startup_id: string;
  primary_incubator_id: string;
  co_incubator_id: string;
  status: 'pending' | 'active' | 'rejected' | 'ended';
  message?: string | null;
  reject_reason?: string | null;
  shared_scope?: string[] | Record<string, any> | null;
  requested_by?: string | null;
  decided_by?: string | null;
  requested_at?: string | null;
  decided_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration_months?: number | null;
  mou_signed?: boolean | null;
  mou_signed_date?: string | null;
  mou_document_url?: string | null;
  mou_type?: string | null;
  equity_split?: string | null;
  responsibilities?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  startup?: any;
  primary_incubator?: any;
  co_incubator?: any;
}

export interface RequestCoIncubationParams {
  startup_id: string;
  primary_incubator_id: string;
  co_incubator_id: string;
  message?: string;
  shared_scope?: string[];
  equity_split?: string;
  responsibilities?: string;
  duration_months?: number;
  mou_document_url?: string;
  mou_type?: string;
}

export interface UserContext {
  id?: string;
  email?: string;
  role?: string;
  organization_id?: string;
}

const DEFAULT_SHARED_SCOPE = [
  'name',
  'startup_name',
  'tagline',
  'description',
  'stage',
  'sector',
  'website',
  'pitch_deck_url',
  'team_size',
  'founded_date',
];

export class CoIncubationService {
  /**
   * Request Co-Incubation
   * Insert allowed only by startup's primary incubator (primary_incubator_id === startup.organization_id)
   * Status is strictly 'pending'
   */
  static async requestCoIncubation(
    params: RequestCoIncubationParams,
    user: UserContext
  ): Promise<CoIncubationRecord> {
    if (!user) throw new Error('Unauthorized: User authentication required');
    if (!params.startup_id) throw new Error('startup_id is required');
    if (!params.primary_incubator_id) throw new Error('primary_incubator_id is required');
    if (!params.co_incubator_id) throw new Error('co_incubator_id is required');

    // 1. Verify startup exists and primary_incubator_id matches startup.organization_id
    const { data: startup, error: stErr } = await supabaseAdmin
      .from('startups')
      .select('id, organization_id, startup_name, name, founder_id, founder_email, email')
      .eq('id', params.startup_id)
      .maybeSingle();

    if (stErr || !startup) {
      throw new Error('Startup not found');
    }

    if (params.primary_incubator_id !== startup.organization_id) {
      throw new Error("Forbidden: primary_incubator_id must equal the startup's host organization_id");
    }

    // Tenant check: Caller must belong to the primary incubator (or be super-admin)
    const isSuperAdmin = user.role === 'super-admin' || user.role === 'super_admin';
    if (!isSuperAdmin && user.organization_id && user.organization_id !== params.primary_incubator_id) {
      throw new Error('Forbidden: You can only request co-incubation for startups in your organization');
    }

    // 2. Different-orgs check
    if (params.primary_incubator_id === params.co_incubator_id) {
      throw new Error('Primary incubator and co-incubator organizations must be different');
    }

    // 3. Verify co_incubator organization exists
    const { data: partnerOrg } = await supabaseAdmin
      .from('organizations')
      .select('id, name, logo_url')
      .eq('id', params.co_incubator_id)
      .maybeSingle();

    if (!partnerOrg) {
      throw new Error('Partner co-incubator organization not found');
    }

    // 4. Verify primary organization exists
    const { data: primaryOrg } = await supabaseAdmin
      .from('organizations')
      .select('id, name, logo_url')
      .eq('id', params.primary_incubator_id)
      .maybeSingle();

    // 5. Unique open-request check: no existing pending or active request for this startup & partner
    const { data: existing } = await supabaseAdmin
      .from('co_incubations')
      .select('id, status')
      .eq('startup_id', params.startup_id)
      .eq('co_incubator_id', params.co_incubator_id)
      .in('status', ['pending', 'active'])
      .maybeSingle();

    if (existing) {
      throw new Error(`An open co-incubation request (${existing.status}) already exists for this startup and partner incubator`);
    }

    const now = new Date().toISOString();
    const finalSharedScope = Array.isArray(params.shared_scope) && params.shared_scope.length > 0
      ? params.shared_scope
      : DEFAULT_SHARED_SCOPE;

    const payload: any = {
      startup_id: params.startup_id,
      primary_incubator_id: params.primary_incubator_id,
      co_incubator_id: params.co_incubator_id,
      status: 'pending',
      message: params.message?.trim() || null,
      shared_scope: finalSharedScope,
      requested_by: user.id || user.email || 'Primary Incubator Staff',
      requested_at: now,
      duration_months: params.duration_months ? Number(params.duration_months) : 12,
      mou_document_url: params.mou_document_url || null,
      mou_type: params.mou_type || 'Standard',
      equity_split: params.equity_split || null,
      responsibilities: params.responsibilities || null,
      created_at: now,
      updated_at: now,
    };

    const { data: created, error: insErr } = await supabaseAdmin
      .from('co_incubations')
      .insert(payload)
      .select()
      .single();

    if (insErr) {
      throw new Error(`Failed to create co-incubation request: ${insErr.message}`);
    }

    // 6. Side effects: Notification to partner incubator
    const startupTitle = startup.startup_name || startup.name || 'Startup';
    const primaryName = primaryOrg?.name || 'Primary Incubator';
    try {
      await NotificationService.createNotification({
        organization_id: params.co_incubator_id,
        recipient_id: params.co_incubator_id,
        title: 'New Co-Incubation Request',
        message: `${primaryName} has invited your organization to co-incubate ${startupTitle}.`,
        notification_type: 'general',
        related_entity_type: 'co_incubation',
        related_entity_id: created.id,
        send_email: true,
        send_in_app: true,
        metadata: {
          url: '/incubator/co-incubations?tab=requests',
          action_url: '/incubator/co-incubations?tab=requests',
          co_incubation_id: created.id,
          startup_id: params.startup_id,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch co-incubation request notification:', notifErr);
    }

    // 7. Activity Log
    try {
      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: params.primary_incubator_id,
        action: 'co_incubation_requested',
        description: `${user.email || 'Staff'} requested co-incubation for ${startupTitle} with partner ${partnerOrg.name}`,
        triggered_by: user.email || 'Staff',
        triggered_by_id: user.id || null,
        metadata: {
          co_incubation_id: created.id,
          startup_id: params.startup_id,
          partner_org_id: params.co_incubator_id,
          partner_name: partnerOrg.name,
        },
      });
    } catch (logErr) {
      console.warn('Activity log error:', logErr);
    }

    return created;
  }

  /**
   * Decide Co-Incubation (Accept or Reject)
   * Allowed ONLY by the co_incubator organization
   * - Accept: status -> 'active', start_date, decided_by, decided_at
   * - Reject: status -> 'rejected', reject_reason (required), decided_by, decided_at
   */
  static async decideCoIncubation(
    id: string,
    decision: 'accept' | 'reject',
    user: UserContext,
    rejectReason?: string
  ): Promise<CoIncubationRecord> {
    if (!user) throw new Error('Unauthorized: User authentication required');
    if (!id) throw new Error('id is required');
    if (decision !== 'accept' && decision !== 'reject') {
      throw new Error("Decision must be either 'accept' or 'reject'");
    }

    // 1. Fetch current co-incubation
    const { data: coinc, error } = await supabaseAdmin
      .from('co_incubations')
      .select('*, startups(id, startup_name, name, founder_id, founder_email, email), primary_org:organizations!co_incubations_primary_incubator_id_fkey(name), partner_org:organizations!co_incubations_co_incubator_id_fkey(name)')
      .eq('id', id)
      .maybeSingle();

    if (error || !coinc) {
      throw new Error('Co-incubation request not found');
    }

    if (coinc.status !== 'pending') {
      throw new Error(`Cannot decide request with current status '${coinc.status}'`);
    }

    // 2. Authorization: Only the co_incubator organization can decide
    const isSuperAdmin = user.role === 'super-admin' || user.role === 'super_admin';
    if (!isSuperAdmin && user.organization_id && user.organization_id !== coinc.co_incubator_id) {
      throw new Error('Forbidden: Only the partner co-incubator organization can accept or reject this request');
    }

    const now = new Date().toISOString();
    const updates: any = {
      decided_by: user.id || user.email || 'Partner Incubator Staff',
      decided_at: now,
      updated_at: now,
    };

    if (decision === 'accept') {
      updates.status = 'active';
      updates.start_date = now;
    } else {
      if (!rejectReason || !rejectReason.trim()) {
        throw new Error('A rejection reason is required when declining a co-incubation request');
      }
      updates.status = 'rejected';
      updates.reject_reason = rejectReason.trim();
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('co_incubations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updErr) {
      throw new Error(`Failed to update co-incubation decision: ${updErr.message}`);
    }

    const startupTitle = coinc.startups?.startup_name || coinc.startups?.name || 'Startup';
    const partnerName = coinc.partner_org?.name || 'Partner Incubator';

    // 3. Notifications
    try {
      // Notification to primary incubator
      await NotificationService.createNotification({
        organization_id: coinc.primary_incubator_id,
        recipient_id: coinc.primary_incubator_id,
        title: decision === 'accept' ? 'Co-Incubation Accepted' : 'Co-Incubation Declined',
        message: decision === 'accept'
          ? `${partnerName} has accepted co-incubation for ${startupTitle}.`
          : `${partnerName} declined co-incubation for ${startupTitle}. Reason: ${updates.reject_reason}`,
        notification_type: 'general',
        related_entity_type: 'co_incubation',
        related_entity_id: id,
        send_email: true,
        send_in_app: true,
        metadata: {
          url: `/incubator/startups?open=${coinc.startup_id}&tab=network`,
          action_url: `/incubator/startups?open=${coinc.startup_id}&tab=network`,
          co_incubation_id: id,
          startup_id: coinc.startup_id,
        },
      });

      // If accepted: Notification to startup founder
      if (decision === 'accept') {
        const startupRecipient = coinc.startups?.founder_id || coinc.startups?.founder_email || coinc.startup_id;
        await NotificationService.createNotification({
          organization_id: coinc.primary_incubator_id,
          recipient_id: startupRecipient,
          title: 'Co-Incubation Partner Confirmed',
          message: `Great news! Your startup is now co-incubated with ${partnerName}.`,
          notification_type: 'general',
          related_entity_type: 'co_incubation',
          related_entity_id: id,
          send_email: true,
          send_in_app: true,
          metadata: {
            url: '/startup/dashboard',
            action_url: '/startup/dashboard',
            co_incubation_id: id,
            startup_id: coinc.startup_id,
          },
        });
      }
    } catch (notifErr) {
      console.warn('Notification warning:', notifErr);
    }

    // 4. Activity Logs
    try {
      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: coinc.co_incubator_id,
        action: decision === 'accept' ? 'co_incubation_accepted' : 'co_incubation_rejected',
        description: `${user.email || 'Partner'} ${decision}ed co-incubation for ${startupTitle}`,
        triggered_by: user.email || 'Partner Staff',
        triggered_by_id: user.id || null,
        metadata: {
          co_incubation_id: id,
          startup_id: coinc.startup_id,
          decision,
          reject_reason: updates.reject_reason || null,
        },
      });

      if (decision === 'accept' && coinc.startup_id) {
        await supabaseAdmin.from('startup_activity').insert({
          startup_id: coinc.startup_id,
          title: `Co-Incubation with ${partnerName} Activated`,
          description: `Partnership established between primary host and ${partnerName}.`,
          type: 'milestone',
          created_by: user.id || null,
        });
      }
    } catch (logErr) {
      console.warn('Activity log error:', logErr);
    }

    return updated;
  }

  /**
   * End Co-Incubation
   * Either the primary incubator OR the co-incubator can mark as ended
   */
  static async endCoIncubation(
    id: string,
    user: UserContext,
    reason?: string
  ): Promise<CoIncubationRecord> {
    if (!user) throw new Error('Unauthorized: User authentication required');
    if (!id) throw new Error('id is required');

    const { data: coinc, error } = await supabaseAdmin
      .from('co_incubations')
      .select('*, startups(id, startup_name, name, founder_id, founder_email)')
      .eq('id', id)
      .maybeSingle();

    if (error || !coinc) {
      throw new Error('Co-incubation program not found');
    }

    if (coinc.status !== 'active') {
      throw new Error(`Cannot end co-incubation with status '${coinc.status}'. Only active programs can be ended.`);
    }

    const isSuperAdmin = user.role === 'super-admin' || user.role === 'super_admin';
    const isPrimary = user.organization_id === coinc.primary_incubator_id;
    const isPartner = user.organization_id === coinc.co_incubator_id;

    if (!isSuperAdmin && !isPrimary && !isPartner) {
      throw new Error('Forbidden: Only the primary incubator or the co-incubator can end this partnership');
    }

    const now = new Date().toISOString();
    const { data: updated, error: updErr } = await supabaseAdmin
      .from('co_incubations')
      .update({
        status: 'ended',
        end_date: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (updErr) {
      throw new Error(`Failed to end co-incubation: ${updErr.message}`);
    }

    // Side effects: Notifications & logs
    const startupTitle = coinc.startups?.startup_name || coinc.startups?.name || 'Startup';
    const notifyTargetOrgId = isPrimary ? coinc.co_incubator_id : coinc.primary_incubator_id;

    try {
      await NotificationService.createNotification({
        organization_id: notifyTargetOrgId,
        recipient_id: notifyTargetOrgId,
        title: 'Co-Incubation Program Ended',
        message: `The co-incubation program for ${startupTitle} was concluded.`,
        notification_type: 'general',
        related_entity_type: 'co_incubation',
        related_entity_id: id,
        metadata: {
          url: '/incubator/co-incubations',
          action_url: '/incubator/co-incubations',
          co_incubation_id: id,
          startup_id: coinc.startup_id,
        },
      });

      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: user.organization_id || coinc.primary_incubator_id,
        action: 'co_incubation_ended',
        description: `Co-incubation for ${startupTitle} ended by ${user.email || 'Staff'}${reason ? `. Reason: ${reason}` : ''}`,
        triggered_by: user.email || 'Staff',
        triggered_by_id: user.id || null,
        metadata: { co_incubation_id: id, startup_id: coinc.startup_id, reason },
      });
    } catch (e) {
      console.warn('Logging error on co-incubation end:', e);
    }

    return updated;
  }

  /**
   * List for Incubator (Primary and Partner views)
   * Primary and co-incubator organizations read their own rows
   */
  static async listForIncubator(
    orgId: string,
    options: { view?: 'all' | 'primary' | 'partner'; status?: string } = {}
  ): Promise<CoIncubationRecord[]> {
    if (!orgId) throw new Error('orgId is required');

    const view = options.view || 'all';
    let query = supabaseAdmin
      .from('co_incubations')
      .select(`
        *,
        startup:startups(id, startup_name, sector, stage, logo_url, logo_color, initials, founder_id, founder_email),
        primary_incubator:organizations!co_incubations_primary_incubator_id_fkey(id, name, slug, logo_url),
        co_incubator:organizations!co_incubations_co_incubator_id_fkey(id, name, slug, logo_url)
      `)
      .order('created_at', { ascending: false });

    if (view === 'primary') {
      query = query.eq('primary_incubator_id', orgId);
    } else if (view === 'partner') {
      query = query.eq('co_incubator_id', orgId);
    } else {
      query = query.or(`primary_incubator_id.eq.${orgId},co_incubator_id.eq.${orgId}`);
    }

    if (options.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list co-incubations: ${error.message}`);
    }

    const formatted = (data || []).map((item: any) => ({
      ...item,
      startup: item.startup
        ? {
            ...item.startup,
            name: item.startup.name || item.startup.startup_name,
          }
        : null,
    }));

    return formatted;
  }

  /**
   * List for Startup
   * A startup reads only its own active rows, without the mou_*, equity_split and responsibilities columns.
   */
  static async listForStartup(
    startupId: string,
    user: UserContext
  ): Promise<any[]> {
    if (!startupId) throw new Error('startupId is required');

    // 1. Ownership validation
    const isSuperAdmin = user?.role === 'super-admin' || user?.role === 'super_admin';
    const isStaff = isSuperAdmin || user?.role?.includes('admin') || user?.role?.includes('incubator');

    if (!isStaff) {
      const { data: startup } = await supabaseAdmin
        .from('startups')
        .select('id, founder_id, founder_email, email')
        .eq('id', startupId)
        .maybeSingle();

      if (!startup) throw new Error('Startup not found');

      const isOwner =
        (user.id && startup.founder_id && user.id === startup.founder_id) ||
        (user.email && startup.founder_email && user.email.toLowerCase() === startup.founder_email.toLowerCase()) ||
        (user.email && startup.email && user.email.toLowerCase() === startup.email.toLowerCase());

      if (!isOwner) {
        throw new Error('Forbidden: Founders can only view co-incubations for their own startup');
      }
    }

    // 2. Query strictly active rows with excluded sensitive columns (mou_*, equity_split, responsibilities)
    const { data, error } = await supabaseAdmin
      .from('co_incubations')
      .select(`
        id,
        startup_id,
        primary_incubator_id,
        co_incubator_id,
        status,
        message,
        shared_scope,
        duration_months,
        start_date,
        end_date,
        created_at,
        updated_at,
        co_incubator:organizations!co_incubations_co_incubator_id_fkey(id, name, slug, logo_url)
      `)
      .eq('startup_id', startupId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load startup co-incubations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Partner-scoped Startup Reader
   * The partner reads a startup only through a limited server function that returns just the fields listed in shared_scope.
   */
  static async getStartupForPartner(
    coIncubationId: string,
    partnerOrgId: string,
    user: UserContext
  ): Promise<Record<string, any>> {
    if (!coIncubationId) throw new Error('coIncubationId is required');
    if (!partnerOrgId) throw new Error('partnerOrgId is required');

    // 1. Fetch co-incubation and verify partner access
    const { data: coinc, error } = await supabaseAdmin
      .from('co_incubations')
      .select('id, startup_id, co_incubator_id, status, shared_scope')
      .eq('id', coIncubationId)
      .maybeSingle();

    if (error || !coinc) {
      throw new Error('Co-incubation record not found');
    }

    const isSuperAdmin = user?.role === 'super-admin' || user?.role === 'super_admin';
    if (!isSuperAdmin && partnerOrgId !== coinc.co_incubator_id) {
      throw new Error('Forbidden: You are not the partner organization for this co-incubation');
    }

    if (coinc.status !== 'active' && coinc.status !== 'pending') {
      throw new Error(`Cannot view startup under ended or rejected co-incubation (status: ${coinc.status})`);
    }

    // 2. Fetch full startup record
    const { data: startup, error: stErr } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('id', coinc.startup_id)
      .maybeSingle();

    if (stErr || !startup) {
      throw new Error('Startup record not found');
    }

    // 3. Project only the allowed fields defined in shared_scope
    let allowedFields: string[] = DEFAULT_SHARED_SCOPE;
    if (Array.isArray(coinc.shared_scope) && coinc.shared_scope.length > 0) {
      allowedFields = coinc.shared_scope;
    } else if (typeof coinc.shared_scope === 'string') {
      try {
        const parsed = JSON.parse(coinc.shared_scope);
        if (Array.isArray(parsed)) allowedFields = parsed;
      } catch {
        // Fallback to default
      }
    }

    const scopedStartup: Record<string, any> = {
      id: startup.id,
      co_incubation_id: coinc.id,
      co_incubation_status: coinc.status,
    };

    for (const field of allowedFields) {
      if (startup[field] !== undefined) {
        scopedStartup[field] = startup[field];
      }
    }

    return scopedStartup;
  }

  /**
   * Get single Co-Incubation by ID with tenant access check
   */
  static async getById(id: string, orgId?: string): Promise<CoIncubationRecord | null> {
    if (!id) return null;
    let query = supabaseAdmin
      .from('co_incubations')
      .select(`
        *,
        startup:startups(id, startup_name, sector, stage, logo_url, logo_color, initials, founder_id, founder_email),
        primary_incubator:organizations!co_incubations_primary_incubator_id_fkey(id, name, slug, logo_url),
        co_incubator:organizations!co_incubations_co_incubator_id_fkey(id, name, slug, logo_url)
      `)
      .eq('id', id);

    if (orgId) {
      query = query.or(`primary_incubator_id.eq.${orgId},co_incubator_id.eq.${orgId}`);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    return {
      ...data,
      startup: data.startup
        ? {
            ...data.startup,
            name: data.startup.name || data.startup.startup_name,
          }
        : null,
    };
  }

  /**
   * Update Co-Incubation Record (restricted fields)
   */
  static async update(
    id: string,
    orgId: string,
    data: Partial<CoIncubationRecord>
  ): Promise<CoIncubationRecord | null> {
    const existing = await this.getById(id, orgId);
    if (!existing) return null;

    const safeUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (data.message !== undefined) safeUpdates.message = data.message;
    if (data.shared_scope !== undefined) safeUpdates.shared_scope = data.shared_scope;
    if (data.duration_months !== undefined) safeUpdates.duration_months = data.duration_months;
    if (data.mou_document_url !== undefined) safeUpdates.mou_document_url = data.mou_document_url;
    if (data.mou_type !== undefined) safeUpdates.mou_type = data.mou_type;
    if (data.equity_split !== undefined) safeUpdates.equity_split = data.equity_split;
    if (data.responsibilities !== undefined) safeUpdates.responsibilities = data.responsibilities;

    const { data: updated, error } = await supabaseAdmin
      .from('co_incubations')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update co-incubation: ${error.message}`);
    return updated;
  }

  /**
   * Sign MOU for co-incubation
   */
  static async signMOU(id: string, orgId: string): Promise<CoIncubationRecord | null> {
    const existing = await this.getById(id, orgId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const { data: updated, error } = await supabaseAdmin
      .from('co_incubations')
      .update({
        mou_signed: true,
        mou_signed_date: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to sign MOU: ${error.message}`);
    return updated;
  }

  /**
   * Delete Co-Incubation Record (e.g. remove declined or outdated request)
   */
  static async delete(id: string, orgId: string): Promise<boolean> {
    const existing = await this.getById(id, orgId);
    if (!existing) throw new Error('Co-incubation not found or access denied');

    const { error } = await supabaseAdmin
      .from('co_incubations')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete co-incubation: ${error.message}`);
    return true;
  }
}
