Legacy Calendar Layer (Archived)
================================

Scope:
 - calendarService.ts (facade) – kept only for unmigrated mutation + search flows
 - useCalendar.ts legacy hooks – superseded by React Query hooks in state/calendar/hooks

Removal Plan:
 1. Migrate UI mutations to new hooks
 2. Replace RSVP + comment usage
 3. Implement search hook; drop searchEvents
 4. Remove stubs in src/services & src/hooks
 5. Delete this folder

Tracking: docs/CALENDAR_PHASE3_CLEANUP.md
