import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export const FOUNDER_MUTABLE_FIELDS = [
  'name',
  'startup_name',
  'tagline',
  'sector',
  'description',
  'problem_statement',
  'solution_description',
  'target_market',
  'business_model',
  'revenue_model',
  'founder_name',
  'founder_email',
  'founder_phone',
  'team_size',
  'cofounders',
  'team_members',
  'registration_type',
  'registration_number',
  'pan_number',
  'gst_number',
  'cin_number',
  'mrr',
  'monthly_revenue',
  'annual_revenue',
  'funding_raised',
  'customer_count',
  'tech_stack',
  'pitch_deck_url',
  'business_plan_url',
  'one_pager_url',
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

const normalizeStage = (val?: string): string => {
  if (!val) return 'Idea';
  const v = val.trim().toLowerCase();
  if (v === 'mvp' || v.includes('prototype')) return 'MVP';
  if (v.includes('pre-revenue') || v.includes('prerevenue')) return 'Pre-revenue';
  if (v.includes('revenue') || v.includes('commercial')) return 'Revenue';
  if (v.includes('growth')) return 'Growth';
  if (v.includes('scale')) return 'Scale';
  return 'Idea';
};

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
      const isValidUUID = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

      // 1. Try finding by founder_email directly (avoids PostgREST .or delimiter errors with email addresses)
      if (emailLower) {
        const { data } = await supabaseAdmin
          .from('startups')
          .select(selectClause)
          .ilike('founder_email', emailLower)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) startup = data;
      }

      // 2. If not found by email, try founder_id if valid UUID
      if (!startup && user?.id && isValidUUID(user.id)) {
        const { data } = await supabaseAdmin
          .from('startups')
          .select(selectClause)
          .eq('founder_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) startup = data;
      }

      // Backfill missing fields from user's application if startup was created with blank defaults
      if (startup && emailLower && (!startup.description || !startup.founder_name || !startup.website)) {
        try {
          const { data: appData } = await supabaseAdmin
            .from('applications')
            .select('*')
            .ilike('applicant_email', emailLower)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (appData) {
            const fd = appData.form_data || {};
            const updates: Record<string, any> = {};
            if (!startup.description) {
              const desc =
                fd.businessDescription ||
                fd.description ||
                fd.solutionOverview ||
                fd.oneSentencePitch ||
                fd.problemStatement ||
                fd.problemSolved ||
                appData.pitch ||
                null;
              if (desc) updates.description = desc;
            }
            if (!startup.founder_name || startup.founder_name.toLowerCase() === 'founder') {
              let fn = appData.applicant_name || fd.fullName || fd.founderName || fd.founder_name || null;
              if (!fn || fn.toLowerCase() === 'founder') {
                const { data: u } = await supabaseAdmin
                  .from('users')
                  .select('full_name')
                  .ilike('email', emailLower)
                  .maybeSingle();
                if (u?.full_name) fn = u.full_name;
              }
              if (fn) updates.founder_name = fn;
            }
            if ((!startup.startup_name || startup.startup_name.includes("'s Startup")) && (appData.startup_name || fd.businessName || fd.startupName)) {
              updates.startup_name = appData.startup_name || fd.businessName || fd.startupName;
            }
            if (!startup.website) {
              const ws = fd.website || fd.companyWebsite || fd.websiteUrl || fd.url || fd.prototypeLink || null;
              if (ws) updates.website = ws;
            }
            if (!startup.founder_phone && (appData.applicant_phone || fd.phone)) {
              updates.founder_phone = appData.applicant_phone || fd.phone;
            }
            if (!startup.sector && (fd.industryVertical || fd.sector)) {
              updates.sector = fd.industryVertical || fd.sector;
            }
            if ((!startup.stage || startup.stage === 'Idea' || startup.stage === 'Not started') && (fd.businessStage || fd.ideaStage || fd.stage)) {
              updates.stage = normalizeStage(fd.businessStage || fd.ideaStage || fd.stage);
            }
            if (!startup.demo_url && fd.prototypeLink) {
              updates.demo_url = fd.prototypeLink;
            }
            if (fd.externalFundingRaised || fd.fundingRequired) {
              const parseNum = (v: any): number => {
                if (typeof v === 'number' && !Number.isNaN(v)) return v;
                if (typeof v !== 'string') return 0;
                const n = parseFloat(v.replace(/[^0-9.]/g, ''));
                return Number.isFinite(n) ? n : 0;
              };
              const fVal = parseNum(fd.externalFundingRaised || fd.fundingRequired);
              if (fVal > 0 && !startup.funding_raised) updates.funding_raised = fVal;
            }
            if (fd.revenue12Months || fd.projectedRevenue12M) {
              const parseNum = (v: any): number => {
                if (typeof v === 'number' && !Number.isNaN(v)) return v;
                if (typeof v !== 'string') return 0;
                const n = parseFloat(v.replace(/[^0-9.]/g, ''));
                return Number.isFinite(n) ? n : 0;
              };
              const revVal = parseNum(fd.revenue12Months || fd.projectedRevenue12M);
              if (revVal > 0 && !startup.arr) {
                updates.arr = revVal;
                updates.annual_revenue = revVal;
                updates.mrr = Math.round(revVal / 12);
              }
            }
            if (Object.keys(updates).length > 0) {
              await supabaseAdmin.from('startups').update(updates).eq('id', startup.id);
              Object.assign(startup, updates);
            }
          }
        } catch (syncErr) {
          console.warn('[StartupService] Backfill from application error:', syncErr);
        }
      }

      // Ensure founder_name is populated from users table if still missing
      if (startup && (!startup.founder_name || startup.founder_name.toLowerCase() === 'founder') && emailLower) {
        try {
          const { data: u } = await supabaseAdmin.from('users').select('full_name').ilike('email', emailLower).maybeSingle();
          if (u?.full_name && u.full_name.trim()) {
            await supabaseAdmin.from('startups').update({ founder_name: u.full_name.trim() }).eq('id', startup.id);
            startup.founder_name = u.full_name.trim();
          }
        } catch {}
      }

      let validFounderId: string | null = null;
      if (isValidUUID(user?.id)) {
        const { data: u } = await supabaseAdmin.from('users').select('id').eq('id', user.id).maybeSingle();
        if (u?.id) validFounderId = u.id;
      }
      if (!validFounderId && emailLower) {
        const { data: u } = await supabaseAdmin.from('users').select('id').ilike('email', emailLower).maybeSingle();
        if (u?.id) validFounderId = u.id;
      }

      let validCreatedBy: string | null = null;
      if (isValidUUID(user?.id)) {
        const { data: u } = await supabaseAdmin.from('users').select('id').eq('id', user.id).maybeSingle();
        if (u?.id) validCreatedBy = u.id;
      }

      // 3. If not found by founder_email directly, check if user has an application
      if (!startup && emailLower) {
        let { data: appData } = await supabaseAdmin
          .from('applications')
          .select('id, startup_name, organization_id, selected_incubator_id, form_data, applicant_name, applicant_phone, created_by')
          .ilike('applicant_email', emailLower)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!appData && user?.id && isValidUUID(user.id)) {
          const { data: appByCreator } = await supabaseAdmin
            .from('applications')
            .select('id, startup_name, organization_id, selected_incubator_id, form_data, applicant_name, applicant_phone, created_by')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (appByCreator) appData = appByCreator;
        }

        if (appData) {
          let appStartup = null;
          if ((appData as any).startup_id) {
            const { data: st } = await supabaseAdmin
              .from('startups')
              .select(selectClause)
              .eq('id', (appData as any).startup_id)
              .maybeSingle();
            appStartup = st;
          }

          if (appStartup) {
            startup = appStartup;
          } else {
            const startupName =
              appData.startup_name ||
              appData.form_data?.startupName ||
              appData.form_data?.startup_name ||
              `${emailLower.split('@')[0]}'s Startup`;

            let targetOrg = [
              appData.organization_id,
              appData.selected_incubator_id,
              appData.form_data?.selected_incubator_id,
              appData.form_data?.selected_id,
              appData.form_data?.incubator_id,
              user?.organization_id,
            ].find((id) => isValidUUID(id));

            if (!targetOrg) {
              const { data: defaultOrg } = await supabaseAdmin.from('organizations').select('id').limit(1).maybeSingle();
              targetOrg = defaultOrg?.id;
            }

            const stageVal = normalizeStage(appData.form_data?.businessStage || appData.form_data?.stage);

            const startupPayload = StartupService.buildStartupPayloadFromApplication(appData, {
              organizationId: targetOrg,
              founderId: validFounderId,
              createdBy: validCreatedBy,
              startupName,
            });

            let { data: created, error: crErr } = await supabaseAdmin
              .from('startups')
              .insert(startupPayload)
              .select(selectClause)
              .single();

            if (crErr && (crErr.message?.includes("'startup_name'") || (crErr as any).code === 'PGRST204')) {
              delete startupPayload.startup_name;
              startupPayload.name = startupName;
              const retryRes = await supabaseAdmin
                .from('startups')
                .insert(startupPayload)
                .select(selectClause)
                .single();
              created = retryRes.data;
              crErr = retryRes.error;
            }

            if (crErr && ((crErr as any).code === '23503' || crErr.message?.includes('foreign key constraint'))) {
              startupPayload.created_by = null;
              startupPayload.founder_id = null;
              const retryFk = await supabaseAdmin
                .from('startups')
                .insert(startupPayload)
                .select(selectClause)
                .single();
              created = retryFk.data;
              crErr = retryFk.error;
            }

            if (crErr) {
              console.error('[StartupService] Auto-provision insert error:', crErr);
            }
            if (created) startup = created;
          }
        }
      }

      // 4. Ultimate fallback: if authenticated user has no startup row at all, provision one so dashboard never fails
      if (!startup && emailLower) {
        const { data: defaultOrg } = await supabaseAdmin.from('organizations').select('id').limit(1).maybeSingle();
        const initialOrgId = (user?.organization_id && isValidUUID(user.organization_id)) ? user.organization_id : defaultOrg?.id;
        const defaultName = `${emailLower.split('@')[0]}'s Startup`;

        const fallbackPayload: Record<string, any> = {
          founder_id: validFounderId,
          founder_email: emailLower,
          startup_name: defaultName,
          organization_id: initialOrgId,
          stage: 'Idea',
          status: 'active',
          is_active: true,
          created_by: validCreatedBy,
        };

        let { data: createdFallback, error: fbErr } = await supabaseAdmin
          .from('startups')
          .insert(fallbackPayload)
          .select(selectClause)
          .single();

        if (fbErr && (fbErr.message?.includes("'startup_name'") || (fbErr as any).code === 'PGRST204')) {
          delete fallbackPayload.startup_name;
          fallbackPayload.name = defaultName;
          const retryFb = await supabaseAdmin
            .from('startups')
            .insert(fallbackPayload)
            .select(selectClause)
            .single();
          createdFallback = retryFb.data;
          fbErr = retryFb.error;
        }

        if (fbErr && ((fbErr as any).code === '23503' || fbErr.message?.includes('foreign key constraint'))) {
          fallbackPayload.created_by = null;
          fallbackPayload.founder_id = null;
          const retryFk = await supabaseAdmin
            .from('startups')
            .insert(fallbackPayload)
            .select(selectClause)
            .single();
          createdFallback = retryFk.data;
          fbErr = retryFk.error;
        }

        if (fbErr) {
          console.error('[StartupService] Fallback provision error:', fbErr);
        } else if (createdFallback) {
          startup = createdFallback;
        }
      }
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
    const startupName = startup.name || startup.startup_name || 'Startup';
    return {
      ...startup,
      name: startupName,
      startup_name: startupName,
      team_members: Array.isArray(startup.team_members) ? startup.team_members : [],
      cofounders: Array.isArray(startup.cofounders) ? startup.cofounders : [],
      tech_stack: Array.isArray(startup.tech_stack) ? startup.tech_stack : [],
      milestones: Array.isArray(startup.milestones) ? startup.milestones : [],
      hardware_bom: Array.isArray(startup.hardware_bom) ? startup.hardware_bom : [],
      lab_equipment: Array.isArray(startup.lab_equipment) ? startup.lab_equipment : [],
      fabrication_pipeline: Array.isArray(startup.fabrication_pipeline) ? startup.fabrication_pipeline : [],
      deck_revisions: Array.isArray(startup.deck_revisions) ? startup.deck_revisions : [],
      batch: startup.batch || startup.cohort || null,
      track: startup.track || null,
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

    // 2. Identify user role & ownership
    const userRole = (user.role || '').toLowerCase();
    const isSuperAdmin = userRole === 'super-admin' || userRole === 'super_admin';
    const isStaff =
      isSuperAdmin ||
      userRole.includes('admin') ||
      userRole.includes('incubator');

    const isOwner =
      id === 'me' ||
      Boolean(
        (user.email && current.founder_email && user.email.toLowerCase() === current.founder_email.toLowerCase()) ||
        (user.id && current.founder_id && user.id === current.founder_id) ||
        (user.email && current.email && user.email.toLowerCase() === current.email.toLowerCase())
      );

    const cleanPayload: Record<string, any> = {};
    const inputKeys = Object.keys(fields).filter((k) => fields[k] !== undefined);

    if (isOwner) {
      // Founder / Owner updating their own startup
      for (const key of inputKeys) {
        // Allow founder to choose or update their track
        if (key === 'track') {
          cleanPayload.track = fields.track;
          continue;
        }

        if ((FOUNDER_MUTABLE_FIELDS as readonly string[]).includes(key)) {
          cleanPayload[key] = fields[key];
        } else if ((INCUBATOR_MUTABLE_FIELDS as readonly string[]).includes(key)) {
          // If founder also has staff/admin role, allow updating incubator fields
          if (isStaff) {
            cleanPayload[key] = fields[key];
          } else if (
            fields[key] === current[key] ||
            JSON.stringify(fields[key]) === JSON.stringify(current[key])
          ) {
            continue;
          } else {
            throw new Error(`Forbidden: '${key}' is managed by your incubator and cannot be modified by startups.`);
          }
        }
      }
    } else if (isStaff) {
      // Incubator staff can only update startups within their organization
      if (!isSuperAdmin) {
        if (user.organization_id && current.organization_id && user.organization_id !== current.organization_id) {
          throw new Error('Forbidden: You can only edit startups enrolled in your organization');
        }
      }

      // Incubator role may update ONLY incubator mutable fields
      for (const key of inputKeys) {
        if ((INCUBATOR_MUTABLE_FIELDS as readonly string[]).includes(key)) {
          cleanPayload[key] = fields[key];
        } else {
          throw new Error(`Forbidden: Incubators cannot update '${key}'. Allowed fields: ${INCUBATOR_MUTABLE_FIELDS.join(', ')}`);
        }
      }
    } else {
      throw new Error('Forbidden: You do not have permission to modify this startup');
    }

    // Normalize empty date string to null to satisfy PostgreSQL date column
    if ('founded_date' in cleanPayload && !cleanPayload.founded_date) {
      cleanPayload.founded_date = null;
    }

    // Normalize stage if provided to satisfy valid_stage CHECK constraint
    if (cleanPayload.stage) {
      cleanPayload.stage = normalizeStage(cleanPayload.stage);
    }

    // Sync startup_name and name
    if (cleanPayload.startup_name && !cleanPayload.name) {
      cleanPayload.name = cleanPayload.startup_name;
    } else if (cleanPayload.name && !cleanPayload.startup_name) {
      cleanPayload.startup_name = cleanPayload.name;
    }

    if (Object.keys(cleanPayload).length === 0) {
      return current;
    }

    cleanPayload.updated_at = new Date().toISOString();

    // 3. Persist update in startups table with graceful column fallback
    let { data: updated, error } = await supabaseAdmin
      .from('startups')
      .update(cleanPayload)
      .eq('id', current.id)
      .select()
      .maybeSingle();

    if (error && (error.message?.includes("'name'") || (error as any).code === 'PGRST204')) {
      const fallbackPayload = { ...cleanPayload };
      delete fallbackPayload.name;
      const res = await supabaseAdmin
        .from('startups')
        .update(fallbackPayload)
        .eq('id', current.id)
        .select()
        .maybeSingle();
      if (!res.error) {
        updated = res.data;
        error = null;
      }
    }

    if (error && (error.message?.includes("'startup_name'") || (error as any).code === 'PGRST204')) {
      const fallbackPayload = { ...cleanPayload };
      delete fallbackPayload.startup_name;
      const res = await supabaseAdmin
        .from('startups')
        .update(fallbackPayload)
        .eq('id', current.id)
        .select()
        .maybeSingle();
      if (!res.error) {
        updated = res.data;
        error = null;
      }
    }

    if (error && (error.message?.includes('initials') || error.message?.includes('logo_color'))) {
      const fallback = { ...cleanPayload };
      delete fallback.initials;
      delete fallback.logo_color;
      delete fallback.name;
      const res = await supabaseAdmin
        .from('startups')
        .update(fallback)
        .eq('id', current.id)
        .select()
        .maybeSingle();
      if (!res.error) {
        updated = res.data;
        error = null;
      }
    }

    if (error) {
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

  /**
   * Maps fields collected in an application (pre-incubator or incubator) into
   * canonical columns of the `startups` table for consistent hydration.
   */
  static buildStartupPayloadFromApplication(
    app: any,
    opts: {
      organizationId: string | null | undefined;
      founderId?: string | null;
      createdBy?: string | null;
      startupName?: string;
    }
  ): Record<string, any> {
    const fd = app?.form_data || {};
    const cleanEmail = (app?.applicant_email || fd.email || '').trim().toLowerCase() || null;

    const parseNum = (v: any): number => {
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v !== 'string') return 0;
      const cleaned = v.replace(/[^0-9.]/g, '');
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    };

    const parseDateOnly = (v: any): string | null => {
      if (!v || typeof v !== 'string') return null;
      const s = v.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    };

    const cofoundersCount = Math.max(0, parseInt(String(fd.coFounderCount ?? '0'), 10) || 0);
    const annualRev = parseNum(fd.revenue12Months || fd.projectedRevenue12M);
    const monthlyRev = annualRev > 0 ? Math.round(annualRev / 12) : 0;

    return {
      organization_id: opts.organizationId || null,
      startup_name:
        opts.startupName ||
        app?.startup_name ||
        fd.startupName ||
        fd.startup_name ||
        fd.businessName ||
        fd.name ||
        `${app?.applicant_name || fd.fullName || 'Startup'}'s Venture`,
      founder_id: opts.founderId || null,
      founder_name: app?.applicant_name || fd.fullName || fd.founderName || fd.founder_name || null,
      founder_email: cleanEmail,
      founder_phone: app?.applicant_phone || fd.phone || fd.phoneNumber || null,
      website: fd.website || fd.companyWebsite || fd.websiteUrl || fd.url || fd.prototypeLink || null,
      sector: fd.industryVertical || fd.sector || 'Technology',
      stage: normalizeStage(fd.businessStage || fd.ideaStage || fd.stage),
      tagline: fd.oneSentencePitch || null,
      description:
        fd.businessDescription ||
        fd.description ||
        fd.solutionOverview ||
        fd.oneSentencePitch ||
        fd.problemStatement ||
        fd.problemSolved ||
        app?.pitch ||
        null,
      problem_statement: fd.problemStatement || fd.problemSolved || fd.customerProblems || null,
      solution_description: fd.solutionOverview || fd.customerSolutions || fd.oneSentencePitch || null,
      target_market: fd.targetAudience || fd.targetMarket || fd.idealCustomerPersona || null,
      business_model: fd.customerAcquisitionChannels || fd.businessModelValidation || null,
      revenue_model: fd.revenueModel || null,
      founded_date: parseDateOnly(fd.startedDate),
      registration_type: fd.legalStatus || null,
      demo_url: fd.prototypeLink || fd.demoUrl || fd.demo_url || null,
      pitch_deck_url: fd.pitchDeckUrl || fd.pitch_deck_url || null,
      business_plan_url: fd.businessPlanUrl || fd.business_plan_url || null,
      one_pager_url: fd.onePagerUrl || fd.one_pager_url || null,
      team_size: Math.max(1, 1 + cofoundersCount),
      customer_count: Math.round(parseNum(fd.payingCustomers || fd.currentUsers)),
      annual_revenue: annualRev,
      monthly_revenue: monthlyRev,
      mrr: monthlyRev,
      funding_raised: parseNum(fd.externalFundingRaised || fd.fundingRequired),
      track: fd.startup_track || null,
      status: 'active',
      is_active: true,
      created_by: opts.createdBy || null,
    };
  }
}

