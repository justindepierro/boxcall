# First-Impression Checklist

_Status: 2025-09-28_

This document records the guardrails we added around the first-touch
experience (login, signup, onboarding, navigation) so future iterations don’t
accidentally regress the funnel.

## Instrumentation

- `auth.signin.success|error|exception` and `auth.signup.success|error|exception`
  fire from `src/app/auth-store.ts` for easy filtering in telemetry.
- `navigation.view` events fire from `Layout.tsx` on every route change.
- The create-team wizard emits `team.create.step` and validation-error events.

## Draft persistence

- Create Team drafts persist in `localStorage` key `boxcall:create-team-v1` and
  restore automatically if the browser reloads mid-flow.

## Visual polish

- Branded splash (`RouteLoadingSpinner`) avoids white flashes during auth.
- Sidebar skeletons appear while the profile/role loads so nav never shows an
  empty column.

## Next miles

- Add e2e smoke tests for login/signup (tracked in issue #TODO).
- Remove the legacy archive folder on **2025-10-05** if no issues are reported.
