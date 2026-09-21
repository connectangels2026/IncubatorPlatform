export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  organization_id: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  startup_id?: string;
  registered_at: string;
}
