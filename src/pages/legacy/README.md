# Legacy Files

This directory contains old versions of files that have been refactored or replaced.

## Files:

### `CreateTeam_BACKUP_2725_lines.tsx`

- **Original:** Monolithic 2,725-line CreateTeam component
- **Date:** September 29, 2025
- **Status:** Replaced with 245-line service-based architecture
- **Reason for replacement:**
  - Massive file was hard to maintain
  - Mixed UI and business logic
  - Direct HTTP API integration needed
  - Extracted services for better modularity

### Services Extracted:

- `TeamCreationService` - Database operations
- `TeamValidationService` - Form validation
- `ProgressTrackingService` - Progress persistence
- `useWizardState` - Step navigation

### Key Features Preserved:

- ✅ Multi-step wizard
- ✅ Direct HTTP API (bypasses Supabase client hanging)
- ✅ Welcome modal after creation
- ✅ Role context refresh
- ✅ All form validation
- ✅ Progress saving/loading

The new implementation is much cleaner, more maintainable, and uses proper separation of concerns.
