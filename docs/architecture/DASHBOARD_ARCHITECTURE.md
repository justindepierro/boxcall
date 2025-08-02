# 🏈 BoxCall Dashboard Architecture

## 📊 **Dashboard Types Overview**

BoxCall has two distinct dashboard types serving different purposes:

### **1. Personal Dashboard (`/dashboard`)**

**Individual user's personal space - think MySpace profile meets Strava achievements**

#### **For Players:**

- **🏆 Personal Trophy Shelf** - Pinned at top
  - **Helmet Stickers** - Team achievements assigned by coaches
  - **Medals** - BoxCall-specific achievements (like Strava challenges/Garmin achievements/Xbox points)
- **👤 Personal Bio & Profile** - Editable personal page
  - **📊 GPA Display** - Academic achievements
  - **👕 Gear Showcase** - "Drip" display (helmet, gloves, cleats, etc.)
  - **📈 Personal Stats** - Individual performance metrics
- **📬 Multi-Team Messages** - Important messages from ALL teams
  - Cross-team communication hub
  - Players can be on multiple teams (high school, travel, 7-on-7, spring programs, flag football)
- **📅 Personal Calendar** - Upcoming events across all teams
- **⚡ Quick Actions** - Personal shortcuts and preferences

#### **For Coaches:**

- **🏆 Personal Trophy Shelf** - Coaching achievements and certifications
- **👤 Coach Profile** - Professional coaching bio
- **📋 Quick Actions Dashboard**
  - **📖 Playbook Access** - Jump to playbook editor
  - **📝 Script Creation** - Quick access to practice scripts
  - **🎯 Play Editor** - Direct access to play creation tools
  - **📊 Team Analytics** - Performance insights across teams
- **📬 Multi-Team Communications** - Messages from all coaching assignments
- **📅 Master Calendar** - Events across all teams coached
- **🎓 Professional Development** - Coaching resources and training

#### **For Family Members:**

- **👤 Family Profile** - Parent/guardian information
- **📅 Family Calendar** - All player events and schedules
- **📬 Coach Communications** - Updates and announcements from coaches
- **📊 Player Progress Tracking** - Monitor their player's development
- **🏆 Family Achievements** - Supporting player achievements
- **💬 Parent Network** - Connect with other team families

---

### **2. Team Bulletin (`/team/:teamId/bulletin`)**

**Team-specific bulletin board and command center - football-style team communication hub**

#### **Team-Specific Features:**

- **🏆 Team Trophy Case** (not shelf) - Collective team achievements
  - **Team Goal Trophies** - Season objectives and milestones
  - **Team Medals** - BoxCall team-specific achievements
  - **Helmet Sticker Gallery** - All helmet stickers awarded to team members
- **📱 Facebook-Style Team Feed**
  - **📢 Announcements** - Coach announcements and updates
  - **📝 Practice Scripts** - New practice plans posted
  - **🎯 New Plays** - Recently added playbook content
  - **💬 Team Discussions** - @mentions and #hashtags
  - **📊 Performance Updates** - Team statistics and progress
- **📅 Team Calendar** - Team-specific events and schedule
- **👥 Team Roster** - Current team members and roles
- **⚡ Team Quick Actions** (role-based)
  - **Coaches**: Add plays, create scripts, send announcements
  - **Players**: View assignments, check schedule, personal stats
  - **Family**: Event calendar, communication with coaches

---

## 🎯 **Key Architectural Differences**

| Feature            | Personal Dashboard            | Team Dashboard                   |
| ------------------ | ----------------------------- | -------------------------------- |
| **Scope**          | Cross-team, personal          | Single team focused              |
| **Trophy Display** | Personal Trophy Shelf         | Team Trophy Case                 |
| **Achievements**   | Individual + BoxCall medals   | Team goals + collective stickers |
| **Communications** | All teams messages            | Team-specific feed               |
| **Calendar**       | Personal events across teams  | Team events only                 |
| **Quick Actions**  | Role-based personal shortcuts | Team-specific role actions       |
| **Profile**        | Personal bio (MySpace style)  | Team role and status             |

---

## 📱 **User Experience Flow**

### **Navigation Pattern:**

1. **Login** → **Personal Dashboard** (default landing)
2. **Team Selector** → **Team Dashboard** (specific team context)
3. **Header Navigation** → Switch between Personal and Team views

### **Multi-Team Support:**

- Players can belong to multiple teams simultaneously
- Each team has its own dashboard and context
- Personal dashboard aggregates across all teams
- Team selector allows switching between team contexts

### **Role-Based Customization:**

- **Players**: Focus on achievements, gear, and personal development
- **Coaches**: Emphasis on team management tools and quick actions
- **Family**: Communication and progress tracking priority

---

## 🛠️ **Technical Implementation Notes**

### **Dashboard Component Structure:**

```typescript
// Personal Dashboard Components
/pages/DashboardPage.tsx           // Main personal dashboard
/components/dashboard/
├── PersonalTrophyShelf.tsx        // Achievement display
├── PersonalProfile.tsx            // Bio and gear showcase
├── CrossTeamMessages.tsx          // Multi-team communications
├── PersonalCalendar.tsx           // Personal events
└── QuickActions/                  // Role-based shortcuts
    ├── PlayerQuickActions.tsx
    ├── CoachQuickActions.tsx
    └── FamilyQuickActions.tsx

// Team Dashboard Components
/pages/TeamDashboard.tsx           // Team-specific dashboard
/components/team-dashboard/
├── TeamTrophyCase.tsx             // Team achievements
├── TeamFeed.tsx                   // Facebook-style updates
├── TeamCalendar.tsx               // Team events
├── TeamRoster.tsx                 // Member overview
└── TeamQuickActions.tsx           // Team-specific actions
```

### **State Management:**

```typescript
// Dashboard Store
interface DashboardState {
  personalDashboard: PersonalDashboardData;
  selectedTeamId: string | null;
  teamDashboards: Record<string, TeamDashboardData>;
  userTeams: Team[];
  achievements: Achievement[];
  crossTeamMessages: Message[];
}
```

### **Database Requirements:**

- **achievements** table - Personal and team achievements
- **helmet_stickers** table - Team-assigned recognition
- **team_goals** table - Team objectives and milestones
- **team_posts** table - Team feed content
- **team_announcements** table - Coach communications
- **user_gear** table - Player equipment showcase
- **personal_stats** table - Individual performance metrics

---

_This architecture ensures clear separation between personal and team contexts while supporting BoxCall's multi-team environment and role-based functionality._
