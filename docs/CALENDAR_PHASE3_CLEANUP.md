# Calendar Phase 3 Cleanup

Legacy artifacts archived under `src/legacy/calendar`.

Open Tasks:

1. Wire mutations to React Query hooks
2. Migrate RSVP flows
3. Migrate comments flows
4. Introduce search hook & remove CalendarService.searchEvents
5. Update dashboard upcoming events widget
6. Delete stubs (services + hooks)
7. Remove legacy folder

Validation Checklist:

- [ ] All mutation paths migrated
- [ ] RSVP UI migrated
- [ ] Comments UI migrated
- [ ] Search hook implemented
- [ ] Grep shows no new imports of legacy service/hooks
