# Phase 3: Dashboard Mobile-First Redesign - Design Plan

**Date**: October 10, 2025  
**Status**: Planning  
**Goal**: Transform Dashboard from desktop-first to mobile-first with vertical layouts, progressive disclosure, and thumb-reachable interactions

---

## 📊 Current State Analysis

### DashboardPage.tsx Structure

- **Container**: `<Aurora variant="shell">` + `<PageLayout variant="dashboard">`
- **Main Component**: `<ResponsiveDashboardLayout />`
- **Title**: "Dashboard"
- **Subtitle**: "Your command center awaits • Quote of the day coming soon"

### ResponsiveDashboardLayout.tsx Architecture

**Hero Section (Aurora Tiles)**:

- 3 tiles in grid: Profile, Team Pulse, Schedule
- Each tile: Icon, title, description, status badge, body content
- Desktop: 3-column grid (`md:grid-cols-3`)
- Mobile: Single column stack

**Content Grid**:

- **Left Column** (1/3):
  - ProfileCard (horizontal layout, 80px avatar)
  - RosterQuickAdd
  - PersonalFeed
- **Right Column** (2/3):
  - TeamFeeds
  - PersonalCalendar

**Current Issues for Mobile**:

1. ❌ Aurora tiles are beautiful but take up too much scroll space (3 tiles = 900px)
2. ❌ ProfileCard is horizontal layout (wastes mobile width)
3. ❌ No single hero stats summary (dispersed across tiles)
4. ❌ Quick actions buried in tiles (not thumb-reachable)
5. ❌ Team feeds show all posts (no progressive disclosure)
6. ❌ Calendar section far down page (requires excessive scrolling)

---

## 🎯 Phase 3 Goals

### Mobile-First Transformation (Week 3 Roadmap)

1. **Consolidate hero section** into single HeroStatsCard (160px vs 900px)
2. **Add QuickActionGrid** with 4 thumb-reachable buttons (replaces Aurora tiles)
3. **Redesign ProfileCard** from horizontal to vertical layout
4. **Create EventCard** component for upcoming schedule preview
5. **Add progressive disclosure** to team feed (show 3, hide rest)
6. **Maintain Aurora tiles** on desktop (responsive design, not replacement)

### Key Metrics

- **Before**: 900px hero + 280px profile = 1180px before content
- **After**: 160px stats + 200px actions + 280px profile = 640px before content
- **Savings**: 540px less scrolling (46% reduction)

---

## 📐 Mobile Component Design Specs

### 1. HeroStatsCard Component (NEW)

**Purpose**: Single-glance dashboard summary replacing 3 Aurora tiles on mobile

**Dimensions**:

- Height: 160px
- Padding: 20px
- Border-radius: 16px

**Layout**:

```
┌────────────────────────────────────────┐
│  Good morning, Coach! 👋               │ ← Greeting (20px)
│                                        │
│  ┌─────────┐  ┌─────────┐  ┌────────┐│
│  │   48    │  │   12    │  │    3   ││ ← Stats (60px each)
│  │  Plays  │  │This Week│  │ Badges ││
│  └─────────┘  └─────────┘  └────────┘│
│                                        │
│  View Details →                        │ ← Link (16px)
└────────────────────────────────────────┘
```

**Features**:

- Personalized greeting with time-based message
- 3 key stats: Total Plays, This Week Activity, Achievement Count
- "View Details" link to expand full stats
- Gradient background (aurora-inspired)
- Mobile: Full width
- Desktop: Remains as Aurora tiles (responsive swap)

**Props**:

```typescript
interface HeroStatsCardProps {
  userName: string;
  stats: {
    totalPlays: number;
    thisWeekActivity: number;
    achievements: number;
  };
  onViewDetails?: () => void;
}
```

---

### 2. QuickActionGrid Component (NEW)

**Purpose**: Thumb-reachable shortcuts to key features (replaces hero tiles on mobile)

**Dimensions**:

- Grid: 2x2 (4 buttons)
- Each button: 80px × 80px touch target
- Gap: 12px
- Total height: 172px (80 + 12 + 80)

**Layout**:

```
┌─────────────────────────────────┐
│  Quick Actions                  │
│                                 │
│  ┌────────┐  ┌────────┐       │
│  │   📋   │  │   📅   │       │
│  │New Play│  │Schedule│       │
│  └────────┘  └────────┘       │
│                                 │
│  ┌────────┐  ┌────────┐       │
│  │   👥   │  │   📖   │       │
│  │ Roster │  │Playbook│       │
│  └────────┘  └────────┘       │
└─────────────────────────────────┘
```

**Actions**:

1. **New Play** → `/playbook?action=new`
2. **Schedule** → `/calendar`
3. **Roster** → `/roster`
4. **Playbook** → `/playbook`

**Props**:

```typescript
interface QuickActionGridProps {
  actions: Array<{
    id: string;
    label: string;
    icon: IconName;
    to: string;
    color?: string;
  }>;
  onActionClick?: (actionId: string) => void;
}
```

---

### 3. ProfileCard - Vertical Redesign

**Purpose**: Transform horizontal profile to vertical for mobile efficiency

**Dimensions**:

- Height: ~280px (flexible based on content)
- Avatar: 96px (up from 80px)
- Stats grid: 2x2 layout

**Layout - BEFORE (Current)**:

```
┌────────────────────────────────┐
│ [80px]  Justin DePierro        │
│ Avatar  Head Coach      [Edit] │
│         🏆 Stickers: 12        │
│         🥇 Medals: 3           │
└────────────────────────────────┘
```

**Layout - AFTER (Mobile)**:

```
┌────────────────────────────────┐
│         [96px Avatar]          │
│                                │
│      Justin DePierro           │
│       Head Coach 👨‍🏫           │
│                                │
│  ┌───────┐  ┌───────┐        │
│  │  48   │  │  12   │        │
│  │ Plays │  │Practice│        │
│  └───────┘  └───────┘        │
│                                │
│  ┌───────┐  ┌───────┐        │
│  │  24   │  │ 75%   │        │
│  │ Games │  │Win Rate│        │
│  └───────┘  └───────┘        │
│                                │
│  [Edit Profile]                │
└────────────────────────────────┘
```

**Changes**:

- Avatar: Center-aligned, 96px
- Name/Role: Centered below avatar
- Stats: 2x2 grid (Plays, Practices, Games, Win Rate)
- Edit button: Full-width at bottom
- Desktop: Keep horizontal layout (responsive)

**Props** (extend existing):

```typescript
interface ProfileCardProps {
  profile?: Profile | null;
  userRole?: string;
  isViewMode?: boolean;
  onEditClick?: () => void;
  variant?: "horizontal" | "vertical"; // NEW
}
```

---

### 4. EventCard Component (NEW)

**Purpose**: Preview upcoming practices/games without opening calendar

**Dimensions**:

- Height: 80px per event
- Max shown: 3 events
- Total height: ~280px (3 × 80 + header + footer)

**Layout**:

```
┌────────────────────────────────┐
│  Upcoming Events               │
│                                │
│  📅 Oct 12 • 3:00 PM          │
│     Practice at Memorial Field │
│     12/15 attending            │
│  ────────────────────────────  │
│  🏈 Oct 15 • 7:00 PM          │
│     Game vs. Warriors          │
│     24/25 confirmed            │
│  ────────────────────────────  │
│  📅 Oct 18 • 3:00 PM          │
│     Film Session - Room 204    │
│     8/12 attending             │
│                                │
│  View Full Calendar →          │
└────────────────────────────────┘
```

**Features**:

- Icon: 📅 Practice, 🏈 Game
- Date/Time: Formatted short
- Location: Truncated if long
- Attendance: X/Y format
- Link to full calendar
- Empty state: "No upcoming events"

**Props**:

```typescript
interface EventCardProps {
  events: Array<{
    id: string;
    type: "practice" | "game" | "meeting";
    date: Date;
    title: string;
    location?: string;
    attendanceCount?: number;
    totalRoster?: number;
  }>;
  maxEvents?: number; // default 3
  onViewCalendar?: () => void;
}
```

---

### 5. Team Feed - Progressive Disclosure

**Purpose**: Show recent activity without overwhelming mobile scroll

**Current**: Shows all posts (could be 20+)
**After**: Show 3 posts + "See More Activity" button

**Layout**:

```
┌────────────────────────────────┐
│  Team Activity                 │
│                                │
│  [Post 1]                      │
│  [Post 2]                      │
│  [Post 3]                      │
│                                │
│  See More Activity (12) →      │
└────────────────────────────────┘
```

**Implementation**:

```typescript
const [showAllPosts, setShowAllPosts] = useState(false);
const displayedPosts = showAllPosts ? posts : posts.slice(0, 3);
const hiddenCount = posts.length - 3;
```

---

## 📱 Responsive Breakpoint Strategy

### Mobile (<768px) - NEW PRIORITY

- HeroStatsCard: 160px greeting + 3 stats
- QuickActionGrid: 2×2 buttons (80px each)
- ProfileCard: Vertical layout (96px avatar, 2×2 stats)
- EventCard: 3 upcoming events
- Team Feed: 3 posts + "See More"
- **Total scroll to content**: 640px (down from 1180px)

### Tablet (768px - 1023px)

- HeroStatsCard: Remains (condensed desktop Aurora)
- QuickActionGrid: 2×2 or 1×4 depending on space
- ProfileCard: Hybrid layout (avatar left, stats grid right)
- EventCard: 4 events shown
- Team Feed: 5 posts + "See More"

### Desktop (≥1024px)

- **Keep Aurora tiles** (3-column grid as currently exists)
- Hide HeroStatsCard (Aurora tiles are better on desktop)
- Hide QuickActionGrid (Aurora tiles handle this)
- ProfileCard: Horizontal layout (current design)
- EventCard: Full calendar widget or 5 events
- Team Feed: Show 8-10 posts

**Key Principle**: Use `@media (max-width: 767px)` to swap components, not hide/show same component

---

## 🗂️ File Structure Plan

### New Files to Create

```
src/components/mobile-library/
  ├── MobileHeroStatsCard.tsx       (NEW)
  ├── MobileQuickActionGrid.tsx     (NEW - similar to existing MobileQuickActions)
  └── MobileEventCard.tsx           (NEW)

src/components/dashboard/
  ├── ProfileCard.tsx               (MODIFY - add vertical variant)
  ├── TeamFeeds.tsx                 (MODIFY - add progressive disclosure)
  └── ResponsiveDashboardLayout.tsx (MODIFY - add mobile components)
```

### Implementation Order

1. ✅ Read current Dashboard (DONE)
2. 🔨 Create MobileHeroStatsCard component
3. 🔨 Create MobileQuickActionGrid component
4. 🔨 Create MobileEventCard component
5. 🔨 Modify ProfileCard to support vertical variant
6. 🔨 Add progressive disclosure to TeamFeeds
7. 🔨 Integrate all components into ResponsiveDashboardLayout
8. 🔨 Add responsive breakpoint logic
9. ✅ Type check and fix errors
10. 📝 Document Phase 3 completion

---

## ✅ Success Criteria

### Functional Requirements

- [ ] Mobile hero section ≤ 200px (HeroStatsCard)
- [ ] Quick actions thumb-reachable (within 300px of top)
- [ ] ProfileCard vertical on mobile, horizontal on desktop
- [ ] Upcoming events visible without scrolling to calendar
- [ ] Team feed shows 3 posts initially, expandable
- [ ] Desktop experience unchanged (Aurora tiles remain)

### Technical Requirements

- [ ] TypeScript: Zero compilation errors
- [ ] Responsive: Works on 375px, 768px, 1024px, 1440px
- [ ] Accessibility: 44px touch targets, ARIA labels, keyboard nav
- [ ] Performance: No layout shift, smooth scroll
- [ ] Reusability: Components work in other contexts

### Quality Checks

- [ ] Design tokens used (no raw Tailwind colors)
- [ ] Mobile component library patterns followed
- [ ] Progressive loading maintained (useProgressiveLoading)
- [ ] Auth context properly handled
- [ ] Error states graceful

---

## 📝 Notes from Phase 2

**Learnings Applied**:

1. Start with component design, not page modification
2. Use mobile component library patterns (MobileSection, etc.)
3. Test TypeScript early and often
4. Document before/after comparisons
5. Keep desktop experience stable

**Patterns to Reuse**:

- Progressive disclosure (show N, "See More" button)
- Touch targets 44px minimum
- MobileSection wrappers for consistent spacing
- Responsive swaps with media queries, not conditional rendering
- Empty states with MobileCTACard

---

## 🚀 Ready to Start

**Next Action**: Create MobileHeroStatsCard component

This plan provides complete specifications for all Phase 3 components. Time to build! 💪
