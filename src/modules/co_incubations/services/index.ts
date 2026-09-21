import { CoIncubation } from '../models';

export class CoIncubationService {
  static async getCoIncubations(orgId: string): Promise<CoIncubation[]> {
    return [];
  }
  static async createCoIncubation(data: Partial<CoIncubation>): Promise<CoIncubation | null> {
    return null;
  }
  static async signMOU(id: string): Promise<boolean> {
    return true;
  }
}
