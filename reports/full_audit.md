# BoxCall — Full Audit (Aug 27, 2025)

**Assumed stack & context** (from our ongoing work): Vite, vanilla JS modules, Tailwind CSS → migrating to CSS‑variable theming, Lucide icons, Supabase (Auth, DB, Storage), Netlify/Vercel deploy, file‑based routing in `/pages`, modular folders (`state.js`, `filters.js`, `confidence.js`, `sort.js`, `ui.js`, `csvParser.js`, `prec.js`, theming modules, DevTools, sidebar system). If any of these have changed, the fixes still apply conceptually.

---

## 0) Executive summary

**What’s working well**

- Clear modular intent: separation of concerns across `state`, `filters`, `confidence`, `sort`, `ui`, `csvParser`.
- Thoughtful UX direction: three‑pane layout, Practice/Game modes, always show ≥6 plays, filter precedence.
- Theming vision is strong: user vs team themes, font + color pairing, future dynamic logo extraction.
- Supabase chosen for auth/storage is a solid fit for early product velocity.

**Needs attention**

- **Theme flash & state race conditions** at boot cause visual jitter and route flicker (login/logout).
- **Router hydration + auth session** not sequenced ⇒ spurious 404 flashes and double renders.
- **Filter precedence vs confidence** coupling is still leaky in places; multi‑select filters not fully normalized.
- **CSV parsing/normalization** work happens on main thread; no caching or workers; schema drift risk.
- **Sidebar system** (3‑state) still has width, alignment, and icon sizing inconsistencies.
- **Testing coverage** thin; no happy‑path/e2e guarding core flows (login, upload CSV, pick play, log outcome).
- **Security hardening** (RLS, CSP, secrets handling, role‑based routes) needs to be formalized.

**Catastrophic‑risk class** (fix early)

1. **Auth/session + router race** can put users in broken routes or expose pages without correct guards.
2. **Missing RLS policies / misuse of Supabase keys** can leak team data.
3. **Theme loader loop/fallbacks** can lock app in default theme or cause unusable CLS (layout shift) on slow networks.
4. **CSV trust boundary**: parsing unbounded input on main thread can freeze UI; no schema validation ⇒ downstream logic errors.

---

## 1) Project structure & architecture

**Target structure**

```
/src
  /app              # app bootstrap, router, guards, error boundaries
  /components       # UI atoms/molecules (BaseButton, Icon, Card, Slider, etc.)
  /features         # domain slices (playbook, boxcall, auth, team, theme)
  /features/playbook
    csvParser.js
    filters.js
    confidence.js
    prec.js
    sort.js
    ui.js
    state.js
  /features/theme
    themeController.js
    themeManager.js
    tokens/           # CSS variable tokens (imported once)
  /lib              # supabaseClient, storage, analytics, logger
  /pages            # route views (file‑based, lazy via import.meta.glob)
  /state            # app‑level stores (if any) and cross‑cutting state
  /utils            # helpers (normalize, groupBy, debounce, etc.)
  /devtools         # Dev tools, role switcher, flags
/styles
  base.css
  tokens/theme-*.css
```

**Actions**

- Make `features` the home for vertical slices; avoid cross‑slice imports. UI stays dumb; feature modules own logic.
- Consolidate _render controls_ in `ui.js` (as planned). Keep `sort`/`filters`/`confidence` logic free of DOM.
- Introduce `/app/guards/` (auth, role, team) & `/app/errors/` (ErrorBoundary component + friendly fallbacks).

---

## 2) Boot sequence: kill flicker, fix route flashes, deterministic theming

**Goal**: App mounts **after** (a) we resolve persisted auth session, (b) we compute the initial theme (user→team→default), and (c) we pre‑hydrate critical tokens (fonts/colors) to avoid flash.

**Recipe**

1. **Inline a tiny critical CSS** for `body{visibility:hidden}` and remove it once theme tokens are applied.
2. **Block router mount** until `auth.restore()` and `themeController.loadInitial()` resolve.
3. **Persisted session**: use Supabase `auth.getSession()` on boot; subscribe to changes.
4. **SSR‑less font strategy**: preload woff2 files; apply `font-display: swap` + class toggles to minimize CLS.

**Pseudo‑bootstrap**

```js
// /src/app/bootstrap.js
export async function bootstrapApp({ mount }) {
  // 1) restore auth session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  authState.set(session);

  // 2) load initial theme (user→team→default)
  await themeController.loadInitial({ session });

  // 3) mount the router/app
  mount();
}
```

**Router mount**

```js
// main.js
import { bootstrapApp } from "./app/bootstrap.js";
import { createRouter } from "./app/router.js";

const mount = () => {
  const router = createRouter();
  router.start();
};

bootstrapApp({ mount }).catch((e) => {
  console.error("fatal boot error", e);
  renderFatalError();
});
```

**Theme flash guard**

- Add `data-theme-ready` on `<html>` when tokens applied; CSS shows body only when present.
- Keep _all_ global colors via CSS variables; Tailwind utilities should reference vars in `base.css`.

---

## 3) Auth, roles, and guards (Supabase)

**Must‑haves**

- **RLS policies** locked from day 0: teams table, memberships, playbooks, scripts, themes.
- **Service role key** never in client; use Edge Functions for privileged ops.
- **Route guards**: `requireAuth`, `requireRole([headCoach, coach])`, `requireTeamMembership(teamId)`.

**Example: membership RLS**

```sql
-- enable row level security
alter table public.memberships enable row level security;

-- policy: user can read their memberships
create policy "Read own memberships" on public.memberships
for select using ( auth.uid() = user_id );

-- policy: head coach can update team members
create policy "HC manage team" on public.memberships
for all using (
  exists (
    select 1 from public.memberships m
    where m.team_id = memberships.team_id
      and m.user_id = auth.uid()
      and m.role = 'head_coach'
  )
);
```

**Auth session listener**

- On `onAuthStateChange`, re‑evaluate guards and **soft‑reset** app state (clear caches, reapply theme if scope changes user→team).

---

## 4) CSV pipeline: validation, workers, caching

**Problems**

- Main‑thread parsing can freeze UI on large books.
- Schema drift causes subtle bugs: filters/confidence reading wrong columns.

**Fixes**

1. **Zod (or schema validator)** for CSV rows → normalized object
2. **Web Worker** to parse + map + index (fields, key players, images) off main thread
3. **Persistent cache** (IndexedDB) keyed by file hash + versioned schema

**Worker sketch**

```js
// /features/playbook/csvWorker.js
self.onmessage = async (e) => {
  const { csvText, schemaVersion } = e.data;
  const rows = parseCsv(csvText); // fast-parser library
  const normalized = rows.map(validateRow); // zod.safeParse -> map errors
  const index = buildIndexes(normalized); // by formation, personnel, down, etc.
  postMessage({ ok: true, normalized, index, schemaVersion });
};
```

**Runtime gates**

- If cache hit (hash+schema), load from IDB; else spin worker.
- Surface row‑level validation errors back to UI (badge on file name → hover to see rows/cols).

---

## 5) Filters, precedence, confidence

**Intent** (your spec):

- Default view: **confidence not modified by filters**; always show ≥6 plays.
- Display order: sort by **filter match → precedence → confidence**.
- Multi‑select filters with remove buttons per group; show `matchedKeys` visually on cards.

**Concrete steps**

- Create a `FilterEngine` with pure functions:
  - `applyFilters(plays, activeFilters)` → returns `{matched, reasonMap}`
  - `scorePrecedence(matched, precedenceState)` → stable sort key array
  - `sortPlays(matched, keys)` → uses tuple `[matchCount, precedenceScore, confidence]`

- Ensure **no DOM** inside these; unit test with fixtures.

**Always ≥6 plays**

- After filtering, if `<6`, **backfill** from top confidence plays not filtered in, with a `backfill: true` tag so UI can style the border subtly.

---

## 6) UI & Sidebar system

**Issues seen**

- Icon‑only/collapsed modes mis‑align text; widths inconsistent; toggler jumps.

**Rules**

- Sidebar width constants: `--sb-wide: 280px; --sb-icon: 72px; --sb-collapsed: 0px;` applied on root.
- Use a single **layout grid**; content area derives width from `calc(100vw - var(--sb-current))`.
- Icon component uses Lucide _by name_ with sizing set in `em` relative to line height; keep hitboxes ≥40px.

**BaseButton**

- Variants via `data-variant` + CSS variables; avoid class soup. Disabled/focus/hover tokens in theme.

---

## 7) Theming (CSS variables, tokens)

**Do**

- Keep all theme values in `/styles/tokens/theme-*.css`. Each file defines `:root.theme-KEY { --color-bg: ... }` etc.
- **Single import** of default tokens in `base.css`. Additional theme files are lazy‑loaded by `themeManager` and toggled via `document.documentElement.classList`.
- Fonts loaded from `/assets/fonts` with hashed names; preloaded via `<link rel="preload" as="font" crossorigin>`.

**Don’t**

- Don’t rely on utility classes referencing raw hex; utilities should reference variables (`color: var(--color-text)`).
- Don’t mutate Tailwind config per theme at runtime; keep Tailwind minimal and let CSS vars do the work.

---

## 8) Performance & DX

**Perf wins**

- **Route code‑split** with `import.meta.glob` and `eager: false`.
- **Preload critical routes** after idle via `requestIdleCallback`.
- **Image/diagram lazy‑loading** with IntersectionObserver; set `width/height` to avoid CLS.
- **CSV worker** (above) + memoized selectors; consider **structuredClone** for deep copies off main thread.
- **Use `Intl.Segmenter`** for label truncation to avoid expensive regex.

**DX**

- Husky: `pre-commit` runs `eslint --max-warnings=0`, `prettier --check`, `vitest -u` for changed files.
- GitHub Actions: build, typecheck (if using TS later), run tests, upload artifact; preview deploy for PRs.

---

## 9) Accessibility & UX polish

- Tab order defined; focus outlines visible; `Skip to main` link.
- Reduced motion: guard animations with `@media (prefers-reduced-motion: reduce)`.
- Color contrast ≥ WCAG AA for **every theme**; add automated axe‑core check to CI.
- ARIA for collapsibles (scripts lists, filters), status live‑regions for CSV parse progress.

---

## 10) Testing strategy

**Unit (Vitest)**

- `filters.test.js` — multi‑select behavior, backfill≥6, reason mapping.
- `prec.test.js` — precedence ordering stability.
- `confidence.test.js` — score math with various game contexts.
- `csvParser.test.js` — schema validation, bad rows, dedupe.

**E2E (Playwright)**

- Login → theme apply → dashboard no‑flash.
- Upload CSV → 6+ cards render → expand/collapse → mark “Worked/Explosive/Failure” updates confidence.
- Role guard: player cannot access coach pages.

**Accessibility**

- Playwright + axe (`checkA11y`) for key pages per theme.

---

## 11) Security hardening

- **CSP**: default‑src 'self'; connect‑src your Supabase/analytics; object‑src 'none'; frame‑ancestors 'none'; upgrade‑insecure‑requests.
- **Headers**: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic, geolocation as needed), `Cross-Origin-Opener-Policy: same-origin`.
- **Auth tokens**: rely on Supabase client; never store service keys; secure cookies if you add custom sessions.
- **Rate‑limit** any Cloud/Edge function endpoints; log anomalies.

---

## 12) Analytics & telemetry (privacy‑friendly)

- Minimal event bus: `app_started`, `csv_uploaded`, `play_selected`, `outcome_logged`, `theme_changed`.
- Redact PII; team IDs hashed if logged; sampling 10–20%.

---

## 13) Roadmap

**Quick wins (today–2 days)**

- Implement deterministic **boot sequence** (auth+theme before mount) to kill flashes.
- Add **RLS** for memberships/teams/tables; verify with tests.
- Move CSV parsing to a **Web Worker**; show progress.
- Sidebar constants + CSS variables for widths; tighten icon sizing.

**Near term (1–2 weeks)**

- Build **FilterEngine** with tests; ensure ≥6 plays backfill.
- Add **route guards** + nice Unauthorized/NotFound pages.
- Add **axe-core** a11y checks; Playwright smoke.
- Introduce **IndexedDB cache** for playbooks by hash.

**Longer term (3–6 weeks)**

- Confidence scoring refactor to consume **live context** (down, distance, hash, field loc) and past outcomes.
- Team branding: **theme tokens** saved per team; admin UI to edit; toggle between personal vs team.
- Export “live mode” result CSV and drilldown analytics.

---

## 14) Snippets & patterns

### A) Theme ready gate (no flash)

```html
<!-- index.html -->
<style>
  html:not([data-theme-ready]) body {
    visibility: hidden;
  }
</style>
```

```js
// themeController.js
export async function loadInitial({ session }) {
  const key = await resolveThemeKey(session); // 'modern' | 'athletic' | ...
  await themeManager.apply(key); // loads tokens, sets class
  document.documentElement.setAttribute("data-theme-ready", "");
}
```

### B) Router with guards

```js
// router.js
import { routes } from "./routes";

export function createRouter() {
  const r = new TinyRouter({ routes });
  r.beforeEach(async (to) => {
    if (to.meta?.auth && !authState.get()) return { name: "login" };
    if (to.meta?.role) {
      const ok = await hasRole(to.meta.role);
      if (!ok) return { name: "unauthorized" };
    }
    return true;
  });
  return r;
}
```

### C) Filter engine tuple sort

```js
const tuple = (m) => [m.matchCount, m.precedenceScore, m.confidence];
matched.sort((a,b) => tuple(b) <=> tuple(a)); // write a safe comparator
```

### D) CSV worker hook

```js
// playbookLoader.js
export async function loadPlaybook(file) {
  const hash = await hashFile(file);
  const cached = await idb.get(hash);
  if (cached) return cached;
  const { normalized, index } = await runCsvWorker(file);
  await idb.set(hash, { normalized, index, v: SCHEMA_V });
  return { normalized, index };
}
```

### E) RLS example for playbooks

```sql
alter table public.playbooks enable row level security;
create policy "Team read" on public.playbooks for select using (
  exists (
    select 1 from public.memberships m
    where m.team_id = playbooks.team_id and m.user_id = auth.uid()
  )
);
```

### F) BaseButton via data‑attributes

```css
/* base.css */
button[data-variant="primary"] {
  background: var(--color-accent);
  color: var(--color-onAccent);
}
button[data-variant="ghost"] {
  background: transparent;
  border: 1px solid var(--color-border);
}
button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

```js
// BaseButton.js
export function BaseButton({ variant = "primary", ...props }) {
  const btn = document.createElement("button");
  btn.dataset.variant = variant;
  // ...apply common ARIA/role/disabled handling
  return btn;
}
```

---

## 15) Definition of Done for this audit pass

- No visible route/theme flicker on cold boot or auth transition.
- Guarded routes behave correctly per role/team.
- CSV uploads parse off main thread with progress + validation; backfill≥6 plays works.
- Sidebar stable across 3 states; icons sized consistently.
- Unit + E2E tests green in CI; basic CSP & headers set.

---

### Final note

If you share the current repo/zip, I’ll annotate **specific files/lines** against this checklist and add concrete diffs. Until then, this is the precise blueprint I’ll audit against.
