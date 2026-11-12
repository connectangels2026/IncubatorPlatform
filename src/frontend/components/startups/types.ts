export interface AllocatedMentor {
  id: string;
  mentor_id?: string;
  name: string;
  avatar?: string;
  type: 'General' | 'SME';
  domain: string;
  status?: 'pending' | 'active' | 'declined' | 'ended' | string;
  decline_reason?: string | null;
  allocatedDate?: string;
  feedback?: string;
}

export interface AllocatedInvestor {
  id: string;
  name: string;
  company: string;
  focusAreas: string[];
  interestLevel: 'Warm Lead' | 'Active' | 'Offer' | 'Invested';
  allocationDate?: string;
  ticketSize?: string;
  notes?: string;
}

export interface CoIncubatorItem {
  id: string;
  name: string;
  partner_name?: string;
  mouStatus?: 'Pending' | 'Signed' | string;
  mou_signed?: boolean;
  mou_signed_date?: string;
  type?: 'Full' | 'Partial' | 'Knowledge Sharing' | string;
  durationMonths?: number;
  duration_months?: number;
  duration?: string;
  status:
    | 'Active'
    | 'Completed'
    | 'Terminated'
    | 'Pending'
    | 'Declined'
    | 'Ended'
    | 'pending'
    | 'active'
    | 'rejected'
    | 'ended'
    | string;
  reject_reason?: string | null;
  rejectReason?: string | null;
  shared_scope?: string[] | null;
  sharedScope?: string[] | null;
  message?: string | null;
  co_incubator?: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  primary_incubator?: {
    id: string;
    name: string;
    logo_url?: string | null;
  };
  equitySplit?: string;
  equityShare?: string;
  mouType?: string;
  responsibilities?: string;
  startDate?: string;
  start_date?: string;
  documentUrl?: string;
  documentName?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  initials?: string;
}

export interface StartupFinancials {
  arr?: string;
  mrr?: string;
  runway?: string;
  valuation?: string;
}

export interface StartupItem {
  id: string;
  name: string;
  startup_name?: string;
  monogram?: string;
  monogramBg?: string;
  founder: string;
  founder_name?: string;
  founderAvatar?: string;
  founderEmail?: string;
  founder_email?: string;
  founderPhone?: string;
  founder_phone?: string;
  founder_id?: string;
  website?: string;
  logo_url?: string;
  logo_color?: string;
  initials?: string;
  sector: string;
  industry?: string;
  stage: 'Idea' | 'MVP' | 'Revenue' | 'Growth' | 'Pre-revenue' | 'Scale' | string;
  status: 'Active' | 'Graduated' | 'Under Review' | 'Queue' | 'Inactive' | 'Exited' | string;
  mrr: number;
  arr: number;
  revenue?: number;
  monthly_revenue?: number;
  annual_revenue?: number;
  funding: string;
  fundingRaised?: string;
  funding_raised?: number;
  monthlyBurn?: string;
  healthScore?: string;
  cohort?: string;
  batch?: string;
  track?: string;
  lifecycle_stage?: string;
  is_active?: boolean;
  milestones?: any[];
  location?: string;
  customers: number;
  customer_count?: number;
  tagline: string;
  description?: string;
  pitch?: string;
  problem?: string;
  problem_statement?: string;
  solution?: string;
  solution_description?: string;
  market?: string;
  target_market?: string;
  business_model?: string;
  revenue_model?: string;
  registration_type?: string;
  registration_number?: string;
  pan_number?: string;
  gst_number?: string;
  cin_number?: string;
  pitch_deck_url?: string;
  business_plan_url?: string;
  incubation_start_date?: string;
  incubation_end_date?: string;
  founded_date?: string;
  team_size?: number;
  burn?: string;
  runway?: string;
  admitted?: string;
  team?: TeamMember[];
  teamMembers?: TeamMember[];
  team_members?: any[];
  cofounders?: any[];
  financials?: StartupFinancials;
  reviews?: Array<{ mentor: string; role: string; rating: number; comment: string }>;
  allocatedMentors?: AllocatedMentor[];
  allocatedInvestors?: AllocatedInvestor[];
  coIncubators?: CoIncubatorItem[];
  organization_id?: string;
  activity_logs?: Array<{
    id?: string;
    action?: string;
    description?: string;
    triggered_by?: string;
    created_at?: string;
    metadata?: any;
  }>;
}
