Auth and routing modernization

Our goal remains: remove guard wrapper duplication, shift checks into route loaders, and standardize UX/errors while keeping gates green.

What’s implemented now

- Central policy: `authorize(input)` in `src/routes/authorize.ts` drives all guard decisions and returns `{ allowed, reason, membership, subscription }` with a typed `DenyReason` for UI mapping. `DenyReason` is exported for reuse in UIs and tests.
- Loader-first gating: UI wrapper guards have been removed. All access control is enforced via React Router Data Router loaders in `src/routes/loaderAuth.ts` and exported via `src/routes/index.ts`:
	- `requireTeamCoachLoader` (team settings)
	- `requireTeamAnalyticsLoader` (team premium analytics: role + subscription tier)
	- `requireAuthenticatedLoader` (non-team routes like dashboard)
	- `requireTeamMemberLoader` (team routes for any member: coach/player/family/admin)
- Role-based non-team loader factory: `requireRolesLoader(["coach","admin",...])` with a ready-made `requireCoachOrAdminLoader`. Use these to gate non-team routes (e.g., Templates, BoxCall) without wrapper components.
- Active team source of truth: Zustand store in `src/state/activeTeamStore.ts` and `TeamParamSync` syncs `:teamId` from the URL into the store (consumed by mobile nav and others).
- Paths: centralized via `src/routes/paths.ts` (`ROUTES`, `teamRoutes`).
- Data Router app: `src/routes/DataRouter.tsx` includes `/login`, `/dashboard` (auth loader), `/team/:teamId/settings` (coach/admin loader), `/team/:teamId/bulletin` (member loader), and `/team/:teamId/analytics` (premium loader).
- Additional migrated routes in Data Router: `/templates` (coach/admin), `/playbook` (authed), `/boxcall` (coach/admin), `/profile` (authed), `/teams` (authed).
- Route errors: `RouteErrorElement` is wired as `errorElement` on the root route for consistent loader/action error UX.
- Tests: coverage for `authorize()` matrix, TeamParamSync, and the loader suite. The icon system was made unmount-safe in tests to eliminate teardown errors.

Guard patterns (quick reference)

- Loader (feature/permission/team/role):
	Use `authorize()` inside route loaders to pre-gate before render. For premium features, pass `requiredTiers`. For team pages, pass `teamId` and `allowedTeamRoles`.

DenyReason → UI mapping (example)

```ts
import type { DenyReason } from "../../src/routes/authorize";

const denyToMessage: Record<DenyReason, string> = {
	unauthenticated: "You need to sign in to continue.",
	role_denied: "Your account role is not allowed here.",
	no_team: "Choose a team to access this page.",
	not_member: "You’re not a member of this team.",
	inactive_member: "Your team membership is inactive.",
	subscription_missing: "This feature requires an active subscription.",
	subscription_tier: "Your team’s plan does not include this feature.",
	subscription_expired: "Your team’s subscription has expired.",
	permission_denied: "You don’t have permission to access this feature.",
};
```

Data Router loader: real implementation (coach/admin)

```ts
// src/routes/loaderAuth.ts
import { redirect } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { authorize } from "./authorize";
import { ROUTES } from "./paths";

export async function requireTeamCoachLoader({ params }: { params: { teamId?: string } }) {
	const { data: authData } = await supabase.auth.getUser();
	const user = authData?.user;
	if (!user) throw redirect(ROUTES.LOGIN);

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	const res = await authorize({ profile: { id: user.id, role: profile?.role ?? null }, teamId: params.teamId, allowedTeamRoles: ["coach", "admin"] });
	if (!res.allowed) {
		if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
		throw redirect(ROUTES.DASHBOARD);
	}
	return null;
}

// Premium loader (role + plan)
export async function requireTeamAnalyticsLoader({ params }: { params: { teamId?: string } }) {
	const { data: authData } = await supabase.auth.getUser();
	const user = authData?.user;
	if (!user) throw redirect(ROUTES.LOGIN);

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	const res = await authorize({ profile: { id: user.id, role: profile?.role ?? null }, teamId: params.teamId, allowedTeamRoles: ["coach", "admin"], requiredTiers: ["team_premium"] });
	if (!res.allowed) {
		if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
		throw redirect(ROUTES.DASHBOARD);
	}
	return null;
}

Role-gated non-team routes (factory)

```ts
// src/routes/loaderAuth.ts
import type { AppRole } from "./authorize";
import { authorize } from "./authorize";
import { redirect } from "react-router-dom";
import { ROUTES } from "./paths";
import { supabase } from "../lib/supabase";

export function requireRolesLoader(allowedRoles: NonNullable<AppRole>[]) {
	return async function roleLoader() {
		const { data: authData } = await supabase.auth.getUser();
		const user = authData?.user;
		if (!user) throw redirect(ROUTES.LOGIN);

		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();

		const res = await authorize({ profile: { id: user.id, role: profile?.role ?? null }, requiredRoles: allowedRoles });
		if (!res.allowed) {
			if (res.reason === "unauthenticated") throw redirect(ROUTES.LOGIN);
			throw redirect(ROUTES.DASHBOARD);
		}
		return null;
	};
}

export const requireCoachOrAdminLoader = requireRolesLoader(["coach", "admin"]);
```

Data Router routes (current)

- Public: `/login`
- Authenticated: `/dashboard`, `/playbook`, `/profile`, `/teams`
- Playbook sub-route: `/playbook/diagram` (lightweight, authenticated)
- Role-gated (non-team): `/templates`, `/boxcall` (coach/admin)
- Team member gated: `/team/:teamId/bulletin`
- Team coach/admin gated: `/team/:teamId/settings`
- Team premium gated: `/team/:teamId/analytics` (requires `team_premium`)
- Root redirect: `/` → `/dashboard`
- `errorElement`: `RouteErrorElement` provides friendly messages for loader/action errors
```

Testing the loader (pre-render gating)

```ts
// src/routes/__tests__/loaderAuth.test.tsx
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

// mock supabase + authorize as needed
// ...

it("redirects unauthenticated to /login", async () => {
	const router = createMemoryRouter([
		{ path: "/login", element: <div>Login</div> },
		{ path: "/teams/:teamId/coach", element: <div>OK</div>, loader: requireTeamCoachLoader },
	], { initialEntries: ["/teams/t1/coach"] });

	// Render and assert final screen shows Login
	// ...
});
```

Adoption path

1) Wire loaders on sensitive routes (settings, analytics) and general pages (dashboard). Use `requireRolesLoader`/`requireCoachOrAdminLoader` for non-team role gates.
2) Co-locate route data fetching in loaders. Use `errorElement` for consistent 401/403 presentation.
3) Continue consolidating checks in `authorize` and expand the test matrix as routes evolve.

Housekeeping (tests)

- Icon dynamic imports were made unmount-safe to prevent teardown-time setState errors in JSDOM. If additional console noise is undesirable, mock `../ui/Icon` in route tests to render a stub.

Next up

- Keep `authorize()` as the single source of truth for access checks.
- Add deny-reason-to-message examples near error UIs and consolidate in a shared util if needed.
- Optionally mock icons in tests to silence logs completely.