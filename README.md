# 🏈 BoxCall

Elite coaching platform – play lifecycle (Ideate → Author → Rehearse → Deploy → Analyze) with quality + performance gates.

[![Uptime Status](https://img.shields.io/uptimerobot/status/801514177?label=Status&style=flat-square)](https://stats.uptimerobot.com/boxcall-status)
[![Uptime (30 days)](https://img.shields.io/uptimerobot/ratio/30/801514177?style=flat-square)](https://stats.uptimerobot.com/boxcall-status)
[![Health Check](https://img.shields.io/uptimerobot/status/801514167?label=Health&style=flat-square)](https://boxcallapp.com/health)

Badges: TypeScript · React · Tailwind · Vite

<div align="center">
  <img src="/assets/boxcall-logo-text.svg" alt="BoxCall" width="300"/>

**Professional football management platform built for coaches, by coaches**

[🔍 View Live Status](https://stats.uptimerobot.com/boxcall-status)

</div>

## Status

**Phase 4: Database Integration & Deployment** - Professional-grade codebase with enterprise-level infrastructure.

See unified product & tech roadmap: [`docs/product/ROADMAP.md`](docs/product/ROADMAP.md).

## Quick Start

**PERFORMANCE STATS**:

- 📦 **Bundle**: 1.34MB total (53% reduction) - optimized for production
- ⚡ **Build**: 14.5s with 41 optimized chunks
- 🚀 **Ready**: Sub-100ms data loading with offline-first architecture
- 🧹 **Code Quality**: 0 ESLint errors, 0 warnings
- 🔒 **Security**: 100/100 score - production ready ([audit](docs/security/PRODUCTION_SECURITY_SUMMARY.md))

## Key Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Quality & Testing
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run test         # Run tests

# Database
npm run db:status           # Check database connection
npm run db:migrate:easy     # Run migration (copy + browser)
npm run db:sql              # Open Supabase SQL Editor
npm run db:setup            # Initial database setup
npm run db:demo             # Load demo data

# Documentation
npm run storybook    # Component documentation
```

## Architecture Overview

BoxCall is a **professional-grade web application** built with modern technologies and enterprise-level architecture patterns.

### 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (Entry Point)                        │
│                        index.html                                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT BOOTSTRAP LAYER                         │
│  main.tsx: StrictMode + Providers + Web Vitals + Route Prefetch │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTEXT PROVIDER TREE                          │
│  ErrorBoundary → TelemetryProvider → OfflineProvider →          │
│  QueryClientProvider → ToastProvider → ConfirmProvider →        │
│  UndoQueueProvider → RoleProvider → SaveStateProvider           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION CORE (App.tsx)                    │
│  AppProvider + AnalyticsProvider + DevModeProvider +            │
│  SaveStateProvider + UndoRedoProvider (50 items) + Popover      │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│          AuthGuard (checks user + team + permissions)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTING LAYER                               │
│  React Router v6: BrowserRouter + ScrollToTop + TeamParamSync   │
│  28 Lazy-Loaded Routes + Protected Route Wrapper                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI LAYER (446 Components)                     │
│  Layout (AppHeader + Sidebar) → Page Components →               │
│  Feature Components → Design System (50+ UI components)         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               STATE MANAGEMENT LAYER                             │
│  Zustand Stores (2): auth-store, activeTeamStore                │
│  React Query: Server state caching + invalidation               │
│  React Context (10): Various domain-specific contexts           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (57 Services)                   │
│  Domain Services: plays, teams, roster, practice, gamePlan      │
│  Data Services: CSV, export, sync, offline, validation          │
│  PDF Services: Practice PDFs, Game Plan PDFs                    │
│  Intelligence: Formation audit, play confidence, recommender    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (Supabase)                        │
│  PostgreSQL Database: 24 tables with RLS policies               │
│  Real-time Subscriptions: Team Bulletin, Notifications          │
│  Storage: Avatars, diagrams, exports                            │
│  Auth: Email/password, magic links, OAuth                       │
└─────────────────────────────────────────────────────────────────┘
```

### 📊 Key Metrics

**Codebase:**

- **Pages**: 28 routes (all lazy-loaded)
- **Services**: 57 domain services
- **Components**: 446 React components
- **Hooks**: 68 custom hooks
- **Database**: 24 tables with RLS
- **Bundle**: 2.95MB (975KB gzipped), 41 chunks

**Performance:**

- **Build Time**: 10.99s
- **Page Load**: <2s (production)
- **Perceived Response**: <50ms (optimistic UI)
- **Modal Open**: <100ms (preloaded)

### 📚 Three-View Coaching System

- **Playbook View**: Interactive play builder with canvas technology (380KB)
- **Practice Script View**: 8-box layout with duration management
- **Game Plan View**: Brian Billick situational methodology

### 🔄 Complete Workflow Integration

```
Playbook View → Practice Script View → Game Plan View
     ↓               ↓                     ↓
  Create Plays    Build Sessions    Organize by Situation
  Tag & Export    Add Timelines     Export Coach Cards
  CSV Import      Practice PDFs     Game Plan PDFs
```

### 🎨 Design System Architecture

```
Token Hierarchy (Enforced by ESLint):
1. Component tokens    # btn-primary, card-padding
2. Semantic tokens     # text-primary, bg-surface-muted
3. Brand scales        # jade-*, navy-*, neutral-*
4. Layout tokens       # spacing-md, space-4
5. Raw Tailwind        # Blocked (use semantic tokens)
```

**Custom ESLint Rules:**

- `no-raw-tailwind-colors` - Enforces semantic color tokens
- `no-arbitrary-spacing` - Prevents hardcoded spacing
- `no-arbitrary-typography` - Enforces text size tokens

**Result**: 100% design system compliance

## Documentation

**[� Complete Documentation Hub](docs/README.md)** - Professionally organized documentation with clear navigation

### Quick Links

- **[📋 Project Overview](docs/PROJECT_OVERVIEW.md)** - Vision, goals, and product roadmap
- **[🏗️ Architecture](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[🔌 API Reference](docs/API.md)** - API documentation and integration guides
- **[🛠️ Development Setup](docs/guides/ENVIRONMENT_SETUP.md)** - Get started developing
- **[✨ Features](docs/features/)** - Feature-specific documentation
- **[🎨 Design System](docs/DESIGN_SYSTEM_REFERENCE.md)** - Components, tokens, and patterns
- **[📖 Guides](docs/guides/)** - Testing, deployment, and workflows

### 🗄️ Database Architecture

**24 PostgreSQL Tables** organized by domain with Row Level Security:

```
┌──────────────────────────────────────────────────┐
│         CORE TEAM MANAGEMENT (4 tables)          │
├──────────────────────────────────────────────────┤
│ teams              # Team metadata               │
│ team_members       # User-team roles             │
│ team_players       # Player roster               │
│ profiles           # User profiles               │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│         PLAYBOOK SYSTEM (4 tables)               │
├──────────────────────────────────────────────────┤
│ playbooks          # Play collections            │
│ plays              # Individual plays            │
│ play_calls         # Execution tracking          │
│ game_results       # Game outcomes              │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│         PRACTICE SYSTEM (3 tables)               │
├──────────────────────────────────────────────────┤
│ practice_scripts   # Practice plans              │
│ practice_templates # Reusable templates          │
│ practice_attendance# Player attendance           │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│         GAME PLANNING (3 tables)                 │
├──────────────────────────────────────────────────┤
│ game_plans         # Billick methodology         │
│ game_plan_situations # Down/distance categories  │
│ game_plan_plays    # Play assignments            │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│         SOCIAL FEATURES (4 tables)               │
├──────────────────────────────────────────────────┤
│ team_posts         # Announcements               │
│ post_comments      # Threaded discussions        │
│ post_likes         # 8-emoji reactions           │
│ post_shares        # Content sharing             │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│    CALENDAR & AWARDS (6 tables)                  │
├──────────────────────────────────────────────────┤
│ calendar_events, team_events, practice_schedules │
│ achievements, helmet_stickers, equipment         │
└──────────────────────────────────────────────────┘
```

**Security Model:**

- ✅ Row Level Security (RLS) on all 24 tables
- ✅ Team-based data isolation (automatic filtering)
- ✅ Role-based access control via `team_members`
- ✅ Automatic timestamp triggers
- ✅ Optimized indexes on foreign keys

**Data Access Pattern:**

```typescript
// Type-safe queries with generated types
const { data: plays } = await supabase
  .from("plays")
  .select("*, playbooks(*)")
  .eq("playbook_id", playbookId);
// Automatically filtered by RLS policies
```

### Documentation Organization

BoxCall maintains industry-leading documentation standards with a clean, organized structure:

```
docs/
├── COMPLETE_ARCHITECTURE_DEC7_2025.md  # ⭐ Full system architecture
├── OPTIMIZATION_COMPLETE_DEC7_2025.md  # ⭐ Performance optimization details
├── archive/           # Historical documentation
│   ├── completed/     # Completed phase docs (PHASE1, PHASE2, PHASE3, etc.)
│   ├── audits/        # System audits (Playbook, Formation, Practice, etc.)
│   ├── performance/   # Performance optimization docs
│   └── legacy/        # Debug docs and cleanup references
├── features/          # Feature-specific guides
├── guides/            # Setup, deployment, and workflow docs
├── database/          # Database schemas, migrations, and query guides
└── [core docs]        # Architecture, API, design system
```

**Root Directory (Clean):**

- `README.md` - This file (with architecture overview)
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines
- `NETLIFY_PWA_SETUP.md` - PWA deployment guide

**Key Architecture Diagrams:**

- [System Architecture](docs/COMPLETE_ARCHITECTURE_DEC7_2025.md) - Full system overview with data flow
- [Database Schema](docs/database/COMPLETE_SCHEMA_REFERENCE.md) - All 24 tables with relationships
- [Performance Optimizations](docs/OPTIMIZATION_COMPLETE_DEC7_2025.md) - React Query, vendor splitting, PWA, database indexes
- [Design System](docs/DESIGN_SYSTEM_REFERENCE.md) - Token hierarchy and component patterns

**Last major reorganization**: December 7, 2025 (Root cleanup + comprehensive architecture + performance optimizations)

## Code Quality & Standards

### ESLint Design System Rules

BoxCall enforces design system compliance through custom ESLint rules that catch violations at development time:

- **`boxcall-design/no-arbitrary-spacing`** - Prevents arbitrary spacing values (e.g., `min-h-[44px]`)
  - Enforces Tailwind standard classes
  - Suggests iOS-compliant touch targets (44px)
  - Requires mobile-safe viewport units (`svh` instead of `vh`)
- **`boxcall-design/no-arbitrary-typography`** - Prevents arbitrary font sizes (e.g., `text-[14px]`)
  - Enforces Tailwind standard classes (text-xs, text-sm, etc.)
  - Whitelists intentional design decisions (text-[11px] for compact labels)
  - Supports Typography variant system
- **`boxcall-design/no-raw-tailwind-colors`** - Prevents raw color values
  - Enforces semantic design tokens
  - Maintains consistent color system

**Benefits:**

- ✅ 100% design system compliance
  - Spacing: 83 violations fixed
  - Typography: 38 violations fixed, 58 intentional whitelisted
- ✅ Automatic enforcement - violations blocked at commit time
- ✅ Helpful suggestions for standard replacements

See [eslint-rules/README.md](eslint-rules/README.md) for complete documentation.

### Quality Gates

All code must pass before merging:

- **TypeScript:** Strict mode, zero errors
- **ESLint:** Zero errors, zero warnings
- **Tests:** All tests passing
- **Build:** Production build successful

```bash
# Run all quality checks
npm run lint && npm run type-check && npm run test && npm run build
```
