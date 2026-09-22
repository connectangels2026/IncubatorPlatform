export interface Collaborator {
  id: string;
  name: string;
  type: 'Investor' | 'Partner' | 'Corporate' | 'Academic';
  contact_name: string;
  email: string;
  phone?: string;
  organization_id: string;
  mou_signed: boolean;
  mou_signed_at?: string;
  matched_startups?: string[];
  created_at: string;
  updated_at: string;
}

const collaboratorsStore: Map<string, Collaborator> = new Map([
  [
    'collab_1',
    {
      id: 'collab_1',
      name: 'Sequoia India Partners',
      type: 'Investor',
      contact_name: 'Rajesh Nair',
      email: 'rajesh@sequoia.com',
      organization_id: 'org_test_123',
      mou_signed: true,
      mou_signed_at: new Date().toISOString(),
      matched_startups: ['startup_1'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
]);

export class CollaboratorService {
  static async getAll(orgId: string): Promise<Collaborator[]> {
    return Array.from(collaboratorsStore.values()).filter((c) => c.organization_id === orgId);
  }

  static async getById(id: string, orgId: string): Promise<Collaborator | null> {
    const c = collaboratorsStore.get(id);
    if (!c || c.organization_id !== orgId) return null;
    return c;
  }

  static async create(data: Partial<Collaborator> & { organization_id: string }): Promise<Collaborator> {
    const id = 'collab_' + Date.now();
    const newCollab: Collaborator = {
      id,
      name: data.name || 'Unnamed Collaborator',
      type: data.type || 'Investor',
      contact_name: data.contact_name || '',
      email: data.email || '',
      phone: data.phone,
      organization_id: data.organization_id,
      mou_signed: false,
      matched_startups: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    collaboratorsStore.set(id, newCollab);
    return newCollab;
  }

  static async update(id: string, orgId: string, data: Partial<Collaborator>): Promise<Collaborator | null> {
    const c = await this.getById(id, orgId);
    if (!c) return null;
    const updated = { ...c, ...data, id: c.id, organization_id: c.organization_id, updated_at: new Date().toISOString() };
    collaboratorsStore.set(id, updated);
    return updated;
  }

  static async signMOU(id: string, orgId: string): Promise<Collaborator | null> {
    const c = await this.getById(id, orgId);
    if (!c) return null;
    c.mou_signed = true;
    c.mou_signed_at = new Date().toISOString();
    c.updated_at = new Date().toISOString();
    collaboratorsStore.set(id, c);
    return c;
  }

  static async matchToStartup(id: string, orgId: string, startupId: string): Promise<Collaborator | null> {
    const c = await this.getById(id, orgId);
    if (!c) return null;
    if (!c.matched_startups) c.matched_startups = [];
    if (!c.matched_startups.includes(startupId)) {
      c.matched_startups.push(startupId);
    }
    c.updated_at = new Date().toISOString();
    collaboratorsStore.set(id, c);
    return c;
  }

  static async getMatchedStartups(id: string, orgId: string): Promise<string[]> {
    const c = await this.getById(id, orgId);
    return c?.matched_startups || [];
  }
}
