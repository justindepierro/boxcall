# BoxCall Audit Implementation Checklist

[x] Audit checklist reviewed and updated as of August 28, 2025.
[x] Obsolete/redundant tests removed (ActionBar, DiagramRoute, etc.).
[x] ActionBar and diagram components fully covered by unit/integration tests.
[x] Strict type compatibility enforced in all test scaffolding.

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
[x] Enable strict asset hashing/caching and build.ssrEmitAssets (if SSR).

## Architecture

[x] Enforce modular layout: `features/{auth,team,playbook,practice}/`, `shared/{ui,components,lib}`, `services/`, `types/`.
[x] Split any file > 500–800 LOC. _(diagram context/reducers, PDF service, etc. modularized)_
[x] Introduce a domain event bus (Pub/Sub) for Practice/Game/Playbook isolation.

## Developer Experience (DX)

[x] Move PDF code behind a lazy import and show a skeleton while loading.
[x] Consider lite/worker-based alternatives for third-party viewers. - **Step-by-step migration and cleanup plan:** 1. **Audit current viewers:** Identify all heavy third-party viewers (PDF, spreadsheet, code editor, etc.) in use. 2. **Select lite/worker-based alternatives:** Research and choose lightweight, modular libraries (e.g., pdf-lib, SheetJS, Monaco Editor in worker mode). 3. **Remove obsolete/redundant dependencies:** Uninstall unused or legacy viewer packages. 4. **Refactor for lazy loading:** Move viewer imports to dynamic imports and enable code splitting for all viewer modules. 5. **Integrate Web Workers:** Offload parsing/rendering to workers for large files and CPU-intensive tasks. 6. **Test and validate:** Ensure all viewers work as expected, with strict type safety and automated tests. 7. **Document migration:** Update architecture docs and README with new viewer setup and usage patterns. 8. **Monitor bundle size and performance:** Use bundle analyzer and Lighthouse to confirm improvements.
[x] Isolate and lazy-load editor/diagram dependencies.
[x] Ensure tree-shaken icon imports (lucide-react direct imports).
[x] Replace moment/lodash with dayjs/lodash-es.
[x] Preload only active theme font files; defer others.
[x] Add `font-display: swap`; font subsetting and font usage fully optimized.

- [x] Isolate and lazy-load editor/diagram dependencies.
- [x] Ensure tree-shaken icon imports (lucide-react direct imports).
      [x] Add unit tests for utils, selectors, stores.
      [x] Add integration tests for rendering “6 plays minimum” logic and Practice/Game flows.
      [x] Add E2E tests (Playwright): login → team select → playbook view → expand card → record outcome.
      [x] Add a11y tests: axe run on top 3 pages, fail on serious/critical.
      [x] Enforce coverage gates: 80% global, 90% on critical modules.

      [x] Add unit tests for utils, selectors, stores.
      [x] Add integration tests for rendering “6 plays minimum” logic and Practice/Game flows.
      [ ] Ensure all migrations go through `supabase/migrations/*` with code review.
      [ ] Add script to regenerate TS types from DB.
      [ ] Pin RLS policy doc next to migrations; add minimal harness for RLS tests.
      [ ] Add `scripts/seed.ts` for dev data seeding.

## DB & Supabase

- [ ] Ensure all migrations go through `supabase/migrations/*` with code review.
      [x] Wire all scripts to CI commands (bundlesize:ci, lhci:ci, etc.).
      [x] Ensure coverage gates in `package.json` for Vitest.
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
