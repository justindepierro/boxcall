# 🏈 BoxCall - Football Coaching Platform

**Assembly Line Workflow**: Playbook → Practice → Game Plan → BoxCall

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Data Flow](#-data-flow)
- [Database Schema](#-database-schema)
- [Component Architecture](#-component-architecture)
- [API Services](#-api-services)
- [Development Workflow](#-development-workflow)
- [Current Implementation Status](#-current-implementation-status)

---

## 🏗️ Architecture Overview

BoxCall is built on the **Assembly Line Workflow** principle - a linear progression where each section feeds the next with intelligent data flow and automated insights.

### Core Principles

1. **Linear Workflow**: Playbook → Practice → Game Plan → BoxCall
2. **Data Flow**: Information flows forward, insights flow backward
3. **Progressive Disclosure**: Simple interfaces that reveal complexity as needed
4. **Mobile-First**: Designed for sideline use during games

### Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Query + Context
- **Build**: Vite + ESLint + Prettier
- **Testing**: Vitest + React Testing Library

---

## 🔄 Data Flow

### Assembly Line Data Flow

```
🏈 PLAYBOOK (Source)
    ↓ creates
📋 PRACTICE (Assembly)
    ↓ feeds
🎯 GAME PLAN (Strategy)
    ↓ executes
📊 BOXCALL (Intelligence)
```

### Key Data Relationships

#### Play Lifecycle
```
plays (created in playbook)
  ↓
play_usage_events (tracked automatically)
  ↓
play_maturity_levels (calculated automatically)
  ↓
workflow_progress (updated automatically)
```

#### Practice Flow
```
practice_scripts
  ↓ contains
script_plays (junction table)
  ↓ references
plays (with usage tracking)
```

#### Game Plan Flow
```
game_plans
  ↓ contains
game_plan_situations
  ↓ contains
game_plan_plays (junction table)
  ↓ references
plays (with usage tracking)
```

#### Live Execution
```
games
  ↓ contains
play_calls (live execution tracking)
  ↓ references
plays (with performance data)
```

---

## 🗄️ Database Schema

### Core Tables (14 essential tables)

#### Team Management
- `teams` - Team information and settings
- `team_members` - User roles within teams

#### Playbook Section
- `playbooks` - Collections of plays
- `plays` - Individual play definitions
- `play_search_docs` - Full-text search optimization

#### Practice Section
- `practice_scripts` - Weekly practice plans
- `script_plays` - Plays included in practice scripts
- `practice_blocks` - Practice period organization
- `practice_activities` - Individual drill definitions

#### Game Plan Section
- `game_plans` - Game-specific strategies
- `game_plan_situations` - Situational categories (Brian Billick method)
- `game_plan_plays` - Plays assigned to situations

#### Live Execution
- `games` - Game records
- `play_calls` - Live play execution tracking

### Intelligence Layer (4 tables)

#### Usage Tracking
- `play_usage_events` - Automatic play usage tracking
- `play_maturity_levels` - Calculated play maturity scores

#### Analytics
- `workflow_progress` - Team progress through assembly line
- `data_flow_analytics` - Cross-section analytics

### Deferred Tables (38+ tables for future phases)

**Phase 2+ Analytics:**
- `player_performance`, `player_skill_assessments`, `practice_analytics`

**Phase 3 Compliance:**
- `player_eligibility`, `audit_logs`, `depth_charts`

**Phase 4 Social:**
- `team_posts`, `post_comments`, `family_communications`

---

## 🧩 Component Architecture

### Page Components

```
src/pages/
├── DashboardPage.tsx      # Main dashboard with workflow overview
├── PlaybookPage.tsx       # Play creation and management
├── PracticePlanner.tsx    # Practice script builder
├── GamePlanPage.tsx       # Situational game planning
├── BoxCall.tsx           # Live game intelligence
├── AnalyticsPage.tsx     # Performance analytics
└── TeamsPage.tsx         # Team management
```

### Feature Components

```
src/components/
├── playbook/             # Playbook-specific components
├── practice/             # Practice planning components
├── gameplan/             # Game planning components
├── boxcall/              # Live execution components
├── ui/                   # Reusable UI components
└── shared/               # Cross-feature components
```

### Key Shared Components

- `WorkflowIndicators` - Assembly line progress visualization
- `DataFlowSummary` - Real-time metrics display
- `PlayMaturityBadge` - Play maturity indicators
- `UniversalSearch` - Cross-section search

### Hook Architecture

```
src/hooks/
├── useTeamsData.ts       # Team and user data
├── useDataFlowTracking.ts # Workflow analytics (currently mock)
├── useTheme.ts           # Theme management
└── useAuth.ts            # Authentication state
```

---

## 🔌 API Services

### Service Layer Architecture

```
src/services/
├── base/BaseService.ts    # Generic CRUD operations
├── dashboardService.ts    # Dashboard data aggregation
├── rosterService.ts       # Team roster management
└── playbookService.ts     # Play management
```

### Data Fetching Strategy

- **React Query**: Server state management
- **Optimistic Updates**: Immediate UI feedback
- **Background Refetch**: Data freshness
- **Error Boundaries**: Graceful failure handling

### Real-time Features

- **Supabase Real-time**: Live data synchronization
- **Presence Indicators**: User activity tracking
- **Live Analytics**: Real-time performance metrics

---

## 🚀 Development Workflow

### Assembly Line Sprint Structure

```
Monday:    Sprint Planning
Tuesday:   Core Development
Wednesday: Integration Testing
Thursday:  Cross-section Testing
Friday:    End-to-end Validation
```

### Quality Gates

- **Code Quality**: ESLint clean, TypeScript strict
- **Testing**: 95%+ coverage on critical paths
- **Performance**: Lighthouse >90, bundle size optimized
- **Accessibility**: WCAG AA compliance
- **Data Flow**: All workflow connections functional

### Branch Strategy

```
main              # Production releases
├── feature/*     # Feature development
├── bugfix/*      # Bug fixes
└── refactor/*    # Code cleanup
```

---

## 📊 Current Implementation Status

### ✅ **Completed (Real Data)**

#### Core Infrastructure
- [x] Team creation and management
- [x] User authentication and authorization
- [x] Database connection and RLS policies
- [x] Component architecture and design system

#### Playbook Section
- [x] Play creation and editing
- [x] Playbook organization
- [x] Universal search functionality
- [x] Play tagging and categorization

#### Basic Assembly Line
- [x] Practice script structure
- [x] Game plan situation framework
- [x] Basic data relationships

### 🔄 **In Progress (Mixed Mock/Real)**

#### Intelligence Layer
- [x] Workflow progress indicators (UI complete, mock data)
- [x] Data flow analytics (UI complete, mock data)
- [x] Play maturity system (UI complete, mock data)
- [ ] Database migration 021 (pending application)

#### Component Integration
- [x] Cross-section navigation
- [x] Responsive design
- [ ] Real-time data synchronization

### ❌ **Not Started**

#### Live Execution
- [ ] BoxCall live interface
- [ ] Real-time play calling
- [ ] Live analytics dashboard

#### Advanced Features
- [ ] AI-powered suggestions
- [ ] Automated practice generation
- [ ] Social collaboration features

---

## 🎯 Next Steps

### Immediate (This Week)
1. **Apply Database Migration 021**
   ```bash
   # Connect to Supabase and run migration
   psql [connection_string] -f database/migrations/021_assembly_line_workflow.sql
   ```

2. **Replace Mock Data**
   - Update `useDataFlowTracking.ts` with real Supabase queries
   - Connect workflow indicators to real data
   - Enable live analytics

3. **Architecture Documentation**
   - Complete component relationship mapping
   - Create data flow diagrams
   - Document API patterns

### Short Term (Next 2 Weeks)
1. **Complete Assembly Line Intelligence**
   - Implement automatic usage tracking triggers
   - Build maturity calculation functions
   - Create analytics aggregation

2. **Codebase Cleanup**
   - Remove redundant database tables
   - Consolidate duplicate components
   - Simplify over-engineered features

### Medium Term (Phase 2)
1. **Advanced Analytics**
   - Player performance tracking
   - Practice effectiveness metrics
   - Predictive insights

2. **AI Integration**
   - Play recommendation engine
   - Automated practice generation
   - Smart scheduling

---

## 📚 Additional Resources

- [Master Roadmap](MASTER_ROADMAP.md) - Complete project vision
- [Architecture Audit](ARCHITECTURE_AUDIT_REPORT.md) - Detailed technical analysis
- [Database Schema](database/schema.sql) - Complete table definitions
- [API Documentation](docs/API.md) - Service layer documentation

---

**Last Updated**: September 20, 2025
**Current Phase**: Phase 1A - Assembly Line Foundation