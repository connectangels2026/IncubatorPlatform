import { Startup, TeamMember, MentorAllocation, InvestorAllocation } from '../models/startup';

// In-memory data store with default seed data for development & testing
const startupsStore: Map<string, Startup> = new Map([
  [
    'startup_1',
    {
      id: 'startup_1',
      name: 'NexHealth AI',
      founder_name: 'Dr. Sarah Connor',
      email: 'sarah@nexhealth.ai',
      sector: 'Health & Biotech',
      stage: 'MVP',
      status: 'active',
      revenue: 50000,
      organization_id: 'org_test_123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      mentors: ['mentor_1'],
      investors: ['investor_1'],
      co_incubations: ['coinc_1'],
    },
  ],
  [
    'startup_2',
    {
      id: 'startup_2',
      name: 'PayFlow Finance',
      founder_name: 'John Miller',
      email: 'john@payflow.com',
      sector: 'FinTech',
      stage: 'Growth',
      status: 'incubating',
      revenue: 250000,
      organization_id: 'org_test_123',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      mentors: [],
      investors: [],
      co_incubations: [],
    },
  ],
]);

const teamStore: Map<string, TeamMember[]> = new Map([
  [
    'startup_1',
    [
      {
        id: 'member_1',
        startup_id: 'startup_1',
        name: 'Alex Vance',
        role: 'CTO',
        email: 'alex@nexhealth.ai',
        phone: '+1-555-0199',
        created_at: new Date().toISOString(),
      },
    ],
  ],
]);

const mentorsStore: Map<string, MentorAllocation[]> = new Map([
  [
    'startup_1',
    [
      {
        id: 'alloc_m_1',
        startup_id: 'startup_1',
        mentor_id: 'mentor_1',
        mentor_type: 'Lead',
        assigned_at: new Date().toISOString(),
      },
    ],
  ],
]);

const investorsStore: Map<string, InvestorAllocation[]> = new Map([
  [
    'startup_1',
    [
      {
        id: 'alloc_i_1',
        startup_id: 'startup_1',
        investor_id: 'investor_1',
        interest_level: 'High',
        allocated_at: new Date().toISOString(),
      },
    ],
  ],
]);

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

export class StartupService {
  // 1. Startup CRUD & Querying
  static async getStartups(orgId: string, filter: GetStartupsFilter = {}): Promise<{ startups: Startup[]; total: number }> {
    let list = Array.from(startupsStore.values()).filter(
      (s) => s.organization_id === orgId && !s.is_deleted
    );

    // Filtering
    if (filter.sector) list = list.filter((s) => s.sector.toLowerCase() === filter.sector!.toLowerCase());
    if (filter.stage) list = list.filter((s) => s.stage.toLowerCase() === filter.stage!.toLowerCase());
    if (filter.status) list = list.filter((s) => s.status.toLowerCase() === filter.status!.toLowerCase());

    // Search
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.founder_name.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sortField = filter.sort || 'created_at';
    const isDesc = (filter.order || 'desc') === 'desc';
    list.sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return isDesc ? 1 : -1;
      if (aVal > bVal) return isDesc ? -1 : 1;
      return 0;
    });

    const total = list.length;
    const offset = filter.offset ? Number(filter.offset) : 0;
    const limit = filter.limit ? Number(filter.limit) : 10;
    const paginated = list.slice(offset, offset + limit);

    return { startups: paginated, total };
  }

  static async getStartupById(id: string, orgId: string): Promise<Startup | null> {
    const s = startupsStore.get(id);
    if (!s || s.organization_id !== orgId || s.is_deleted) return null;
    return s;
  }

  static async createStartup(data: Partial<Startup> & { organization_id: string }): Promise<Startup> {
    const id = 'startup_' + Date.now();
    const newStartup: Startup = {
      id,
      name: data.name || 'Untitled Startup',
      founder_name: data.founder_name || 'Anonymous',
      email: data.email || '',
      sector: data.sector || 'General',
      stage: data.stage || 'Idea',
      status: data.status || 'active',
      revenue: Number(data.revenue) || 0,
      organization_id: data.organization_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      mentors: [],
      investors: [],
      co_incubations: [],
    };
    startupsStore.set(id, newStartup);
    return newStartup;
  }

  static async updateStartup(id: string, orgId: string, data: Partial<Startup>): Promise<Startup | null> {
    const s = await this.getStartupById(id, orgId);
    if (!s) return null;

    const updated: Startup = {
      ...s,
      ...data,
      id: s.id,
      organization_id: s.organization_id,
      updated_at: new Date().toISOString(),
    };
    startupsStore.set(id, updated);
    return updated;
  }

  static async softDeleteStartup(id: string, orgId: string): Promise<boolean> {
    const s = await this.getStartupById(id, orgId);
    if (!s) return false;
    s.is_deleted = true;
    s.updated_at = new Date().toISOString();
    startupsStore.set(id, s);
    return true;
  }

  // 2. Team Members
  static async getTeamMembers(startupId: string): Promise<TeamMember[]> {
    return teamStore.get(startupId) || [];
  }

  static async addTeamMember(startupId: string, member: Partial<TeamMember>): Promise<TeamMember> {
    const members = teamStore.get(startupId) || [];
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
    teamStore.set(startupId, members);
    return newMember;
  }

  static async updateTeamMember(startupId: string, memberId: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
    const members = teamStore.get(startupId) || [];
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx === -1) return null;
    members[idx] = { ...members[idx], ...data, id: memberId, startup_id: startupId };
    teamStore.set(startupId, members);
    return members[idx];
  }

  static async removeTeamMember(startupId: string, memberId: string): Promise<boolean> {
    const members = teamStore.get(startupId) || [];
    const initialLen = members.length;
    const filtered = members.filter((m) => m.id !== memberId);
    teamStore.set(startupId, filtered);
    return filtered.length < initialLen;
  }

  // 3. Mentors Allocation
  static async getMentors(startupId: string): Promise<MentorAllocation[]> {
    return mentorsStore.get(startupId) || [];
  }

  static async allocateMentor(startupId: string, mentorId: string, mentorType: 'Lead' | 'Domain' | 'Peer'): Promise<MentorAllocation> {
    const list = mentorsStore.get(startupId) || [];
    const existing = list.find((m) => m.mentor_id === mentorId);
    if (existing) {
      existing.mentor_type = mentorType;
      return existing;
    }
    const newAlloc: MentorAllocation = {
      id: 'alloc_m_' + Date.now(),
      startup_id: startupId,
      mentor_id: mentorId,
      mentor_type: mentorType,
      assigned_at: new Date().toISOString(),
    };
    list.push(newAlloc);
    mentorsStore.set(startupId, list);
    return newAlloc;
  }

  static async updateMentorAllocation(startupId: string, mentorId: string, mentorType: 'Lead' | 'Domain' | 'Peer'): Promise<MentorAllocation | null> {
    const list = mentorsStore.get(startupId) || [];
    const alloc = list.find((m) => m.mentor_id === mentorId);
    if (!alloc) return null;
    alloc.mentor_type = mentorType;
    return alloc;
  }

  static async deallocateMentor(startupId: string, mentorId: string): Promise<boolean> {
    const list = mentorsStore.get(startupId) || [];
    const filtered = list.filter((m) => m.mentor_id !== mentorId);
    mentorsStore.set(startupId, filtered);
    return filtered.length < list.length;
  }

  // 4. Investors Allocation
  static async getInvestors(startupId: string): Promise<InvestorAllocation[]> {
    return investorsStore.get(startupId) || [];
  }

  static async allocateInvestor(startupId: string, investorId: string, interestLevel: 'High' | 'Medium' | 'Low'): Promise<InvestorAllocation> {
    const list = investorsStore.get(startupId) || [];
    const existing = list.find((i) => i.investor_id === investorId);
    if (existing) {
      existing.interest_level = interestLevel;
      return existing;
    }
    const newAlloc: InvestorAllocation = {
      id: 'alloc_i_' + Date.now(),
      startup_id: startupId,
      investor_id: investorId,
      interest_level: interestLevel,
      allocated_at: new Date().toISOString(),
    };
    list.push(newAlloc);
    investorsStore.set(startupId, list);
    return newAlloc;
  }

  static async updateInvestorAllocation(startupId: string, investorId: string, interestLevel: 'High' | 'Medium' | 'Low'): Promise<InvestorAllocation | null> {
    const list = investorsStore.get(startupId) || [];
    const alloc = list.find((i) => i.investor_id === investorId);
    if (!alloc) return null;
    alloc.interest_level = interestLevel;
    return alloc;
  }

  static async deallocateInvestor(startupId: string, investorId: string): Promise<boolean> {
    const list = investorsStore.get(startupId) || [];
    const filtered = list.filter((i) => i.investor_id !== investorId);
    investorsStore.set(startupId, filtered);
    return filtered.length < list.length;
  }

  // 5. Co-incubations
  static async getCoIncubations(startupId: string): Promise<string[]> {
    const s = Array.from(startupsStore.values()).find((x) => x.id === startupId);
    return s?.co_incubations || [];
  }
}
