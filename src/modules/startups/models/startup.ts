export interface Startup {
  id: string;
  startup_name?: string;
  name: string;
  founder_name: string;
  founder_id?: string;
  founder_phone?: string;
  email: string;
  founder_email?: string;
  sector: string;
  stage: string;
  status: string;
  lifecycle_stage?: string;
  revenue: number;
  monthly_revenue?: number;
  annual_revenue?: number;
  funding_raised?: number;
  mrr?: number;
  customer_count?: number;
  logo_url?: string;
  logo_color?: string;
  initials?: string;
  website?: string;
  description?: string;
  problem_statement?: string;
  solution_description?: string;
  target_market?: string;
  business_model?: string;
  revenue_model?: string;
  registration_type?: string;
  registration_number?: string;
  pan_number?: string;
  gst_number?: string;
  cin_number?: string;
  founded_date?: string;
  incubation_start_date?: string;
  incubation_end_date?: string;
  pitch_deck_url?: string;
  business_plan_url?: string;
  cohort?: string;
  team_size?: number;
  team_members?: any[];
  cofounders?: any[];
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
