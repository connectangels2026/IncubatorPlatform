export interface Startup {
  id: string;
  name: string;
  founder_name: string;
  email: string;
  sector: string;
  stage: string;
  status: string;
  revenue: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  mentors: string[];
  investors: string[];
  co_incubations: string[];
}

export interface TeamMember {
  id: string;
  startup_id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface MentorAllocation {
  id: string;
  startup_id: string;
  mentor_id: string;
  mentor_type: 'Lead' | 'Domain' | 'Peer';
  assigned_at: string;
}

export interface InvestorAllocation {
  id: string;
  startup_id: string;
  investor_id: string;
  interest_level: 'High' | 'Medium' | 'Low';
  allocated_at: string;
}
