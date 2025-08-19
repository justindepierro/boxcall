Here is a file-by-file checklist for a clean sweep and ground-up rewrite of your icon system:

1. Deprecate & Remove Legacy Files
   Mark and prepare to remove these files:
   ModularIcon.tsx
   ProfessionalIcon.tsx
   SmartIconSystem.ts
   StreamlinedIcon.tsx
   accessibility.tsx
   categories/ (all category files)
   common.ts
   convenience.tsx
   criticalIcons.json
   iconErrorLogger.ts
   iconSingletons.ts
   icons/ (all files)
   preloadIcons.ts
   preloadShim.d.ts
   preloadShim.ts
   registry.ts
   types.ts
   iconCoverage.test.ts
2. Design & Implement New System
   Create a new, unified Icon.tsx component.
   Build a new registry (type-safe, extensible).
   Add accessibility and fallback logic.
3. Migrate Usage
   Replace all icon usages in your codebase with the new Icon.tsx.
   Update sidebar, buttons, and other UI elements.
4. Delete Artifacts
   Remove all deprecated files listed above after migration.
5. Test & Validate
   Add unit and accessibility tests for the new icon system.
