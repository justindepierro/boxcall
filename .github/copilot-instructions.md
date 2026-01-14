# BoxCall AI Copilot Instructions

> **For Agent Mode**: See [copilot-agent-instructions.md](./copilot-agent-instructions.md) for comprehensive agent training guide.

## Project Context

BoxCall is a professional football coaching platform implementing Brian Billick's game planning methodology. Built with React + TypeScript + Vite + Supabase (PostgreSQL), featuring a design token system, strict quality gates, and comprehensive documentation.

**Target Users**: Football coaches (head coaches, coordinators, assistants) managing playbooks, practice scripts, and game plans.

**Current Status (January 2026)**: Phase 4 (Core Development) - 75% complete, v1.0 release in ~16 weeks

## Architecture Essentials

### Core Views & Data Flow

Three interconnected coaching workflows:

1. **Playbook View** → Create/edit plays with image uploads (coach-drawn diagrams, formation metadata)
2. **Practice Script View** → 8-box layout system with automatic duration tracking
3. **Game Plan View** → Billick situational methodology (down/distance, field position, personnel groupings)

Data flow: `plays` table → `practice_scripts` → `game_plans` → `coach_cards` (printable sideline references)

### Tech Stack Summary
- **Frontend**: React 18, TypeScript 5.6, Vite 5.4, Tailwind CSS 3.4
- **State**: Zustand (global), React Query (server state, 10min cache)
- **Database**: Supabase PostgreSQL (24 tables, RLS policies)
- **Performance**: 2.83MB bundle (975KB gzipped), <2s load, <100ms response
- **Deployment**: Netlify with PWA support

### Key Systems (Quick Reference)

**Design Token System** (Token-First):
- Priority: Component tokens → Semantic tokens → Brand scales → Layout tokens
- Example: Use `btn-primary` not `bg-jade-600 text-white px-4 py-2`
- Enforced by custom ESLint rules (no raw colors/spacing/typography)

**Database Architecture**:
- 24 tables with Row Level Security (RLS)
- Team-based isolation via `team_members` join
- Auto-generated TypeScript types in `src/types/database.ts`
- Migrations in `supabase/migrations/` (timestamped)

**Unified API Client** (December 2025):
```typescript
import { api } from "@/lib/api";

// All queries use api() client
const { data, error } = await api("plays")
  .select("*")
  .eq("playbook_id", playbookId);
```
- Request deduplication (same query = one network request)
- Auto-retry with exponential backoff (3 retries)
- 30s timeout protection

## Performance Optimizations (December 2025)

**8 Major Optimizations Complete** (see `docs/OPTIMIZATION_COMPLETE_DEC7_2025.md`):

1. ✅ **React Query Cache** (40% fewer API calls)
   - `staleTime: 10min`, `gcTime: 30min`
   - `refetchOnWindowFocus: false`

2. ✅ **Vendor Code Splitting** (20% faster loads)
   - 15 optimized chunks: `react-vendor`, `supabase`, `query-client`, `pdf-core`, etc.
   - Better browser caching

3. ✅ **PWA Enhancement** (Smart caching)
   - Stable data: 15min cache (plays, playbooks)
   - Live data: 2min cache (sessions)
   - Auth: Never cache

4. ✅ **Database Indexes** (50-70% query speedup)
   - 19 selective indexes across 9 tables
   - See `supabase/migrations/20251207110836_performance_indexes.sql`

5. ✅ **Image Optimization**
   - Auto-resize to 1200x800px
   - 85% quality compression
   - WebP generation

6. ✅ **Optimistic UI** (Facebook-fast)
   - <50ms perceived response
   - Playbook, Game Plans, Team Bulletin
   - Instant feedback with background sync

7. ✅ **Preload Heavy Modals**
   - FormationBuilderModal, GamePlanModal preloaded during idle (2s delay)
   - <100ms modal open time

8. ✅ **Virtual Scrolling**
   - `react-virtuoso` for 200+ items
   - PlayGrid component

**Performance Targets**:
- Page load: <2s initial, <1s cached
- API response: <100ms perceived (optimistic UI)
- Bundle: 2.83MB (975KB gzipped) - target <1.5MB

## Design System (MANDATORY)

### Token-First Approach

**ALL styling must use design tokens** - enforced by custom ESLint rules:

- `no-raw-tailwind-colors`: Blocks arbitrary colors (`bg-[#hexcode]`) and raw scales (`bg-gray-500`)
- `no-arbitrary-spacing`: Blocks arbitrary spacing (`w-[24px]` → use `w-spacing-md`)
- `no-arbitrary-typography`: Blocks arbitrary text sizes (`text-[14px]` → use semantic tokens)

### Design Token Hierarchy (Priority Order)

1. **Component tokens** (highest): `btn-primary`, `card-padding`, `input-border`
2. **Semantic tokens**: `text-primary`, `bg-surface-muted`, `border-divider`
3. **Brand scales**: `jade-*`, `navy-*`, `neutral-*` (50-900 steps)
4. **Layout tokens**: `spacing-md`, `space-4`, CSS variables (`--space-*`)
5. **Raw Tailwind** (AVOID): Only for approved cases (info states use `blue-*`)

Example: Use `className="btn-primary"` not `bg-jade-600 text-white px-4 py-2`

### Button Component Pattern

See `src/components/ui/Button/Button.tsx` - uses component tokens (`btn-primary`), haptic feedback on click, and focus-ring utility for accessibility.

## Key Systems & Patterns

### 1. Unified API Client (December 2025)

**Best Practice**: Use `api()` client for all Supabase queries (see `src/lib/api/client.ts`).

```typescript
import { api } from "@/lib/api";

// Simple query
const { data, error } = await api("plays")
  .select("*")
  .eq("playbook_id", playbookId);

// Parallel queries (deduplicated)
const [plays, formations] = await Promise.all([
  api("plays").select("*").in("playbook_id", ids),
  api("formations").select("*").in("playbook_id", ids),
]);
```

**Features**:
- Request deduplication (same query = one network request)
- Automatic retry with exponential backoff (3 retries)
- 30s timeout protection
- Auth token sync (automatic)

**Files**: `src/lib/api/client.ts`, `docs/architecture/API_ARCHITECTURE_DEC9_2025.md`

### 2. React Query Configuration

**Cache Strategy** (Optimized December 2025):
- `staleTime: 10min` (data considered fresh)
- `gcTime: 30min` (cache lifetime)
- `refetchOnWindowFocus: false` (use cached data)
- **Result**: 40% fewer API calls

**Files**: `src/app/queryClient.ts`, `src/lib/queryClient.ts`

### 3. Optimistic UI Pattern (Facebook-Fast)

**Target**: <50ms perceived response time

```typescript
// 1. Instant UI update
setOptimisticData(newData);

// 2. Background server sync
try {
  const result = await api("table").insert(newData);
  setData(result);
} catch (error) {
  // 3. Automatic rollback on error
  setData(originalData);
  toast.error("Failed to save");
}
```

**Implemented In**: Playbook (play saves), Game Plans (CRUD), Team Bulletin (reactions/comments)

### 4. Real-time Subscriptions

```typescript
useEffect(() => {
  const channel = supabaseClient
    .channel("my_channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "my_table" }, handleChange)
    .subscribe();

  // CRITICAL: Always clean up
  return () => {
    supabaseClient.removeChannel(channel);
  };
}, []);
```

**Used In**: Team Bulletin (announcements, reactions, comments)

### Initial Environment Setup

1. Copy `.env.example` to `.env` in project root
2. **Required variables**:
   - `VITE_SUPABASE_URL` - Supabase project URL (format: `https://PROJECT_ID.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` - Public anon key from Supabase project settings
3. **Optional but recommended**:
   - `VITE_ENABLE_PWA=false` - Enable service worker (set to `true` for production)
   - `VITE_SENTRY_DSN` - Error tracking (production only)
   - `VITE_DEBUG_PERFORMANCE=true` - Enable performance logging (dev only)
4. **Dev stub fallback**: App will use mock Supabase client if env vars missing (dev only)

### Quality Gates (Run Before Commits)

```bash
npm run type-check    # TypeScript strict mode, ~10s
npm run lint          # ESLint with design token rules, max 200 warnings allowed
npm run test          # Vitest unit tests
npm run validate      # Combined: type-check + lint + test
```

### Database Operations

Use CLI tools in `scripts/cli/`:

```bash
npm run db:status          # Check connection
npm run db:migrate:easy    # Copy migration SQL to clipboard, open Supabase dashboard
npm run db:sql             # Open SQL editor directly
```

**Migration workflow**: Create timestamped file → Test in dashboard → Commit to `supabase/migrations/` → Apply via CLI

### Development Server

- Port 5173 (auto-opens browser)
- Strict TypeScript watch task runs on folder open (background)
- HMR overlay shows errors
- Dev stub fallback if `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` missing

### Testing Strategy

- **Vitest** for unit/component tests (jsdom environment)
- **Playwright** for E2E tests
- Test file pattern: `*.test.tsx` (excluded from lint via ESLint config)
- Storybook for component documentation (port 6006)

## Code Conventions

### File Organization

```
src/
├── components/ui/       # Design system components (Button, Input, Card)
├── features/           # Feature modules (defense/, profile/)
├── services/           # Business logic + API clients
├── hooks/              # Custom React hooks (useSEO, usePractice)
├── design-system/      # Token types (types.ts, utils.ts)
├── lib/                # Third-party integrations (supabase.ts)
└── types/              # TypeScript types (database.ts)
```

### Path Aliases (vite.config.ts + tsconfig.app.json)

Use `@` prefix for clean imports:

- `@components/ui/Button`
- `@design-system/types`
- `@services/pdf`
- `@hooks/useSEO`

### Commit Convention

Conventional commits: `feat(scope): summary`, `fix(scope): summary`, `docs(scope): summary`, `chore(scope): summary`

## Documentation Standards

**Hard limit: ≤300 lines per Markdown file** (enforced by `npm run docs:validate`)

- Single H1 on first non-empty line
- Long-form reference files need `<!-- allow-empty -->` marker at top
- Documentation organized by topic (not date/status) in `docs/`

Key docs:

- `docs/ARCHITECTURE.md` - System design
- `docs/PROJECT_OVERVIEW.md` - Vision, roadmap, status
- `docs/database/DATABASE_INTEGRATION.md` - Schema details
- `CONTRIBUTING.md` - Commit conventions, PR checklist

## Project-Specific Patterns

### Playbook Performance Patterns

The **Playbook page** (`src/pages/PlaybookPage.tsx`) uses Facebook-fast performance patterns:

**Optimistic Updates**:

- Play saves show instant feedback with background server sync
- `setOptimisticPlays` for immediate UI updates
- Error handling with automatic rollback
- `toast.success` shown before server confirmation

**Instant Search**:

- No debouncing on search input (array filtering <10ms for 200 plays)
- Existing memoization prevents unnecessary re-renders
- Direct use of `state.searchQuery` instead of `useDebouncedValue`

**Preload Heavy Modals**:

- FormationBuilderModal preloaded during idle time (2s delay)
- Modals cached by browser for instant open
- Silent failure handling (loads on-demand if preload fails)

**Performance Targets**:

- ✅ Save play: <50ms perceived response
- ✅ Search: Instant (<10ms filter time)
- ✅ Modal open: <100ms (preloaded)

### Game Plans Performance Patterns

The **Game Plans page** (`src/pages/GamePlansPage.tsx`) uses the same Facebook-fast patterns:

**Optimistic Updates**:

- Create/update game plans show instant feedback (10x faster: 800ms→<50ms)
- Duplicate plans appear instantly (16x faster: 800ms→<50ms)
- Archive/delete actions instant (12x faster: 600ms→<50ms)
- Temporary IDs for new items, replaced after server confirms
- Automatic rollback on error with original state restoration

**Preload Heavy Modals**:

- GamePlanModal, ImportGamePlansModal preloaded during idle time (2s delay)
- Modals cached for instant open
- Silent failure handling (loads on-demand if preload fails)

**Performance Targets**:

- ✅ Create/Update: <50ms perceived response (was 800ms)
- ✅ Duplicate: <50ms perceived response (was 800ms)
- ✅ Archive/Delete: <50ms perceived response (was 600ms)
- ✅ Modal open: <100ms (preloaded)

### BoxCall Live Session Tracking

The **BoxCall page** (`src/pages/BoxCall.tsx`) is a coach-only feature for live/retroactive session tracking:

- **Live practice mode**: Real-time rep counting during practice sessions
- **Live game mode**: Situational play tracking during games
- **Retroactive mode**: Post-session execution logging
- Integration: Links to practice scripts and game plans for session selection
- Future: ExecutionTrackingService for session analytics

### Team Bulletin Social Hub

The **Team Bulletin** (`src/pages/TeamBulletin.tsx`) is the social center of BoxCall - "Facebook for football teams":

**Core Features**:

- **Rich announcements** with TipTap editor (bold, italic, lists, links, hashtags)
- **8-emoji reactions**: like, love, fire, clap, celebrate, football, target, hundred
- **Real-time subscriptions**: Supabase channels for instant updates (INSERT/UPDATE on announcements, reactions, comments)
- **Notification system**: Bell icon with @mention notifications, 30-second polling
- **Live activity stats**: "X new posts today", "X people online now" (green pulse), auto-refresh every 30s
- **"New Posts Available" banner**: Blue banner appears when new content arrives via real-time subscription

**Technical Implementation**:

- `useTeamActivity` hook: Real-time team stats from `team_announcements` and `team_members` tables
- `useAnnouncementsRealtime` hook: Supabase real-time subscriptions with **tiered debouncing** (100ms for reactions/comments, 300ms for announcements)
- `ReactionButton` component: **Optimistic UI** - instant visual feedback, background server sync, automatic rollback on error
- `AnnouncementSkeleton`: Facebook-style skeleton screens for perceived speed (replaces spinners)
- `NotificationBell`: Unread count badge, dropdown with mark-as-read/delete actions
- RLS policies: Team-based isolation via `team_members` join

**Performance Patterns (See `docs/SOCIAL_FEATURES_FACEBOOK_FAST_OCT25_2025.md`)**:

- ✅ **Optimistic UI**: Click reaction → instant update → background server sync → revert only on error
- ✅ **Tiered debouncing**: 100ms for social interactions (reactions, comments), 300ms for content updates
- ✅ **Skeleton screens**: Show feed structure immediately instead of spinners
- ✅ **Memoization**: All social components wrapped in React.memo with shallow comparison
- 🎯 **Target**: <100ms perceived response time for all social interactions

**Social Tables** (see `supabase/migrations/20251106*`):

- `team_announcements` - Rich text posts with pinning, hashtags, metadata
- `announcement_reactions` - 8 emoji types with user tracking
- `announcement_comments` - Threaded discussions with TipTap content
- `notifications` - @mention alerts (4 types: mention, comment_reply, reaction, announcement)
- `mentions` - Track @username references in posts/comments

### Practice Script 8-Box System

Practice planning with hierarchical time blocks (`src/components/practice/`):

- **8-box layout**: Visual grid for practice organization (modular refactor from 2732-line monolith)
- **Two modes**: Regular (drag-drop blocks) vs. Scaffold (timeline allocation)
- **Duration tracking**: Auto-calculate total time, progress bars, over/under indicators
- **Group management**: Assign position groups (offense, defense, special teams) to time blocks
- **Role-based access**: Head coach sees all groups; position coaches see assigned groups only
- **Components**: `PracticeHeader`, `TimeSummary`, `TimelineAllocation`, `PracticeBlocksList` (see `README.md`)

### Formation Builder Panel

Playbook metadata editor (`src/components/formations/FormationBuilderPanel.tsx`):

- **Formation metadata**: Personnel groupings, formation categories, tags
- **Tabbed interface**: Details → Diagnostic → Review tabs
- **Personnel integration**: 11, 12, 21, 22 personnel groupings
- **Formation library**: Pre-built formations with directional warnings
- **Note**: No visual canvas drawing - coaches upload their own diagram images via `PlayImageUpload`

### Custom ESLint Rules

Located in `eslint-rules/`:

- `no-raw-tailwind-colors.js` - Enforces semantic tokens with auto-fix suggestions
- `no-arbitrary-spacing.js` - Prevents hardcoded spacing
- `no-arbitrary-typography.js` - Prevents hardcoded font sizes

Imported in `eslint.config.js` and merged as `boxcallDesignRules`

### Brian Billick Game Planning

Situational categorization system:

- Down & distance: "1st & 10", "3rd & Short", etc.
- Field position: "Red Zone", "Goal Line", "Plus Territory"
- Priority-based play assignments (1-5 scale)
- Personnel groupings: "11" (1 RB, 1 TE), "12" (1 RB, 2 TE), etc.
- Coach cards for sideline reference (printable PDFs via `@react-pdf/renderer`)

### Haptic Feedback

All interactive buttons use `triggerHapticFeedback()` from `src/lib/hapticFeedback.ts` for mobile UX

### Service Worker / PWA

Optional PWA mode via `VITE_ENABLE_PWA=true` environment variable

- Workbox for caching strategy
- Offline fallback for Supabase API calls
- 3MB max cache file size

## Common Tasks

### Adding a New Database Table

1. Create migration in `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Add RLS policies (team-based isolation pattern)
3. Update `src/types/database.ts` with Row/Insert/Update types
4. Test via `npm run db:migrate:easy`

### Creating a New Component

1. Follow Button pattern: `src/components/ui/ComponentName/ComponentName.tsx`
2. Use component tokens first, semantic tokens second
3. Add haptic feedback for interactive elements
4. Create `.types.ts` file for TypeScript interfaces
5. Add Storybook story (excluded from lint)

### Debugging Supabase Connection

1. Check env vars: `console.log(import.meta.env.VITE_SUPABASE_URL)`
2. Run `npm run db:status` to verify connection
3. Dev stub fallback logs: "Using dev Supabase stub" warning in console
4. RLS policy issues: Check `team_members` join for user's team access

## Critical "Gotchas"

1. **Never use raw Tailwind colors** - ESLint will block but may miss edge cases
2. **Service role key security** - Only in server-side scripts, never `src/`
3. **Migration ordering** - Timestamps must be sequential to avoid conflicts
4. **Team isolation** - All queries must filter by team_id via RLS or explicit WHERE
5. **Zustand store side effects** - Listed in package.json `sideEffects` array for tree-shaking
6. **Storybook files** - Excluded from lint but still type-checked
7. **Real-time subscriptions** - Always clean up Supabase channels in useEffect return
8. **Performance critical** - App MUST feel fast: <2s page load, <100ms API response, optimize all data fetching
9. **Optimistic UI pattern** - Social features use instant feedback (reactions, comments) with background server sync
10. **Tiered debouncing** - 100ms for social interactions, 300ms for content updates
11. **Skeleton screens > spinners** - Use Facebook-style skeleton loading states for better perceived performance

## CI/CD & Deployment

### Netlify Configuration (`netlify.toml`)

- **Build command**: `npm run build` (TypeScript + Vite production build)
- **Publish directory**: `dist/`
- **Node version**: 20
- **Functions**: Optional Netlify Functions in `netlify/functions/`

### Security Headers (Applied Automatically)

- **CSP**: Restricts script/style sources, allows Supabase + Sentry domains
- **HSTS**: Strict-Transport-Security with preload
- **Frame protection**: X-Frame-Options DENY, frame-ancestors none
- **XSS protection**: X-XSS-Protection enabled
- **CORS**: Cross-Origin policies set to same-origin

### Cache Strategy

- **Static assets**: `Cache-Control: public, max-age=31536000, immutable`
- **HTML files**: `Cache-Control: public, max-age=0, must-revalidate`
- **Service worker**: `Cache-Control: public, max-age=0, must-revalidate`
- **Manifest**: `Cache-Control: public, max-age=86400`

### Environment Variables (Netlify Dashboard)

Must configure in Netlify UI (not in repo):

- `VITE_SUPABASE_URL` - Production Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Production anon key (safe for client-side)
- `VITE_SENTRY_DSN` - Error tracking (optional)
- `VITE_ENABLE_PWA=true` - Enable service worker caching
- `VITE_ENVIRONMENT=production` - Enables production optimizations

### Deployment Workflow

1. Push to `main` branch → Netlify auto-deploys
2. **Pre-deploy checks**: `npm run validate` runs type-check + lint + tests
3. **Build output**: 41 optimized chunks, 2.83MB total (975KB gzipped)
4. **Database migrations**: Apply manually via `npm run db:migrate:easy` before deploy
5. **Rollback**: Use Netlify dashboard to revert to previous deploy

### Performance Monitoring

- **Bundle analysis**: `npm run analyze` generates visualizer report
- **Sentry**: Production error tracking with session replays
- **Custom metrics**: `VITE_DEBUG_PERFORMANCE=true` logs Web Vitals in dev

## Success Metrics

- **Performance**: <2s page load, <100ms API response
- **Quality**: 95%+ test coverage, ≤200 ESLint warnings (goal: 0)
- **Accessibility**: WCAG 2.1 AA compliance, focus-ring utility on all interactive elements
- **Bundle**: Currently 2.83MB total (975KB gzipped), 41 optimized chunks
- **Build**: 11.28s average (December 2025 optimization sprint)
- **Database**: 19 performance indexes across 9 tables (50-70% query speedup)
- **PWA**: Enabled in production with smart caching strategies

## Performance Optimization History

**December 2025 Sprint** (see `docs/OPTIMIZATION_COMPLETE_DEC7_2025.md`):

1. ✅ React Query cache optimization (5min→10min staleTime, disabled aggressive refetch)
2. ✅ PDF lazy loading (1.5MB separate chunk, already optimized)
3. ✅ TypeScript automation (`npm run db:types` script)
4. ✅ Vendor code splitting (15 optimized chunks: react-vendor, supabase, charts, pdf-core, etc)
5. ✅ Image optimization (vite-plugin-imagemin with WebP generation)
6. ✅ PWA enhancement (workbox caching: stable 15min, live 2min, auth never)
7. ✅ Virtual scrolling (react-virtuoso in PlayGrid, already optimized)
8. ✅ Database indexes (19 indexes: plays, playbooks, game_plans, team_posts, formations, etc)

**Key Files:**

- `src/app/queryClient.ts` - React Query config
- `vite.config.ts` - Build optimization, vendor splitting, PWA
- `supabase/migrations/20251207110836_performance_indexes.sql` - Database indexes
- `NETLIFY_PWA_SETUP.md` - PWA deployment guide
