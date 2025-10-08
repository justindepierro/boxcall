# Archived Files - October 2025 Cleanup

This directory contains deprecated and legacy files that have been archived during the codebase cleanup process.

## Archived Files

### Deprecated Source Files

- `useProviderCompat.ts` - Deprecated compatibility hooks for legacy provider access (marked with @deprecated tags)
- `validate-theme-contrast.ts` - Deprecated theme contrast validation script that needs updating for new theme system

### Backup Files

- `mobile.css.backup` - Backup of mobile CSS styles
- `responsive-dashboard.css.backup` - Backup of responsive dashboard styles
- `PlayCardListHeader.tsx.backup` - Backup of PlayCardListHeader component
- `PlaybookPage.tsx.backup` - Backup of PlaybookPage component

### Legacy Directories

- `legacy/` - Contains old versions of refactored files:
  - `CreateTeam_BACKUP_2725_lines.tsx` - Monolithic CreateTeam component (2,725 lines) replaced with service-based architecture

## Archival Criteria

Files were archived if they met one or more of these criteria:

- Marked with `@deprecated` tags
- Explicitly marked as "DEPRECATED" in comments
- Backup files from completed refactoring work
- Legacy code that has been properly replaced with better implementations
- Files that are no longer imported or used anywhere in the codebase

## Restoration

If any archived file needs to be restored for reference or rollback purposes, it can be found in this directory. However, these files should not be reintroduced into the active codebase without careful review.

## Contact

If you need access to any archived file, please check this directory first or contact the development team.
