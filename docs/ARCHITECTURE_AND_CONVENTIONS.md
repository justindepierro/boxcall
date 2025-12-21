# Architecture + Conventions

This is the entrypoint for BoxCall’s technical architecture and day-to-day coding conventions.

## Start Here

- System overview: `docs/ARCHITECTURE.md`
- API/data layer: `docs/API.md` and `docs/API_ARCHITECTURE_DEC9_2025.md`
- Design system (tokens + rules): `docs/DESIGN_SYSTEM_REFERENCE.md`
- Code quality gates: `CODE_QUALITY_CHECKLIST.md`
- Render performance checklist: `docs/development/RENDER_PERFORMANCE_CHECKLIST.md`

## Stack

- React + TypeScript + Vite
- State:
  - React Query for server state
  - Zustand for app/UI state (domain stores)
- Backend: Supabase (Postgres + RLS)

## Repo Conventions (Practical)

### Imports

- Prefer path aliases (e.g. `@services/...`, `@components/...`) when available
- Keep imports grouped: React → third-party → internal → relative
- Remove unused imports; keep type imports separated

### Design System (Mandatory)

- Use component tokens first, then semantic tokens
- Avoid raw Tailwind colors / arbitrary spacing / arbitrary typography
- Ensure interactive elements include haptic feedback

### Services

- Business logic belongs in the service/domain layer (not components)
- Network access should flow through the API/service layer (no direct `fetch` in UI)
- Prefer consistent return patterns for service methods (typed result or consistent throwing)

### State Management

- React Query:
  - Use shared query keys (`src/lib/queryKeys.ts`)
  - Avoid bespoke caching in hooks/components
  - Prefer invalidation + optimistic updates instead of ad-hoc local mirrors
- Zustand:
  - Use selector-based subscriptions
  - Avoid `.getState()` outside store modules

### Performance Patterns

- Keep heavy modules off cold-start routes (lazy-load editors/modals)
- Use virtualization for large lists
- Stabilize props and callbacks to keep memo boundaries effective

### Telemetry

- Use the telemetry dispatcher as the default event path
- Ensure events include consistent context fields (at minimum `session_id`; pages should include `page`)

## Quality Gates

Run before PR:

- `npm run type-check`
- `npm run lint`
- `npm run format:check`
- `npm run test`

## Where Things Live

- `src/services/`: business logic and integration clients
- `src/hooks/`: reusable React hooks
- `src/components/`: UI and feature components
- `src/stores/`: Zustand stores by domain
- `src/telemetry/`: telemetry + analytics integration
- `docs/`: documentation by topic
