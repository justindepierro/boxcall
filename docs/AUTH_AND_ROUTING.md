High-level plan

Remove guard wrapper duplication, shift checks to route loaders, and standardize UX/errors.
Tighten auth/session handling (refresh, restoration), team context, and redirects.
Improve prefetch, performance, and test coverage to keep gates green.
Checklist (prioritized)

Now (fast wins)

Consolidate guards into a single policy-based gate:
Create an isAllowed({role, permissions, teamRole, subscription}) utility used by RoleProtectedRoute, PermissionRoute, TeamMemberRoute, SubscriptionRoute to cut wrapper nesting.
Add a Guards.compose helper to reduce multiple nested <Guard> wrappers to one guard per route element.
Centralize 401/403/Loading UX:
Use GuardUI consistently (already added) and wire standard error boundaries per segment for “unauthorized” vs “forbidden”.
Redirect hygiene:
Ensure all redirects sanitize and preserve from correctly (done in ProtectedRoute); extend to guards that still Navigate inline.
Active team source of truth:
Replace localStorage-only helper with a small context/store (e.g., Zustand) that syncs with localStorage and URL (:teamId) and listens for storage events across tabs.
Next (structural uplift)

Move to React Router “Data Router” API:
Switch to createBrowserRouter + RouterProvider.
Put guard checks in loaders (auth, role, team membership, subscription). Redirect in loader to eliminate extra render passes and suspense flashes.
Co-locate data fetching in loaders with typed results; use errorElement for consistent 401/403 pages.
Auth context v2:
Harden session restoration and token refresh with Supabase onAuthStateChange.
Expose an async getSession() and a suspense-friendly hook; remove race conditions in useAuthGate.
Typed route helpers:
Add typed param helpers (e.g., buildTeamPath({teamId})) and a parseParams utility with zod to validate :teamId presence where required.
Keep ROUTES/teamRoutes as the single source of truth.
Prefetch polish:
Extend getRouteImporter to include analytics and any remaining large routes.
Add intersection-based prefetch on visible nav links and hover prefetch (already partially in place).
Later (future-proof and perf)

Permission matrix as the driver:
Use PERMISSION_MATRIX in nav generation (you’ve started), route gating, and button/href visibility for full consistency.
Observability:
Instrument guard denies and redirects (category, route, role, reason) to telemetry for UX tuning.
SSR readiness:
Keep routes/data/guards compatible with future SSR (avoid window-only APIs in loaders; gate with typeof window when necessary).
Error boundaries:
Segment route-level boundaries for data errors vs auth errors; show fast skeletons where appropriate.
Code splitting and skeletons:
Ensure heavy pages (Playbook, BoxCall, Templates) have lightweight skeletons and split sub-routes where practical.
Concrete first steps I can implement next

Introduce a single authorize() utility and refactor guards to use it (no behavior change, fewer wrappers).
Add a tiny ActiveTeamStore (Zustand) that syncs URL param, context, and localStorage; update mobile/desktop nav to read from it.
Add importer entries for any remaining heavy routes and wire intersection-based prefetch on nav.