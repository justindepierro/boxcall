# 07. Performance & Web Vitals

(Status: stub)

Focus Areas:

- Bundle splitting (pdf, calendar, playbuilder, team-settings).
- INP/LCP capture & regression gating.
- Memoization & suspense boundaries.

Immediate Tasks:

1. Establish Web Vitals capture util (noop dispatch initially).
2. Record baseline INP/LCP in dev (manual) and store.
3. Identify candidate dynamic imports (pdf export, calendar heavy code).
4. Add performance budget checks to CI (already partially present) – extend to route-level if feasible.

Targets:

- P95 INP < 200ms
- Main non-PDF bundle < 180k (gz)
- Calendar chunk < 120k after split
