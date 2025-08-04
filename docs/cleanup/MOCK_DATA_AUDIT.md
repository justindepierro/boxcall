# Mock Data Audit - MOVED TO MASTER PLAN

> **⚠️ DEPRECATED**: This file has been combined with the roadmap  
> **📍 NEW LOCATION**: [MOCK_DATA_MASTER_PLAN.md](./MOCK_DATA_MASTER_PLAN.md)  
> **📅 Updated**: August 4, 2025

---

## 🎯 **Current Status**

This audit has been **merged** with the implementation roadmap to create a single source of truth for all mock data cleanup efforts.

### **What Moved Where:**

- **Complete inventory** → Master Plan Section: "Complete Mock Data Inventory"
- **Impact analysis** → Master Plan Section: "Component Impact Map"
- **Priority assessment** → Master Plan Section: "Critical Action Items"
- **Recommendations** → Master Plan Section: "Implementation Roadmap"

---

## 📍 **Find Current Information At:**

**[📋 MOCK_DATA_MASTER_PLAN.md](./MOCK_DATA_MASTER_PLAN.md)**

This master plan includes:

- ✅ Complete audit findings (from this file)
- ✅ Implementation roadmap
- ✅ Progress tracking
- ✅ Success criteria
- ✅ Action items

---

_Please use the Master Plan for all future mock data cleanup work._

---

## 📊 **Mock Data Inventory by Category**

### 🏆 **Achievement System**

**File**: `src/services/achievementService.ts`

- **Mock Methods**: `getMockAchievements()`, `getMockHelmetStickers()`, `getMockBoxCallMedals()`
- **Mock Data**: Helmet stickers, BoxCall medals, achievements
- **Hardcoded Values**: "Eastside Eagles" team name, dev-eagles team IDs
- **Components Affected**: PersonalTrophyShelf, achievement displays
- **User Experience Impact**: Shows fake achievements instead of empty state for new users

### 📅 **Calendar System**

**File**: `src/services/calendarService.ts`

- **Mock Methods**: `getMockUserEvents()`, `getMockTeamEvents()`
- **Mock Data**: Practice schedules, games, team events
- **Dev Mode Routing**: Legacy mock mode handling
- **Components Affected**: PersonalCalendar, team calendar views
- **User Experience Impact**: Shows fake events in blank slate mode

### 📈 **Dashboard Activity**

**File**: `src/services/dashboardService.ts`

- **Mock Methods**: `getRecentActivity()`
- **Mock Data**: Activity feeds, user interactions
- **Hardcoded Content**: Fake player activities, roster uploads
- **Components Affected**: TeamFeeds, activity displays
- **User Experience Impact**: Shows fake team activity for new coaches

### 👥 **Team Data**

**File**: `src/data/mock-team-data.ts`

- **Mock Objects**: `MOCK_TEAM_DATA`, `MOCK_TEAM_MEMBERS`
- **Hardcoded Values**: "Eastside Eagles", team structure, player roster
- **Data Size**: 258 lines of comprehensive team data
- **Components Affected**: Team displays, player management
- **User Experience Impact**: Shows fake team instead of team creation flow

### 🏈 **Team Bulletin**

**File**: `src/pages/TeamBulletin.tsx`

- **Mock Objects**: `mockTeam` object
- **Hardcoded Content**: Team name, season, record
- **Components Affected**: Team bulletin page
- **User Experience Impact**: Shows fake team information

### 🎯 **Dev Mode Types**

**File**: `src/app/dev-mode-types.ts`

- **Mock References**: Eagles team data, dev profiles
- **Impact**: Dev mode switching logic
- **User Experience Impact**: Inconsistent dev mode behavior

---

## 🎯 **High-Priority Mock Data (Immediate Impact)**

### 1. **Dashboard Experience Issues**

```typescript
// src/services/achievementService.ts - Lines 378, 478-601
teamName: "Eastside Eagles"  // Hardcoded in 15+ places
teamId: "dev-eagles"         // Hardcoded team ID

// src/services/dashboardService.ts - Lines 112-148
const mockActivity: ActivityItem[] = [...] // Fake activities

// src/pages/DashboardPage.tsx
const totalTeams = 3 // Fixed team count (ALREADY FIXED!)
```

### 2. **Calendar Mock Events**

```typescript
// src/services/calendarService.ts - Lines 334-500+
getMockUserEvents(); // Fake personal events
getMockTeamEvents(); // Fake team events
```

### 3. **Team Data Structure**

```typescript
// src/data/mock-team-data.ts - Full file (258 lines)
MOCK_TEAM_DATA; // Complete fake team
MOCK_TEAM_MEMBERS; // Fake roster and coaches
```

---

## 🔧 **Services Requiring Dev Mode Awareness**

### ✅ **Already Updated**

- `TeamFeeds.tsx` - Dev mode routing implemented
- `DashboardPage.tsx` - Team count fixed

### ⚠️ **Needs Updates**

- `achievementService.ts` - Add blank slate mode
- `dashboardService.ts` - Remove hardcoded activity
- `calendarService.ts` - Add empty state handling
- `practiceService.ts` - Mock practice data cleanup

### 🆕 **Missing Dev Mode Support**

- `TeamBulletin.tsx` - No dev mode awareness
- `enhancedCalendarService.ts` - Mock implementations
- Phase 3 services - Multiple mock implementations

---

## 🎨 **Component Impact Analysis**

### **Dashboard Components**

- `PersonalTrophyShelf` → Shows fake achievements
- `TeamFeeds` → Shows fake activity (✅ partially fixed)
- `PersonalCalendar` → Shows fake events

### **Team Management**

- `TeamBulletin` → Shows hardcoded team data
- Team creation flows → Bypassed by mock data

### **Achievement System**

- Achievement displays → All fake data
- Progress tracking → Fake progress states

---

## 🚀 **Recommended Implementation Order**

### **Phase 1A: Critical Dashboard Fixes**

1. **AchievementService** - Add blank slate mode
2. **DashboardService** - Remove mock activities
3. **CalendarService** - Add empty state support

### **Phase 1B: Team Data Cleanup**

1. **Remove mock-team-data.ts** dependency
2. **Update TeamBulletin** for dev mode
3. **Clean up hardcoded "Eagles" references**

### **Phase 1C: Dev Mode Standardization**

1. **Create DevDataService** - Centralized mock control
2. **Update remaining services** - Consistent dev mode handling
3. **Add blank slate components** - Proper empty states

---

## 📋 **Action Items for Next Steps**

### **Immediate Tasks**

- [ ] Update `achievementService.ts` for blank slate mode
- [ ] Remove hardcoded activities from `dashboardService.ts`
- [ ] Add empty calendar state to `calendarService.ts`
- [ ] Document all "Eagles" references for replacement

### **Dev Environment Setup**

- [ ] Create real dev profiles in Supabase
- [ ] Build DevDataService for centralized control
- [ ] Test blank slate experience end-to-end

### **Quality Assurance**

- [ ] Verify no mock data leaks in production mode
- [ ] Test all dev modes with realistic data
- [ ] Validate empty states look professional

---

## 💡 **Key Insights**

1. **Mock data is deeply embedded** - affects core user experience
2. **"Eastside Eagles" appears 15+ times** - systematic replacement needed
3. **No consistent dev mode pattern** - services handle differently
4. **Blank slate experience is broken** - shows fake data instead of empty states
5. **Achievement system needs redesign** - currently all mock data

---

## 🎯 **Success Criteria**

✅ **Perfect Blank Slate**: New coaches see completely empty dashboard  
✅ **Realistic Dev Modes**: Each role shows appropriate real data  
✅ **No Mock Data Leaks**: Production users never see fake content  
✅ **Fast Development**: Easy switching between realistic scenarios

---

_This audit provides the foundation for implementing a proper dev environment that serves both new user testing and realistic development scenarios._
