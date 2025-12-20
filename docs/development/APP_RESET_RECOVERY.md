# App Reset & Recovery (No-Reload Standard)

This doc defines the **standard** way BoxCall resets/recover from bad runtime state **without** doing a full-page reload.

## Goals

- Avoid `window.location.reload()` hacks.
- Keep production bundles lean.
- Provide a predictable, testable recovery path.

## The Standard API

- Reset trigger: `requestAppReset(reason?)` in [src/utils/appReset.ts](src/utils/appReset.ts)
- Reset listener: the root app listens for `APP_RESET_EVENT` and forces a remount in [src/App.tsx](src/App.tsx)

### When to use `requestAppReset()`

Use it when you want to recover from:

- A crashed subtree (ErrorBoundary actions)
- Stuck UI state in dev tooling
- “Reset to sample data” flows after clearing storage

It should be preferred over page reload because it:

- Remounts the React tree (providers/hooks re-init)
- Preserves the session + service worker state
- Avoids nuking dev/prod caches unexpectedly

### What the reset does

On `APP_RESET_EVENT` the root app:

- Closes DevPanel (dev only)
- Clears the dynamically-imported DevPanel module reference
- Increments a React `key` on the `ErrorBoundary` root, forcing a full subtree remount

## Navigation + Recovery

If you need “Go Home” behavior from places that can’t use router hooks (like class components), use:

- `softNavigate()` in [src/utils/softNavigate.ts](src/utils/softNavigate.ts)

Example pattern used by `ErrorBoundary`:

- `softNavigate("/", { replace: true })` then `requestAppReset("...")`

## Rules

- Do not add new `window.location.reload()`.
- Do not add new `window.location.href = ...` for SPA routes.
- If you can use React Router (`useNavigate`), do so.
- If you can’t use hooks, use `softNavigate()`.

## Quick Checklist (PR Review)

- [ ] Recovery actions call `requestAppReset()` (not reload)
- [ ] Root listens for `APP_RESET_EVENT` (constant, not string literal)
- [ ] Non-hook navigation uses `softNavigate()`
- [ ] `npm run validate` stays green
