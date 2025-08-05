# 📋 BoxCall - TODO & Maintenance Tasks

> **Project maintenance, cleanup, and optimization tracking**

## 🚀 **3-VIEW COACHING SYSTEM ROADMAP**

### ✅ **Phase 1: Core Architecture - COMPLETE**

- ✅ **3-View Toggle System** - Playbook, Practice Script, Game Plan views
- ✅ **PracticeScriptService** - Complete backend with Quick Adds functionality
- ✅ **GamePlanService** - Brian Billick methodology with situational organization
- ✅ **CSV Import/Export** - Professional data management for all workflows
- ✅ **TypeScript Integration** - Full type safety across all services
- ✅ **State Management** - Seamless view switching with data persistence

### 🎯 **Phase 2: Builder Interfaces (ACTIVE DEVELOPMENT)**

- [ ] **Practice Script Builder Interface**
  - [ ] Visual timeline builder with drag-and-drop functionality
  - [ ] 8-box 2x4 layout system for professional practice organization
  - [ ] Time block management with precise scheduling
  - [ ] Real-time duration calculations and repetition tracking
  - [ ] Integration with PracticeScriptService for data persistence

- [ ] **Game Plan Builder Interface**
  - [ ] Situational category management (Down & Distance, Red Zone, etc.)
  - [ ] Priority assignment system (Primary, Secondary, Check-down)
  - [ ] Brian Billick methodology implementation
  - [ ] Coach card layout for lamination-ready sideline use
  - [ ] Integration with GamePlanService for data management

### 🔮 **Phase 3: PDF Export System (NEXT PRIORITY)**

- [ ] **Practice Script PDFs**
  - [ ] Custom 8-box 2x4 layout formatter
  - [ ] Professional practice script templates
  - [ ] Time block visualization and play integration
  - [ ] Print-ready output for coaching staff distribution

- [ ] **Game Plan Cards**
  - [ ] Coach lamination card format
  - [ ] Situational play organization for sideline reference
  - [ ] Priority-based layout with clear visual hierarchy
  - [ ] Multiple export formats for different coaching styles

### � **Phase 4: Professional Data Architecture (CRITICAL PRIORITY)**

- [ ] **Week 1: Supabase Foundation**
  - [ ] Create performance-optimized database schema
  - [ ] Implement Row Level Security (RLS) policies
  - [ ] Add full-text search indexes for plays
  - [ ] Set up data migration from demo data to production schema
  - [ ] Create comprehensive backup and recovery procedures

- [ ] **Week 2: Performance Caching Layer**
  - [ ] Implement IndexedDB for local caching (target: <10ms response)
  - [ ] Add optimistic updates for instant UI feedback
  - [ ] Create multi-tier caching strategy (Memory → IndexedDB → Supabase)
  - [ ] Add conflict resolution for offline/online sync
  - [ ] Performance monitoring and metrics tracking

- [ ] **Week 3: Bulletproof Backup System**
  - [ ] Automatic local backups every 5 minutes
  - [ ] Enhanced CSV/ZIP export system with metadata
  - [ ] Mobile device backup integration via Capacitor
  - [ ] Rolling backup system (keep 50 most recent)
  - [ ] Backup integrity verification and recovery testing

- [ ] **Week 4: Real-time Sync & Security**
  - [ ] Supabase realtime integration for team collaboration
  - [ ] Cross-device synchronization with conflict resolution
  - [ ] Performance dashboard and monitoring
  - [ ] Security audit and penetration testing
  - [ ] User acceptance testing and documentation

### �📱 **Phase 5: Mobile Optimization**

- [ ] **Responsive Design Audit** for all 3 views
- [ ] **Touch-friendly UI** for Practice Script builder
- [ ] **Mobile PDF Export** functionality
- [ ] **Offline Capabilities** for game day use

## 🚀 **PERFORMANCE & OPTIMIZATION**

### ✅ **Phase 1: Bundle Optimization - COMPLETE**

- ✅ **82% bundle reduction** (2.9MB → 519KB)
- ✅ Code splitting for fabric, calendar, PDF chunks
- ✅ Removed 502+ React Native packages
- ✅ Console cleanup error recovery (312 errors → 0)
- ✅ Bundle size monitoring with performance budgets

### 🎯 **Phase 2: Real-World Performance (In Progress)**

- ✅ Web Vitals monitoring setup
- ✅ Bundle size regression prevention
- ✅ Lighthouse baseline (60/100)
- [ ] **React.memo optimization** for heavy components
- [ ] **Unused CSS removal** (12KB identified)
- [ ] **Image optimization** pipeline
- [ ] **Critical CSS extraction**
- [ ] **Target: 90+ Lighthouse Score**

### 🔮 **Phase 3: Advanced Optimizations (Future)**

- [ ] Service worker implementation
- [ ] CDN and caching strategy
- [ ] Progressive Web App features
- [ ] Advanced tree shaking analysis

## 🧹 **CODE CLEANUP & MAINTENANCE**

### **High Priority**

- [ ] **3-View System Enhancement (CURRENT PRIORITY)**
  - [ ] Complete Practice Script Builder interface
  - [ ] Complete Game Plan Builder interface  
  - [ ] Implement PDF export system for both views
  - [ ] Add visual timeline builder for practice scripts
  - [ ] Create coach card layout for game plans
  - [ ] Integrate achievement system across all 3 views

- [ ] **Phase 5: Component Migration (NEXT PRIORITY)**
  - [ ] Migrate main DashboardPage to use DataResolutionService
  - [ ] Update team management pages (CreateTeam, JoinTeam)
  - [ ] Convert user profile components to new data hooks
  - [ ] Prepare calendar system for clean data integration
  - [ ] Remove legacy data loading patterns
  - [ ] Update component documentation

- [ ] **Mobile Responsiveness Issues (URGENT)**
  - [ ] Fix mobile layout inconsistencies across all 3 views
  - [ ] Responsive design audit for Practice Script and Game Plan builders
  - [ ] Touch-friendly UI elements for visual builders
  - [ ] Mobile navigation improvements for 3-view system
  - [ ] Form usability on small screens for CSV import/export
  - [ ] Legal pages mobile formatting
  - [ ] Footer and header mobile optimization
  - [ ] Performance testing on mobile devices

- [ ] **Coach Account System (ONGOING)**
  - ✅ Create Coach Account page ($9.99 one-time purchase)
  - ✅ Personal coaching profile setup
  - ✅ Team connection via school codes
  - [ ] Payment integration for coach accounts
  - [ ] Personal playbook library system
  - [ ] Practice planning tools for individual coaches
  - [ ] Team linking approval workflow
  - [ ] Content import/export between personal and team accounts
  - [ ] Coach account upgrade path from existing users
- [ ] **Payment/Subscription System (FUTURE - NOT NOW)**
  - ⚠️ **NOTE: Justin doesn't pay** - this is for future enterprise customers
  - Research school/team payment processing (Stripe for Education?)
  - Design subscription tiers (Team vs School vs District vs Individual Coach)
  - Implement payment flow in Create Team process
  - Add billing management dashboard
  - Consider school purchasing department workflows
- [ ] **Team Creation & Management System**
  - ✅ Create Team page scaffold with step-by-step flow
  - ✅ Join Team page scaffold
  - [ ] School verification system integration
  - [ ] Team ownership transfer functionality
  - [ ] Head coach role management
  - [ ] Primary contact information validation
- [ ] **Daily Quote of the Day System**
  - Design quote database with inspirational football/leadership quotes
  - Create daily rotation system with cache
  - Add quote display to dashboard header
  - Include quote attribution and sharing functionality
- [ ] **Remove unused imports** across codebase
- [ ] **Standardize error handling** patterns
- [ ] **Consolidate duplicate utility functions**
- [ ] **Update component documentation**
- [ ] **Clean up stale TODO comments in code**

### **Medium Priority**

- [ ] **TypeScript strict mode** improvements
- [ ] **ESLint rule optimization**
- [ ] **Test coverage improvements**
- [ ] **Storybook component updates**

### **Low Priority**

- [ ] **Code formatting consistency**
- [ ] **Variable naming conventions**
- [ ] **File organization restructure**

## 🔧 **TECHNICAL DEBT**

### **Architecture**

- [ ] **Consistent state management** patterns
- [ ] **API layer standardization**
- [ ] **Component prop interfaces** cleanup
- [ ] **Route structure optimization**

### **Dependencies**

- [ ] **Regular dependency updates**
- [ ] **Security vulnerability patches**
- [ ] **Unused package removal**
- [ ] **License compatibility check**

## 📱 **MOBILE & RESPONSIVE**

### **Optimization**

- [ ] **Touch interaction improvements**
- [ ] **Mobile performance profiling**
- [ ] **Cross-device testing**
- [ ] **Accessibility compliance**

## 🚦 **MONITORING & ALERTS**

### **Performance**

- ✅ Bundle size monitoring
- ✅ Lighthouse CI integration
- [ ] **Real User Monitoring (RUM)**
- [ ] **Error tracking setup**
- [ ] **Performance regression alerts**

### **Quality**

- [ ] **Code coverage thresholds**
- [ ] **Build time monitoring**
- [ ] **Dependency vulnerability scanning**

## 🎯 **UPCOMING FEATURES (Prep Work)**

### **Achievement System - BoxCall Medals & Rewards**

- [ ] **Achievement Database Design**
  - Design Supabase schema for BoxCall-specific achievements
  - Create achievement categories (seasonal, milestone, behavioral)
  - Define tracking mechanisms for user progress
- [ ] **Achievement Types Planning**
  - Helmet stickers (coach-awarded, manual)
  - BoxCall medals (automatic, task-based)
  - Team trophies (collaborative achievements)
  - Seasonal challenges and goals
- [ ] **Progress Tracking System**
  - Xbox-style achievement tracking
  - User activity monitoring hooks
  - Achievement unlock notifications
  - Progress visualization components
- [ ] **Content Creation**
  - Define initial achievement set
  - Create achievement descriptions and rewards
  - Design achievement icons and assets
  - Seasonal achievement calendar planning

### **Phase 5: Advanced Features**

- [ ] **Database schema optimization**
- [ ] **Real-time collaboration prep**
- [ ] **Advanced analytics foundation**
- [ ] **Multi-team support architecture**

## 🏈 **USER EXPERIENCE TESTING**

### **New Coach Experience Session**

- [ ] **Execute tomorrow's roadmap** - [NEW_COACH_EXPERIENCE_ROADMAP.md](./NEW_COACH_EXPERIENCE_ROADMAP.md)
- [ ] **Create sample roster CSV** - Add MaxPreps-compatible template to assets
- [ ] **Test complete onboarding flow** - Signup → Roster → Playbook → Calendar
- [ ] **Document UX feedback** - Note friction points and improvements needed

## 📝 **DOCUMENTATION**

### **Updates Needed**

- [ ] **API documentation refresh**
- [ ] **Component library docs**
- [ ] **Development setup guide**
- [ ] **Deployment documentation**

---

## 🏈 **QUICK WINS** (Easy Tasks)

- [ ] Remove console.log statements in production
- [ ] Update outdated comments
- [ ] Fix TypeScript "any" types
- [ ] Add missing prop types
- [ ] Optimize image assets
- [ ] Clean up unused CSS classes

---

## 📊 **PERFORMANCE TARGETS**

### **Current Status**

- **Bundle Size**: 519KB (Target: <500KB) ⚠️
- **Lighthouse Score**: 60/100 (Target: 90+) ⚠️
- **First Contentful Paint**: 6.8s (Target: <1.2s) ⚠️
- **Total Blocking Time**: 0ms ✅

### **Success Metrics**

- 90+ Lighthouse Performance Score
- <1.2s First Contentful Paint
- <2.5s Largest Contentful Paint
- <100MB Memory Usage
- Bundle size under performance budgets

---

**Last Updated**: August 4, 2025  
**Priority**: High for Phase 5 migration, Medium for cleanup  
**Owner**: Development Team
