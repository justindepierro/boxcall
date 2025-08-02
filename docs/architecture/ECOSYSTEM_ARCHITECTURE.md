# BoxCall Ecosystem Architecture

## Component Interconnection Map

This document outlines how all BoxCall components connect and reference each other across the platform ecosystem.

## Core Navigation Flow

```
Authentication → Role Detection → Component Routing
                                       ↓
Personal Dashboard ←→ Team Bulletin ←→ Calendar Page ←→ Settings
        ↓                  ↓              ↓            ↓
    Dashboard          Team Mgmt      Master Cal    Team Config
   Components         Components     Integration   & Permissions
```

## Primary Component Relationships

### 1. Dashboard Ecosystem

#### Personal Dashboard (`/dashboard`)
**Dependencies:**
- `PersonalCalendar.tsx` → References Master Calendar data
- `CrossTeamMessages.tsx` → Aggregates from Team Bulletin feeds
- `PersonalTrophyShelf.tsx` → Pulls achievements from all teams
- `QuickActions/` → Routes to appropriate team contexts

**Data Sources:**
- User's team memberships (cross-team aggregation)
- Achievement data from all teams
- Calendar events from all teams
- Messages from all teams user belongs to

#### Team Bulletin (`/teams/:teamId/bulletin`)
**Dependencies:**
- `TeamCalendar.tsx` → References Master Calendar for team events
- `TeamRoster.tsx` → Syncs with Team Management settings
- `TeamFeed.tsx` → Integrates with communication system
- `TeamTrophyCase.tsx` → Links to achievement system

**Data Sources:**
- Single team context
- Team-specific events and announcements
- Team member data
- Team achievements and goals

### 2. Calendar System Integration

#### Calendar Data Flow
```
Database (Supabase)
    ↓
Calendar Service Layer
    ↓
├── PersonalCalendar (Dashboard) → Cross-team aggregation
├── TeamCalendar (Team Bulletin) → Team-specific events
└── Master Calendar (/calendar) → Unified management interface
    ↓
Settings Integration → Calendar permissions & preferences
```

#### Calendar Component Connections
- **Personal Dashboard Calendar** → Links to Master Calendar with user's team filter
- **Team Bulletin Calendar** → Links to Master Calendar with specific team filter
- **Master Calendar** → Provides data to both dashboard calendars
- **Settings Page** → Manages calendar permissions and sync preferences

### 3. Team Management Integration

#### Team Settings Flow
```
Team Bulletin → Team Management (Settings)
    ↓              ↓
Team Roster ←→ Role Management ←→ Permission System
    ↓              ↓                    ↓
Calendar     →  Feature Access  →   Dashboard Visibility
Permissions      Controls              & Quick Actions
```

#### Data Synchronization
- **Team Roster changes** → Update calendar event permissions
- **Role modifications** → Reflect in dashboard quick actions
- **Team settings updates** → Cascade to all team components
- **Permission changes** → Update feature visibility across ecosystem

## Detailed Component References

### PersonalCalendar.tsx → Master Calendar
```typescript
// Navigation from dashboard widget to full calendar
onViewFullCalendar = () => {
  navigate('/calendar', { 
    state: { 
      userTeamsFilter: user.teamMemberships,
      defaultView: 'month' 
    }
  });
};
```

### TeamCalendar.tsx → Master Calendar
```typescript
// Navigation from team bulletin to team-filtered calendar
onViewTeamCalendar = () => {
  navigate('/calendar', { 
    state: { 
      teamFilter: teamId,
      defaultView: 'month' 
    }
  });
};
```

### TeamRoster.tsx → Team Management
```typescript
// Sync roster data with team settings
useEffect(() => {
  // Sync roster changes with team management settings
  syncRosterWithTeamSettings(teamId, rosterChanges);
}, [rosterChanges]);
```

### Dashboard Quick Actions → Team Context
```typescript
// Role-based quick actions that route to team contexts
const PlayerQuickActions = () => (
  <>
    <QuickAction 
      label="View Practice Schedule" 
      onClick={() => navigate(`/teams/${activeTeam}/bulletin`, { anchor: 'calendar' })} 
    />
    <QuickAction 
      label="Team Messages" 
      onClick={() => navigate(`/teams/${activeTeam}/bulletin`, { anchor: 'feed' })} 
    />
  </>
);
```

## State Management Connections

### Global State Dependencies
```typescript
// User context affects all components
interface UserContext {
  user: User;
  activeTeams: Team[];
  permissions: Permission[];
  preferences: UserPreferences;
}

// Team context for bulletin components
interface TeamContext {
  currentTeam: Team;
  teamMembers: TeamMember[];
  teamPermissions: TeamPermission[];
  teamSettings: TeamSettings;
}

// Calendar context spans both dashboard types
interface CalendarContext {
  userEvents: CalendarEvent[];     // For PersonalCalendar
  teamEvents: CalendarEvent[];     // For TeamCalendar
  masterCalendar: CalendarEvent[]; // For /calendar page
}
```

### Cross-Component Data Sharing
- **Achievement System**: Personal Trophy Shelf ←→ Team Trophy Case
- **Communication Hub**: Cross-Team Messages ←→ Team Feed
- **Calendar Integration**: All calendar components share event data
- **Role-Based Features**: User role affects all component visibility

## Database Schema Connections

### Key Table Relationships
```sql
-- Core user and team relationships
users → team_members → teams
   ↓         ↓           ↓
achievements ← team_achievements
   ↓              ↓
personal_shelf   team_trophy_case

-- Calendar system relationships  
teams → team_events → calendar_events
users → user_events → calendar_events
   ↓         ↓
personal_calendar → master_calendar

-- Communication flow
teams → team_messages → user_notifications
users → cross_team_messages
```

## Navigation Architecture

### Route Structure
```
/dashboard                    # Personal Dashboard
/teams/:teamId/bulletin      # Team Bulletin
/calendar                    # Master Calendar
/teams/:teamId/settings      # Team Management
/settings                    # User Preferences
```

### Component-to-Route Mapping
- **PersonalCalendar** → `/calendar?userTeams=true`
- **TeamCalendar** → `/calendar?team=${teamId}`
- **TeamRoster** → `/teams/${teamId}/settings#roster`
- **CrossTeamMessages** → `/teams/${teamId}/bulletin#feed`
- **Quick Actions** → Various team-specific routes

## Performance Considerations

### Data Loading Strategy
- **Personal Dashboard**: Lazy load cross-team data
- **Team Bulletin**: Cache team-specific data
- **Calendar System**: Paginated event loading
- **Settings Pages**: On-demand configuration loading

### State Synchronization
- **Real-time updates**: Supabase subscriptions for live data
- **Optimistic updates**: Immediate UI feedback
- **Background sync**: Periodic data refresh
- **Conflict resolution**: Last-write-wins with user notification

## Future Ecosystem Expansions

### Planned Integrations
- **Mobile App**: Shared state with web components
- **Family Portal**: Parent/guardian component access
- **Recruiting Platform**: Cross-team player visibility
- **League Integration**: Multi-team tournament management

### Scalability Architecture
- **Microservice Ready**: Component isolation for service extraction
- **API Gateway**: Centralized data access layer
- **Event-Driven**: Component communication via events
- **Plugin System**: Extensible feature architecture

---

This ecosystem architecture ensures all BoxCall components work together seamlessly while maintaining clear separation of concerns and scalable data flow patterns.
