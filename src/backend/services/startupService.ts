import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const FOUNDER_MUTABLE_FIELDS = [
  'name',
  'startup_name',
  'tagline',
  'description',
  'problem_statement',
  'solution_description',
  'target_market',
  'business_model',
  'revenue_model',
  'team_size',
  'cofounders',
  'team_members',
  'tech_stack',
  'pitch_deck_url',
  'business_plan_url',
  'github_url',
  'figma_url',
  'demo_url',
  'deck_revisions',
  'logo_url',
  'logo_color',
  'initials',
  'website',
  'contact_email',
  'phone',
  'location',
  'founded_date',
  'social_links',
  'milestones',
  'hardware_bom',
  'fabrication_pipeline',
] as const;

export const INCUBATOR_MUTABLE_FIELDS = [
  'status',
  'lifecycle_stage',
  'batch',
  'cohort',
  'track',
  'stage',
  'stage_progress',
  'incubation_start_date',
  'incubation_end_date',
  'is_active',
  'milestones',
  'lab_equipment',
] as const;

export class StartupService {
  /**
   * Resolves and fetches a single startup by ID (UUID or 'me') with optional column selection
   */
  static async getStartup(id: string, user?: any, selectColumns?: string[]): Promise<any> {
    const isMe = id === 'me';
    let query = supabaseAdmin.from('startups');

    const selectClause =
      selectColumns && selectColumns.length > 0
        ? Array.from(new Set(['id', 'organization_id', 'founder_id', 'founder_email', ...selectColumns])).join(', ')
        : '*';

    let startup: any = null;

    if (isMe) {
      if (!user?.email && !user?.id) {
        throw new Error('Unauthorized: Authentication required to fetch current startup');
      }
      const emailLower = (user.email || '').trim().toLowerCase();
      const { data, error } = await query
        .select(selectClause)
        .or(`founder_email.ilike.${emailLower},founder_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      startup = data;
    } else {
      const { data, error } = await query
        .select(selectClause)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      startup = data;
    }

    if (!startup) {
      return null;
    }

    // Attach organization details if present
    if (startup.organization_id && !startup.organization) {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id, name, slug, logo_url')
        .eq('id', startup.organization_id)
        .maybeSingle();
      if (org) {
        startup.organization = org;
      }
    }

    // Ensure array/jsonb fields are parsed and not null
    return {
      ...startup,
      team_members: Array.isArray(startup.team_members) ? startup.team_members : [],
      cofounders: Array.isArray(startup.cofounders) ? startup.cofounders : [],
      tech_stack: Array.isArray(startup.tech_stack) ? startup.tech_stack : [],
      milestones: Array.isArray(startup.milestones) ? startup.milestones : [],
      hardware_bom: Array.isArray(startup.hardware_bom) ? startup.hardware_bom : [],
      lab_equipment: Array.isArray(startup.lab_equipment) ? startup.lab_equipment : [],
      fabrication_pipeline: Array.isArray(startup.fabrication_pipeline) ? startup.fabrication_pipeline : [],
      deck_revisions: Array.isArray(startup.deck_revisions) ? startup.deck_revisions : [],
      batch: startup.batch || startup.cohort || null,
      track: startup.track || 'both',
    };
  }

  /**
   * Updates startup fields with strict server-side RBAC and activity logging
   */
  static async updateStartup(id: string, fields: Record<string, any>, user: any): Promise<any> {
    if (!user) {
      throw new Error('Unauthorized: User authentication required');
    }

    // 1. Fetch current startup state
    const current = await this.getStartup(id, user);
    if (!current) {
      throw new Error('Startup not found');
    }

    // 2. Identify user role
    const userRole = (user.role || '').toLowerCase();
    const isStaff =
      userRole.includes('admin') ||
      userRole.includes('incubator') ||
      userRole === 'super-admin' ||
      userRole === 'super_admin';

    const cleanPayload: Record<string, any> = {};
    const inputKeys = Object.keys(fields).filter((k) => fields[k] !== undefined);

    if (isStaff) {
      // Incubator staff can only update startups within their organization
      if (userRole !== 'super-admin' && userRole !== 'super_admin') {
        if (user.organization_id && current.organization_id && user.organization_id !== current.organization_id) {
          throw new Error('Forbidden: You can only edit startups enrolled in your organization');
        }
      }

      // Incubator role may update ONLY: status, lifecycle_stage, batch, track, stage, incubation dates, is_active, milestones
      for (const key of inputKeys) {
        if ((INCUBATOR_MUTABLE_FIELDS as readonly string[]).includes(key)) {
          cleanPayload[key] = fields[key];
        } else {
          throw new Error(`Forbidden: Incubators cannot update '${key}'. Allowed fields: ${INCUBATOR_MUTABLE_FIELDS.join(', ')}`);
        }
      }
    } else {
      // Startup role: may update founder-owned fields only
      const isOwner =
        (user.email && current.founder_email && user.email.toLowerCase() === current.founder_email.toLowerCase()) ||
        (user.id && current.founder_id && user.id === current.founder_id) ||
        id === 'me';

      if (!isOwner) {
        throw new Error('Forbidden: You do not have permission to modify this startup');
      }

      for (const key of inputKeys) {
        if ((INCUBATOR_MUTABLE_FIELDS as readonly string[]).includes(key)) {
          // If value is identical to current DB state, omit without error
          if (
            fields[key] === current[key] ||
            JSON.stringify(fields[key]) === JSON.stringify(current[key])
          ) {
            continue;
          }
          throw new Error(`Forbidden: '${key}' is managed by your incubator and cannot be modified by startups.`);
        }
        if ((FOUNDER_MUTABLE_FIELDS as readonly string[]).includes(key)) {
          cleanPayload[key] = fields[key];
        }
      }
    }

    if (Object.keys(cleanPayload).length === 0) {
      return current;
    }

    cleanPayload.updated_at = new Date().toISOString();

    // 3. Persist update in startups table
    let { data: updated, error } = await supabaseAdmin
      .from('startups')
      .update(cleanPayload)
      .eq('id', current.id)
      .select()
      .single();

    if (error && (error.message?.includes('initials') || error.message?.includes('logo_color'))) {
      const fallback = { ...cleanPayload };
      delete fallback.initials;
      delete fallback.logo_color;
      const res = await supabaseAdmin
        .from('startups')
        .update(fallback)
        .eq('id', current.id)
        .select()
        .single();
      if (res.error) throw res.error;
      updated = res.data;
    } else if (error) {
      throw error;
    }

    // 4. Log change to organization_activity_log
    try {
      const modifiedKeys = Object.keys(cleanPayload).filter((k) => k !== 'updated_at');
      await supabaseAdmin.from('organization_activity_log').insert({
        organization_id: current.organization_id,
        action: 'startup_updated',
        description: `${user.email || 'User'} updated ${modifiedKeys.join(', ')} on startup ${current.startup_name || current.name}`,
        triggered_by: user.email || 'User',
        triggered_by_id: user.id || null,
        metadata: {
          startup_id: current.id,
          modified_fields: modifiedKeys,
          role: isStaff ? 'incubator' : 'startup',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (logErr) {
      console.warn('Startup activity log warning:', logErr);
    }

    return updated;
  }
}

