# Optimization, Speed & Professional Code Quality — Checklist Roadmap (Dec 19, 2025)

This is the “single source of truth” checklist for our performance + professionalism push.
It is intentionally checkable: what’s done is checked, what’s next is unchecked.

## Success Criteria (Definition of Done)

- [x] `npm run validate` passes (TypeScript + ESLint + Vitest)
- [x] `npm run format:check` passes
- [x] Production build succeeds (`npm run build`)
- [x] Heavy feature bundles (PDF/editor/charts) are not on cold-start routes unless needed
- [x] Bundle analysis report reviewed and any obvious regressions addressed (`npm run build:analyze`)
- [ ] Console noise is reduced or routed through a logger (dev-only where appropriate)

---

## ✅ Completed (Verified)

### A) Quality Gates / Professional Hygiene

- [x] TypeScript is green (`npm run validate`)
- [x] ESLint is green (`npm run validate` / `npm run lint:strict`)
- [x] Unit tests are green (`npm run validate`)
- [x] Prettier is green (`npm run format:check`)
- [x] Fixed macOS-safe console scan script (`npm run find:console` now correctly matches `console.(log|warn|debug)`)

### B) Bundle / Route-Splitting Enforcement (Critical Path Protection)

- [x] Production build artifacts inspected (`dist/.vite/manifest.json` + emitted route bundles)
- [x] Practice Planner route no longer statically imports PDF chunks
  - Evidence: PracticePlanner has `dynamicImports` including `src/components/practice/LazyPDFExport.tsx` (and does *not* list `feature-pdf`/`pdf-core` under `imports`).
- [x] Team Bulletin route does not pull PDF/editor bundles by default
  - Evidence: TeamBulletin imports `AnnouncementsList` and keeps heavy feature bundles route-scoped.
- [x] Manual chunking tightened to prevent “feature chunk capture” (PDF/editor/analytics stay owned by their feature chunks)

### C) Team Bulletin Speed Wins (Feed + Rendering)

- [x] Announcements feed virtualized (react-virtuoso)
- [x] Removed N+1 avatar fetching by enriching announcements payload (include `avatar_url`)
- [x] Batched announcement view receipts (bulk upsert) instead of per-item writes
- [x] Read-only rich text display switched from per-item TipTap instantiation to lightweight renderer (`RichTextDisplay`)

### D) PDF “On-Demand” Loading (No Cold-Start Tax)

- [x] Export flows switched to click-time dynamic imports (PDF services not imported at module load)
- [x] PracticePlanner export UI behind `React.lazy` + `Suspense` (`LazyPDFExport`)

---

## 🧪 Verification Checklist (Repeatable)

### Build + Chunk Ownership

- [x] Run: `npm run build`
- [x] Inspect: `dist/.vite/manifest.json`
  - Confirm `src/pages/PracticePlanner.tsx` does **not** list `feature-pdf` / `pdf-core` in `imports`
  - Confirm it lists `src/components/practice/LazyPDFExport.tsx` in `dynamicImports`

### Quality Gates

- [x] Run: `npm run validate`
- [x] Run: `npm run format:check`

---

## ⬜ Next Up (Roadmap)

### 1) “Big Sweep” Deep Scans (Actionable Reports)

- [x] Run `npm run build:analyze` and review `reports/bundle-analysis.html`
  - [x] Confirm largest chunks are still route-scoped (PDF/editor/charts)
  - [x] Confirm route bundles that matter (Dashboard/TeamBulletin/PracticePlanner) stay lean
- [x] Run `npm run security:audit` and triage findings
  - [x] Result: production deps (`npm audit --omit=dev`) reports 0 vulnerabilities
  - [x] Result: dev dependency vulnerabilities exist (non-blocking); consider dependency bumps / `npm audit fix`
- [x] Run `npm run deadcode:scan` and triage findings
  - [x] Result: no orphaned CSS found
  - [x] Result: flagged as “potentially orphaned” (sampling-based): `src/components/LandscapePrompt.tsx`, `src/components/TabBar.tsx`

### 2) Reduce Console Noise (Professional Output)

Current state: `npm run find:console | wc -l` reports a large number of `console.*` usages.

- Progress note: after initial passes, `npm run find:console | wc -l` is down to ~153 (still more to triage).

- [ ] Categorize console usage into:
  - [ ] Required (security warnings, error boundaries)
  - [ ] Dev-only diagnostics
  - [ ] Accidental leftovers
- [ ] Convert dev-only logs to a gated logger (dev only) or remove when safe
- [x] Converted high-frequency “startup path” logs to `src/utils/logger.ts`
  - Touch points: RoleService, PreferenceService, user team memberships hook, dashboard stats hook
  - Touch points: auth store initialization, Layout team sync, QueryCache, Supabase client module (and dev-only globals)
  - Touch points: PlayGrid hooks/handlers (view mode, selection, expansion, play save)
  - Touch points: PlayCard selection headers (list + tile)
- [ ] Update tests to avoid intentionally printing noisy stderr when possible (assert on mocked logger)

### 3) Performance / UX Profiling (Targeted)

- [ ] Profile Team Bulletin scroll + expand comments (React Profiler + Performance panel)
- [ ] Profile Playbook search + modal open paths
- [ ] Profile Practice Planner interactions (drag/drop, open modals)

---

## Notes / Constraints

- We avoid suppressions and avoid behavior changes unless explicitly requested.
- For performance changes, we prefer artifact-driven verification (manifest + emitted chunks), not just “it looks lazy in source”.
