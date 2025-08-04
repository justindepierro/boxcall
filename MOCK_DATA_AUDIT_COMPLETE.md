# Complete Mock Data Audit - BoxCall Application

## 🔍 **Executive Summary**

The BoxCall application has extensive mock data embedded throughout the system that prevents a true "blank slate" experience. This audit catalogs every instance of mock data and provides a detailed cleanup strategy.

---

## 📊 **Mock Data Inventory**

### **🎯 Primary Mock Data Sources**

#### 1. **Core Dev Mode System**

**Files:** `src/app/dev-mode-types.ts`

- **MockTeamData type** - Complete team structure definition
- **mockTeamData object** - "Eastside Eagles" sample team with:
  - Team details (name, code, subscription)
  - 15+ players with positions, grades, stats
  - 4 coaches with different roles
- **Impact:** Used across all "view*as*\*" modes

#### 2. **Achievement System**

**Files:** `src/services/achievementService.ts`

- **getMockAchievements()** - Returns preset achievements
- **getMockHelmetStickers()** - 5 helmet stickers with game references
- **getMockBoxCallMedals()** - 3 medals (First Touchdown, Team Leader, etc.)
- **Impact:** Always shows achievements even for new users
- **Lines:** 212-370+ (extensive mock data methods)

#### 3. **Dashboard Activity Feed**

**Files:** `src/services/dashboardService.ts`

- **getMockRecentActivity()** - Creates fake activity items
- **Mock activities include:**
  - Achievement notifications
  - Practice updates
  - Game announcements
  - Message notifications
- **Impact:** Dashboard never shows empty state
- **Lines:** 112-148

#### 4. **Calendar System**

**Files:** `src/services/calendarService.ts`

- **getMockUserEvents()** - Extensive calendar data (lines 305-392)
- **getMockTeamEvents()** - Team-specific events (lines 395-402)
- **getMockRSVPs()** - Event attendance data (lines 406+)
- **Mock event types:**
  - Practices (multiple per week)
  - Games with opponents
  - Team meetings
  - Academic deadlines
- **Impact:** Calendar never appears empty

#### 5. **Static Mock Data Files**

**Files:**

- `src/data/mock-team-data.ts` - Additional team data structures
- `src/data/demoPlays.ts` - Playbook demo content

---

### **🔧 Service-Level Mock Data**

#### **Dashboard Page Components**

**File:** `src/pages/DashboardPage.tsx`

```typescript
const totalTeams = 3; // Mock data - Line 50
```

#### **Practice Service**

**File:** `src/services/practiceService.ts`

- Mock practice script implementations
- Placeholder practice planning data

#### **Mobile Testing**

**File:** `src/services/mobile/MobileTestSpecs.ts`

- Mock viewport configurations
- Mock platform contexts

---

### **🎨 Component-Level Issues**

#### **Trophy Shelf Component**

- Consumes achievement service mock data
- Always displays preset achievements
- No empty state handling

#### **Team Feeds Component**

- Uses dashboard service mock activity
- Shows fake recent activity
- No "no activity" state

#### **Personal Calendar Component**

- Loads mock calendar events
- Shows fake practices/games
- Never displays empty calendar

---

## 🚨 **Critical Problems Identified**

### **1. Services Ignore Dev Mode**

Most services return mock data regardless of the current dev mode:

```typescript
// Example from achievementService.ts
if (devMode === "super_admin_mock" || devMode?.startsWith("view_as_")) {
  return this.getMockAchievements(userId);
}
// BUT - also returns mock for production users!
return this.getMockHelmetStickers(userId); // Line 162
```

### **2. No Blank Slate Implementation**

The `blank_slate` dev mode exists but services don't respect it:

- Achievement service still returns mock data
- Dashboard still shows mock activity
- Calendar still populates mock events

### **3. Hardcoded "Production" Mock Data**

Many services default to mock data even in production mode:

- Calendar service always returns mock events
- Dashboard service always returns mock activity
- Achievement service defaults to mock for users with no real data

### **4. Mixed Real/Mock Data**

Some components use real user profile data but mock team/activity data, creating inconsistent experiences.

---

## 📋 **Detailed Cleanup Plan**

### **Phase 1: Service Refactoring (Priority: HIGH)**

#### **1.1 Update Achievement Service**

```typescript
// Current problematic code:
static async getAchievements(userId: string, devMode?: DevMode): Promise<AchievementData> {
  if (devMode === "super_admin_mock" || devMode?.startsWith("view_as_")) {
    return this.getMockAchievements(userId);
  }
  // ... but then defaults to mock anyway!
  return this.getMockHelmetStickers(userId);
}

// Fixed approach:
static async getAchievements(userId: string, devMode?: DevMode): Promise<AchievementData> {
  // Blank slate - return empty
  if (devMode === "blank_slate") {
    return { helmetStickers: [], medals: [], totalPoints: 0 };
  }

  // Dev profile modes - use specific dev data
  if (devMode?.startsWith("dev_")) {
    return this.getDevProfileAchievements(devMode, userId);
  }

  // Mock modes
  if (devMode === "super_admin_mock" || devMode?.startsWith("view_as_")) {
    return this.getMockAchievements(userId);
  }

  // Production - real database only
  return this.getRealAchievements(userId);
}
```

#### **1.2 Update Dashboard Service**

- Remove hardcoded mock activity
- Add blank slate support
- Implement real activity queries
- Add dev profile data loading

#### **1.3 Update Calendar Service**

- Remove automatic mock event loading
- Add empty state returns for blank slate
- Implement real event queries
- Support dev profile calendars

### **Phase 2: Dev Profile System Implementation**

#### **2.1 Create Supabase Dev Profiles**

```sql
-- Create dev user accounts
INSERT INTO auth.users (email, email_confirmed_at) VALUES
('dev_blank_slate@boxcall.dev', NOW()),
('dev_head_coach@boxcall.dev', NOW()),
('dev_assistant_coach@boxcall.dev', NOW()),
('dev_player@boxcall.dev', NOW()),
('dev_manager@boxcall.dev', NOW()),
('dev_family@boxcall.dev', NOW()),
('dev_super_admin@boxcall.dev', NOW());

-- Create profiles
INSERT INTO profiles (id, full_name, email, role) VALUES
('[dev_blank_slate_id]', 'Blank Slate User', 'dev_blank_slate@boxcall.dev', 'coach'),
('[dev_head_coach_id]', 'Dev Head Coach', 'dev_head_coach@boxcall.dev', 'coach'),
-- ... etc
```

#### **2.2 Create Dev Team Structure**

```sql
-- Create BoxCall Dev Team
INSERT INTO teams (name, school_name, mascot, team_code, created_by) VALUES
('BoxCall Development Team', 'Development High School', 'Developers', 'DEV2025', '[dev_head_coach_id]');

-- Add team memberships for each dev profile
-- Add realistic players, coaches, schedules, etc.
```

#### **2.3 Populate Realistic Data**

- 25-30 players with realistic stats
- Full practice schedule
- Game schedule with some completed games
- Realistic achievement history
- Active playbook content
- Team announcements and activity

### **Phase 3: Enhanced Dev Mode System**

#### **3.1 New Dev Mode Types**

```typescript
export type DevMode =
  | "production" // Real user's actual data
  | "blank_slate" // Empty state, new user experience
  | "dev_head_coach" // Full team access with realistic data
  | "dev_assistant_coach" // Limited coach access
  | "dev_player" // Player perspective (#15, QB, Junior)
  | "dev_manager" // Team manager, logistics focused
  | "dev_family" // Parent of player #15
  | "dev_super_admin" // System admin, multiple teams
  | "legacy_mock"; // Keep old mock system for transition
```

#### **3.2 DevProfileService**

```typescript
export class DevProfileService {
  static async switchToDevProfile(devMode: DevMode): Promise<UserProfile> {
    // Load dev profile data without re-authentication
    // Return profile with appropriate permissions and team data
  }

  static async getDevProfileData(devMode: DevMode, dataType: string) {
    // Return role-appropriate data for dev profiles
  }
}
```

### **Phase 4: Component Updates**

#### **4.1 Add Empty State Components**

- EmptyTrophyShelf
- EmptyActivityFeed
- EmptyCalendar
- EmptyDashboard

#### **4.2 Update Existing Components**

- Add loading states
- Handle empty data gracefully
- Show appropriate empty state messages

---

## 🎯 **Implementation Strategy**

### **Recommended Approach: Parallel Development**

1. **Keep existing mock system** running during development
2. **Build new dev profile system** alongside current system
3. **Add feature flag** to toggle between old/new systems
4. **Migrate services one by one** with thorough testing
5. **Update QuickDevPanel** to support new modes
6. **Phase out old mock system** once new system is validated

### **Success Metrics**

#### **For Blank Slate Mode:**

- ✅ Dashboard shows "Welcome! Let's create your first team"
- ✅ Trophy shelf shows "No achievements yet"
- ✅ Calendar shows "No events scheduled"
- ✅ Activity feed shows "No recent activity"
- ✅ Zero hardcoded achievements or data

#### **For Dev Profile Modes:**

- ✅ Each role sees appropriate data and permissions
- ✅ Realistic user scenarios with real-looking data
- ✅ Fast switching between roles without re-auth
- ✅ Consistent data across role perspectives

#### **For Production Mode:**

- ✅ Uses only real user's actual database data
- ✅ No dev artifacts or mock data visible
- ✅ Normal app performance and experience

---

## 🚀 **Next Steps**

1. **Create script to setup dev profiles in Supabase**
2. **Implement DevDataService for centralized data control**
3. **Refactor achievementService as proof of concept**
4. **Update QuickDevPanel with new dev modes**
5. **Create realistic dev team data**
6. **Test blank slate experience thoroughly**
7. **Roll out to other services incrementally**

---

## 💡 **Benefits of This Cleanup**

✅ **True new coach testing** - Experience exactly what new users see  
✅ **Realistic role testing** - Use believable data for each user type  
✅ **Better quality assurance** - Test real user scenarios  
✅ **Cleaner codebase** - Remove mock data scattered throughout  
✅ **Scalable development** - Easy to add new dev scenarios  
✅ **Improved onboarding** - Validate new user flows work perfectly

This comprehensive cleanup will transform your development workflow and ensure the new coach experience is genuinely tested with realistic scenarios!
