import { Startup, TeamMember, MentorAllocation, InvestorAllocation } from '../models/startup';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from '@/backend/services/notificationService';

export interface GetStartupsFilter {
  sector?: string;
  stage?: string;
  status?: string;
  search?: string;
  sort?: 'created_at' | 'name' | 'revenue';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  dashboard?: string;
}

// In-memory fallback cache for development & seed references
const fallbackStartups: Startup[] = [
  {
    id: '8d9dfb33-7b8f-4e28-9467-d51b3eab4642',
    name: 'NexHealth AI',
    founder_name: 'Dr. Sarah Connor',
    email: 'sarah@nexhealth.ai',
    sector: 'Health & Biotech',
    stage: 'MVP',
    status: 'active',
    revenue: 50000,
    organization_id: '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    mentors: [],
    investors: [],
    co_incubations: [],
  },
  {
    id: '0b66ea58-6bac-42a3-b3dd-d347156c0396',
    name: 'PayFlow Finance',
    founder_name: 'John Miller',
    email: 'john@payflow.com',
    sector: 'FinTech',
    stage: 'Growth',
    status: 'incubating',
    revenue: 250000,
    organization_id: '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false,
    mentors: [],
    investors: [],
    co_incubations: [],
  },
];

const isValidUUID = (str?: string | null): boolean => {
  return Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim()));
};

const resolveOrgId = (orgId?: string | null): string => {
  if (orgId && isValidUUID(orgId)) return orgId.trim();
  return orgId || '';
};

// Map DB row from Supabase to Startup interface
const mapRowToStartup = (row: any): Startup => {
  return {
    ...row,
    id: row.id,
    startup_name: row.startup_name || row.name || 'Startup',
    name: row.startup_name || row.name || 'Startup',
    founder_name: row.founder_name || row.founder_email?.split('@')[0] || 'Founder',
    founder_id: row.founder_id,
    founder_phone: row.founder_phone || '',
    email: row.founder_email || '',
    description: row.description || row.problem_statement || '',
    sector: row.sector || '',
    stage: row.stage || 'Idea',
    status: row.status || 'pending',
    admission_status: row.admission_status || null,
    revenue: Number(row.monthly_revenue || row.annual_revenue) || 0,
    organization_id: row.organization_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_deleted: !!row.deleted_at,
    mentors: row.mentors || [],
    investors: row.investors || [],
    co_incubations: row.co_incubations || [],
  };
};

export class StartupService {
  // 1. Startup CRUD & Querying directly with Supabase Database
  static async getStartups(
    orgId: string,
    filter: GetStartupsFilter = {}
  ): Promise<{
    startups: Startup[];
    total: number;
    dashboards_assigned: number;
    status_counts: Record<string, number>;
    overall_total: number;
  }> {
    const realOrgId = resolveOrgId(orgId);

    // Pre-calculate dashboards assigned for this incubator organization
    const { data: assignedApps } = await supabaseAdmin
      .from('applications')
      .select('startup_id, applicant_email, admission_status, form_data')
      .or('admission_status.eq.dashboard_assigned,form_data->>dashboard_access_granted.eq.true');

    const assignedIds = new Set<string>();
    const assignedEmails = new Set<string>();
    if (assignedApps) {
      assignedApps.forEach((a: any) => {
        if (a.startup_id) assignedIds.add(a.startup_id);
        if (a.applicant_email) assignedEmails.add(a.applicant_email.toLowerCase());
      });
    }

    const isAssignedRow = (s: any) =>
      assignedIds.has(s?.id) ||
      Boolean(s?.founder_email && assignedEmails.has(s.founder_email.toLowerCase()));

    let orgQuery = supabaseAdmin
      .from('startups')
      .select('id, startup_name, founder_name, founder_email, sector, stage, status');
    if (orgId !== 'all' && realOrgId) {
      orgQuery = orgQuery.eq('organization_id', realOrgId);
    }
    const { data: orgStartups } = await orgQuery;
    const allOrgStartups: any[] = Array.isArray(orgStartups) ? orgStartups : [];

    const dashboardsAssignedCount = allOrgStartups.filter(isAssignedRow).length;
    const overallTotal = allOrgStartups.length;

    const statusCounts: Record<string, number> = {
      all: 0,
      queue: 0,
      active: 0,
      inactive: 0,
      exited: 0,
    };
    const searchTerm = filter.search?.trim().replace(/['"]/g, '').toLowerCase();

    allOrgStartups.forEach((s: any) => {
      if (
        filter.sector && filter.sector !== 'ALL' &&
        !String(s.sector || '').toLowerCase().includes(filter.sector.toLowerCase())
      ) return;
      if (
        filter.stage && filter.stage !== 'ALL' &&
        !String(s.stage || '').toLowerCase().includes(filter.stage.toLowerCase())
      ) return;
      if (filter.dashboard === 'assigned' && !isAssignedRow(s)) return;
      if (filter.dashboard === 'unassigned' && isAssignedRow(s)) return;
      if (searchTerm) {
        const haystack = [s.startup_name, s.founder_name, s.founder_email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(searchTerm)) return;
      }

      statusCounts.all += 1;
      const status = String(s.status || '').toLowerCase();
      if (status === 'pending') statusCounts.queue += 1;
      else if (status === 'active') statusCounts.active += 1;
      else if (status === 'inactive') statusCounts.inactive += 1;
      else if (status === 'exited') statusCounts.exited += 1;
    });

    const emptyResult = (total: number) => ({
      startups: [] as Startup[],
      total,
      dashboards_assigned: dashboardsAssignedCount,
      status_counts: statusCounts,
      overall_total: overallTotal,
    });

    let query = supabaseAdmin
      .from('startups')
      .select('*', { count: 'exact' });

    if (orgId !== 'all') {
      if (realOrgId) {
        query = query.eq('organization_id', realOrgId);
      } else {
        return emptyResult(0);
      }
    }

    // Dashboard filter
    if (filter.dashboard === 'assigned') {
      const idsArr = Array.from(assignedIds);
      const emailsArr = Array.from(assignedEmails);
      if (idsArr.length === 0 && emailsArr.length === 0) {
        return emptyResult(0);
      }
      const clauses: string[] = [];
      if (idsArr.length > 0) clauses.push(`id.in.(${idsArr.join(',')})`);
      if (emailsArr.length > 0) clauses.push(`founder_email.in.(${emailsArr.map((e) => `"${e}"`).join(',')})`);
      query = query.or(clauses.join(','));
    } else if (filter.dashboard === 'unassigned') {
      const idsArr = Array.from(assignedIds);
      const emailsArr = Array.from(assignedEmails);
      if (idsArr.length > 0) query = query.not('id', 'in', `(${idsArr.join(',')})`);
      if (emailsArr.length > 0) query = query.not('founder_email', 'in', `(${emailsArr.map((e) => `"${e}"`).join(',')})`);
    }

    // Filtering
    if (filter.sector && filter.sector !== 'ALL') query = query.ilike('sector', `%${filter.sector}%`);
    if (filter.stage && filter.stage !== 'ALL') query = query.ilike('stage', `%${filter.stage}%`);
    if (filter.status && filter.status !== 'all') query = query.ilike('status', `%${filter.status}%`);

    // Search
    if (filter.search && filter.search.trim()) {
      const term = filter.search.trim().replace(/['"]/g, '');
      const searchClauses = [
        `startup_name.ilike."%${term}%"`,
        `founder_name.ilike."%${term}%"`,
        `founder_email.ilike."%${term}%"`,
      ];
      query = query.or(searchClauses.join(','));
    }

    // Sorting
    const sortField = filter.sort === 'revenue' ? 'monthly_revenue' : filter.sort === 'name' ? 'name' : filter.sort || 'created_at';
    const isAsc = filter.order === 'asc';
    try {
      query = query.order(sortField, { ascending: isAsc });
    } catch { }

    // Pagination
    const offset = filter.offset ? Number(filter.offset) : 0;
    const limit = filter.limit ? Number(filter.limit) : 100;
    query = query.range(offset, offset + limit - 1);

    let { data, count, error } = await query;

    if (error) {
      console.warn('Initial startups query failed, retrying simplified:', error);
      let retryQuery = supabaseAdmin
        .from('startups')
        .select('*', { count: 'exact' });
      if (orgId !== 'all') {
        if (realOrgId) {
          retryQuery = retryQuery.eq('organization_id', realOrgId);
        } else {
          return emptyResult(0);
        }
      }
      if (filter.sector && filter.sector !== 'ALL') retryQuery = retryQuery.ilike('sector', `%${filter.sector}%`);
      if (filter.stage && filter.stage !== 'ALL') retryQuery = retryQuery.ilike('stage', `%${filter.stage}%`);
      if (filter.status && filter.status !== 'all') retryQuery = retryQuery.ilike('status', `%${filter.status}%`);
      if (filter.search && filter.search.trim()) {
        const term = filter.search.trim().replace(/['"]/g, '');
        retryQuery = retryQuery.or(`startup_name.ilike."%${term}%",founder_name.ilike."%${term}%",founder_email.ilike."%${term}%"`);
      }
      const retryRes = await retryQuery.range(offset, offset + limit - 1);
      data = retryRes.data;
      count = retryRes.count;
      error = retryRes.error;
    }

    if (error) {
      console.error('Error fetching startups:', error);
      return emptyResult(0);
    }

    if (!data || data.length === 0) {
      return emptyResult(count ?? 0);
    }

    // Compute founder registration status
    const emails = data.map((row) => (row.founder_email || '').toLowerCase()).filter(Boolean);
    const uniqueEmails = Array.from(new Set(emails));
    let userStatusMap: Record<string, boolean> = {};
    if (uniqueEmails.length > 0) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email,last_login_at')
        .in('email', uniqueEmails);
      if (!userError && userData) {
        userData.forEach((u: any) => {
          userStatusMap[u.email.toLowerCase()] = !!u.last_login_at;
        });
      }
    }

    // Query admission_status from linked applications
    const startupIds = data.map((row) => row.id).filter(Boolean);
    let appStatusMap: Record<string, string> = {};
    if (startupIds.length > 0) {
      const { data: appData } = await supabaseAdmin
        .from('applications')
        .select('startup_id, applicant_email, admission_status, form_data')
        .in('startup_id', startupIds)
        .order('created_at', { ascending: false });

      if (appData) {
        appData.forEach((a: any) => {
          const isAssigned =
            a.admission_status === 'dashboard_assigned' ||
            a.form_data?.dashboard_access_granted === true ||
            a.form_data?.dashboard_access_granted === 'true';
          const status = isAssigned ? 'dashboard_assigned' : (a.admission_status || null);
          if (a.startup_id && !appStatusMap[a.startup_id]) {
            appStatusMap[a.startup_id] = status;
          }
        });
      }
    }
    if (uniqueEmails.length > 0) {
      const { data: emailAppData } = await supabaseAdmin
        .from('applications')
        .select('startup_id, applicant_email, admission_status, form_data')
        .in('applicant_email', uniqueEmails)
        .order('created_at', { ascending: false });

      if (emailAppData) {
        emailAppData.forEach((a: any) => {
          if (a.applicant_email) {
            const em = a.applicant_email.toLowerCase();
            const isAssigned =
              a.admission_status === 'dashboard_assigned' ||
              a.form_data?.dashboard_access_granted === true ||
              a.form_data?.dashboard_access_granted === 'true';
            const status = isAssigned ? 'dashboard_assigned' : (a.admission_status || null);
            if (!appStatusMap[em]) {
              appStatusMap[em] = status;
            }
          }
        });
      }
    }

    const startups = data.map((row) => {
      const startup = mapRowToStartup(row);
      const email = (row.founder_email || '').toLowerCase();
      (startup as any).founder_registered = !!userStatusMap[email];
      const isAssigned = assignedIds.has(row.id) || (email && assignedEmails.has(email));
      const resolvedAdmissionStatus =
        appStatusMap[row.id] ||
        (email ? appStatusMap[email] : null) ||
        (isAssigned ? 'dashboard_assigned' : null) ||
        undefined;
      (startup as any).admission_status = resolvedAdmissionStatus;
      startup.admission_status = resolvedAdmissionStatus;
      return startup;
    });

    const pageAssignedCount = startups.filter((s) => s.admission_status === 'dashboard_assigned').length;
    const finalDashboardsAssigned = Math.max(dashboardsAssignedCount, pageAssignedCount);

    return {
      startups,
      total: count ?? data.length,
      dashboards_assigned: finalDashboardsAssigned,
      status_counts: statusCounts,
      overall_total: overallTotal,
    };
  }

  static async getStartupById(id: string, orgId: string): Promise<Startup | null> {
    const realOrgId = resolveOrgId(orgId);

    // If query by seed ID or non-UUID, check fallback first
    if (!isValidUUID(id)) {
      const found = fallbackStartups.find((s) => s.id === id && !s.is_deleted);
      if (found) return found;
    }

    const { data, error } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      const fallback = fallbackStartups.find((s) => s.id === id && !s.is_deleted);
      return fallback || null;
    }

    return mapRowToStartup(data);
  }

  static async createStartup(data: Partial<Startup> & { organization_id: string }): Promise<Startup> {
    const realOrgId = resolveOrgId(data.organization_id);

    // Valid check constraints in Supabase
    const allowedStages = ['Idea', 'MVP', 'Pre-revenue', 'Revenue', 'Growth', 'Scale'];
    let validStage = 'Idea';
    if (data.stage) {
      const match = allowedStages.find((s) => s.toLowerCase() === data.stage!.toLowerCase());
      if (match) validStage = match;
    }

    const stName = data.startup_name || data.name || 'New Startup';
    const insertPayload: any = {
      organization_id: realOrgId,
      name: stName,
      startup_name: stName,
      sector: data.sector || null,
      stage: validStage,
      founder_name: data.founder_name || 'Founder',
      founder_email: data.email || (data as any).founder_email || 'founder@startup.com',
      founder_phone: (data as any).founder_phone || (data as any).contact || null,
      description: data.description || null,
      monthly_revenue: (data as any).monthly_revenue != null ? Number((data as any).monthly_revenue) : (data.revenue != null ? Number(data.revenue) : null),
      annual_revenue: (data as any).annual_revenue != null ? Number((data as any).annual_revenue) : (data.revenue != null ? Number(data.revenue) * 12 : null),
      status: (data.status || 'pending').toLowerCase(),
      is_active: data.status ? data.status.toLowerCase() === 'active' : false,
      track: (data as any).track || null,
      website: (data as any).website || null,
      founded_date: (data as any).founded_date || null,
      problem_statement: (data as any).problem_statement || (data as any).problem || null,
      solution_description: (data as any).solution_description || (data as any).solution || null,
      target_market: (data as any).target_market || (data as any).market || null,
      business_model: (data as any).business_model || (data as any).revenue_model || null,
    };

    if (data.founder_id && isValidUUID(data.founder_id)) {
      insertPayload.founder_id = data.founder_id;
    }

    let { data: createdRow, error } = await supabaseAdmin
      .from('startups')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // Check if the record actually succeeded inserting (e.g. if error was merely on .single() RLS selection)
      const { data: alreadyInserted } = await supabaseAdmin
        .from('startups')
        .select()
        .eq('organization_id', realOrgId)
        .ilike('name', stName)
        .limit(1)
        .maybeSingle();

      if (alreadyInserted) {
        return mapRowToStartup(alreadyInserted);
      }

      if ((error as any).code === '23503' || error.message?.includes('foreign key constraint')) {
        delete insertPayload.founder_id;
      }
      if (error.message?.includes("'startup_name'") || (error as any).code === 'PGRST204') {
        delete insertPayload.startup_name;
        insertPayload.name = stName;
      }
      if (error.message?.includes("'name'")) {
        delete insertPayload.name;
        insertPayload.startup_name = stName;
      }
      if (error.message?.includes("'track'")) {
        delete insertPayload.track;
      }
      if (error.message?.includes("'is_active'")) {
        delete insertPayload.is_active;
      }
      delete insertPayload.team_members;
      const retryRes = await supabaseAdmin
        .from('startups')
        .insert(insertPayload)
        .select()
        .single();
      createdRow = retryRes.data;
      error = retryRes.error;
    }

    if (error || !createdRow) {
      // In-memory fallback if insert rejected by schema constraint
      const fallbackId = 'startup_' + Date.now();
      const fallbackObj: Startup = {
        id: fallbackId,
        startup_name: data.startup_name || data.name || 'Untitled Startup',
        name: data.startup_name || data.name || 'Untitled Startup',
        founder_name: data.founder_name || 'Founder',
        founder_id: data.founder_id,
        email: data.email || '',
        sector: data.sector || 'General',
        stage: validStage,
        status: data.status || 'Active',
        revenue: Number(data.revenue) || 0,
        organization_id: realOrgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        mentors: [],
        investors: [],
        co_incubations: [],
      };
      fallbackStartups.unshift(fallbackObj);
      return fallbackObj;
    }

    return mapRowToStartup(createdRow);
  }

  static async updateStartup(id: string, orgId: string, data: Partial<Startup>): Promise<Startup | null> {
    const realOrgId = resolveOrgId(orgId);

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (data.startup_name !== undefined) updatePayload.startup_name = data.startup_name;
    else if (data.name !== undefined) updatePayload.startup_name = data.name;
    if (data.founder_name !== undefined) updatePayload.founder_name = data.founder_name;
    if (data.founder_email !== undefined) updatePayload.founder_email = data.founder_email;
    if (data.founder_phone !== undefined) updatePayload.founder_phone = data.founder_phone;
    if (data.sector !== undefined) updatePayload.sector = data.sector;
    if (data.stage !== undefined) updatePayload.stage = data.stage;
    if (data.status !== undefined) updatePayload.status = data.status;
    if ((data as any).cohort !== undefined) updatePayload.cohort = (data as any).cohort;
    if ((data as any).batch !== undefined) updatePayload.cohort = (data as any).batch;
    if ((data as any).track !== undefined) updatePayload.track = (data as any).track;
    if ((data as any).lifecycle_stage !== undefined) updatePayload.lifecycle_stage = (data as any).lifecycle_stage;
    if ((data as any).is_active !== undefined) updatePayload.is_active = (data as any).is_active;
    if ((data as any).milestones !== undefined) updatePayload.milestones = (data as any).milestones;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.website !== undefined) updatePayload.website = data.website;
    if (data.logo_url !== undefined) updatePayload.logo_url = data.logo_url;
    if (data.problem_statement !== undefined) updatePayload.problem_statement = data.problem_statement;
    if (data.solution_description !== undefined) updatePayload.solution_description = data.solution_description;
    if (data.target_market !== undefined) updatePayload.target_market = data.target_market;
    if (data.business_model !== undefined) updatePayload.business_model = data.business_model;
    if (data.revenue_model !== undefined) updatePayload.revenue_model = data.revenue_model;
    if (data.registration_type !== undefined) updatePayload.registration_type = data.registration_type;
    if (data.registration_number !== undefined) updatePayload.registration_number = data.registration_number;
    if (data.pan_number !== undefined) updatePayload.pan_number = data.pan_number;
    if (data.gst_number !== undefined) updatePayload.gst_number = data.gst_number;
    if (data.cin_number !== undefined) updatePayload.cin_number = data.cin_number;
    if (data.founded_date !== undefined) updatePayload.founded_date = data.founded_date;
    if (data.incubation_start_date !== undefined) updatePayload.incubation_start_date = data.incubation_start_date;
    if (data.incubation_end_date !== undefined) updatePayload.incubation_end_date = data.incubation_end_date;
    if (data.pitch_deck_url !== undefined) updatePayload.pitch_deck_url = data.pitch_deck_url;
    if (data.business_plan_url !== undefined) updatePayload.business_plan_url = data.business_plan_url;
    if (data.mrr !== undefined) updatePayload.mrr = Number(data.mrr) || 0;
    if (data.funding_raised !== undefined) updatePayload.funding_raised = Number(data.funding_raised) || 0;
    if (data.customer_count !== undefined) updatePayload.customer_count = Number(data.customer_count) || 0;
    if (data.team_size !== undefined) updatePayload.team_size = Number(data.team_size) || 1;
    if (data.team_members !== undefined) updatePayload.team_members = data.team_members;
    if ((data as any).cofounders !== undefined) updatePayload.cofounders = (data as any).cofounders;
    if (data.revenue !== undefined || data.monthly_revenue !== undefined) {
      const rev = Number(data.monthly_revenue !== undefined ? data.monthly_revenue : data.revenue) || 0;
      updatePayload.monthly_revenue = rev;
      updatePayload.annual_revenue = rev * 12;
    }

    if (isValidUUID(id)) {
      const { data: updatedRow, error } = await supabaseAdmin
        .from('startups')
        .update(updatePayload)
        .eq('id', id)
        .eq('organization_id', realOrgId)
        .select()
        .maybeSingle();

      if (!error && updatedRow) {
        return mapRowToStartup(updatedRow);
      }
    }

    // Fallback update
    const idx = fallbackStartups.findIndex((s) => s.id === id);
    if (idx !== -1) {
      fallbackStartups[idx] = { ...fallbackStartups[idx], ...data, updated_at: new Date().toISOString() };
      return fallbackStartups[idx];
    }

    return null;
  }

  static async softDeleteStartup(id: string, orgId: string): Promise<boolean> {
    const realOrgId = resolveOrgId(orgId);

    if (isValidUUID(id)) {
      const { error } = await supabaseAdmin
        .from('startups')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', id);

      if (!error) return true;
    }

    const idx = fallbackStartups.findIndex((s) => s.id === id);
    if (idx !== -1) {
      fallbackStartups[idx].is_deleted = true;
      return true;
    }

    return false;
  }

  // 2. Team Members (persisted in JSONB column 'team_members' on Supabase startups row)
  static async getTeamMembers(startupId: string): Promise<TeamMember[]> {
    if (isValidUUID(startupId)) {
      const { data } = await supabaseAdmin
        .from('startups')
        .select('team_members')
        .eq('id', startupId)
        .maybeSingle();

      if (data?.team_members && Array.isArray(data.team_members)) {
        return data.team_members;
      }
    }
    return [
      {
        id: 'member_1',
        startup_id: startupId,
        name: 'Alex Vance',
        role: 'CTO',
        email: 'alex@startup.ai',
        created_at: new Date().toISOString(),
      },
    ];
  }

  static async addTeamMember(startupId: string, member: Partial<TeamMember>): Promise<TeamMember> {
    const members = await this.getTeamMembers(startupId);
    const newMember: TeamMember = {
      id: 'member_' + Date.now(),
      startup_id: startupId,
      name: member.name || 'Team Member',
      role: member.role || 'Contributor',
      email: member.email || '',
      phone: member.phone,
      created_at: new Date().toISOString(),
    };
    members.push(newMember);

    if (isValidUUID(startupId)) {
      await supabaseAdmin
        .from('startups')
        .update({ team_members: members })
        .eq('id', startupId);
    }

    return newMember;
  }

  static async updateTeamMember(startupId: string, memberId: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    const members = await this.getTeamMembers(startupId);
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx === -1) return null;

    members[idx] = { ...members[idx], ...data, id: memberId, startup_id: startupId };

    if (isValidUUID(startupId)) {
      await supabaseAdmin
        .from('startups')
        .update({ team_members: members })
        .eq('id', startupId);
    }

    return members[idx];
  }

  static async removeTeamMember(startupId: string, memberId: string): Promise<boolean> {
    const members = await this.getTeamMembers(startupId);
    const initialLen = members.length;
    const filtered = members.filter((m) => m.id !== memberId);

    if (filtered.length < initialLen && isValidUUID(startupId)) {
      await supabaseAdmin
        .from('startups')
        .update({ team_members: filtered })
        .eq('id', startupId);
    }

    return filtered.length < initialLen;
  }

  // Real startup_mentors allocation helpers
  static async getMentors(startupId: string): Promise<any[]> {
    if (!isValidUUID(startupId)) return [];
    const { data, error } = await supabaseAdmin
      .from('startup_mentors')
      .select(`
        *,
        mentor:mentors (
          id,
          user_id,
          expertise_areas,
          industry_experience,
          company_background,
          is_available,
          is_active,
          availability_hours_per_month,
          preferred_meeting_mode,
          timezone,
          calendar_url,
          availability_json,
          user:users (
            id,
            first_name,
            last_name,
            full_name,
            email
          )
        )
      `)
      .eq('startup_id', startupId)
      .neq('status', 'ended')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any) => {
      const m = row.mentor || {};
      const u = Array.isArray(m.user) ? m.user[0] : m.user;
      const fullName =
        u?.full_name ||
        [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim() ||
        u?.email?.split('@')[0] ||
        'Mentor';
      return {
        id: row.id,
        allocation_id: row.id,
        startup_id: row.startup_id,
        mentor_id: row.mentor_id,
        name: fullName,
        email: u?.email || '',
        type: row.mentor_type || 'General',
        domain: row.domain || (Array.isArray(m.expertise_areas) ? m.expertise_areas[0] : '') || 'Advisory',
        status: row.status || 'pending',
        decline_reason: row.decline_reason || null,
        feedback: row.notes || '',
        allocatedDate: (row.created_at || new Date().toISOString()).split('T')[0],
        assigned_at: row.created_at,
        decided_at: row.decided_at || null,
        is_available: Boolean(m.is_available),
        availability_hours_per_month: m.availability_hours_per_month ?? 10,
        preferred_meeting_mode: m.preferred_meeting_mode || 'video',
        timezone: m.timezone || 'Asia/Kolkata',
        calendar_url: m.calendar_url || '',
        availability_json: m.availability_json || {},
      };
    });
  }

  static async allocateMentor(
    startupId: string,
    mentorId: string,
    mentorType: any,
    extraData: any = {}
  ): Promise<any> {
    if (!isValidUUID(startupId) || !isValidUUID(mentorId)) {
      throw new Error('Valid startup_id and mentor_id are required');
    }

    const { data: startup, error: stErr } = await supabaseAdmin
      .from('startups')
      .select('*')
      .eq('id', startupId)
      .maybeSingle();
    if (stErr || !startup) {
      throw new Error('Startup not found');
    }

    const { data: mentor, error: mErr } = await supabaseAdmin
      .from('mentors')
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          full_name,
          email
        )
      `)
      .eq('id', mentorId)
      .maybeSingle();
    if (mErr || !mentor) {
      throw new Error('Mentor not found');
    }

    const mentorStatus = (mentor.status || (mentor.is_active ? 'active' : 'pending')).toLowerCase();
    if (!mentor.is_active || mentorStatus !== 'active' || !mentor.is_available) {
      throw new Error('Only active mentors accepting startups can be allocated');
    }

    const { data: existingOpen } = await supabaseAdmin
      .from('startup_mentors')
      .select('id, status')
      .eq('startup_id', startupId)
      .eq('mentor_id', mentorId)
      .in('status', ['pending', 'active'])
      .maybeSingle();
    if (existingOpen) {
      throw new Error(`Mentor allocation already ${existingOpen.status} for this startup`);
    }

    let validAllocatedBy: string | null = null;
    if (extraData.allocatedBy && isValidUUID(extraData.allocatedBy)) {
      const { data: uCheck } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', extraData.allocatedBy)
        .maybeSingle();
      if (uCheck?.id) validAllocatedBy = uCheck.id;
    }

    const domainVal =
      extraData.domain ||
      (Array.isArray(mentor.expertise_areas) ? mentor.expertise_areas[0] : '') ||
      'Advisory';

    const { data: created, error: insErr } = await supabaseAdmin
      .from('startup_mentors')
      .insert({
        startup_id: startupId,
        mentor_id: mentorId,
        organization_id: startup.organization_id,
        mentor_type: mentorType || 'General',
        domain: domainVal,
        notes: extraData.notes || null,
        status: 'pending',
        allocated_by: validAllocatedBy,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    const u = Array.isArray(mentor.user) ? mentor.user[0] : mentor.user;
    const mentorName =
      u?.full_name ||
      [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim() ||
      extraData.name ||
      'Mentor';
    const startupTitle = startup.startup_name || startup.name || 'Startup';

    if (u?.id && isValidUUID(u.id)) {
      try {
        await NotificationService.createNotification({
          organization_id: startup.organization_id,
          recipient_id: u.id,
          recipient_name: mentorName,
          recipient_email: u.email,
          title: `New Startup Allocation: ${startupTitle}`,
          message: `You have been assigned to mentor ${startupTitle} (${domainVal}). Please review and accept or decline from your Mentor Dashboard.`,
          notification_type: 'mentor_allocation',
          send_email: true,
          send_in_app: true,
          related_entity_type: 'startup',
          related_entity_id: startupId,
        });
      } catch (nErr) {
        console.warn('Mentor allocation notification warning:', nErr);
      }
    }

    return {
      id: created.id,
      allocation_id: created.id,
      startup_id: startupId,
      mentor_id: mentorId,
      name: mentorName,
      type: created.mentor_type,
      domain: created.domain,
      status: created.status,
      decline_reason: null,
      feedback: created.notes || '',
      allocatedDate: (created.created_at || new Date().toISOString()).split('T')[0],
      assigned_at: created.created_at,
    };
  }

  static async updateMentorAllocation(
    startupId: string,
    mentorId: string,
    mentorType: 'Lead' | 'Domain' | 'Peer'
  ): Promise<MentorAllocation | null> {
    if (!isValidUUID(startupId) || !isValidUUID(mentorId)) return null;
    const { data } = await supabaseAdmin
      .from('startup_mentors')
      .update({ mentor_type: mentorType, updated_at: new Date().toISOString() })
      .eq('startup_id', startupId)
      .or(`id.eq.${mentorId},mentor_id.eq.${mentorId}`)
      .select()
      .maybeSingle();
    return data || null;
  }

  static async deallocateMentor(startupId: string, mentorOrAllocId: string): Promise<boolean> {
    if (!isValidUUID(startupId) || !isValidUUID(mentorOrAllocId)) return false;
    const { error } = await supabaseAdmin
      .from('startup_mentors')
      .update({ status: 'ended', updated_at: new Date().toISOString() })
      .eq('startup_id', startupId)
      .or(`id.eq.${mentorOrAllocId},mentor_id.eq.${mentorOrAllocId}`);
    return !error;
  }
  static async getInvestors(startupId: string): Promise<InvestorAllocation[]> { return []; }
  static async allocateInvestor(startupId: string, investorId: string, interestLevel: any): Promise<any> { return {}; }
  static async updateInvestorAllocation(startupId: string, investorId: string, interestLevel: 'High' | 'Medium' | 'Low'): Promise<InvestorAllocation | null> {
    return {
      id: 'inv_alloc_' + Date.now(),
      startup_id: startupId,
      investor_id: investorId,
      interest_level: interestLevel,
      allocated_at: new Date().toISOString(),
    };
  }
  static async deallocateInvestor(startupId: string, investorId: string): Promise<boolean> { return true; }

  // Co-incubations
  static async getCoIncubations(startupId: string): Promise<any[]> {
    if (isValidUUID(startupId)) {
      const { data } = await supabaseAdmin
        .from('co_incubations')
        .select('*')
        .eq('startup_id', startupId);
      if (data && data.length > 0) return data;
    }
    return [];
  }
}
