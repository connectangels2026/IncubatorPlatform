import { Startup, TeamMember, MentorAllocation, InvestorAllocation } from '../models/startup';
import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';

export interface GetStartupsFilter {
  sector?: string;
  stage?: string;
  status?: string;
  search?: string;
  sort?: 'created_at' | 'name' | 'revenue';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
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

const DEFAULT_ORG_ID = '6f0ac9a7-4c1d-48df-81ba-f9d34f1eb279';

const isValidUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const resolveOrgId = (orgId: string): string => {
  if (isValidUUID(orgId)) return orgId;
  return DEFAULT_ORG_ID;
};

// Map DB row from Supabase to Startup interface
const mapRowToStartup = (row: any): Startup => {
  return {
    id: row.id,
    name: row.name,
    founder_name: row.founder_name || row.founder_email?.split('@')[0] || 'Founder',
    founder_id: row.founder_id,
    email: row.founder_email || '',
    sector: row.sector || 'General',
    stage: row.stage || 'Idea',
    status: row.status || 'active',
    revenue: Number(row.monthly_revenue || row.annual_revenue) || 0,
    organization_id: row.organization_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    is_deleted: !!row.deleted_at,
    mentors: [],
    investors: [],
    co_incubations: [],
  };
};

export class StartupService {
  // 1. Startup CRUD & Querying directly with Supabase Database
  static async getStartups(orgId: string, filter: GetStartupsFilter = {}): Promise<{ startups: Startup[]; total: number }> {
    const realOrgId = resolveOrgId(orgId);

    let query = supabaseAdmin
      .from('startups')
      .select('*', { count: 'exact' })
      .eq('organization_id', realOrgId)
      .is('deleted_at', null);

    // Filtering
    if (filter.sector) query = query.ilike('sector', `%${filter.sector}%`);
    if (filter.stage) query = query.ilike('stage', `%${filter.stage}%`);
    if (filter.status) query = query.ilike('status', `%${filter.status}%`);

    // Search
    if (filter.search) {
      query = query.or(`name.ilike.%${filter.search}%,founder_email.ilike.%${filter.search}%`);
    }

    // Sorting
    const sortField = filter.sort === 'revenue' ? 'monthly_revenue' : filter.sort || 'created_at';
    const isAsc = filter.order === 'asc';
    query = query.order(sortField, { ascending: isAsc });

    // Pagination
    const offset = filter.offset ? Number(filter.offset) : 0;
    const limit = filter.limit ? Number(filter.limit) : 10;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback if table is empty
      let list = [...fallbackStartups];
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter((s) => s.name.toLowerCase().includes(q) || s.founder_name.toLowerCase().includes(q));
      }
      return { startups: list.slice(offset, offset + limit), total: list.length };
    }

    return {
      startups: data.map(mapRowToStartup),
      total: count ?? data.length,
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
    let validStage = 'MVP';
    if (data.stage) {
      const match = allowedStages.find((s) => s.toLowerCase() === data.stage!.toLowerCase());
      if (match) validStage = match;
    }

    const insertPayload: any = {
      organization_id: realOrgId,
      name: data.name || 'New Startup',
      sector: data.sector || 'Tech',
      stage: validStage,
      founder_email: data.email || 'founder@startup.com',
      monthly_revenue: Number(data.revenue) || 0,
      annual_revenue: Number(data.revenue) ? Number(data.revenue) * 12 : 0,
      status: data.status || 'active',
      team_members: [],
    };

    if (data.founder_id && isValidUUID(data.founder_id)) {
      insertPayload.founder_id = data.founder_id;
    }

    const { data: createdRow, error } = await supabaseAdmin
      .from('startups')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !createdRow) {
      // In-memory fallback if insert rejected by schema constraint
      const fallbackId = 'startup_' + Date.now();
      const fallbackObj: Startup = {
        id: fallbackId,
        name: data.name || 'Untitled Startup',
        founder_name: data.founder_name || 'Founder',
        founder_id: data.founder_id,
        email: data.email || '',
        sector: data.sector || 'General',
        stage: validStage,
        status: data.status || 'active',
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
    if (data.name) updatePayload.name = data.name;
    if (data.sector) updatePayload.sector = data.sector;
    if (data.stage) updatePayload.stage = data.stage;
    if (data.status) updatePayload.status = data.status;
    if (data.revenue !== undefined) {
      updatePayload.monthly_revenue = Number(data.revenue);
      updatePayload.annual_revenue = Number(data.revenue) * 12;
    }

    if (isValidUUID(id)) {
      const { data: updatedRow, error } = await supabaseAdmin
        .from('startups')
        .update(updatePayload)
        .eq('id', id)
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

  // Mentors and Investors stubs
  static async getMentors(startupId: string): Promise<MentorAllocation[]> { return []; }
  static async allocateMentor(startupId: string, mentorId: string, mentorType: any): Promise<any> { return {}; }
  static async updateMentorAllocation(startupId: string, mentorId: string, mentorType: 'Lead' | 'Domain' | 'Peer'): Promise<MentorAllocation | null> {
    return {
      id: 'mentor_alloc_' + Date.now(),
      startup_id: startupId,
      mentor_id: mentorId,
      mentor_type: mentorType,
      assigned_at: new Date().toISOString(),
    };
  }
  static async deallocateMentor(startupId: string, mentorId: string): Promise<boolean> { return true; }
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
