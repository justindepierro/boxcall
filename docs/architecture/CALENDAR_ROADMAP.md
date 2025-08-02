# Calendar System Roadmap & Architecture

## Overview

The BoxCall calendar system is a comprehensive multi-layer scheduling ecosystem that serves both individual users and team management. It integrates across all platform features to create a unified timeline experience.

Justin added - In the team settings a coach should be able to upload and edit schedule.
Date
Time
Opponent
Location
Home or Away
and it should automatically populate on the calendar.

Playbook and Practice Scripts should also reflect the schedule.

## Core Calendar Types

### 1. Personal Calendar (Dashboard)

**Location**: Personal Dashboard → PersonalCalendar.tsx
**Purpose**: Individual user's cross-team schedule aggregation
**Features**:

- Cross-team events aggregation
- Personal schedule management
- Role-based event filtering
- Quick RSVP actions

### 2. Team Calendar (Team Bulletin)

**Location**: Team Bulletin → TeamCalendar.tsx  
**Purpose**: Team-specific scheduling and coordination
**Features**:

- Team games, practices, meetings
- Team-specific event management
- Collective RSVP tracking
- Practice schedule popouts

### 3. Master Calendar (Navigation Page)

**Location**: `/calendar` - Full calendar application
**Purpose**: Comprehensive calendar management interface
**Features**:

- Full FullCalendar integration
- Universal search across all calendars
- Advanced filtering and views
- Event creation and management

## Technical Architecture

### Core Technology Stack

- **Calendar Engine**: FullCalendar (FREE version)
- **Date Management**: date-fns
- **State Management**: React Query + Zustand
- **Backend**: Supabase with calendar tables
- **Real-time**: Supabase realtime subscriptions

### Database Schema Integration

```sql
-- Core Tables (Already exists in schema)
teams
team_members
games
practices
meetings

-- Calendar Enhancement Tables (Future)
calendar_events
event_rsvps
calendar_tags
recurring_events
practice_schedules
```

## Ecosystem Connections

### Component Interconnections

```
Personal Dashboard (PersonalCalendar.tsx)
    ↓ References
Master Calendar (/calendar page)
    ↓ Aggregates from
Team Bulletin (TeamCalendar.tsx)
    ↓ Links to
Team Management (Settings page)
    ↓ Uses
Team Roster data
```

### Data Flow Architecture

```
Database (Supabase)
    ↓
Calendar Service Layer
    ↓
├── Personal Calendar Component (cross-team events)
├── Team Calendar Component (team-specific events)
└── Master Calendar Page (unified view)
    ↓
Calendar Navigation Integration
    ↓
Settings/Management Pages (roster sync)
```

## Phase 1: Foundation (Immediate - Post Dashboard) ✅ **COMPLETE**

### 1.1 FullCalendar Integration ✅ **COMPLETE**

- [x] Install and configure FullCalendar
- [x] Create calendar service layer
- [x] Implement basic event CRUD operations
- [x] Set up Supabase calendar tables (schema ready)

### 1.2 Component Enhancement ✅ **COMPLETE**

- [x] Upgrade TeamCalendar.tsx with FullCalendar
- [x] Enhance PersonalCalendar.tsx with cross-team aggregation
- [x] Create calendar utilities and helpers
- [x] Implement responsive calendar views

### 1.3 Basic Features ✅ **COMPLETE**

- [x] Event creation and editing (service layer)
- [x] RSVP functionality (hook implementation)
- [x] Time zone handling (date-fns integration)
- [x] Mobile-responsive design

**✅ INFRASTRUCTURE COMPLETE:** Calendar service layer, React hooks, FullCalendar component, and enhanced PersonalCalendar with both list and calendar views are fully implemented and working.

## Phase 2: Advanced Features (Sprint 2)

### 2.1 Master Calendar Page ✅ **COMPLETE**

- [x] Create `/calendar` route and page
- [x] Implement full FullCalendar interface
- [x] Universal search functionality
- [x] Advanced filtering (by team, type, date range)
- [x] Calendar import/export

### 2.2 Practice Schedule System ✅ **COMPLETE**

- [x] Practice schedule popouts with detailed info
- [x] Recurring practice templates
- [x] Weather integration for outdoor practices
- [x] Equipment and field management integration
- [x] Attendance tracking
- [x] Ability to save practice schedule templates
- [x] Ability to drag and drop practice blocks to reorganize.
- [x] ability to set a practice start and end time and lock time to keep on schedule
- [x] ability to attach/link Practice Scripts (not yet implemented) or "Make new Practice Script for this Time Block"
- [x] Ability to make quick intervals of practice 5min/10min/15min. or custom time.

### 2.3 Enhanced Team Features ✅ **COMPLETE**

- [x] Team-wide polling for events
- [x] Advanced RSVP with conditional responses
- [x] Team calendar permissions and roles
- [x] Bulk event operations

## Phase 3: Intelligent Features (Sprint 3)

### 3.1 Smart Scheduling

- [ ] Conflict detection across teams
- [ ] Smart scheduling suggestions
- [ ] Travel time calculations
- [ ] Automated reminder system

### 3.2 Analytics & Insights

- [ ] Attendance analytics
- [ ] Team availability insights
- [ ] Practice efficiency metrics
- [ ] Player participation tracking

### 3.3 Integration Expansions

- [ ] School district calendar sync
- [ ] Conference/league schedule imports
- [ ] Weather-based automatic adjustments
- [ ] Transportation coordination

## Phase 4: Advanced Ecosystem (Future)

### 4.1 Cross-Platform Integration

- [ ] Mobile app calendar sync
- [ ] Parent/family calendar sharing
- [ ] Coach coordination calendars
- [ ] Multi-season planning

### 4.2 AI-Powered Features

- [ ] Intelligent scheduling optimization
- [ ] Predictive attendance modeling
- [ ] Automated conflict resolution
- [ ] Smart practice planning

### 4.3 Advanced Workflows

- [ ] Game day workflow automation
- [ ] Equipment check-in/out scheduling
- [ ] Medical appointment integration
- [ ] Academic calendar coordination

## Key Features Deep Dive

### Universal Search & Tagging

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'game' | 'practice' | 'meeting' | 'film';
  tags: string[];
  team_id?: string;
  searchable_content: string;
}

// Search functionality
searchEvents(query: string, filters: SearchFilters)
```

### Practice Schedule Popouts

- Detailed practice plans
- Equipment requirements
- Weather conditions
- Field/facility information
- Coach notes and objectives

### RSVP & Polling System

```typescript
interface EventRSVP {
  event_id: string;
  user_id: string;
  status: "attending" | "not_attending" | "maybe";
  note?: string;
  timestamp: string;
}

interface EventPoll {
  event_id: string;
  question: string;
  options: string[];
  responses: PollResponse[];
}
```

### Master Calendar Integration

- Unified view of all team calendars
- Cross-team scheduling coordination
- Advanced filtering and search
- Export capabilities for external calendars

## Technical Implementation Notes

### State Management Strategy

```typescript
// Calendar Store (Zustand)
interface CalendarStore {
  events: CalendarEvent[];
  selectedTeam: string | null;
  viewMode: "month" | "week" | "day";
  filters: CalendarFilters;

  // Actions
  fetchEvents: (teamId?: string) => Promise<void>;
  createEvent: (event: CreateEventData) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}
```

### Real-time Updates

- Supabase realtime subscriptions for live calendar updates
- Optimistic UI updates for immediate feedback
- Conflict resolution for simultaneous edits

### Performance Considerations

- Event caching and pagination
- Lazy loading for large date ranges
- Debounced search functionality
- Efficient re-rendering strategies

## Component Naming Convention Update

### Proposed Rename

- **Current**: Dashboard + Team Dashboard
- **New**: Personal Dashboard + Team Bulletin

The "Team Bulletin" name captures the football-style team communication board concept while distinguishing it clearly from the personal space.

## Integration Roadmap

### Dashboard → Calendar Flow

1. User views upcoming events in dashboard calendar widget
2. Clicks "View Full Calendar" → navigates to master calendar page
3. Master calendar shows unified view with team filtering
4. Can drill down to specific team bulletin calendar

### Team Management Integration

1. Team roster changes reflect in calendar permissions
2. Coaching staff changes update calendar management roles
3. Player eligibility affects event participation options
4. Team settings control calendar privacy and sharing

### Settings Page Connections

- Calendar preferences and notifications
- Time zone and scheduling preferences
- Team calendar permissions management
- External calendar integration settings

## Success Metrics

### User Engagement

- Calendar page visits and session duration
- Event creation and RSVP rates
- Cross-team calendar usage
- Mobile calendar adoption

### Team Coordination

- Event attendance improvement
- Scheduling conflict reduction
- Communication efficiency gains
- Coach time savings

### Platform Integration

- Feature adoption across ecosystem
- Data consistency across components
- Performance metrics and load times
- User satisfaction scores

---

**Next Steps**: Complete dashboard development, then begin Phase 1 calendar implementation with FullCalendar integration and enhanced component development.
