# 📋 BoxCall - TODO & Maintenance Tasks

> **Project maintenance, cleanup, and optimization tracking**

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

- [ ] **Phase 5: Component Migration (NEXT PRIORITY)**
  - [ ] Migrate main DashboardPage to use DataResolutionService
  - [ ] Update team management pages (CreateTeam, JoinTeam)
  - [ ] Convert user profile components to new data hooks
  - [ ] Prepare calendar system for clean data integration
  - [ ] Remove legacy data loading patterns
  - [ ] Update component documentation

- [ ] **Mobile Responsiveness Issues (URGENT)**
  - [ ] Fix mobile layout inconsistencies across pages
  - [ ] Responsive design audit for all components
  - [ ] Touch-friendly UI elements and spacing
  - [ ] Mobile navigation improvements
  - [ ] Form usability on small screens
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
