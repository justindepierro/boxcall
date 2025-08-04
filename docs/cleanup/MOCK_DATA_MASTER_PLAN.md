# Mock Data Master Plan - Complete Strategy & Implementation

> **Generated**: August 4, 2025  
> **Status**: Combined Audit + Roadmap - Single Source of Truth  
> **Purpose**: Complete mock data cleanup strategy with implementation plan

## 🎯 **Executive Summary**

**Current State**: Mock data deeply embedded throughout app, affecting user experience  
**Goal**: Transform to proper dev environment with real Supabase profiles + true blank slate  
**Priority**: High - blocking realistic testing and new user onboarding  
**Progress**: Phase 1A partially complete, continuing with systematic cleanup

---

## 📊 **Complete Mock Data Inventory**

### 🏆 **Achievement System - HIGH IMPACT**

**File**: `src/services/achievementService.ts`

- **Mock Methods**: `getMockAchievements()`, `getMockHelmetStickers()`, `getMockBoxCallMedals()`
- **Mock Data**: Helmet stickers, BoxCall medals, achievements
- **Hardcoded Values**: "Eastside Eagles" team name (15+ occurrences), dev-eagles team IDs
- **Components Affected**: PersonalTrophyShelf, achievement displays
- **Status**: ✅ **COMPLETED** - Full dev mode awareness with blank slate support
- **User Impact**: ✅ Fixed - Shows empty state for new users, proper dev data for dev modes

### 📅 **Calendar System - HIGH IMPACT**

**File**: `src/services/calendarService.ts`

- **Mock Methods**: `getMockUserEvents()`, `getMockTeamEvents()`
- **Mock Data**: Practice schedules, games, team events
- **Dev Mode**: Legacy mock mode handling
- **Components Affected**: PersonalCalendar, team calendar views
- **Status**: ✅ **COMPLETED** - Empty state handling implemented with dev mode awareness
- **User Impact**: ✅ Fixed - Shows empty calendar for new users, proper dev data for dev modes

### 📈 **Dashboard Activity - HIGH IMPACT**

**File**: `src/services/dashboardService.ts`

- **Mock Methods**: `getRecentActivity()`
- **Mock Data**: Activity feeds, user interactions
- **Hardcoded Content**: Fake player activities, roster uploads
- **Components Affected**: TeamFeeds, activity displays
- **Status**: ✅ **COMPLETED** - Blank slate mode properly implemented
- **User Impact**: ✅ Fixed - Shows empty activity for new users, proper dev data for dev modes

### 👥 **Team Data Structure - CRITICAL**

**File**: `src/data/mock-team-data.ts`

- **Mock Objects**: `MOCK_TEAM_DATA`, `MOCK_TEAM_MEMBERS`
- **Hardcoded Values**: "Eastside Eagles", team structure, player roster
- **Data Size**: 258 lines of comprehensive team data
- **Components Affected**: Team displays, player management
- **Status**: ⚠️ Needs complete removal/replacement
- **User Impact**: Shows fake team instead of team creation flow

### 🏈 **Team Bulletin - MEDIUM IMPACT**

**File**: `src/pages/TeamBulletin.tsx`

- **Mock Objects**: `mockTeam` object
- **Hardcoded Content**: Team name, season, record
- **Components Affected**: Team bulletin page
- **Status**: ✅ **COMPLETED** - Dev mode awareness implemented with blank slate support
- **User Impact**: ✅ Fixed - Shows proper "No Team Found" screen for blank slate, dev team data for dev modes

### ✅ **Already Fixed/Updated**

- `TeamFeeds.tsx` - ✅ Dev mode routing implemented
- `DashboardPage.tsx` - ✅ Team count fixed
- `PersonalTrophyShelf.tsx` - ✅ Partially updated
- `Navigation.tsx` - ✅ Updated with new quick actions
- `achievementService.ts` - ✅ **COMPLETED** - Full dev mode awareness with blank slate support
- `dashboardService.ts` - ✅ **COMPLETED** - Blank slate mode returns empty activity
- `calendarService.ts` - ✅ **COMPLETED** - Empty state handling implemented
- `TeamBulletin.tsx` - ✅ **COMPLETED** - Dev mode awareness with blank slate support implemented

---

## 🚀 **Implementation Roadmap**

### **Phase 1A: Critical Dashboard Fixes** ✅ **COMPLETED**

#### Immediate Tasks (This Week)

- [x] **AchievementService** - ✅ **COMPLETED** - Dev mode awareness implemented with blank slate support
- [x] **DashboardService** - ✅ **COMPLETED** - Mock activities properly handled with blank slate mode, super_admin_real fixed
- [x] **CalendarService** - ✅ **COMPLETED** - Empty state handling implemented
- [x] **TeamBulletin** - ✅ **COMPLETED** - Dev mode awareness with proper super_admin_real handling
- [x] **Remove "Eastside Eagles" references** - ✅ **COMPLETED** - All hardcoded Eagles references cleaned up
- [x] **Fix Quick Navigation** - ✅ **COMPLETED** - Fixed React routing consistency issues
  ```bash
  # Updated files:
  # ✅ src/app/dev-mode-types.ts - "Eastside Eagles" → "BoxCall Dev Team"
  # ✅ src/app/dev-mode-types-enhanced.ts - Team code updated to "DEVTEAM"
  # ✅ src/components/dashboard/CrossTeamMessages.tsx - Team name updated
  # ✅ src/components/team-dashboard/TeamFeed.tsx - Hashtag updated
  # ✅ src/components/dev/ (all files) - Mock descriptions updated
  # ✅ src/services/achievementService.ts - All Eagles references cleaned
  # ✅ src/services/calendarService.ts - Team names updated
  # ✅ src/services/dashboardService.ts - Super admin real mode fixed
  # ✅ src/services/dev-profiles/DevProfileRepository.ts - Team IDs updated
  # ✅ src/pages/TeamBulletin.tsx - Super admin real mode properly handled
  # ✅ src/services/pdf/README.md - Example updated
  # ✅ src/components/dev/QuickDevPanel.tsx - Fixed navigation consistency
  # ✅ src/app/dev-mode-store.tsx - Enhanced state synchronization
  ```

#### Progress Tracking

- ✅ Navigation updated with new quick actions
- ✅ Font colors softened (gray-900 → gray-800)
- ✅ Auto-hide timing improved (faster response)
- ✅ **AchievementService dev mode awareness COMPLETED**
- ✅ **CalendarService empty state support COMPLETED**
- ✅ **DashboardService mock activity cleanup COMPLETED**
- ✅ **TeamBulletin dev mode awareness COMPLETED**
- ✅ **Super Admin (Real) mode properly shows real data (not mock)**
- ✅ **Quick navigation consistency issues FIXED**
- ✅ **"Eastside Eagles" references cleanup COMPLETED**

### **Phase 1B: Dev Profile Infrastructure** 📋 PLANNED

#### Supabase Dev Profiles to Create

```sql
-- Dev profiles structure:
1. dev_blank_slate@boxcall.dev     (new_user role, no teams)
2. dev_head_coach@boxcall.dev      (head_coach role, full team)
3. dev_assistant_coach@boxcall.dev (coach role, limited access)
4. dev_player@boxcall.dev          (player role, player view)
5. dev_manager@boxcall.dev         (manager role, logistics focus)
6. dev_family@boxcall.dev          (family role, limited view)
7. dev_super_admin@boxcall.dev     (admin role, system access)
```

#### Dev Team Structure

- [ ] **Create "BoxCall Development Team":**
  - Team name: "BoxCall Dev Team"
  - School: "Development High School"
  - Mascot: "Developers"
  - Team code: "DEV2025"
  - 25-30 realistic players
  - Multiple coaches with different roles
  - Complete schedules and data

### **Phase 1C: Enhanced Dev Mode System** 🔧 ARCHITECTURE

#### Updated Dev Mode Types

```typescript
export type DevMode =
  | "production" // Real user's actual data
  | "blank_slate" // Empty state, new user experience
  | "dev_head_coach" // Full team access profile
  | "dev_assistant_coach" // Limited coach access
  | "dev_player" // Player perspective
  | "dev_manager" // Team manager role
  | "dev_family" // Parent portal access
  | "dev_super_admin"; // System admin access
```

#### DevDataService Architecture

- [ ] **Create centralized mock control:**
  ```typescript
  export class DevDataService {
    static getDataSource(devMode: DevMode): DataSourceConfig;
    static getUserProfile(devMode: DevMode): Profile;
    static getTeamMemberships(devMode: DevMode): TeamMember[];
    static getPermissions(devMode: DevMode): Permission[];
  }
  ```

---

## 📋 **Critical Action Items**

### **This Week (High Priority)**

1. **Update AchievementService** - Add dev mode awareness
   - Location: `src/services/achievementService.ts`
   - Change: Add blank slate mode that returns empty data
   - Impact: Fixes fake achievements showing for new users

2. **Clean DashboardService** - Remove mock activities
   - Location: `src/services/dashboardService.ts`
   - Change: Remove hardcoded mock activity arrays
   - Impact: Fixes fake team activity in dashboard

3. **Update CalendarService** - Add empty state support
   - Location: `src/services/calendarService.ts`
   - Change: Return empty events for blank slate mode
   - Impact: Fixes fake events showing in calendar

4. **Document Eagles References** - Systematic replacement
   - Search: All "Eastside Eagles" occurrences
   - Plan: Replace with configurable dev team data
   - Impact: Removes hardcoded team names

### **Next Week (Medium Priority)**

1. **Create DevDataService** - Centralized control
2. **Set up Supabase dev profiles** - Real data sources
3. **Update remaining services** - Consistent dev mode handling
4. **Enhanced QuickDevPanel** - Better dev mode switching

---

## 🎨 **Component Impact Map**

### **Dashboard Components**

- `PersonalTrophyShelf` → ✅ **COMPLETED** - Fixed with achievement service update
- `TeamFeeds` → ✅ **COMPLETED** - Fixed with dev mode awareness
- `PersonalCalendar` → ✅ **COMPLETED** - Fixed with calendar service update
- `ProfileCard` → ✅ Updated with softer colors

### **Team Management**

- `TeamBulletin` → ⚠️ Shows hardcoded team data, needs dev mode support
- Team creation flows → ⚠️ Bypassed by mock data

### **Achievement System**

- Achievement displays → ⚠️ All fake data, needs service update
- Progress tracking → ⚠️ Fake progress states

---

## 🎯 **Success Criteria & Testing**

### **Blank Slate Mode Requirements**

- [ ] ✅ Completely empty dashboard (no fake data)
- [ ] ✅ Empty trophy shelf with proper messaging
- [ ] ⚠️ Empty calendar with "add event" prompts
- [ ] ⚠️ No fake team activity or achievements
- [ ] ✅ Proper new user onboarding flows

### **Dev Profile Mode Requirements**

- [ ] Real Supabase data for each role
- [ ] Accurate permission testing
- [ ] Realistic user scenarios
- [ ] Fast switching between roles
- [ ] No authentication hassles

### **Production Mode Requirements**

- [ ] Uses actual user's real data only
- [ ] No dev artifacts visible
- [ ] Normal app experience
- [ ] Performance optimized

---

## 💡 **Key Implementation Insights**

1. **Mock data is architectural** - affects core user experience flows
2. **"Eastside Eagles" is everywhere** - systematic replacement needed
3. **No consistent dev mode pattern** - services handle mock data differently
4. **Blank slate is critical** - new coach first impression is broken
5. **Achievement system needs redesign** - currently 100% mock data

---

## 🔄 **Progress Tracking**

### **Completed ✅**

- Navigation quick actions reorganized
- Font colors softened across dashboard
- Auto-hide behavior improved
- TeamFeeds dev mode awareness added
- Basic dev mode infrastructure exists

### **In Progress ⚠️**

- AchievementService dev mode awareness
- DashboardService mock activity cleanup
- CalendarService empty state handling

### **Planned 📋**

- DevDataService creation
- Supabase dev profile setup
- Enhanced QuickDevPanel
- Systematic Eagles reference removal

---

## 🚀 **Next Immediate Steps**

1. **Continue with AchievementService** - Add blank slate mode
2. **Clean up DashboardService** - Remove mock activities
3. **Fix CalendarService** - Add empty state support
4. **Test blank slate experience** - Verify no mock data shows
5. **Plan Supabase dev profiles** - Real data infrastructure

---

_This master plan combines audit findings with implementation strategy. The systematic approach ensures we build a proper dev environment while maintaining excellent new user experience._
