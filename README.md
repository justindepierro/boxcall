# 🏈 BoxCall

Elite coaching platform – play lifecycle (Ideate → Author → Rehearse → Deploy → Analyze) with quality + performance gates.

Badges: TypeScript · React · Tailwind · Vite

<div align="center">
  <img src="/assets/boxcall-logo-text.svg" alt="BoxCall" width="300"/>

  **Professional football management platform built for coaches, by coaches**
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
