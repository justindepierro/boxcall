# Delete Week (Cleanup Cadence)

Delete Week is a recurring cleanup practice: every sprint we remove or merge at least 5 files/components and track net deletion as a KPI.

## Goals

- Keep the codebase small, fast, and discoverable
- Remove redundant/legacy/contradicting paths before they rot
- Reduce cognitive load for new contributors

## KPI

Track these in PR descriptions (and optionally in sprint notes):

- Files removed: N
- Files merged: N
- Net LOC removed: approx N

## What qualifies for deletion

- Unused shims (compat layers no longer referenced)
- Deprecated pages/components that are no longer routed or linked
- Duplicate utilities and “parallel” implementations
- Dead feature flags, commented-out blocks, or placeholder modules
- Legacy exports kept “just in case” with zero call sites

## Safety rules

- No UX changes: deletions should not change user-facing behavior
- Verify no imports/usages before deleting
- Remove/adjust barrel exports and references
- Run at least:
  - `npm run type-check`
  - `npm run lint`
  - `npm run test`

## How to find candidates

- Search for:
  - `DEPRECATED`, `legacy`, `backward compatibility`, `shim`
  - unused pages in routes
  - old single-file shims where a folder `index.ts` already exists
- Confirm with repo search that the symbol/path is unused.

## PR checklist (Delete Week)

- List the 5+ deletions/merges (file paths)
- Mention any alias/export rewires
- Confirm validation commands passed
