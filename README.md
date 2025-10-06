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

- 📦 **Bundle**: 2.83MB total (975KB gzipped) - optimized for production
- ⚡ **Build**: 8.64s with 41 optimized chunks
- 🚀 **Ready**: Sub-100ms data loading with offline-first architecture
- 🧹 **Code Quality**: 0 ESLint errors, 0 warnings

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
npm run db:setup     # Initial database setup
npm run db:demo      # Load demo data

# Documentation
npm run storybook    # Component documentation
```

## Architecture Overview

BoxCall revolutionizes football coaching with a professional workflow system that mirrors how elite coaches actually prepare their teams.

### 📚 Three-View Coaching System

- **Playbook View**: Interactive play builder with Fabric.js canvas technology
- **Practice Script View**: 8-box layout system with automated duration management
- **Game Plan View**: Brian Billick situational methodology with coach cards

### 🔄 Complete Workflow Integration

```
Playbook View → Practice Script View → Game Plan View
     ↓               ↓                     ↓
  Create Plays    Build Sessions    Organize by Situation
  Tag & Export    Add Timelines     Export Coach Cards
  CSV Import      Practice PDFs     Game Plan PDFs
```

## Documentation

- **[📋 Roadmap & Status](docs/product/ROADMAP.md)** - Current status and development roadmap
- **[🛠️ Setup Guide](docs/SETUP.md)** - Development environment setup
- **[🏗️ Architecture](docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[🔌 API Reference](docs/API.md)** - API documentation and integration guides
- **[🗄️ Database](docs/database/)** - Schema, rebuild guides, and audit reports
- **[🎨 Design System](docs/roadmaps/DESIGN_SYSTEM_ROADMAP.md)** - Component library and theming

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
