# BoxCall Audit Implementation Checklist

## Security

- [ ] Rotate all Supabase keys and any other secrets that were ever in `.env.local`.
- [ ] Ensure `.env*` files are excluded from git and build artifacts.
- [ ] Audit `.gitignore` and artifact pipeline for secret leaks.

## CI/CD (GitHub Actions or similar)

- [ ] Add type-check, lint, and test steps to PRs (fail on any error).
- [ ] Add bundle-size check with hard thresholds.
- [ ] Add Lighthouse CI with budgets from `lighthouserc.json`.
- [ ] Enforce Vitest coverage thresholds (e.g., 80–90%)—fail build if violated.
- [ ] Add Knip dead code check in CI.
- [ ] (Optional) Add Playwright a11y smoke tests for top user flows.

## Performance

- [x] Implement route-level code splitting (React.lazy) for Playbook, Dashboard, Team, Practice Planner, etc.
- [x] Split heavy utilities (PDF renderer, diagram tools, rich editors) into async chunks.
- [x] Preload only the active theme; lazy-load additional theme token files on switch.
- [ ] Enable strict asset hashing/caching and build.ssrEmitAssets (if SSR).

## Architecture

- [x] Enforce modular layout: `features/{auth,team,playbook,practice}/`, `shared/{ui,components,lib}`, `services/`, `types/`.
- [ ] Split any file > 500–800 LOC.
- [ ] Introduce a domain event bus (Pub/Sub) for Practice/Game/Playbook isolation.

## Developer Experience (DX)

- [ ] Add `npm run ci` to run: type-check → lint → test → knip → bundlesize → lighthouse-ci.
- [ ] Add pre-commit hook for ESLint/Prettier, pre-push hook for type-check + unit tests.
- [ ] Create `docs/CONTRIBUTING.md` with branch naming, PR size limits, commit style, review gates.

## Performance Plan (Specific Cuts)

- [ ] Move PDF code behind a lazy import and show a skeleton while loading.
- [ ] Consider lite/worker-based alternatives for third-party viewers.
- [ ] Isolate and lazy-load editor/diagram dependencies.
- [ ] Ensure tree-shaken icon imports (lucide-react direct imports).
- [ ] Replace moment/lodash with dayjs/lodash-es.
- [ ] Preload only active theme font files; defer others.
- [ ] Add `font-display: swap`; consider font subsetting.

## Testing Matrix

- [ ] Add unit tests for utils, selectors, stores.
- [ ] Add integration tests for rendering “6 plays minimum” logic and Practice/Game flows.
- [ ] Add E2E tests (Playwright): login → team select → playbook view → expand card → record outcome.
- [ ] Add a11y tests: axe run on top 3 pages, fail on serious/critical.
- [ ] Enforce coverage gates: 80% global, 90% on critical modules.

## DB & Supabase

- [ ] Ensure all migrations go through `supabase/migrations/*` with code review.
- [ ] Add script to regenerate TS types from DB.
- [ ] Pin RLS policy doc next to migrations; add minimal harness for RLS tests.
- [ ] Add `scripts/seed.ts` for dev data seeding.

## Professional Environment Hardening

- [ ] Wire all scripts to CI commands (bundlesize:ci, lhci:ci, etc.).
- [ ] Ensure coverage gates in `package.json` for Vitest.
- [ ] Implement route splitting as shown in the audit.

## Speed Wins (Ranked)

- [ ] Lazy-load heaviest features (PDF/diagram/editor).
- [ ] Use cache + stale-while-revalidate for Supabase reads.
- [ ] Reduce initial JS via route splitting and deferring dev-mode tools.
- [ ] Trim dependencies with Knip and bundle analyzer.
- [ ] Preload only active theme; defer others.
