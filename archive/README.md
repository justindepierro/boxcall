# Archive (Scheduled for Deletion)

This directory holds legacy assets retained for one more week while we validate the
new role/navigation stack. If nothing regresses by **2025-10-05**, delete these
subdirectories.

## Notes
- Move date: 2025-09-28
- Owners: BoxCall team
- Reminder: remove matching imports/tooling when deleting.

## Contents
- `services/` – phase1/phase2 integrations, cross-platform/react-native/mobile stubs, RBAC service.
- `docs/` – static analysis outputs and early architecture notes.
- `database/` – obsolete schema rebuild scripts.
- `navigation/` – deprecated nav schema + tests.
- `stories/` – Storybook stories tied to removed APIs.
- `scripts/` – unused automation snippets.

## Action Items Before Deletion
1. Confirm no build/test/storybook scripts reference these files.
2. Update documentation to point at the new role/navigation approach.
3. Remove the archive directories after the confirmation window.
