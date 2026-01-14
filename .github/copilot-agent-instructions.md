# BoxCall AI Agent Instructions (January 2026)

## 🎯 Agent Mode Purpose & Goals

You are an elite AI coding agent specialized in the BoxCall football coaching platform. Your mission is to deliver production-ready code with professional quality, Facebook-fast performance, and coach-friendly UX.

**Core Competencies:**
- Full-stack TypeScript/React development
- Supabase/PostgreSQL database architecture
- Performance optimization (React Query, virtual scrolling, vendor splitting)
- Design system enforcement (token-first approach)
- Real-time collaboration features
- PWA/offline-first patterns

## 🏈 Project Context

**BoxCall** is a professional football coaching platform implementing Brian Billick's game planning methodology. Built with **React + TypeScript + Vite + Supabase (PostgreSQL)**, featuring a design token system, strict quality gates, and comprehensive documentation.

**Target Users**: Football coaches (head coaches, coordinators, assistants) managing playbooks, practice scripts, and game plans.

**Current Status (January 2026)**:
- ✅ Phase 4 (Core Development) - 75% complete
- ✅ 8 major performance optimizations complete (Dec 2025)
- ✅ Design system at 99% token coverage
- ✅ Social features (Team Bulletin) with real-time subscriptions
- ✅ Advanced analytics (Phase 13-14) with confidence tracking
- 🎯 Target: v1.0 release in ~16 weeks

## 📊 Key Metrics & Standards

**Performance Targets (MANDATORY)**:
- Page load: <2s initial, <1s cached
- API response: <100ms perceived (optimistic UI)
- Bundle size: Currently 2.83MB (975KB gzipped) - target <1.5MB
- Test coverage: 85%+ (current: ~70%)
- ESLint warnings: ≤600 (goal: 0)

**Quality Standards**:
- Zero TypeScript errors (strict mode enabled)
- WCAG 2.1 AA accessibility compliance
- Focus-ring utility on all interactive elements
- Haptic feedback for mobile interactions
- Semantic HTML with proper ARIA labels

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript 5.6, Vite 5.4
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **State**: Zustand (global), React Query (server state)
- **Database**: Supabase (PostgreSQL with RLS)
- **Deployment**: Netlify with PWA support
- **Testing**: Vitest, Playwright, Storybook

### Core Systems (Must Know)

#### 1. Design Token System (Token-First Approach)
**CRITICAL**: All styling MUST use design tokens - enforced by custom ESLint rules.

**Token Hierarchy (Priority Order)**:
1. **Component tokens** (highest): `btn-primary`, `card-padding`, `input-border`
2. **Semantic tokens**: `text-primary`, `bg-surface-muted`, `border-divider`
3. **Brand scales**: `jade-*`, `navy-*`, `neutral-*` (50-900)
4. **Layout tokens**: `spacing-md`, `space-4`, CSS variables (`--space-*`)
5. **Raw Tailwind** (AVOID): Only for approved cases (info states use `blue-*`)

**Example**: Use `className="btn-primary"` not `bg-jade-600 text-white px-4 py-2`

**Files**:
- `src/styles/tailwind/boxcallTheme.js` - Component tokens
- `eslint-rules/no-raw-tailwind-colors.js` - Enforcement
- `docs/DESIGN_SYSTEM_REFERENCE.md` - Full reference

#### 2. Database Architecture (Supabase + PostgreSQL)
- **24 tables** with Row Level Security (RLS) policies
- Team-based data isolation via `team_members` join table
- Trigger-based counting (play_count, situation_count)
- Migration strategy: Timestamped files in `supabase/migrations/`

**Key Tables**:
- `teams`, `team_members` - Team management
- `plays`, `playbooks`, `formations` - Playbook system
- `game_plans`, `game_plan_situations`, `game_plan_plays` - Billick methodology
- `practice_scripts`, `practice_script_blocks` - 8-box practice system
- `team_announcements`, `announcement_reactions`, `announcement_comments` - Social features
- `play_executions`, `practice_sessions`, `game_sessions` - Analytics tracking

**Database Files**:
- `database/schema.sql` - Actual SQL schema
- `docs/database/COMPLETE_SCHEMA_REFERENCE.md` - Complete reference
- `src/types/database.ts` - Auto-generated TypeScript types

#### 3. Unified API Architecture (December 2025)
**Best Practice**: Use `api()` client for all Supabase queries.

```typescript
import { api } from "@/lib/api";

// Simple query
const { data, error } = await api("plays")
  .select("*")
  .eq("playbook_id", playbookId)
  .order("created_at", { ascending: false });

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

**Files**:
- `src/lib/api/client.ts` - Core API client
- `src/lib/api/hooks.ts` - React Query hooks
- `docs/architecture/API_ARCHITECTURE_DEC9_2025.md` - Full guide

#### 4. React Query Configuration
**Cache Strategy** (Optimized December 2025):
- `staleTime: 10min` (data considered fresh)
- `gcTime: 30min` (cache lifetime)
- `refetchOnWindowFocus: false` (use cached data)
- **Result**: 40% fewer API calls

**Files**:
- `src/app/queryClient.ts` - Query client config
- `src/lib/queryClient.ts` - Formation-specific cache utilities

#### 5. State Management
**Zustand Stores** (Global State):
- `src/app/auth-store.ts` - Authentication state
- `src/stores/uiStore.ts` - UI preferences
- `src/stores/activeTeamStore.ts` - Active team context
- `src/stores/dashboard/store.ts` - Dashboard customization

**React Query** (Server State):
- All server data via React Query hooks
- No local state for server data (use query cache)

## 🚀 Performance Optimizations (December 2025)

### Completed Optimizations (Agent Should Know)

#### 1. React Query Cache (40% fewer API calls)
```typescript
// Default settings
staleTime: 10 * 60 * 1000,  // 10 minutes
gcTime: 30 * 60 * 1000,     // 30 minutes
refetchOnWindowFocus: false,
```

#### 2. Vendor Code Splitting (20% faster loads)
15 optimized chunks: `react-vendor`, `supabase`, `query-client`, `zustand`, `pdf-core`, `calendar-core`, `charts`, etc.

**File**: `vite.config.ts` - `manualChunks` configuration

#### 3. PWA Enhancement (Smart Caching)
- **Stable data**: 15min cache (plays, playbooks, formations)
- **Live data**: 2min cache (practice sessions, game sessions)
- **Auth**: Never cache (user state)

**File**: `vite.config.ts` - `VitePWA` plugin

#### 4. Image Optimization
- Auto-resize to max 1200x800px
- 85% quality compression
- WebP generation via `vite-plugin-imagemin`

#### 5. Database Indexes (50-70% query speedup)
19 selective indexes across 9 tables:
- `plays` (playbook_id, team_id, play_type, formation_id)
- `playbooks` (team_id)
- `game_plans` (team_id, opponent_name)
- `team_announcements` (team_id, created_at)
- `formations` (playbook_id, team_id)

**File**: `supabase/migrations/20251207110836_performance_indexes.sql`

#### 6. Optimistic UI Pattern (Facebook-Fast)
**Target**: <50ms perceived response time

**Pattern**:
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

**Implemented In**:
- Playbook page (play saves)
- Game Plans page (create/update/duplicate/delete)
- Team Bulletin (reactions, comments, posts)

#### 7. Preload Heavy Modals
```typescript
// Preload during idle time (2s delay)
useEffect(() => {
  const timer = setTimeout(() => {
    import("./FormationBuilderModal").catch(() => {});
  }, 2000);
  return () => clearTimeout(timer);
}, []);
```

**Preloaded**:
- FormationBuilderModal
- GamePlanModal
- ImportGamePlansModal

#### 8. Virtual Scrolling
**Library**: `react-virtuoso`
**Usage**: PlayGrid component for 200+ plays

### Performance Best Practices (Agent Must Follow)

1. **Use Optimistic UI** for all write operations
2. **Preload heavy modals** during idle time
3. **No debouncing on search** (array filtering <10ms for 200 items)
4. **Memoize expensive components** with `React.memo`
5. **Use semantic search** before showing spinners (perceived speed)
6. **Parallel queries** over sequential (use `Promise.all`)
7. **Skeleton screens > spinners** (Facebook pattern)

## 🎨 Design System Enforcement

### Custom ESLint Rules (MANDATORY)
Located in `eslint-rules/`:

1. **no-raw-tailwind-colors.js** - Blocks arbitrary colors (`bg-[#hex]`, `bg-gray-500`)
2. **no-arbitrary-spacing.js** - Blocks arbitrary spacing (`w-[24px]`)
3. **no-arbitrary-typography.js** - Blocks arbitrary text sizes (`text-[14px]`)
4. **no-direct-fetch-outside-services.js** - Enforces `api()` usage
5. **no-supabase-from-outside-dal.js** - Blocks direct Supabase imports
6. **no-zustand-store-hook-without-selector.js** - Enforces shallow comparison

### Button Component Pattern (Reference)
```tsx
// src/components/ui/Button/Button.tsx
import { triggerHapticFeedback } from "@/lib/hapticFeedback";

export const Button: React.FC<ButtonProps> = ({ onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent) => {
    triggerHapticFeedback();
    onClick?.(e);
  };

  return (
    <button
      className="btn-primary focus-ring" // Component tokens + utility
      onClick={handleClick}
      {...props}
    />
  );
};
```

**Key Points**:
- Use component tokens (`btn-primary`)
- Add haptic feedback for mobile
- Include `focus-ring` utility for accessibility

## 🏈 Feature-Specific Patterns

### 1. Playbook System
**Files**:
- `src/pages/PlaybookPage.tsx` - Main playbook view
- `src/components/playbook/` - Playbook components
- `src/services/playsService.ts` - Play CRUD operations

**Optimizations**:
- Optimistic UI for play saves (<50ms)
- Instant search (no debouncing)
- Virtual scrolling for 200+ plays
- Preloaded FormationBuilderModal

### 2. Practice Script (8-Box System)
**Files**:
- `src/components/practice/` - Practice components
- `src/services/practiceService.ts` - Practice operations
- `docs/features/practice/` - Practice documentation

**Features**:
- 8-box visual layout (modular refactor from 2732-line monolith)
- Two modes: Regular (drag-drop) vs. Scaffold (timeline)
- Duration tracking with progress bars
- Group management (offense, defense, special teams)
- Role-based access (head coach vs. position coaches)

### 3. Game Planning (Billick Methodology)
**Files**:
- `src/pages/GamePlansPage.tsx` - Game plan management
- `src/components/game-plans/` - Game plan components
- `src/services/gamePlanService.ts` - Game plan operations

**Features**:
- Situational categorization (down/distance, field position)
- Personnel groupings (11, 12, 21, 22)
- Priority-based play assignments (1-5 scale)
- Coach cards (printable PDFs via `@react-pdf/renderer`)

**Optimizations**:
- Optimistic UI (create/update/duplicate/delete <50ms)
- Preloaded GamePlanModal

### 4. Team Bulletin (Social Hub)
**Files**:
- `src/pages/TeamBulletin.tsx` - Main bulletin view
- `src/components/team-dashboard/` - Bulletin components
- `src/services/teamAnnouncementsService.ts` - Announcements

**Features**:
- Rich text editor (TipTap) with inline images
- 8-emoji reactions (like, love, fire, clap, celebrate, football, target, hundred)
- Real-time subscriptions (Supabase channels)
- Notification system (@mentions)
- Read receipts with analytics

**Performance**:
- Optimistic UI for reactions/comments (<100ms)
- Tiered debouncing (100ms social, 300ms content)
- Skeleton screens (Facebook pattern)
- React.memo on all social components

**Real-time Subscriptions**:
```typescript
// Always clean up in useEffect return
useEffect(() => {
  const channel = supabaseClient
    .channel("announcements")
    .on("postgres_changes", { event: "*", schema: "public", table: "team_announcements" }, handleChange)
    .subscribe();

  return () => {
    supabaseClient.removeChannel(channel);
  };
}, []);
```

### 5. Analytics System (Phase 13-14)
**Files**:
- `src/services/executionTrackingService.ts` - Execution tracking
- `src/services/analytics/SessionAnalyticsService.ts` - Session analytics
- `src/components/analytics/` - Analytics components

**Features**:
- Coverage-based intelligence (Cover 0-6, Man, Zone, Blitz)
- Hash preference analysis (Left/Middle/Right)
- Situational recommendations (context-aware)
- Play success heatmap (8 field zones)
- Confidence trend charts (time-series analysis)
- Formation effectiveness tracking

**Charts**: Recharts library (bar, pie, line charts)

### 6. BoxCall Live (Session Tracking)
**Files**:
- `src/pages/BoxCall.tsx` - Main session view
- `src/hooks/usePracticeSession.ts` - Practice session logic
- `src/hooks/useGameSession.ts` - Game session logic

**Features**:
- Live practice mode (real-time rep counting)
- Live game mode (situational play tracking)
- Retroactive mode (post-session logging)
- Integration with practice scripts and game plans

## 🛠️ Development Workflows

### Initial Setup
1. Copy `.env.example` to `.env`
2. Set required variables:
   - `VITE_SUPABASE_URL` - Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Public anon key
3. Optional but recommended:
   - `VITE_ENABLE_PWA=false` (dev), `true` (production)
   - `VITE_DEBUG_PERFORMANCE=true` (dev only)

### Quality Gates (Run Before Commits)
```bash
npm run type-check    # TypeScript strict mode
npm run lint          # ESLint (max 600 warnings)
npm run test          # Vitest unit tests
npm run validate      # All three combined
```

### Database Operations
**Use CLI tools in `scripts/cli/`**:

```bash
npm run db:status          # Check connection
npm run db:migrate:easy    # Copy SQL, open dashboard
npm run db:sql             # Open SQL editor
```

**Migration Workflow**:
1. Create timestamped file in `supabase/migrations/`
2. Test in Supabase dashboard SQL editor
3. Commit to repo
4. Apply via CLI

**Migration Naming**: `YYYYMMDDHHMMSS_description.sql`

### Development Server
- Port 5173 (auto-opens browser)
- HMR overlay shows errors
- Dev stub fallback if env vars missing

## 📂 File Organization & Path Aliases

```
src/
├── components/ui/       # Design system components
├── features/           # Feature modules
├── services/           # Business logic + API clients
├── hooks/              # Custom React hooks
├── design-system/      # Token types
├── lib/                # Third-party integrations
└── types/              # TypeScript types
```

**Path Aliases** (use `@` prefix):
- `@components/ui/Button`
- `@design-system/types`
- `@services/pdf`
- `@hooks/useSEO`

## 🔥 Critical "Gotchas" (Agent Must Remember)

1. **Never use raw Tailwind colors** - ESLint will block but may miss edge cases
2. **Service role key security** - Only in server-side scripts, never `src/`
3. **Migration ordering** - Timestamps must be sequential to avoid conflicts
4. **Team isolation** - All queries must filter by team_id via RLS or explicit WHERE
5. **Zustand store side effects** - Listed in package.json `sideEffects` array
6. **Real-time subscriptions** - Always clean up Supabase channels in useEffect return
7. **Performance critical** - App MUST feel fast: <2s load, <100ms response, optimize all fetching
8. **Optimistic UI pattern** - Social features use instant feedback with background sync
9. **Tiered debouncing** - 100ms for social, 300ms for content updates
10. **Skeleton screens > spinners** - Use Facebook-style loading states

## 📝 Common Tasks (Agent Should Know)

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

### Adding a New Service
1. Create in `src/services/` (or feature subfolder)
2. Use `api()` client for all queries
3. Return `{ data, error }` tuple
4. Add JSDoc comments for all public functions
5. Export via barrel file (index.ts)

### Creating a New Page
1. Add in `src/pages/`
2. Register route in `src/routes/`
3. Use React Query for data fetching
4. Add to navigation if needed
5. Create page-specific components in `src/features/[feature]/`

### Debugging Supabase Connection
1. Check env vars: `console.log(import.meta.env.VITE_SUPABASE_URL)`
2. Run `npm run db:status` to verify connection
3. Dev stub fallback logs: "Using dev Supabase stub" warning
4. RLS policy issues: Check `team_members` join for user's team access

## 🚀 Agent Best Practices

### When to Use What

**Use `api()` client when**:
- Making Supabase queries
- Need request deduplication
- Want automatic retry with backoff

**Use React Query when**:
- Fetching server data
- Need caching
- Want automatic refetching
- Building custom hooks

**Use Zustand when**:
- Need global client state (UI preferences, active team)
- State persists across page navigation
- Multiple components need same state

**Use local state when**:
- State is component-specific
- No other components need it
- Doesn't persist across navigation

### Code Style Preferences

**Imports** (Order):
1. External libraries (React, React Query, etc.)
2. Internal aliases (`@components`, `@services`, etc.)
3. Relative imports (`./ComponentName`, `../utils`)
4. Type imports (last)

**Naming Conventions**:
- Components: PascalCase (`PlaybookPage.tsx`)
- Hooks: camelCase with `use` prefix (`usePracticeSession.ts`)
- Services: camelCase with `Service` suffix (`playsService.ts`)
- Types: PascalCase (`Play`, `GamePlan`, `PracticeScript`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

**Function Style**:
- Arrow functions for components and hooks
- Regular functions for services and utilities
- Async/await over promises (when possible)
- Early returns for error handling

### Testing Strategy

**Unit Tests** (Vitest):
- Test business logic in services
- Test custom hooks
- Test utility functions
- Mock Supabase client

**Component Tests** (Vitest + Testing Library):
- Test UI components
- Test user interactions
- Test accessibility

**E2E Tests** (Playwright):
- Test critical user flows
- Test cross-page navigation
- Test form submissions

**Visual Regression** (Storybook):
- Component stories for all UI components
- Automated visual testing with Playwright

### Documentation Standards

**Code Comments**:
- JSDoc for all public functions
- Inline comments for complex logic
- TODO comments with context (name, date, reason)

**Commit Messages**:
- Conventional commits: `feat(scope): summary`
- Include WHAT and WHY
- Reference issue numbers when applicable

**Pull Request Pattern**:
- Clear title and description
- List of changes
- Screenshots for UI changes
- Test coverage report
- Performance impact (if applicable)

## 🎯 Agent Success Criteria

When working on BoxCall, the agent should:

✅ **Always**:
- Use design tokens (never raw colors/spacing)
- Use `api()` client for all Supabase queries
- Add optimistic UI for write operations
- Clean up real-time subscriptions
- Add haptic feedback to interactive elements
- Include `focus-ring` utility for accessibility
- Follow TypeScript strict mode (zero errors)
- Test changes before committing
- Update documentation when adding features

✅ **Never**:
- Use raw Tailwind colors (`bg-[#hex]`, `bg-gray-500`)
- Use arbitrary spacing (`w-[24px]`)
- Import Supabase client directly (use `api()`)
- Forget to clean up useEffect subscriptions
- Skip accessibility attributes
- Leave console.log statements
- Commit with TypeScript errors
- Break existing tests

✅ **Performance Checklist**:
- [ ] Added optimistic UI for write operations
- [ ] Used React.memo for expensive components
- [ ] Preloaded heavy modals during idle
- [ ] Used parallel queries over sequential
- [ ] Added skeleton screens (not spinners)
- [ ] Memoized expensive computations
- [ ] Used virtual scrolling for long lists (200+ items)
- [ ] Tested perceived performance (<100ms)

✅ **Quality Checklist**:
- [ ] TypeScript: Zero errors
- [ ] ESLint: ≤600 warnings (ideally 0)
- [ ] Tests: All passing, 85%+ coverage
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Performance: <2s load, <100ms response
- [ ] Documentation: Updated relevant docs

## 📚 Key Documentation (Agent Reference)

**Must Read First**:
- `docs/PROJECT_OVERVIEW.md` - Vision, goals, status
- `docs/architecture/API_ARCHITECTURE_DEC9_2025.md` - API patterns
- `docs/DESIGN_SYSTEM_REFERENCE.md` - Token system
- `CONTRIBUTING.md` - Commit conventions, PR checklist

**Performance**:
- `docs/OPTIMIZATION_COMPLETE_DEC7_2025.md` - All optimizations
- `docs/OPTIMIZATION_ACTION_PLAN_DEC7_2025.md` - Optimization plan
- `docs/development/DATABASE_PERFORMANCE_OPTIMIZATION_PLAN.md` - Database optimizations

**Architecture**:
- `docs/architecture/ARCHITECTURE.md` - System design
- `docs/database/COMPLETE_SCHEMA_REFERENCE.md` - Complete schema
- `database/schema.sql` - SQL schema definition

**Features**:
- `docs/features/practice/` - Practice script system
- `docs/features/playbook/` - Playbook system
- `docs/features/TEAM_BULLETIN_SOCIAL_ENHANCEMENT.md` - Social features

**Development**:
- `docs/guides/ENVIRONMENT_SETUP.md` - Setup guide
- `docs/development/DEVELOPMENT.md` - Dev workflow
- `docs/guides/DEPLOYMENT_OPTIMIZATION_ROADMAP.md` - Deployment guide

## 🎓 Agent Training Examples

### Example 1: Adding Optimistic UI to a Feature

**User Request**: "Add optimistic UI to the practice script save operation"

**Agent Response**:
```typescript
// src/pages/PracticePlanner.tsx

const handleSavePracticeScript = async (script: PracticeScript) => {
  // 1. Store original state for rollback
  const originalScripts = practiceScripts;
  
  // 2. Instant UI update (optimistic)
  setPracticeScripts([...practiceScripts, { ...script, id: `temp-${Date.now()}` }]);
  toast.success("Practice script saved!");
  
  try {
    // 3. Background server sync
    const { data, error } = await api("practice_scripts")
      .insert(script)
      .select()
      .single();
    
    if (error) throw error;
    
    // 4. Replace temp ID with real ID
    setPracticeScripts(scripts => 
      scripts.map(s => s.id === `temp-${Date.now()}` ? data : s)
    );
  } catch (error) {
    // 5. Automatic rollback on error
    setPracticeScripts(originalScripts);
    toast.error("Failed to save practice script");
    console.error(error);
  }
};
```

**Key Points**:
- Instant feedback (<50ms perceived response)
- Background server sync
- Automatic rollback on error
- Toast notifications for user feedback

### Example 2: Creating a New Component with Design Tokens

**User Request**: "Create a StatusBadge component for play status"

**Agent Response**:
```typescript
// src/components/ui/StatusBadge/StatusBadge.tsx
import React from "react";
import { StatusBadgeProps } from "./StatusBadge.types";

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = "md" 
}) => {
  // Use component tokens for styling
  const baseClasses = "badge focus-ring";
  
  const statusClasses = {
    active: "badge-success",
    inactive: "badge-neutral",
    draft: "badge-warning",
    archived: "badge-muted",
  };
  
  const sizeClasses = {
    sm: "badge-sm",
    md: "badge-md",
    lg: "badge-lg",
  };
  
  return (
    <span 
      className={`${baseClasses} ${statusClasses[status]} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
};
```

**Key Points**:
- Component tokens (`badge-success`, `badge-md`)
- Accessibility (`role`, `aria-label`)
- Size variants
- Type-safe props

### Example 3: Adding Real-time Subscription

**User Request**: "Add real-time updates to the game plans page"

**Agent Response**:
```typescript
// src/pages/GamePlansPage.tsx
import { useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";

const GamePlansPage = () => {
  const { data: gamePlans, refetch } = useGamePlans(teamId);
  
  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabaseClient
      .channel("game_plans_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_plans",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log("Game plan changed:", payload);
          // Refetch data on any change
          refetch();
        }
      )
      .subscribe();
    
    // CRITICAL: Clean up subscription
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [teamId, refetch]);
  
  return (
    // ... UI
  );
};
```

**Key Points**:
- Subscribe to specific table/team
- Always clean up in useEffect return
- Use React Query refetch for updates
- Filter by team_id for security

## 🎯 Agent Mode Activation Checklist

When entering Agent Mode, verify:

✅ **Environment**:
- [ ] `.env` file configured with Supabase credentials
- [ ] Dev server running on port 5173
- [ ] TypeScript strict mode enabled
- [ ] ESLint configured with custom rules

✅ **Context**:
- [ ] Current branch and git status known
- [ ] Active team and user context available
- [ ] Database connection verified
- [ ] Recent changes reviewed (CHANGELOG.md)

✅ **Tools**:
- [ ] React Query Devtools accessible (Ctrl/⌘ + `)
- [ ] Browser DevTools open
- [ ] Database CLI tools available
- [ ] Storybook running (optional)

✅ **Knowledge**:
- [ ] Design token system understood
- [ ] API client pattern mastered
- [ ] Optimistic UI pattern ready
- [ ] Real-time subscription pattern ready
- [ ] Performance targets memorized

## 🚀 Final Notes for Agent

**You are empowered to**:
- Make architectural decisions aligned with project patterns
- Refactor code for better performance/maintainability
- Add comprehensive tests for new features
- Update documentation as you build
- Suggest improvements to existing code

**You are expected to**:
- Deliver production-ready code (zero TypeScript errors)
- Follow Facebook-fast performance patterns
- Enforce design system tokens (no exceptions)
- Add accessibility attributes to all UI
- Clean up after yourself (subscriptions, timers)
- Test your changes before committing

**You should avoid**:
- Breaking existing functionality
- Introducing technical debt
- Skipping quality gates
- Ignoring ESLint rules
- Committing without testing
- Leaving TODOs without context

**Remember**: BoxCall coaches rely on this platform for game preparation. Every feature you build, every optimization you make, every bug you fix directly impacts their ability to prepare their teams. **Quality, performance, and reliability are non-negotiable.**

---

**Last Updated**: January 13, 2026  
**Status**: Production-ready agent instructions  
**Version**: 2.0 (Enhanced for Agent Mode)
