# Mock Data Cleanup Roadmap - MOVED TO MASTER PLAN

> **⚠️ DEPRECATED**: This roadmap has been combined with the audit  
> **📍 NEW LOCATION**: [docs/cleanup/MOCK_DATA_MASTER_PLAN.md](./docs/cleanup/MOCK_DATA_MASTER_PLAN.md)  
> **📅 Updated**: August 4, 2025

---

## 🎯 **Current Status**

This roadmap has been **merged** with the mock data audit to create a comprehensive master plan for all cleanup efforts.

### **What Moved Where:**

- **Phase structure** → Master Plan Section: "Implementation Roadmap"
- **Dev profile strategy** → Master Plan Section: "Dev Profile Infrastructure"
- **Success criteria** → Master Plan Section: "Success Criteria & Testing"
- **Implementation steps** → Master Plan Section: "Critical Action Items"

---

## 📍 **Find Current Information At:**

**[📋 docs/cleanup/MOCK_DATA_MASTER_PLAN.md](./docs/cleanup/MOCK_DATA_MASTER_PLAN.md)**

This master plan includes:

- ✅ Complete audit findings
- ✅ Implementation roadmap (from this file)
- ✅ Progress tracking
- ✅ Combined strategy
- ✅ Single source of truth

---

_Please use the Master Plan for all future mock data cleanup work._

## 🔍 **Current State Analysis**

### Mock Data Locations Found:

1. **Services with Hardcoded Mock Data:**
   - `src/services/dashboardService.ts` - Mock activity feed
   - `src/services/achievementService.ts` - Mock achievements (stickers, medals, trophies)
   - `src/pages/DashboardPage.tsx` - Mock team count (`const totalTeams = 3`)
   - `src/app/dev-mode-types.ts` - Mock Eagles team data
   - `src/data/mock-team-data.ts` - Mock team/player data

2. **Components Using Mock Data:**
   - `PersonalTrophyShelf` - Achievement display
   - `TeamFeeds` - Activity feeds
   - `PersonalCalendar` - Calendar events
   - Dashboard components throughout

3. **Dev Mode Issues:**
   - Services don't check dev mode before returning mock data
   - No real distinction between "blank slate" and "production" modes
   - Dev modes use same mock data regardless of role

---

## 📋 **Phase 1: Mock Data Audit & Cleanup**

### 1.1 Complete Mock Data Inventory

- [ ] **Search and catalog ALL mock data locations**

  ```bash
  # Search patterns to run:
  grep -r "mock" src/ --include="*.ts" --include="*.tsx"
  grep -r "Mock" src/ --include="*.ts" --include="*.tsx"
  grep -r "MOCK" src/ --include="*.ts" --include="*.tsx"
  grep -r "Eagles" src/ --include="*.ts" --include="*.tsx"
  grep -r "TODO.*mock" src/ --include="*.ts" --include="*.tsx"
  ```

- [ ] **Document each mock data source:**
  - Location in codebase
  - What data it provides
  - Which components consume it
  - Impact on user experience

### 1.2 Service Layer Refactoring

- [x] **Update `dashboardService.ts`:**
  - Remove hardcoded mock activity
  - Add dev mode awareness
  - Return empty arrays for blank slate mode
  - Return real data for production mode

- [x] **Update `achievementService.ts`:**
  - Remove hardcoded mock achievements
  - Implement real Supabase queries
  - Add dev mode support for different data sources

- [ ] **Create new `DevDataService.ts`:**
  - Centralized dev mode data management
  - Switch between blank/real/dev-profile data
  - Clean interface for all services to use

### 1.3 Component Updates

- [ ] **Remove hardcoded mock data from components:**
  - Dashboard page team count
  - Achievement displays
  - Activity feeds
  - Calendar events

- [ ] **Add proper loading states:**
  - Empty state components
  - Loading skeletons
  - Error boundaries

---

## 📋 **Phase 2: Supabase Dev Profile System**

### 2.1 Create Dev Profiles Structure

```sql
-- Dev profiles to create in Supabase:
1. dev_blank_slate@boxcall.dev     (new_user role, no teams)
2. dev_head_coach@boxcall.dev      (head_coach role, full team)
3. dev_assistant_coach@boxcall.dev (coach role, limited access)
4. dev_player@boxcall.dev          (player role, player view)
5. dev_manager@boxcall.dev         (manager role, logistics focus)
6. dev_family@boxcall.dev          (family role, limited view)
7. dev_super_admin@boxcall.dev     (admin role, system access)
```

### 2.2 Create Dev Team Structure

- [ ] **Create "BoxCall Development Team":**
  - Team name: "BoxCall Dev Team"
  - School: "Development High School"
  - Mascot: "Developers"
  - Team code: "DEV2025"
  - Full roster with realistic data

- [ ] **Populate with realistic data:**
  - 25-30 players across different positions
  - Multiple coaches with different roles
  - Practice schedules
  - Game schedule
  - Achievement history
  - Playbook content

### 2.3 Dev Profile Data Assignment

- [ ] **dev_head_coach**: Full team access, all permissions
- [ ] **dev_assistant_coach**: Limited coach access, specific groups
- [ ] **dev_player**: Player #15, position QB, junior
- [ ] **dev_manager**: Team manager, logistics permissions
- [ ] **dev_family**: Parent of player #15, family portal access
- [ ] **dev_super_admin**: System admin, all teams access

---

## 📋 **Phase 3: Enhanced Dev Mode System**

### 3.1 Update Dev Mode Types

```typescript
export type DevMode =
  | "production" // Real user's actual data
  | "blank_slate" // Empty state, new user experience
  | "dev_head_coach" // Use dev_head_coach@boxcall.dev profile
  | "dev_assistant_coach" // Use dev_assistant_coach@boxcall.dev profile
  | "dev_player" // Use dev_player@boxcall.dev profile
  | "dev_manager" // Use dev_manager@boxcall.dev profile
  | "dev_family" // Use dev_family@boxcall.dev profile
  | "dev_super_admin"; // Use dev_super_admin@boxcall.dev profile
```

### 3.2 Profile Switching System

- [ ] **Create `DevProfileService`:**
  - Switch between dev profiles without re-authentication
  - Load profile-specific data and permissions
  - Maintain session state across switches

- [ ] **Update dev mode hooks:**
  - Real profile data loading
  - Permission system integration
  - Team membership switching

### 3.3 Enhanced QuickDevPanel

- [ ] **Update dev mode options:**

  ```typescript
  const DEV_MODES = [
    {
      mode: "production",
      label: "🏭 Production",
      description: "Your real data",
    },
    {
      mode: "blank_slate",
      label: "🆕 Blank Slate",
      description: "New coach experience",
    },
    {
      mode: "dev_head_coach",
      label: "🏆 Head Coach",
      description: "Full team access",
    },
    {
      mode: "dev_assistant_coach",
      label: "👨‍🏫 Assistant Coach",
      description: "Limited access",
    },
    {
      mode: "dev_player",
      label: "🏃‍♂️ Player",
      description: "Player perspective",
    },
    { mode: "dev_manager", label: "📋 Manager", description: "Team logistics" },
    { mode: "dev_family", label: "👨‍👩‍👧‍👦 Family", description: "Parent portal" },
    {
      mode: "dev_super_admin",
      label: "👑 Super Admin",
      description: "System admin",
    },
  ];
  ```

- [ ] **Add profile information display:**
  - Current dev profile being used
  - Team memberships
  - Permission levels
  - Data source confirmation

---

## 📋 **Phase 4: Data Population & Testing**

### 4.1 Realistic Data Creation

- [ ] **Player Data:**
  - Names, positions, jersey numbers
  - Stats, achievements, attendance
  - Parent contact information
  - Academic information

- [ ] **Team Operations Data:**
  - Practice schedules (past/future)
  - Game schedule with results
  - Playbook with plays
  - Achievement history
  - Team announcements

- [ ] **User Activity Data:**
  - Recent logins
  - Activity feeds
  - Messages and notifications
  - Calendar events

### 4.2 Testing Scenarios

- [ ] **New Coach Experience (blank_slate):**
  - Empty dashboard
  - Team creation flow
  - First player addition
  - Initial setup wizards

- [ ] **Each Role Perspective:**
  - Verify permission boundaries
  - Test role-specific features
  - Validate data visibility
  - Check navigation restrictions

---

## 📋 **Phase 5: Implementation Strategy**

### 5.1 Migration Approach

1. **Parallel Development:**
   - Keep existing mock system running
   - Build new dev profile system alongside
   - Gradual service migration

2. **Feature Flags:**
   - Toggle between old/new systems
   - Safe rollback capability
   - Component-by-component migration

3. **Testing Strategy:**
   - Automated tests for each dev mode
   - Manual testing workflows
   - Performance impact assessment

### 5.2 Database Setup Script

```bash
# Create script: scripts/setup-dev-profiles.sh
- Create dev user accounts
- Generate team and player data
- Set up realistic relationships
- Populate achievement history
- Create sample content
```

---

## 🎯 **Success Criteria**

### For Blank Slate Mode:

- [ ] Completely empty dashboard
- [ ] No preloaded achievements
- [ ] No mock team data
- [ ] True new user experience
- [ ] Proper onboarding flows

### For Dev Profile Modes:

- [ ] Real Supabase data for each role
- [ ] Accurate permission testing
- [ ] Realistic user scenarios
- [ ] Fast switching between roles
- [ ] No authentication hassles

### For Production Mode:

- [ ] Uses actual user's real data
- [ ] No dev artifacts visible
- [ ] Normal app experience
- [ ] Performance optimized

---

## 🚀 **Next Steps**

1. **Start with Phase 1** - Complete mock data audit
2. **Set up dev profiles** in Supabase manually
3. **Implement DevDataService** for centralized control
4. **Update services** one by one to use new system
5. **Enhance QuickDevPanel** with new modes
6. **Test thoroughly** across all scenarios

---

## 💡 **Benefits of This Approach**

✅ **True blank slate testing** - See exactly what new coaches experience  
✅ **Realistic role testing** - Use real data for each perspective  
✅ **No mock data confusion** - Clean separation of concerns  
✅ **Easy development** - Quick role switching without re-auth  
✅ **Better QA** - Test real scenarios with real data  
✅ **Scalable system** - Add new dev profiles as needed

---

_This roadmap will transform your development experience and give you confidence that the new coach onboarding works perfectly!_
