import { describe, it, expect } from 'vitest';
import { CalendarService } from '../../services/calendarService';

const iso = () => new Date().toISOString();

describe('CalendarService createEvent positive path', () => {
  it('creates and returns parsed event', async () => {
    const created = await CalendarService.createEvent({
      title: 'Practice',
      start: iso(),
      type: 'practice',
      tags: ['conditioning']
    });
    expect(created).not.toBeNull();
    expect(created?.id).toMatch(/mock-/);
    expect(created?.title).toBe('Practice');
  });
});
