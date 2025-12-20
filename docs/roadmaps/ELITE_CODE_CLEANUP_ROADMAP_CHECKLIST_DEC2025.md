# Elite Code Cleanup Roadmap (Checklist) — Dec 2025

Use this as the single source of truth for “make the code elite.” Check items off as they ship.

Policy: when we implement any item below, we also delete the legacy/duplicate path — see [docs/development/DELETE_OLD_STUFF_POLICY.md](docs/development/DELETE_OLD_STUFF_POLICY.md).

## Recommended Execution Order (do this first)

This checklist is grouped by area below for readability, but the fastest/lowest-risk execution order is:

1) **Safety/Security first**: (23) → (24) → (25)
2) **Dev/prod discipline guards**: (16) → (17) → (18)
3) **Data layer foundations**: (14) → (13) → (12) → (11)
4) **App correctness + consistency**: (9) → (10) → (8) → (7)
5) **Performance gates + hygiene**: (20) → (19) → (21) → (22)
6) **Tests + quality gates**: (26) → (27) → (28)
7) **Docs + cleanup cadence**: (29) → (30)

If a step is already checked off, skip it and continue to the next.

## Safety Rails (so we don’t lose work)

- Treat each checklist item as its own commit (or small stack of commits).
- Prefer `git commit` early/often; if unsure, do a WIP commit.
- Avoid destructive commands during active work: `git reset --hard`, `git clean -fd`.
	- If you need to “park” work, use `git stash -u`.
- Before any risky git operation, run `git status` and confirm what’s staged vs untracked.
- After each step: run `npm run validate` (or at least `npm run type-check` + `npm run lint`).
- When deleting old systems, do it in the same PR as the replacement (prevents drift).

## Verification Audit (Dec 20, 2025)

Goal: keep this checklist honest — only check items that have durable code-level enforcement or a clearly completed replacement.

Verified complete:
- (16) Console guard exists and is enforced via `boxcall-design/no-console-outside-logger` (console allowed only in `src/utils/logger.ts`).
- (17) Design-token linting is expanded and enforced: raw colors + arbitrary spacing/typography are errors, with warn-only coverage for dynamic raw-color expressions.
- (20) Route-level lazy loading is in place via `src/components/lazy/LazyRoutes.tsx` (pages and heavy modals are code-split).
- (19) Perf budgets gate is enforced via `npm run validate` and GitHub Actions (production build + Vite manifest-based per-route gzip JS budgets).
- (28) Playwright smoke suite is present in `tests/e2e/` and enforced via GitHub Actions (`CI` workflow `e2e-smoke` job).

Verified partial (keep unchecked for now):
- (11) Zustand store surface area is not yet reduced: `src/app/store.ts` remains a broad “god store” (even though some domain stores exist elsewhere).
- (12) Optimistic patterns exist (e.g., temp IDs + rollback utilities in data sync services), but they are not yet unified across major features into one shared approach.
- (13) React Query defaults are standardized in `src/app/queryClient.ts` and some query-key factories exist (e.g., `src/lib/queryClient.ts`), but there’s still bespoke caching in the codebase and no single shared query-key scheme across features.
- (14) A typed Supabase DAL exists under `src/data/supabase/`, but direct `supabase.from(...)` usage is still scattered across routes/services.

Verified missing:
- (none noted in this audit pass)

## App Recovery & Navigation
- [x] (1) Standardize reset/recovery patterns (ErrorBoundary, soft reset, cache clear) into one documented approach
- [x] (2) Enforce router-first navigation (soft navigation only when hooks aren’t available); ban new `window.location.*` usage

## Architecture & Boundaries
- [x] (3) Break up large “god components” into small tab/section components with strict props
- [x] (4) Define and enforce module boundaries (`src/shared/` / `src/lib/` / `src/features/`) with ESLint import rules
- [x] (5) Consolidate duplicate UI panels (floating/settings/dev) into one canonical surface and delete the rest
- [x] (6) Move to feature-module ownership: each feature owns routes, hooks, services, and UI locally

## TypeScript & Events
- [ ] (7) Tighten TypeScript strictness incrementally and track remaining violations
- [ ] (8) Replace stringly-typed DOM/app events with typed constants + payload types
- [ ] (9) Normalize service return patterns (consistent Result-style or consistent throw) so components don’t guess failures
- [ ] (10) Centralize and type all localStorage keys/usage in one storage module

## State & Data Layer
- [ ] (11) Reduce Zustand store surface area: split by domain, memo-safe selectors, ban ad-hoc store reads in utilities
- [ ] (12) Unify optimistic update patterns (temp IDs, rollback, toasts) across Playbook/GamePlans/Bulletin/etc.
- [ ] (13) Standardize React Query config: query keys, stale times, refetch policies; remove bespoke caching
- [ ] (14) Create a typed Supabase data-access layer (table-level helpers) and reduce direct query scattering

## Dev/Prod Discipline
- [ ] (15) Guarantee DEV-only tooling never ships in prod bundles (dynamic import + `import.meta.env.DEV` gating)
- [x] (16) CI guard: no `console.*` anywhere outside the logger module
- [x] (17) CI guard: expand design-token linting (no raw colors / no arbitrary spacing/typography)
- [ ] (18) CI guard: no direct `fetch` outside a service layer

## Performance
- [x] (19) Set per-route performance budgets (max JS/chunks on cold start) and fail CI if exceeded
- [x] (20) Audit route-level lazy loading so heavy editors never load on cold-start routes
- [ ] (21) Add a render-performance checklist for high-traffic pages (memo boundaries, stable callbacks, virtualization)
- [ ] (22) Normalize telemetry: one schema, consistent fields, single dispatcher integration

## Security & Safety
- [ ] (23) Security pass: verify no service-role key usage; ensure RLS + team isolation patterns everywhere
- [ ] (24) Harden auth flows (reset password redirects, invite accept) with consistent allowlist/validation
- [ ] (25) Add “sensitive logging” scrubber (never log tokens/PII, even in dev)

## Testing & Quality Gates
- [ ] (26) Add service-layer contract tests (Supabase stubs) to reduce reliance on UI-only tests
- [ ] (27) Add regression tests for historically fragile areas (reset flows, offline sync, navigation helpers)
- [x] (28) Add Playwright smoke tests for top coaching workflows (Playbook, Practice, GamePlan, Bulletin, BoxCall)

## Docs & Housekeeping
- [ ] (29) Docs cleanup: merge duplicates, keep each doc ≤300 lines, create one “Architecture + Conventions” entrypoint
- [ ] (30) Add a recurring “delete week”: every sprint remove/merge 5 files/components; track net deletion as a KPI
