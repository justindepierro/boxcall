# BoxCall AI Coding Agent Instructions

## Project Context

BoxCall is a professional football coaching platform implementing Brian Billick's game planning methodology. Built with React + TypeScript + Vite + Supabase (PostgreSQL), featuring a design token system, strict quality gates, and comprehensive documentation.

**Target Users**: Football coaches (head coaches, coordinators, assistants) managing playbooks, practice scripts, and game plans.

## Architecture Essentials

### Core Views & Data Flow

Three interconnected coaching workflows:

1. **Playbook View** → Create/edit plays with Fabric.js canvas (formations, routes, assignments)
2. **Practice Script View** → 8-box layout system with automatic duration tracking
3. **Game Plan View** → Billick situational methodology (down/distance, field position, personnel groupings)

Data flow: `plays` table → `practice_scripts` → `game_plans` → `coach_cards` (printable sideline references)

### Database Architecture (Supabase + PostgreSQL)

- **21 core tables** with Row Level Security (RLS) policies
- Team-based data isolation via `team_members` join table
- Trigger-based counting (play_count, situation_count) for performance
- Migration strategy: Timestamped files in `supabase/migrations/` (YYYYMMDDHHMMSS format)
- **CRITICAL**: Never expose service role key client-side; use anon key + RLS only

Key tables: `teams`, `team_members`, `plays`, `playbooks`, `game_plans`, `game_plan_situations`, `game_plan_plays`, `coach_cards`, `practice_scripts`, `team_posts`, `achievements`

### TypeScript Type System

- Database types auto-generated in `src/types/database.ts` (21 tables with Row/Insert/Update variants)
- Type-safe Supabase client in `src/lib/supabase.ts` with dev stub fallback
- Zustand store in `src/app/store.ts` for global state (User, Team, Player, Notification types)

## Design System (MANDATORY)

### Token-First Approach

**ALL styling must use design tokens** - enforced by custom ESLint rules:

- `no-raw-tailwind-colors`: Blocks arbitrary colors (`bg-[#hexcode]`) and raw scales (`bg-gray-500`)
- `no-arbitrary-spacing`: Blocks arbitrary spacing (`w-[24px]` → use `w-spacing-md`)
- `no-arbitrary-typography`: Blocks arbitrary text sizes (`text-[14px]` → use semantic tokens)

### Design Token Hierarchy (Priority Order)

1. **Component tokens** (highest): `btn-primary`, `card-padding`, `input-border` → See `src/styles/tailwind/boxcallTheme.js`
2. **Semantic tokens**: `text-primary`, `bg-surface-muted`, `border-divider`
3. **Brand scales**: `jade-*`, `navy-*`, `neutral-*` (50-900 steps)
4. **Layout tokens**: `spacing-md`, `space-4`, CSS variables (`--space-*`)
5. **Raw Tailwind** (AVOID): Only for approved cases (info states use `blue-*`)

Example: Use `className="btn-primary"` not `bg-jade-600 text-white px-4 py-2`

### Button Component Pattern

See `src/components/ui/Button/Button.tsx` - uses component tokens (`btn-primary`), haptic feedback on click, and focus-ring utility for accessibility.

## Development Workflows

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

- FormationBuilderModal, DiagramEditor preloaded during idle time (2s delay)
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

### Canvas & Diagram Performance Patterns

The **Diagram Editor** (`src/components/playbook/diagram-editor/`) uses Facebook-fast patterns for smooth canvas interactions:

**Optimistic Autosave**:

- Instant "saved" indicator without waiting for server (330x faster: 3.3s→<10ms)
- Non-blocking autosave with 2.5s debounce
- Background sync with silent success, error toast only on failure
- Implemented in `useAutosave.ts` hook

**Throttled Player Movement**:

- 60fps smooth dragging with 16ms throttle
- Prevents excessive Zustand store updates during drag
- Custom throttle utility in `usePixiApp.ts` hook
- Batched position updates for single canvas render

**Error Boundaries**:

- React error boundary wraps DiagramEditor
- Catches Pixi.js canvas crashes gracefully
- Provides retry button and detailed error info (dev mode)
- Prevents entire app from crashing on canvas errors

**Performance Targets**:

- ✅ Autosave: <10ms perceived response (was 3.3s)
- ✅ Player drag: 60fps smooth (was 30-45fps)
- ✅ Canvas render: Batched via throttle
- ✅ Error recovery: Graceful fallback with retry

**Technical Implementation**:

- `useAutosave.ts`: Optimistic instant feedback + background sync
- `usePixiApp.ts`: Throttled movement handler (16ms = 60fps)
- `DiagramEditorErrorBoundary.tsx`: Error boundary for Pixi.js crashes
- Pixi.js v8.5.2: WebGL hardware-accelerated rendering
- Zustand store: Fast, minimal re-renders

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

### Formation Builder Canvas

Playbook visual editor (`src/components/playbook/FormationBuilderModal/`):

- **Interactive field diagram**: Drag-drop player positioning
- **Tabbed interface**: Tab 1 (Quick Config) → Tab 2 (Visual Draw)
- **Personnel integration**: 11, 12, 21, 22 personnel groupings
- **Formation library**: Pre-built formations with directional warnings
- **Export formats**: CSV, PDF via `@react-pdf/renderer`

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
