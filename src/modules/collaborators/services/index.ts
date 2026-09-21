import { Collaborator } from '../models';

export class CollaboratorService {
  static async getCollaborators(orgId: string): Promise<Collaborator[]> {
    return [];
  }
  static async createCollaborator(data: Partial<Collaborator>): Promise<Collaborator | null> {
    return null;
  }
  static async signMOU(collaboratorId: string): Promise<boolean> {
    return true;
  }
}
