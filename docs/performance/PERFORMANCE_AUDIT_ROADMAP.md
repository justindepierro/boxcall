# Performance Audit & Roadmap

## Goals (Definition of “Blazing Fast”)

**User-perceived speed (mobile-first):**

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

**App interaction targets:**

- Common UI actions update in <100ms perceived time
- List scrolling stays 60fps (no long tasks >50ms during scroll)
- “Cold start” does not load heavy feature bundles unless needed

---

## Current Baseline Snapshot

**Build (prod) baseline**

- Command: `npm run build:analyze`
- Build time: ~21.7s
- Visual report output: `reports/bundle-analysis.html`

**Largest production chunks observed**

- `pdf-core` ~1.49MB (gz ~499KB)
- `react-pdf.browser` ~1.50MB
- `PlaybookPage` ~350KB (gz ~89KB)
- `react-vendor` ~359KB (gz ~89KB)
- `charts` ~362KB (gz ~112KB)
- `editor-core` ~286KB (gz ~57KB)

Notes:

- Large chunks are not necessarily a problem *if they are not on the critical path*.
- The audit focuses on: (1) what loads on first view of common routes, and (2) what causes runtime jank.

---

## What’s Already Strong

- Vite manual chunking is thoughtfully segmented (router/supabase/query/editor/pdf/calendar/etc).
- React Query defaults are tuned to reduce refetching and network chatter.
- PWA runtime caching is segmented by data type (stable vs live vs auth).

---

## Findings (Highest Impact)

### 1) Team Bulletin: expensive rendering + avoidable N+1 network

**Risk:** Team Bulletin can degrade quickly with many posts/comments.

Observed patterns:

- The feed renders announcements with `.map()` (no virtualization).
- Each announcement can create a TipTap editor instance for read-only display (`RichTextDisplay`).
  - This pulls TipTap/ProseMirror code and does per-item editor setup work.
- Each announcement triggers per-item Supabase calls for author avatar loading.
- Each announcement triggers per-item “view tracking” side effects on mount.

**Why this matters:**

- Even if chunks are split, heavy per-item initialization and N+1 queries will hurt INP and scroll performance.

### 2) Background timers/services can run longer than needed

Observed patterns:

- Some services use `setInterval` (e.g., preloading/monitoring). If instantiated and never stopped, they can keep doing work even after leaving a route.

**Why this matters:**

- Mobile devices are sensitive to background JS work (battery, thermals, long tasks, INP).

### 3) Duplicate “web-vitals” integration

Observed patterns:

- `src/telemetry/initWebVitals.ts` is the single integration point for `web-vitals`.
- Dev tooling should read vitals via `getVitalsSnapshot()` (and optional `window.webVitals` back-compat), rather than initializing a second pipeline.

**Why this matters:**

- Duplicate initialization adds complexity and can interfere with clean chunk separation.

---

## Roadmap (Prioritized)

### Now (High impact, low/medium risk)

1) Team Bulletin feed performance pass

- Add virtualization to the announcements feed rendering.
- Remove per-item Supabase avatar queries:
  - Include `avatar_url` in the batched profile fetch inside `AnnouncementsService.getAnnouncements`, or batch-fetch avatars once per page.
- Batch view tracking:
  - Record views for the first visible set of announcements in one call (or dedupe by session/page view).

Success criteria:

- Scrolling with 200+ announcements stays smooth.
- Network calls for initial load do not scale linearly with the number of announcements.

2) Read-only rich text: avoid TipTap instances per item

Options (pick one):

- Best: Store/render precomputed HTML for display (server-side or on write), and sanitize on render.
- Good: Implement a lightweight TipTap-JSON → HTML renderer for the subset of nodes/marks you use.
- Acceptable: Lazy-load TipTap display renderer and only hydrate when content scrolls into view.

Success criteria:

- Team Bulletin route does not eagerly pull `editor-core` unless the user is composing/editing.
- Read-only display does not create a ProseMirror editor per post.

3) Consolidate Web Vitals tracking

- Choose one system of record (telemetry dispatcher vs performance monitor).
- Ensure `web-vitals` loads only in production and is not pulled into the initial bundle unnecessarily.

Success criteria:

- No mixed static + dynamic imports of `web-vitals`.

### Next (High impact, larger effort)

4) Confirm heavy libraries are truly off the critical path

- PDF: ensure `@react-pdf/renderer` is only imported via dynamic import and never from a commonly imported module.
- Calendar/charts/editor: validate only loaded on routes that need them.

Success criteria:

- First load of Dashboard/Team Bulletin does not preload PDF/Calendar/Charts.

5) Route-level performance profiling

- Profile the heaviest real routes (Playbook, Team Bulletin, Practice Planner) using React DevTools Profiler.
- Fix top 3 re-render sources:
  - Stabilize props, reduce context churn, memoize expensive derived data, and avoid inline object/array props in hot lists.

### Later (Ongoing / platform maturity)

6) Add performance gates

- Add bundle budget checks (per-route chunk size caps) and a lightweight Lighthouse run in CI for regressions.
- Add production Web Vitals reporting dashboards (Sentry + web-vitals).

---

## How To Run This Audit (Repeatable)

**Bundle & chunking**

- `npm run build:analyze` → open `reports/bundle-analysis.html`

**Production-like runtime**

- `npm run build && npm run preview` (use Chrome DevTools Performance + Network)

**React render profiling**

- React DevTools Profiler on:
  - Team Bulletin (feed scroll + expand comments)
  - Playbook (search + switch views)
  - Practice Planner (drag/drop, open modals)

---

## Primary Targets (Top 5)

1) Team Bulletin feed: virtualization + remove N+1 queries
2) Read-only rich text: no TipTap editor per item
3) Batch “view tracking” side effects
4) Confirm heavy libs are route-split in practice (PDF/Calendar/Charts/Editor)
5) Add regression gates (bundle + vitals)
