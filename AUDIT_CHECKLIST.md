# BoxCall Audit Implementation Checklist

## Security

- [ ] Rotate all Supabase keys and any other secrets that were ever in `.env.local`.
- [ ] Ensure `.env*` files are excluded from git and build artifacts.
- [ ] Audit `.gitignore` and artifact pipeline for secret leaks.

## CI/CD (GitHub Actions or similar)

[x] Add type-check, lint, and test steps to PRs (fail on any error).
[x] Add bundle-size check with hard thresholds.
[x] Add Lighthouse CI with budgets from `lighthouserc.json`.
[x] Enforce Vitest coverage thresholds (e.g., 80–90%)—fail build if violated.
[x] Add Knip dead code check in CI.
[x] (Optional) Add Playwright a11y smoke tests for top user flows.

## Performance

[x] Implement route-level code splitting (React.lazy) for Playbook, Dashboard, Team, Practice Planner, etc.
[x] Split heavy utilities (PDF renderer, diagram tools, rich editors) into async chunks.
[x] Preload only the active theme; lazy-load additional theme token files on switch.
[ ] Enable strict asset hashing/caching and build.ssrEmitAssets (if SSR).

## Architecture

[x] Enforce modular layout: `features/{auth,team,playbook,practice}/`, `shared/{ui,components,lib}`, `services/`, `types/`.
[x] Split any file > 500–800 LOC. _(diagram context/reducers, PDF service, etc. modularized)_
[ ] Introduce a domain event bus (Pub/Sub) for Practice/Game/Playbook isolation.

## Developer Experience (DX)

[x] Move PDF code behind a lazy import and show a skeleton while loading.
[ ] Consider lite/worker-based alternatives for third-party viewers.
[x] Isolate and lazy-load editor/diagram dependencies.
[x] Ensure tree-shaken icon imports (lucide-react direct imports).
[x] Replace moment/lodash with dayjs/lodash-es.
[x] Preload only active theme font files; defer others.
[ ] Add `font-display: swap`; consider font subsetting.

- [ ] Consider lite/worker-based alternatives for third-party viewers.
- [x] Isolate and lazy-load editor/diagram dependencies.
- [x] Ensure tree-shaken icon imports (lucide-react direct imports).
      [ ] Add unit tests for utils, selectors, stores.
      [ ] Add integration tests for rendering “6 plays minimum” logic and Practice/Game flows.
      [ ] Add E2E tests (Playwright): login → team select → playbook view → expand card → record outcome.
      [ ] Add a11y tests: axe run on top 3 pages, fail on serious/critical.
      [ ] Enforce coverage gates: 80% global, 90% on critical modules.

- [ ] Add unit tests for utils, selectors, stores.
- [ ] Add integration tests for rendering “6 plays minimum” logic and Practice/Game flows.
      [ ] Ensure all migrations go through `supabase/migrations/*` with code review.
      [ ] Add script to regenerate TS types from DB.
      [ ] Pin RLS policy doc next to migrations; add minimal harness for RLS tests.
      [ ] Add `scripts/seed.ts` for dev data seeding.

## DB & Supabase

- [ ] Ensure all migrations go through `supabase/migrations/*` with code review.
      [ ] Wire all scripts to CI commands (bundlesize:ci, lhci:ci, etc.).
      [ ] Ensure coverage gates in `package.json` for Vitest.
      [x] Implement route splitting as shown in the audit.

## Professional Environment Hardening

[x] Lazy-load heaviest features (PDF/diagram/editor).
[ ] Use cache + stale-while-revalidate for Supabase reads.
[x] Reduce initial JS via route splitting and deferring dev-mode tools.
[x] Trim dependencies with Knip and bundle analyzer.
[x] Preload only active theme; defer others.

- [x] Lazy-load heaviest features (PDF/diagram/editor).
- [ ] Use cache + stale-while-revalidate for Supabase reads.
- [x] Reduce initial JS via route splitting and deferring dev-mode tools.
- [x] Trim dependencies with Knip and bundle analyzer.
- [x] Preload only active theme; defer others.
