# Component Library Audit (Dec 2025)

## Why this audit

Goal: make shared UI primitives “industry-leading” — accessible, stable, reusable, and consistent — without behavior regressions.

## Key findings (so far)

### 1) Unstable auto-generated IDs (fixed)

Some form primitives generated `id` values using `Math.random()` when `id` was not provided.

Impact:
- Label associations (`<label htmlFor=...>`) can break across re-renders.
- `aria-describedby` links can drift.
- In React 18 + hydration/StrictMode, non-deterministic IDs can cause mismatches.

Fix:
- `Input`, `TextArea`, and `Select` now use React 18 `useId()` to generate stable IDs when no `id` is provided.

Files:
- `src/components/ui/Input/Input.tsx`
- `src/components/ui/TextArea/TextArea.tsx`
- `src/components/ui/Select/Select.tsx`

### 2) Audit signals collected

Initial scans focused on:
- Accessibility patterns (roles, aria, focus management, traps)
- Code quality markers (`eslint-disable`, `TODO`, `FIXME`, `HACK`)
- Shared primitive hotspots (Input/Modal/Select/TextArea/etc.)

### 3) “No hacks” cleanup (in progress)

- `src/**` currently has no literal `HACK` markers.
- Prefer “self-healing” behavior for recoverable client-side state corruption:
	- Example: corrupted `localStorage` should be treated as recoverable (clear the bad value) and logged at `debug` to avoid test/CI stderr noise.
- Prefer removing hook lint suppressions when possible:
	- Example: initialize URL-derived state on first render instead of using a mount-only effect with `react-hooks/exhaustive-deps` disabled.

## Next targets

1. Confirm all form controls expose/accept `id` and connect helper/error text via `aria-describedby` consistently.
2. Standardize “status” API across primitives (`default|error|success|warning`) and ensure `aria-invalid` is correct.
3. Review keyboard + focus behavior in `Modal`, `Select`, `Dropdown`, `Tooltip` for edge cases (escape, tab trap, focus restore).
4. Reduce large-function disables (`max-lines-per-function`, `complexity`) where it’s low-risk to refactor.

## Non-goals

- No visual redesign.
- No new features.
- No behavior changes unless required for correctness/a11y.
