import { Event, EventRegistration } from '../models';

export class EventService {
  static async getEvents(orgId: string): Promise<Event[]> {
    return [];
  }
  static async createEvent(data: Partial<Event>): Promise<Event | null> {
    return null;
  }
  static async registerForEvent(data: Partial<EventRegistration>): Promise<EventRegistration | null> {
    return null;
  }
}
