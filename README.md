# 🏈 BoxCall - Professional Football Team Management

> **Elite football coaching platform** with intelligent scheduling, advanced team management, comprehensive design system, and enterprise-grade development tools.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://reactjs.org/)
[![Storybook](https://img.shields.io/badge/Storybook-9.1.0-ff4785)](https://storybook.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.7-38b2ac)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646cff)](https://vitejs.dev/)
[![Web Vitals](https://img.shields.io/badge/Web_Vitals-5.1.0-success)](https://github.com/GoogleChrome/web-vitals)
[![Husky](https://img.shields.io/badge/Husky-9.1.7-dog)](https://typicode.github.io/husky/)
[![Prettier](https://img.shields.io/badge/Prettier-3.4.2-ff69b4)](https://prettier.io/)

## � **CURRENT STATUS: PRODUCTION-READY WORKSPACE**

✅ **Latest**: **Complete workspace optimization with industry-leading development practices**
🎯 **Achieved**: Performance monitoring, automated quality gates, enterprise dev tools
🔧 **Active**: Trophy Shelf UI refinements and dashboard component integration

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

## 🛠️ Development Status

### 🎉 **Recently Completed**

- **✅ Complete workspace optimization** with enterprise-grade development tools
- **✅ Core Web Vitals monitoring** with real-time performance tracking
- **✅ Automated quality gates** with pre-commit hooks and conventional commits
- **✅ Performance monitoring dashboard** component implementation
- **✅ Bundle analysis integration** with Vite tooling
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

## 📚 Documentation

- **[Workspace Optimization Guide](WORKSPACE_OPTIMIZATION_COMPLETE.md)** - Complete transformation documentation
- **[Architecture](docs/architecture/)** - System design and technical decisions
- **[Performance Monitoring](src/components/dev/PerformanceMonitor.tsx)** - Web Vitals integration
- **[Current Status](docs/CURRENT_STATUS.md)** - Realistic project assessment
- **[Phase Documentation](docs/phases/)** - Implementation phases and roadmaps
- **[Setup Guide](docs/SUPABASE_SETUP.md)** - Environment setup instructions

## 📊 **Scripts & Automation**

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

## 🎯 Development Priorities

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

## 🤝 Contributing

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

**Status**: 🎯 **Production-Ready Workspace** - Enterprise development practices implemented

_Building the future of football team management with industry-leading development standards_ 🏈
