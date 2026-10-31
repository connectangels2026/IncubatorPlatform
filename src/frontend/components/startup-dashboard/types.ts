export type DashboardTab = 'overview' | 'pitch' | 'tech' | 'activity';

export interface StartupProfile {
  id: string;
  name: string;
  batch: string;
  tagline: string;
  stage: string;
  stageProgress: number; // e.g. 70
  track: 'hardware' | 'software' | 'both';
  incubatorName: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  assignedMentor: {
    name: string;
    avatar?: string;
  };
}

export interface ScheduleEventItem {
  id: string;
  title: string;
  type: 'Workshop' | '1-on-1 Session' | 'Lab Office Hours';
  speaker: string;
  timing: string;
  link?: string;
}

export interface DeckRevision {
  version: string;
  date: string;
  author: string;
  keyChanges: string;
  status: 'Approved' | 'Archived';
}

export interface ActivityLogItem {
  id: string;
  title: string;
  tag: 'Pitch Approval' | 'Mentor Feedback' | 'Lab Reservation' | 'Milestone';
  author: string;
  timestamp: string;
  quote?: string;
  scores?: {
    team: number;
    traction: number;
    market: number;
    tech: number;
  };
  reply?: {
    author: string;
    role: string;
    timestamp: string;
    message: string;
  };
}


export interface ApplicationSummary {
  id: string;
  incubator_name_text?: string;
  organization?: { id: string; name: string };
  form_data?: any;
  status: string;
  super_admin_status?: string;
  incubator_response_status?: string;
  reviewer_comments?: string;
  created_at?: string;
}
