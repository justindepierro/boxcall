# Module boundaries and import hygiene

This repo uses ESLint to enforce a simple layered architecture and consistent import ordering.

- Layers (lower to higher):
  - domain, data, infra, adapters, services, state, hooks
  - components, features, design-system
  - routes, pages, app (top level)
- Key rules:
  - design-system is the lowest UI layer and can’t import anything above it.
  - components are presentational and can’t import app/pages/routes.
  - services/state/infra/data/adapters/domain don’t import UI.
  - domain must remain framework-agnostic (no React/DOM).

Rollout strategy
- Boundary violations: warn by default. Toggle strict via env when needed.
- Import order/newlines: off by default to avoid noise; run on-demand to fix.

Useful scripts
- Normal lint (fast):
  npm run lint
- Strict boundaries (CI toggle or local enforcement):
  npm run lint:boundaries
- Organize imports (on demand, autofix):
  npm run lint:imports:fix

Notes
- If you hit a legitimate exception, comment it with a focused disable and open a refactor task.
- If you see many import-order warnings, run the autofix and commit.
