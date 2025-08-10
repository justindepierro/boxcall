// Comments infra module (Phase 2)
// Provides list/add stub; future: pagination, edit/delete, rate limiting.
import { parseCalendarComments, parseCalendarCommentCreate } from '../../domain/calendar/schema';
import type { CalendarComment } from '../../domain/calendar/types';

export const CalendarComments = {
  async list(_eventId: string): Promise<CalendarComment[]> {
    return parseCalendarComments([]); // mock empty
  },
  async add(data: { event_id: string; body: string }): Promise<CalendarComment> {
    parseCalendarCommentCreate(data);
    const comment: CalendarComment = {
      id: `c-${Date.now()}`,
      event_id: data.event_id,
      user_id: 'mock-user',
      body: data.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return comment;
  }
};
