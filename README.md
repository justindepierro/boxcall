# 🏈 BoxCall

Elite coaching platform – play lifecycle (Ideate → Author → Rehearse → Deploy → Analyze) with quality + performance gates.

Badges: TypeScript · React · Tailwind · Vite

<div align="center">
  <img src="/assets/boxcall-logo-text.svg" alt="BoxCall" width="300"/>
  
  **Professional football management platform built for coaches, by coaches**
</div>

## Status

See unified product & tech roadmap: `docs/product/ROADMAP.md`.

## Quick Start

**PERFORMANCE STATS**:

- 📦 **Bundle**: 2.83MB total (975KB gzipped) - optimized for production
- ⚡ **Build**: 8.64s with 41 optimized chunks
- 🚀 **Ready**: Sub-100ms data loading with offline-first architecture
- 🧹 **Mock Data**: 4 areas identified for cleanup (mock-team-data.ts, demoPlays.ts, service dev modes)

## Key Scripts

### **Bundle Optimization Complete** ✅

- **58% reduction**: Main bundle 648KB → 272KB
- **95% component optimization**: 3,351 lines → 1,837 lines across 17 focused components
- **Route-based code splitting**: 41 optimized chunks for efficient loading
- **Modern build pipeline**: Vite + TypeScript with <10s build times

### **Architecture Modernization** ✅

- **Modular DevTools**: Refactored from 946-line monolith → 297-line modular system
- **Professional Toast System**: Complete UX feedback with animations and auto-dismiss
- **React Best Practices**: Fixed key duplication warnings, proper component identity
- **TypeScript Integration**: Full type safety across 90% of services

### **Database & Services Ready** ✅

- **DataSyncService**: 747 lines of performance-optimized Supabase integration
- **PracticeService**: 551 lines of complete CRUD operations
- **DataResolutionService**: 630 lines of clean data orchestration
- **Authentication**: Complete auth store (227 lines) with session management

## Architecture & Docs

BoxCall revolutionizes football coaching with a professional workflow system that mirrors how elite coaches actually prepare their teams.

### **📚 Playbook View** - Play Creation & Management

- Interactive play builder powered by Fabric.js canvas technology
- Professional play data structure with comprehensive metadata
- CSV import/export for team collaboration and data sharing
- Achievement system with automated complexity analysis
- Integration with Practice Script and Game Plan workflows
- Advanced filtering and search capabilities

### **⏱️ Practice Script View** - Session Planning & Timeline Building

**Database-Driven Professional System:**

- **Complete Practice Planning Database** - 7-table architecture with comprehensive practice management
- **8-Box Layout System** - Visual timeline builder with professional PDF export layout
- **Practice Execution Tracking** - Real-time performance data and coaching observations
- **Automated Duration Management** - PostgreSQL triggers maintain accurate timing automatically
- **Practice Analytics** - Performance insights, trend analysis, and optimization recommendations
- **Template System** - Reusable practice structures with public sharing capabilities
- **Professional Integration** - Seamless connection with playbook plays and game plan situations

### **🎯 Game Plan View** - Brian Billick Situational Methodology

**Database-Driven Professional System:**

- **Complete Brian Billick Implementation** - Down & Distance, Red Zone, Goal Line, Two Minute, Fourth Down
- **6-Table Database Architecture** - game_plans, situations, plays, coach_cards, templates, analytics
- **Automated Count Management** - PostgreSQL triggers maintain accurate statistics in real-time
- **Professional Coach Cards** - Printable sideline references with custom layouts and prioritization
- **Template System** - Reusable game plan patterns and coaching philosophies
- **Real-Time Analytics** - Execution tracking and performance analysis during games
- **Row Level Security** - Team-based data isolation with secure sharing capabilities

### **🔄 Complete Workflow Integration**

```
Playbook View → Practice Script View → Game Plan View
     ↓               ↓                     ↓
  Create Plays    Build Sessions    Organize by Situation
  Tag & Export    Add Timelines     Export Coach Cards
  CSV Import      Practice PDFs     Game Plan PDFs
  Achievement     Quick Adds        Analytics Tracking
```

**Professional Database Foundation:**

- Game Planning: 6 specialized tables with Brian Billick methodology
- Practice Planning: 7 comprehensive tables with 8-box layout system
- Automatic relationship management and data integrity
- Performance-optimized queries with strategic indexing
- Complete audit trails and execution tracking
- Scalable architecture supporting team growth

Full architecture: `docs/ARCHITECTURE.md`

### **Service Layer Architecture**

```typescript
// PracticeScriptService - Timeline-based session builder
- getOrCreateQuickAddsScript(teamId: string)
- addPlayToScript(data: AddPlayToScriptData)
- exportPracticeScriptToCSV(script: PracticeScript)
- generateTimelineLayout(plays: ScriptPlay[])

// GamePlanService - Brian Billick methodology
- createGamePlan(data: CreateGamePlanData)
- addPlayToSituation(gamePlanId, situationId, play, priority)
- generatePracticeScriptFromGamePlan(gamePlanId)
- exportGamePlanToPDF(gamePlanId)

// CSVService - Professional data management
- parsePlaysFromCSV(csvContent: string)
- exportPlaysToCSV(plays: Play[], options: CSVExportOptions)
- exportPracticeScriptToCSV(script: PracticeScript)
- generateSampleCSV()
```

### **3-View State Management**

```typescript
type CoachingView = "playbook" | "practice-script" | "game-plan";

interface PlaybookPageState {
  currentView: CoachingView;
  // Seamless data flow between views
  // Achievement integration across workflows
  // Professional UI state management
}
```

### **Brian Billick Situational Categories**

```typescript
// Game planning organized by football situations
- Down & Distance: "1st & 10", "2nd & Long", "3rd & Short"
- Red Zone: "Red Zone", "Goal Line", "+10 Territory"
- Special Situations: "Two Minute", "Third Down", "Short Yardage"
// Priority-based play assignment for each situation
// Automatic practice script generation from game plan priorities
```

### 🎨 UI Primitive Selection (Quick Matrix)

| Need                         | Use             | Notes                                 |
| ---------------------------- | --------------- | ------------------------------------- |
| Taxonomy / category chip     | Tag             | Lightweight, low elevation            |
| Status / achievement / count | Badge           | Elevated, can animate / show progress |
| Progress (0–100%)            | ProgressBadge   | Uses fill animation internally        |
| Premium highlight            | Badge (premium) | Gradient w/ decorative marker         |
| Inline sentence label        | Tag             | Keep text ≤ 2 words                   |

Full decision tree: `docs/BADGE_TAG_GUIDELINES.md`.

## Quality Gates

### **Phase 4** ✅ **3-View Coaching System**

Revolutionary coaching workflow with Playbook → Practice Script → Game Plan architecture, Brian Billick methodology integration, and comprehensive CSV import/export capabilities.

### **Phase 3** ✅ **Data Resolution Service**

Enterprise-grade data architecture with centralized loading, clean React hooks, and professional dev environment with super admin capabilities.

### **Phase 2** ✅ **Achievement & Reward Loop System**

Complete gamification with complexity analysis, celebration overlays, streak tracking, and psychological engagement triggers.

### **Phase 1** ✅ **Playbook Foundation**

Complete playbook management with step-by-step builder, play categorization, and professional data structure.

### **Phase 2** ✅ **Visual Play Builder**

Professional drawing tools with Fabric.js integration, NFHS-compliant field dimensions, and coaching-grade diagrams.

### **Phase 2.5** ✅ **Enhanced Play Experience**

Custom name generation, expandable UI components, MonoCode typography, and intelligent play organization.

### **Phase 2.8** ✅ **Legal Framework & User Onboarding**

Professional legal compliance, enhanced team creation experience, and comprehensive coach account system with business model implementation.

### **Phase 4** ✅ **Data Resolution Service**

Enterprise-grade centralized data loading system with context-aware resolution, clean React hooks architecture, and professional development environment with data source transparency.

## Telemetry & Search

### **📐 Visual Play Builder**

- **NFHS-Compliant Field Canvas**: Accurate 53⅓ yard field dimensions
- **6 Background Modes**: Football field, red zone, blank, engineering paper styles
- **Professional Drawing Tools**: Route styles, player positioning, annotations
- **Interactive Canvas**: Zoom controls (0.5x-3.0x), drag-and-drop players
- **Coaching-Grade Diagrams**: Based on real coaching standards

### **🏈 Advanced Playbook Management**

- **Custom Play Name Generation**: Intelligent concatenation from formation components
- **One-Word Call System**: Toggle between full names and sideline calls
- **MonoCode Typography**: Technical, coaching-friendly font design
- **Expandable Play Cards**: Skinny scanning mode + detailed analysis view
- **Color-Coded Organization**: Visual play type identification
- **Comprehensive Statistics**: Success rates, usage tracking, situational analysis

### **� Professional Team Management**

- **Dual Account System**: $199/year team accounts + $9.99/month coach accounts
- **Enhanced Team Creation**: Split team name fields (school/mascot), auto-season assignment
- **7-Step Wizard Experience**: Streamlined onboarding for both teams and individual coaches
- **RBAC Integration**: Role-based access control with coach account permissions
- **Professional Legal Framework**: Complete privacy policy, terms of service, and contact system

### **�🛠️ Development Experience**

- **Consolidated Dev Tools**: Unified, draggable panel with enhanced opacity control
- **Role Switching System**: Test all user experiences (Coach, Player, Admin, Super Admin)
- **Live Development**: Hot reloading, TypeScript checking, ESLint validation
- **Professional Debugging**: Comprehensive logging and error tracking

## 🎯 **MVP Roadmap to v1.0**

> **Vision**: Transform BoxCall from advanced playbook tool to comprehensive football team management platform

📋 **[Complete MVP Roadmap](MVP_ROADMAP.md)** - Detailed 8-milestone plan to v1.0.0  
📝 **[TODO & Maintenance Tasks](TODO.md)** - Performance optimization and cleanup tracking

### **Key Upcoming Milestones**

- **v0.2.0** - Core Platform Foundation (User roles, team management)
- **v0.3.0** - Enhanced Playbook System (Collections, import/export)
- **v0.4.0** - Intelligent Calendar & Scheduling (Multi-team, conflicts)
- **v0.5.0** - Team Performance Analytics (Player tracking, insights)
- **v1.0.0** - Complete Football Management Platform (100+ teams target)

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd boxcall

# Install dependencies & setup development environment
npm install

# Run health check & quality verification
npm run predev

# Start optimized development environment
npm run dev

# Launch Storybook design system
npm run storybook

# Run comprehensive quality checks
npm run quality:check

# Analyze bundle size and performance
npm run analyze
```

## ⚡ **Performance & Quality Monitoring**

### 📏 Baseline & Performance Budgets

We maintain a locked Phase 0 baseline to measure optimization progress and prevent regressions.

Artifacts:

- `baseline/performance-budgets.json` – gzip targets (largest non-PDF chunk + initial index/vendor total)
- `baseline/bundle-stats.json` – raw byte sizes for every JS/CSS asset
- `baseline/raw-gray-offenders.json` – style debt inventory (raw gray utilities slated for codemod)

Local workflow:

```bash
npm run build            # produce dist/assets
npm run perf:budgets     # enforce current budgets
npm run baseline:create  # (only when intentionally updating baseline)
```

Budget policy:

1. If you exceed a budget, either optimize (preferred) or intentionally raise in `baseline/performance-budgets.json` in the same PR.
2. Provide before/after numbers (from `bundle-stats.json`) plus rationale.
3. Add a follow-up issue if increase >10% with a mitigation plan (code-splitting, library replacement, lazy loading, etc.).

Planned extensions: per-route LCP/INP thresholds, image weight budgets, PDF bundle isolation via dynamic import, and automated daily trend capture.

### 🎯 **Core Web Vitals Tracking**

- **Real-time performance monitoring** with Web Vitals v5.1.0
- **Performance dashboard** component for development insights
- **Automated performance targets**: LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Bundle size analysis** with Vite integration < 150KB initial load

### 🛡️ **Automated Quality Gates**

- **Pre-commit hooks** with Husky for code quality enforcement
- **Lint-staged** integration: ESLint + Prettier on every commit
- **Conventional commit validation** with commitlint
- **TypeScript strict mode** with 100% coverage targets
- **Automated formatting** and linting with industry standards

### 🔧 **Development Tools**

- **Health check scripts** for environment validation
- **VS Code workspace optimization** with recommended extensions
- **Git hooks** for automated quality assurance
- **Bundle analysis tools** for performance optimization
- **One-command startup** with comprehensive quality gates

## 🎯 Core Features

### ✅ **Production-Ready Foundation**

- **Enterprise workspace optimization** with industry-leading practices
- **Professional jade & navy color palette** for coaching interfaces
- **Typography hierarchy**: Bebas Neue (display), Inter (interface), IBM Plex Mono (data)
- **Storybook documentation** with component-driven development
- **Tailwind CSS integration** with custom BoxCall design tokens
- **Performance monitoring** with real-time Web Vitals tracking

### 🏈 **Playbook Management** (ENHANCED)

- **Builder Mode**: Step-by-step play creation wizard for coaches
- **CSV Import**: Bulk import existing playbooks and data
- **Advanced Play Cards**: MonoCode typography with expand/collapse functionality
- **Custom Play Naming**: Intelligent concatenation from formation components
- **Smart Filtering**: Search by formation, down, distance, play type, and tags
- **One-Word Call Toggle**: Switch between full names and coaching audibles
- **Professional Visual Builder**: NFHS-compliant field with drawing tools
- **Color-Coded Organization**: Visual play type identification and confidence tracking
- **Comprehensive Stats**: Success rates, usage tracking, and situational preferences

### 🔍 **Performance & Monitoring**

- **Core Web Vitals integration**: LCP, INP, CLS, FCP, TTFB tracking
- **Performance dashboard component** for development insights
- **Bundle size analysis** with automated optimization recommendations
- **Real-time performance metrics** displayed during development
- **Automated performance budgets** and threshold monitoring

### 🛠️ **Developer Experience**

- **Automated code quality** with ESLint + Prettier + Husky workflow
- **Pre-commit hooks** ensuring code standards before commits
- **Conventional commit validation** for consistent git history
- **Health check automation** for environment validation
- **VS Code integration** with workspace-optimized settings
- **One-command development startup** with quality gate verification

### 🧠 **Intelligent Features** (Planned)

- AI-powered conflict detection for scheduling optimization
- Smart scheduling suggestions based on team patterns
- Predictive attendance analytics using machine learning
- Real-time conflict resolution with intelligent recommendations

### 👥 **Team Management** (In Development)

- **Personal Trophy Shelf**: Compact design with scrollable achievements
- Advanced RSVP system with conditional responses
- Role-based permissions with granular access control
- Event polling interface for team-wide decision making
- Bulk operations for efficient team administration

## Contributing

Conventional commits required. Run validation before PR: `npm run validate:full`.

### 🎉 **Recently Completed**

- **✅ Enhanced Play Cards** with MonoCode fonts and expand/collapse functionality
- **✅ Custom Play Name Generation** with intelligent field concatenation
- **✅ One-Word Call Toggle System** for coaching-friendly display modes
- **✅ Professional Visual Play Builder** with NFHS-compliant field canvas
- **✅ Advanced Typography** with coaching-grade font design
- **✅ Comprehensive Play Statistics** with color-coded confidence tracking
- **✅ Complete workspace optimization** with enterprise-grade development tools
- **✅ Core Web Vitals monitoring** with real-time performance tracking
- **✅ Automated quality gates** with pre-commit hooks and conventional commits
- **✅ Development environment automation** with health checks and setup scripts
- **✅ VS Code workspace optimization** with recommended extensions and settings
- **✅ Git workflow enhancement** with Husky, lint-staged, and commitlint
- **✅ Draggable dev tools system** with smart opacity states and smooth UX
- **✅ Fixed ESLint configuration** removed deprecated .eslintignore file
- **✅ React Hooks placement issues** resolved for proper component architecture

### ⚠️ **Current Active Work**

- **Trophy Shelf UI refinements** and height alignment optimization
- **Dashboard component integration** and comprehensive testing
- **Achievement system UI/UX** improvements and data integration

### 🧹 **Troubleshooting: Clear Stale File References**

**Problem**: VS Code Problems panel shows errors for deleted files (like `lighthouse.spec.ts`)

**⚠️ SAFE Solution** (won't restore deleted files):

```bash
npm run clear:references  # Clears cache only, keeps workspace clean
```

**Manual Safe Commands** (use `Cmd+Shift+P`):

1. Try `ESLint: Restart ESLint Server` first (safest)
2. Close and reopen the Problems panel: `View → Problems`
3. **Only if desperate**: Close VS Code completely and reopen (preserves file cleanup)

**❌ AVOID**: `Developer: Reload Window` - **This will restore 100s of deleted files!**

**Alternative**: Just close the Problems panel if stale errors aren't blocking your work:

- `View → Problems` to toggle it off
- Focus on the actual code instead of phantom errors

### ⚠️ **Expected Warning: TypeScript Version**

**Warning**: You may see this ESLint warning (this is expected and safe):

```
WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.
* @typescript-eslint/typescript-estree version: 8.38.0
* Supported TypeScript versions: >=4.8.4 <5.9.0
* Your TypeScript version: 5.9.2
```

**Why this happens**: TypeScript ESLint packages are often behind the latest TypeScript releases
**Is it safe?**: Yes! TypeScript 5.9.2 works fine with ESLint, just with this warning
**Solution**: Ignore this warning - it's informational only and doesn't affect functionality

### 🛠️ **Super Admin Mode - Movable Dev Tools**

**Problem**: Performance monitor and dev tools blocking your workspace!

**🚀 Solution**: All dev tools are now **draggable, collapsible, and hideable**:

**Performance Monitor**:

- **🔄 Real-time performance tracking** - component renders, memory usage, performance stats
- **Draggable floating widget** with smart positioning
- **Opacity control** - 30% when idle, 95% when in use for unobtrusive monitoring
- **Keyboard shortcut**: `Ctrl+Shift+P` (toggle on/off)
- **Minimize/expand controls** for flexible workspace usage
- **Hide completely** when workspace needs to be clear

**Dev Tools Panel** (Super Admin Mode):

- **🛠️ Central control** for all development tools
- **Draggable interface** - grab and move anywhere on screen
- **Smart opacity states**:
  - **30% opacity** when collapsed and idle (stays out of your way)
  - **95% opacity** when actively using, hovering, or expanded
  - **Smooth transitions** between states for polished UX
- **Quick access** to Storybook, Bundle Analyzer, Web Vitals test
- **Debug console** button for instant troubleshooting
- **Collapsible interface** with expand/collapse controls
- **Hide when not needed**, restore with floating button

**Quick Access**:

- Click **🛠️** button (top-right) to access all dev tools
- **Performance Monitor** independently controllable
- **One-click access** to Storybook (`npm run storybook`)
- **Bundle analysis** with visual reports (`npm run analyze`)
- **Web Vitals testing** page for performance validation

### ✅ **Production-Ready Components**

- **Performance monitoring system** with Web Vitals integration
- **Automated development workflow** with quality enforcement
- **Comprehensive build tooling** with bundle analysis and optimization
- **Enterprise workspace setup** with industry-standard practices
- **Compact Trophy Shelf design** with horizontal layout and scrolling
- **Tailwind CSS foundation** with jade/navy color tokens
- **TypeScript architecture** with strict typing and interfaces
- **Supabase integration** with database helpers and configuration

## Documentation Index

See `docs/README.md` (to be added) for categorized references.

- **[Workspace Optimization Guide](WORKSPACE_OPTIMIZATION_COMPLETE.md)** - Complete transformation documentation
- **[Architecture](docs/architecture/)** - System design and technical decisions
- **[Performance Monitoring](src/components/dev/PerformanceMonitor.tsx)** - Web Vitals integration
- **[Current Status](docs/CURRENT_STATUS.md)** - Realistic project assessment
- **[Phase Documentation](docs/phases/)** - Implementation phases and roadmaps
- **[Setup Guide](docs/SUPABASE_SETUP.md)** - Environment setup instructions

## Scripts

```bash
# Development workflow
npm run dev              # Start optimized development server
npm run predev           # Pre-development health check
npm run quality:check    # Comprehensive quality verification

# Code quality
npm run lint             # ESLint code analysis
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier code formatting
npm run type-check       # TypeScript validation
npm run clear:references # Clear stale file references from Problems panel

# Performance & analysis
npm run analyze          # Bundle size analysis
npm run build            # Production build
npm run preview          # Preview production build

# Automation scripts
./scripts/setup-dev-tools.sh       # Setup development environment
./scripts/optimize-workspace.sh    # Workspace optimization
./scripts/health-check.sh          # Environment health validation
./scripts/analyze-bundle.sh        # Bundle analysis automation
./scripts/clear-stale-references.sh # Clear stale file references from Problems panel
```

## License

Proprietary – All rights reserved.

### 🔥 **Immediate Focus**

1. **Complete Trophy Shelf height alignment** for perfect stat box matching
2. **Integrate achievement system** with real user data and backend
3. **Expand dashboard components** with consistent design patterns
4. **Complete Storybook component stories** with comprehensive documentation

### 📈 **Performance Targets** (Automated Monitoring)

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **INP (Interaction to Next Paint)**: < 200 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8 seconds
- **TTFB (Time to First Byte)**: < 800 milliseconds
- **Bundle Size**: < 150KB initial load

---

Historical verbose README retained in git history (slimmed 2025-08-11).

### 🛡️ **Quality Standards** (Automated)

1. **All commits automatically validated** with pre-commit hooks
2. **Conventional commit messages** enforced via commitlint
3. **Code formatting** auto-applied with Prettier on commit
4. **ESLint validation** runs automatically before commits
5. **TypeScript strict mode** with comprehensive type checking

### 🔧 **Development Workflow**

```bash
# Recommended development flow
npm run predev          # Health check before starting
npm run dev             # Start development with monitoring
# Make your changes...
git add .               # Stage changes (triggers pre-commit hooks)
git commit -m "feat: description"  # Conventional commit format
# Quality gates run automatically
```

### 📋 **Code Standards**

- Follow established **TypeScript patterns** and interfaces
- Use the **BoxCall design system** for UI consistency
- Ensure **performance budgets** are maintained
- Update **documentation** to reflect implementation status
- **All quality checks must pass** before PR approval

## 🚀 **Performance Features**

### � **Real-Time Monitoring**

- **Web Vitals dashboard** in development mode
- **Bundle size tracking** with optimization recommendations
- **Performance budget alerts** when thresholds exceeded
- **Automated performance regression detection**

### 🔍 **Analysis Tools**

- **Bundle analyzer** for dependency optimization
- **Performance profiling** with Core Web Vitals
- **Build size reporting** and trend analysis
- **Development environment health checks**

---

_Building the future of football coaching operations._ 🏈
