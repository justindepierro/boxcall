import { describe, it, expect } from 'vitest';
import { parseCalendarEvent, parseCalendarEvents, parseEventRSVPs } from './schema';

describe('calendar schema parsing', () => {
  it('parses a single calendar event', () => {
    const event = parseCalendarEvent({
      id: 'e1',
      title: 'Practice',
      start: new Date().toISOString(),
      type: 'practice'
    });
    expect(event.id).toBe('e1');
  });

  it('parses multiple events', () => {
    const events = parseCalendarEvents([
      { id: 'e1', title: 'Game', start: new Date().toISOString(), type: 'game' },
      { id: 'e2', title: 'Meeting', start: new Date().toISOString(), type: 'meeting' }
    ]);
    expect(events.length).toBe(2);
  });

  it('fails on invalid event', () => {
    expect(() => parseCalendarEvent({})).toThrow();
  });

  it('parses RSVPs', () => {
    const rsvps = parseEventRSVPs([
      { id: 'r1', event_id: 'e1', user_id: 'u1', status: 'attending', created_at: '2025-01-01', updated_at: '2025-01-01' }
    ]);
    expect(rsvps[0].status).toBe('attending');
  });
});
