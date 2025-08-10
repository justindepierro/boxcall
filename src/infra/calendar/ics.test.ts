import { describe, it, expect } from 'vitest';
import { eventToICS } from './ics';

describe('ICS generator', () => {
  it('produces minimal valid VCALENDAR content', () => {
    const ics = eventToICS({
      id: 'evt-ics',
      title: 'ICS Event',
      start: new Date().toISOString(),
      type: 'practice'
    });
    expect(ics).toMatch(/BEGIN:VCALENDAR/);
    expect(ics).toMatch(/UID:evt-ics@boxcall/);
    expect(ics).toMatch(/DTSTART:/);
    expect(ics).toMatch(/SUMMARY:ICS Event/);
  });
});
