import { describe, it, expect } from 'vitest';
import { canEditEvent, canCreateEvent, canDeleteEvent, requiresRSVP, canEditRecurringInstance } from './rules';
import type { CalendarEvent } from './types';

const baseEvent: CalendarEvent = {
  id: 'evt-1',
  title: 'Practice',
  start: new Date().toISOString(),
  type: 'practice',
  rsvp_required: true,
};

describe('calendar rules', () => {
  it('admin can edit/create/delete', () => {
    const admin = { id: 'u1', role: 'admin' } as const;
    expect(canEditEvent(admin, baseEvent)).toBe(true);
    expect(canCreateEvent(admin)).toBe(true);
    expect(canDeleteEvent(admin, baseEvent)).toBe(true);
  });

  it('coach can edit/create/delete', () => {
    const coach = { id: 'u2', role: 'coach' } as const;
    expect(canEditEvent(coach, baseEvent)).toBe(true);
    expect(canCreateEvent(coach)).toBe(true);
    expect(canDeleteEvent(coach, baseEvent)).toBe(true);
  });

  it('null user cannot edit/create/delete', () => {
    expect(canEditEvent(null, baseEvent)).toBe(false);
    expect(canCreateEvent(null)).toBe(false);
    expect(canDeleteEvent(null, baseEvent)).toBe(false);
  });

  it('cannot edit/delete with valid user but null event', () => {
    const coach = { id: 'u2', role: 'coach' } as const;
    expect(canEditEvent(coach, null)).toBe(false); // event null branch
    expect(canDeleteEvent(coach, null)).toBe(false); // event null branch
  });

  it('player role cannot edit/create/delete even with event', () => {
    const player = { id: 'u3', role: 'player' } as const;
    expect(canEditEvent(player, baseEvent)).toBe(false);
    expect(canCreateEvent(player)).toBe(false);
    expect(canDeleteEvent(player, baseEvent)).toBe(false);
  });

  it('requiresRSVP reflects event flag', () => {
    expect(requiresRSVP(baseEvent)).toBe(true);
    expect(requiresRSVP({ ...baseEvent, rsvp_required: false })).toBe(false);
  });

  it('canEditRecurringInstance defers to canEditEvent', () => {
    const admin = { id: 'u1', role: 'admin' } as const;
    expect(canEditRecurringInstance(admin, baseEvent)).toBe(true);
    expect(canEditRecurringInstance(null, baseEvent)).toBe(false);
  });
});
