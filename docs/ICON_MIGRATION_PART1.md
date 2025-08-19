# ICON SYSTEM MIGRATION: PART 1

## Objective

Completely remove legacy icon system artifacts and prepare for a ground-up rewrite.

## Steps

### 1. Deprecate Legacy Files

- Mark all legacy icon files for removal (see checklist below).

### 2. Remove Legacy Files

- Delete all files listed in the checklist.

### 3. Prepare for New System

- Create a new, unified `Icon.tsx` component and registry.
- Add accessibility and fallback logic.

### 4. Migrate Usage

- Replace all icon usages in the codebase with the new system.

### 5. Validate

- Add unit and accessibility tests for the new icon system.

---

## Legacy Files to Remove

- ModularIcon.tsx
- ProfessionalIcon.tsx
- SmartIconSystem.ts
- StreamlinedIcon.tsx
- accessibility.tsx
- categories/ (all files)
- common.ts
- convenience.tsx
- criticalIcons.json
- iconErrorLogger.ts
- iconSingletons.ts
- icons/ (all files)
- preloadIcons.ts
- preloadShim.d.ts
- preloadShim.ts
- registry.ts
- types.ts
- **tests**/iconCoverage.test.ts

---

## Next Steps

- Implement new `Icon.tsx` and registry.
- Migrate all icon usages.
- Validate with tests.

---

_This document tracks the migration process for the icon system rewrite._
