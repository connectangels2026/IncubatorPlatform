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
  updated_at: string;
}

const coincubationsStore: Map<string, CoIncubation> = new Map([
  [
    'coinc_1',
    {
      id: 'coinc_1',
      partner_organization_name: 'IIT Bombay SINE Incubator',
      lead_contact_name: 'Dr. Anand Rao',
      lead_contact_email: 'anand.rao@sineiitb.org',
      organization_id: 'org_test_123',
      status: 'active',
      mou_signed: true,
      mou_signed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
]);

export class CoIncubationService {
  static async getAll(orgId: string): Promise<CoIncubation[]> {
    return Array.from(coincubationsStore.values()).filter((c) => c.organization_id === orgId);
  }

  static async getById(id: string, orgId: string): Promise<CoIncubation | null> {
    const c = coincubationsStore.get(id);
    if (!c || c.organization_id !== orgId) return null;
    return c;
  }

  static async create(data: Partial<CoIncubation> & { organization_id: string }): Promise<CoIncubation> {
    const id = 'coinc_' + Date.now();
    const newCoinc: CoIncubation = {
      id,
      partner_organization_name: data.partner_organization_name || 'Partner Incubator',
      lead_contact_name: data.lead_contact_name || '',
      lead_contact_email: data.lead_contact_email || '',
      organization_id: data.organization_id,
      status: data.status || 'pending',
      mou_signed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    coincubationsStore.set(id, newCoinc);
    return newCoinc;
  }

  static async update(id: string, orgId: string, data: Partial<CoIncubation>): Promise<CoIncubation | null> {
    const c = await this.getById(id, orgId);
    if (!c) return null;
    const updated = { ...c, ...data, id: c.id, organization_id: c.organization_id, updated_at: new Date().toISOString() };
    coincubationsStore.set(id, updated);
    return updated;
  }

  static async signMOU(id: string, orgId: string): Promise<CoIncubation | null> {
    const c = await this.getById(id, orgId);
    if (!c) return null;
    c.mou_signed = true;
    c.mou_signed_at = new Date().toISOString();
    c.updated_at = new Date().toISOString();
    coincubationsStore.set(id, c);
    return c;
  }

  static async updateStatus(id: string, orgId: string, status: CoIncubation['status']): Promise<CoIncubation | null> {
    const c = await this.getById(id, orgId);
    if (!c) return null;
    c.status = status;
    c.updated_at = new Date().toISOString();
    coincubationsStore.set(id, c);
    return c;
  }
}
