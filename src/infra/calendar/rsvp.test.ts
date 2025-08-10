import { describe, it, expect } from 'vitest';
import { CalendarRSVP } from './rsvp';

describe('CalendarRSVP infra', () => {
  it('lists mock RSVPs parsed', async () => {
    const list = await CalendarRSVP.list('evt-1');
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].event_id).toBe('evt-1');
  });
  it('upserts RSVP', async () => {
    const r = await CalendarRSVP.upsert('evt-2', 'user-9', 'maybe');
    expect(r.event_id).toBe('evt-2');
    expect(r.status).toBe('maybe');
  });
});
