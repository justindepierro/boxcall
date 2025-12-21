# Elite Code Cleanup Roadmap (Checklist) — Dec 2025

Use this as the single source of truth for “make the code elite.” Check items off as they ship.

Policy: when we implement any item below, we also delete the legacy/duplicate path — see [docs/development/DELETE_OLD_STUFF_POLICY.md](docs/development/DELETE_OLD_STUFF_POLICY.md).

## Recommended Execution Order (do this first)

This checklist is grouped by area below for readability, but the fastest/lowest-risk execution order is:

1. **Safety/Security first**: (23) → (24) → (25)
2. **Dev/prod discipline guards**: (16) → (17) → (18)
3. **Data layer foundations**: (14) → (13) → (12) → (11)
4. **App correctness + consistency**: (9) → (10) → (8) → (7)
5. **Performance gates + hygiene**: (20) → (19) → (21) → (22)
6. **Tests + quality gates**: (26) → (27) → (28)
7. **Docs + cleanup cadence**: (29) → (30)

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
- (26) Service-layer contract tests exist (Supabase stub helper + initial contract coverage for `RosterService`).
- (27) Regression tests added for fragile areas: app reset event (`appReset`), auth loader redirects (`loaderAuth`), and offline sync queue behavior (`OfflineExecutionQueue`).
- (23) Client secret guard is enforced (fails CI/validate if service-role keys or JWT-like tokens appear in `src/`). Service role keys are reserved for server-side scripts/workflows.
- (24) Auth flow hardening is in place: returnUrl sanitization is enforced in `src/utils/navigationUtils.ts` (rejects external/protocol-relative URLs), invite accept links URL-encode tokens and redirect to canonical team routes, and a real `/reset-password` route exists (validated via `npm run validate` + unit tests).
- (25) Sensitive logging scrubber is implemented in `src/utils/logger.ts`: JWTs/Bearer tokens/emails and common token/password keys are redacted before hitting `console.*` (covered by unit tests).
- (18) Direct `fetch()` is banned outside the service/API layer via `boxcall-design/no-direct-fetch-outside-services` (allowed only in `src/services/*`, `src/lib/api/*`, and `src/sw.ts`).
- (8) App/DOM custom events are typed and centralized: constants + typed dispatch/listen helpers live in `src/utils/appEvents.ts`, and existing feature events use them (activation, PWA install, PlayGrid).
- (7) TypeScript strictness is tightened incrementally: `noImplicitOverride` is enabled in TS configs, overrides are fixed (e.g., ErrorBoundary), and remaining candidates are tracked in `docs/development/TYPESCRIPT_STRICTNESS_TRACKER.md`.
- (10) Web storage is centralized and typed: `src/utils/storage.ts` is the single source of truth for keys + SSR-safe helpers, and direct `localStorage`/`sessionStorage` usage is banned via `boxcall-design/no-direct-web-storage` (tests exempt).
- (11) Zustand store surface area is reduced and enforced: legacy `src/app/store.ts` was deleted, UI state moved to `src/stores/uiStore.ts`, dashboard store was modularized under `src/stores/dashboard/`, and new guardrails prevent ad-hoc `.getState()` and whole-store subscriptions.
- (12) Optimistic update patterns are unified via shared helpers in `src/utils/optimistic.ts` (consistent temp IDs + targeted replace/rollback for concurrent optimistic mutations).
- (14) Supabase table access is centralized behind the DAL in `src/data/supabase/`, and a guardrail blocks new `supabase.from("...")` usage outside the DAL (auth + storage are exempt).
- (15) DEV-only tooling is guaranteed not to ship in prod: `DevHealthCheck` is lazy-loaded behind `import.meta.env.DEV` check, `testBasicDatabaseConnectivity` and database helpers are dynamically imported only in DEV mode, `AnalyticsDebugger` is gated behind `import.meta.env.DEV`, and `DevPanel` + `PerformanceDashboard` + `FormationDataDiagnostic` are already lazy-loaded and gated (Vite tree-shakes them from production bundles).

Verified partial (keep unchecked for now):

- (13) React Query defaults are standardized in `src/app/queryClient.ts` and some query-key factories exist (e.g., `src/lib/queryClient.ts`), but there’s still bespoke caching in the codebase and no single shared query-key scheme across features.

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

- [x] (7) Tighten TypeScript strictness incrementally and track remaining violations
- [x] (8) Replace stringly-typed DOM/app events with typed constants + payload types
- [x] (9) Normalize service return patterns (consistent Result-style or consistent throw) so components don't guess failures
  - ✅ Verified: Created `src/services/serviceResult.ts` with `ServiceResult<T, Code>` type and helpers
  - ✅ Verified: Migrated invitation service (getInvitationByToken, acceptInvitation, sendPlayerInvitation, resendPlayerInvitation) to ServiceResult with explicit error codes
  - ✅ Verified: Migrated email service (sendEmail, sendPlayerInvitationEmail, sendInvitationReminderEmail) to ServiceResult
  - ✅ Verified: Updated all call sites (InvitationAcceptPage, useRosterInvitations) to handle typed error codes without guessing
  - ✅ Gate: type-check + lint pass (Dec 20, 2025)
- [x] (10) Centralize and type all localStorage keys/usage in one storage module

## State & Data Layer

- [x] (11) Reduce Zustand store surface area: split by domain, memo-safe selectors, ban ad-hoc store reads in utilities
  - ✅ Verified: Legacy `src/app/store.ts` removed; UI state lives in `src/stores/uiStore.ts` and dashboard store is modularized under `src/stores/dashboard/`
  - ✅ Verified: Guardrail bans `.getState()` outside store modules via `boxcall-design/no-direct-zustand-getstate` (tests exempt)
  - ✅ Verified: Guardrail bans whole-store subscriptions for key stores via `boxcall-design/no-zustand-store-hook-without-selector` (tests exempt)
  - ✅ Verified: Store consumers use selector-based subscriptions (active team + dashboard + UI)
  - ✅ Gate: `npm run validate` pass (Dec 20, 2025)
- [x] (12) Unify optimistic update patterns (temp IDs, rollback, toasts) across Playbook/GamePlans/Bulletin/etc.
  - ✅ Verified: Shared optimistic helpers live in `src/utils/optimistic.ts`
  - ✅ Verified: Major hotspots migrated (Playbook, GamePlans, Team data hooks, Roster, Calendar, Practice scripts, data-sync create)
  - ✅ Gate: `npm run type-check` + `npm run lint` + `npm run test` pass (Dec 21, 2025)
- [x] (13) Standardize React Query config: query keys, stale times, refetch policies; remove bespoke caching
  - ✅ Verified: Centralized React Query timing constants in `src/app/reactQueryTimes.ts`
  - ✅ Verified: Expanded shared query key factory in `src/lib/queryKeys.ts` and migrated key hotspots (Teams data, roster, personnel, calendar)
  - ✅ Gate: `npm run type-check` + `npm run lint` pass (Dec 21, 2025)
- [x] (14) Create a typed Supabase data-access layer (table-level helpers) and reduce direct query scattering

## Dev/Prod Discipline

- [x] (15) Guarantee DEV-only tooling never ships in prod bundles (dynamic import + `import.meta.env.DEV` gating)
  - ✅ Verified: `DevHealthCheck` lazy-loaded behind `import.meta.env.DEV` in App.tsx
  - ✅ Verified: `testBasicDatabaseConnectivity` dynamically imported only in DEV mode
  - ✅ Verified: `AnalyticsDebugger` gated behind `import.meta.env.DEV` check
  - ✅ Verified: `DevPanel`, `PerformanceDashboard`, `FormationDataDiagnostic` already lazy-loaded and gated
  - ✅ Gate: `npm run type-check` + `npm run lint` pass (Dec 21, 2025)
- [x] (16) CI guard: no `console.*` anywhere outside the logger module
- [x] (17) CI guard: expand design-token linting (no raw colors / no arbitrary spacing/typography)
- [x] (18) CI guard: no direct `fetch` outside a service layer

## Performance

- [x] (19) Set per-route performance budgets (max JS/chunks on cold start) and fail CI if exceeded
- [x] (20) Audit route-level lazy loading so heavy editors never load on cold-start routes
- [x] (21) Add a render-performance checklist for high-traffic pages (memo boundaries, stable callbacks, virtualization)
  - ✅ Verified: Added `docs/development/RENDER_PERFORMANCE_CHECKLIST.md` and linked from `CODE_QUALITY_CHECKLIST.md`
- [x] (22) Normalize telemetry: one schema, consistent fields, single dispatcher integration
  - ✅ Verified: Telemetry events attach `session_id` consistently (dispatcher-level)
  - ✅ Verified: Telemetry persistence is registered at app bootstrap and forwards flushed events to `AnalyticsService`
  - ✅ Verified: `useAnalytics` emits via the telemetry dispatcher for a consistent schema

## Security & Safety

- [x] (23) Security pass: verify no service-role key usage; ensure RLS + team isolation patterns everywhere
- [x] (24) Harden auth flows (reset password redirects, invite accept) with consistent allowlist/validation
- [x] (25) Add “sensitive logging” scrubber (never log tokens/PII, even in dev)

## Testing & Quality Gates

- [x] (26) Add service-layer contract tests (Supabase stubs) to reduce reliance on UI-only tests
- [x] (27) Add regression tests for historically fragile areas (reset flows, offline sync, navigation helpers)
- [x] (28) Add Playwright smoke tests for top coaching workflows (Playbook, Practice, GamePlan, Bulletin, BoxCall)

## Docs & Housekeeping

- [x] (29) Docs cleanup: merge duplicates, keep each doc ≤300 lines, create one “Architecture + Conventions” entrypoint
  - ✅ Verified: Added `docs/ARCHITECTURE_AND_CONVENTIONS.md` as the entrypoint
  - ✅ Verified: Rebuilt `docs/README.md` into a clean single-source docs index
- [ ] (30) Add a recurring “delete week”: every sprint remove/merge 5 files/components; track net deletion as a KPI
