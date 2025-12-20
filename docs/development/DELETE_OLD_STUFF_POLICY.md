# Delete Old Stuff Policy (Refactors)

BoxCall’s rule: **every cleanup refactor must delete the legacy path**.

If we keep both “old + new” implementations around, we pay twice:

- Confusing behavior (which path is active?)
- Larger bundles / slower cold start
- More bugs during future changes

## Required steps for any cleanup/refactor PR

- Identify the legacy/duplicate code path(s).
- Replace call sites to the new standard.
- Delete the old implementation(s) (files, exports, dead branches).
- Remove commented-out code (git is the archive).
- Run `npm run validate`.

## Common places to sweep

- Alternate components that solve the same UI problem
- Old utility helpers and wrappers
- Dead dev toggles / localStorage flags that no longer do anything
- Duplicate services/hooks for the same Supabase table
- Unused exports/index barrels

## PR description requirement

Include a short “Deleted / merged” section listing the removed files or the collapsed duplicates.
