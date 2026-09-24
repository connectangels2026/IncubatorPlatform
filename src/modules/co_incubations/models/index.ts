export interface CoIncubation {
  id: string;
  partner_organization_name: string;
  lead_contact_name: string;
  lead_contact_email: string;
  organization_id: string;
  status: 'active' | 'pending' | 'completed' | 'terminated';
  mou_signed: boolean;
  mou_signed_at?: string;
  created_at: string;
}
