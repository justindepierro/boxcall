# Render Performance Checklist

Use this checklist for high-traffic pages (Playbook, Game Plans, Team Bulletin, Practice, Roster) and any view with large lists, heavy canvas, or frequent state updates.

## Goals

- Keep interactions <100ms perceived where possible
- Avoid unnecessary re-renders and expensive reconciliation
- Bound the “blast radius” of state changes
- Ensure large lists stay smooth via virtualization

## Baseline Rules

- Prefer **React.memo boundaries** at list-item and section level
- Prefer **selector-based subscriptions** (Zustand/React Query) over whole-store reads
- Keep props stable: pass IDs and primitives, not freshly-created objects/functions
- Avoid synchronous heavy work during typing/dragging

## Quick Triage (5 minutes)

- Add temporary `console.count()` or React DevTools “Highlight updates” to confirm what re-renders
- Identify the top 1–3 components that re-render most often
- Check whether re-renders are caused by:
  - unstable callbacks (`() => ...`) passed to memoized children
  - inline objects/arrays (`{}` / `[]`) used as props
  - store subscriptions without selectors
  - expensive derived computations on every render

## Component Boundaries

- Wrap “leaf” UI components and list rows in `React.memo`
- Extract subtrees that don’t need to re-render into memoized components
- Keep component files <200 lines when possible; split large pages into sections

## Props Stability

- Prefer `useCallback` for handlers passed to memoized children
- Prefer `useMemo` for derived props used by memoized children
- Avoid passing `new Date()`, `Math.random()`, `{} / []`, or freshly-mapped arrays as props unless memoized
- Prefer `id` + lookup inside child over passing full objects when the object shape changes frequently

## State & Subscriptions

- Zustand:
  - Use selector-based hooks (avoid whole-store subscriptions)
  - Avoid calling `.getState()` outside store modules
- React Query:
  - Keep query keys stable and centralized (use the shared `queryKeys`)
  - Avoid bespoke caching and manual cache scans unless absolutely necessary
  - Prefer invalidation and optimistic updates over ad-hoc local caches

## Lists & Rendering Strategy

- Use virtualization for large lists (`react-virtuoso`)
- Avoid rendering hidden content (unmounted tabs/accordions rather than CSS hiding)
- Avoid `Array.map` that creates heavy JSX trees on every keystroke
- Prefer incremental rendering for huge “cards” (split into smaller memoized pieces)

## Event Handling & Scheduling

- Throttle high-frequency updates (dragging, mousemove, resize) to ~16ms for 60fps
- Debounce server writes (autosave) but keep UI optimistic and instant
- Use `requestAnimationFrame` or throttled batching for canvas-like interactions

## Expensive Computation

- Move heavy computation out of render:
  - `useMemo` with correct dependencies
  - precompute server-side or in a selector
  - compute once on data fetch and store in derived state
- Beware “death by small work”: multiple 1–3ms computations in render can add up

## Images, Canvas, and Heavy Modules

- Lazy-load heavy editors/modals and keep them off cold-start routes
- For images:
  - prefer optimized formats and sizes
  - avoid layout shifts (set dimensions)
- For canvas/diagram:
  - batch updates and avoid store writes on every pointer tick
  - keep rendering work out of React when possible

## Common Anti-Patterns

- Passing unstable props into `React.memo` components
- Recomputing filters/sorts on every keystroke without memoization
- Rendering non-virtualized lists of hundreds of rows
- Storing large derived data in component state and re-creating it frequently

## Verification

- React DevTools:
  - “Highlight updates” shows only expected parts updating
- Manual check:
  - typing into search stays responsive
  - scroll stays smooth on long lists
  - opening/closing heavy modals doesn’t block the UI thread

## When to escalate

- If a single user interaction triggers >50 component updates, add boundaries and stabilize props
- If a list grows beyond ~200 rows, add virtualization (or ensure it is already virtualized)
- If a render consistently exceeds ~16ms on common devices, profile and reduce work per frame
