export interface AllocatedMentor {
  id: string;
  name: string;
  avatar?: string;
  type: 'General' | 'SME';
  domain: string;
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
  mouStatus: 'Pending' | 'Signed';
  type: 'Full' | 'Partial' | 'Knowledge Sharing';
  durationMonths?: number;
  duration?: string;
  status: 'Active' | 'Completed' | 'Terminated';
  equitySplit?: string;
  equityShare?: string;
  mouType?: string;
  responsibilities?: string;
  startDate?: string;
  documentUrl?: string;
  documentName?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  initials: string;
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
  monogram: string;
  monogramBg: string;
  founder: string;
  founderAvatar?: string;
  founderEmail?: string;
  website: string;
  sector: string;
  industry?: string;
  stage: 'Idea' | 'MVP' | 'Revenue' | 'Growth' | string;
  status: 'Active' | 'Graduated' | 'Under Review' | string;
  mrr: number;
  arr: number;
  funding: string;
  fundingRaised?: string;
  monthlyBurn?: string;
  healthScore?: string;
  cohort?: string;
  location?: string;
  customers: number;
  tagline: string;
  pitch?: string;
  problem?: string;
  solution?: string;
  market?: string;
  burn?: string;
  runway?: string;
  admitted?: string;
  team?: TeamMember[];
  teamMembers?: TeamMember[];
  financials?: StartupFinancials;
  reviews?: Array<{ mentor: string; role: string; rating: number; comment: string }>;
  allocatedMentors?: AllocatedMentor[];
  allocatedInvestors?: AllocatedInvestor[];
  coIncubators?: CoIncubatorItem[];
}
