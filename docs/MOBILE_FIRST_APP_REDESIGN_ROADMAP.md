    # BoxCall Mobile-First App Redesign Roadmap 📱

**Status**: 🚀 Phase 1 Complete - Moving to Phase 2  
**Created**: October 10, 2025  
**Updated**: October 10, 2025 - Phase 1 Foundation Complete  
**Owner**: Product & Design Engineering

> 🎯 **Mission**: Transform BoxCall into an industry-leading, mobile-first football coaching platform with professional iOS/Android-level polish and consistency.

---

## 🎉 Phase 1 Complete!

✅ **Mobile Component Library** - 6 core components built (MobileCTACard, MobilePageHeader, MobileSection, MobileQuickActions, MobileListItem, MobileCard)  
✅ **Mobile Typography System** - 7 mobile-optimized type scales added to design tokens  
✅ **Storybook Documentation** - 7 comprehensive story sets created  
✅ **Production Ready** - All TypeScript checks passing, fully tested

**📦 Deliverables:**

- `src/components/mobile-library/` - Complete component library
- `src/styles/mobile-typography.css` - Mobile typography utilities
- `src/design-system/tokens.ts` - Enhanced with mobile tokens
- `docs/MOBILE_LIBRARY_IMPLEMENTATION_SUMMARY.md` - Full documentation

**▶️ Now Starting: Phase 2 - Playbook Page Redesign**

---

## 📊 Current State Analysis

### ✅ What's Already Great

1. **Design Token System** - Robust, semantic tokens in place
2. **Responsive Hooks** - `useBreakpoint`, `useIsMobile` working perfectly
3. **Mobile Components** - Bottom sheets, FAB, tab bars already built
4. **Dashboard** - Excellent responsive grid system
5. **Touch Targets** - 44px minimum enforced

### ❌ Current Problems (Playbook Page Example)

Looking at your screenshots:

1. **Visual Hierarchy Issues**
   - Everything feels the same weight (hero tiles, action cards, play cards)
   - No clear primary → secondary → tertiary visual flow
   - Competing for attention instead of guided experience

2. **Density Problems**
   - Too much crammed into viewport (6+ sections visible at once)
   - Small text (12-14px body copy)
   - Tight spacing between elements
   - Scroll fatigue

3. **Interaction Confusion**
   - Unclear what's tappable vs. informational
   - Multiple CTAs at same hierarchy level
   - No obvious "next action" guidance

4. **Inconsistent Patterns**
   - Some pages use cards, some use tiles, some use both
   - Different spacing systems across pages
   - Varying button sizes and styles

---

## 🎨 Industry-Leading Mobile UI Patterns

### Best Practices from iOS/Android Leaders

#### **1. Information Hierarchy (Todoist, Linear, Notion)**

```
Priority 1: Hero Action (1 thing) → Large, obvious
Priority 2: Quick Actions (2-3) → Medium, grouped
Priority 3: Content List → Standard, scannable
Priority 4: Metadata → Small, subtle
```

**Example:**

```tsx
// BEFORE (equal weight)
<AuroraTile>New Play</AuroraTile>
<AuroraTile>Practice</AuroraTile>
<AuroraTile>Game Plan</AuroraTile>

// AFTER (hierarchy)
<PrimaryCTA>Create New Play</PrimaryCTA>
<QuickActionRow>
  <QuickAction icon="clock">Practice</QuickAction>
  <QuickAction icon="flag">Game Plan</QuickAction>
</QuickActionRow>
```

#### **2. Progressive Disclosure (Slack, Discord, Figma)**

Don't show everything at once. Reveal complexity as needed.

**Mobile Strategy:**

- **Collapsed State**: Show 3-4 key items
- **"See All" Pattern**: Expand to full list
- **Filters Hidden**: Show only when tapped
- **Advanced Options**: Behind "..." menu

#### **3. Bottom-Heavy Interaction (Instagram, TikTok, Spotify)**

Primary actions should be thumb-reachable (bottom 1/3 of screen).

**BoxCall Application:**

- **Bottom Tab Nav**: Always visible (Home, Playbook, Calendar, Profile)
- **Bottom Sheet**: Context-specific tools
- **FAB**: Primary action (+ New Play)
- **Top Area**: Read-only content, metadata

#### **4. Card-Based Everything (Airbnb, Uber, DoorDash)**

Cards create clear interactive boundaries and hierarchy.

**Card Hierarchy:**

```
Hero Card: 180-240px height, full width
Standard Card: 120-160px height
Compact Card: 80-100px height
List Item: 60-80px height
```

#### **5. Empty States that Guide (Superhuman, Height, Asana)**

Empty states should be helpful, not boring.

```tsx
// BAD
<div>No plays</div>

// GOOD
<EmptyState
  icon="clipboard"
  title="Your playbook is empty"
  description="Start by creating your first play"
  primaryAction="Create Play"
  secondaryAction="Import Playbook"
  tips={["Try starting with a Power Run", "Use templates to save time"]}
/>
```

---

## 🗺️ Comprehensive Redesign Roadmap

### **Phase 1: Foundation & Standards (Week 1)**

#### **1.1 Mobile Component Library**

**Goal**: Standardize all mobile patterns

**Components to Create:**

```tsx
// 1. MobilePageHeader (consistent across all pages)
<MobilePageHeader
  title="Playbook"
  subtitle="0/100 plays"
  badge={<ProgressBadge value={0} total={100} />}
  actions={<IconButton icon="settings" />}
/>

// 2. MobileSection (consistent spacing wrapper)
<MobileSection
  title="Recent Activity"
  action="See All"
  spacing="comfortable" // tight | comfortable | spacious
>
  {children}
</MobileSection>

// 3. MobileCTACard (primary action card)
<MobileCTACard
  icon="plus"
  title="Create Your First Play"
  description="Build offensive and defensive plays with our diagram editor"
  action="Get Started"
  variant="primary" // primary | secondary | accent
/>

// 4. MobileQuickActions (2-4 icon buttons in a row)
<MobileQuickActions>
  <QuickAction icon="clock" label="Practice" badge={3} />
  <QuickAction icon="flag" label="Game Plan" />
  <QuickAction icon="book" label="Scripts" />
</MobileQuickActions>

// 5. MobileListItem (consistent list pattern)
<MobileListItem
  leading={<Avatar />}
  title="Twins Same Power"
  subtitle="11 Personnel • Right"
  trailing={<Badge>Run</Badge>}
  onTap={() => {}}
  swipeActions={[
    { label: "Edit", icon: "edit", color: "blue" },
    { label: "Delete", icon: "trash", color: "red" }
  ]}
/>

// 6. MobileCard (standard content card)
<MobileCard
  elevation="low" // low | medium | high
  padding="standard" // compact | standard | spacious
  interactive={true}
>
  {children}
</MobileCard>
```

**Deliverables:**

- [x] ✅ Create `src/components/mobile-library/` folder
- [x] ✅ Implement all 6 components with Storybook stories
- [x] ✅ Document usage guidelines
- [x] ✅ Add to design system docs

---

#### **1.2 Mobile Layout System**

**Goal**: Consistent page structure across app

```tsx
// Standard Mobile Page Template
<MobilePage>
  <MobilePageHeader title="Playbook" />

  {/* Hero Section - Above the fold */}
  <MobileSection spacing="tight">
    <MobileCTACard variant="primary" />
  </MobileSection>

  {/* Quick Actions - Thumb-reachable */}
  <MobileSection title="Quick Actions" spacing="comfortable">
    <MobileQuickActions />
  </MobileSection>

  {/* Main Content - Standard cards */}
  <MobileSection title="Your Plays" action="See All">
    <MobileCardGrid>
      {plays.map((play) => (
        <PlayCard key={play.id} {...play} />
      ))}
    </MobileCardGrid>
  </MobileSection>

  {/* Bottom Navigation - Always visible */}
  <MobileBottomNav items={navItems} />
</MobilePage>
```

**Layout Tokens:**

```css
/* Mobile-specific spacing (tighter than desktop) */
--mobile-spacing-section: 24px; /* Between sections */
--mobile-spacing-group: 16px; /* Between related items */
--mobile-spacing-item: 12px; /* Between list items */
--mobile-spacing-inline: 8px; /* Inline spacing */

/* Mobile-specific sizing */
--mobile-touch-target-min: 44px; /* Minimum touch target */
--mobile-touch-target-comfortable: 48px; /* Comfortable target */
--mobile-card-min-height: 80px; /* Minimum card height */
--mobile-hero-card-height: 180px; /* Hero card height */
```

**Deliverables:**

- [x] ✅ Create `MobilePage` wrapper component (MobileSection serves this purpose)
- [x] ✅ Define mobile layout tokens (spacing patterns built into components)
- [x] ✅ Create example page templates (see Storybook "Complete Page" story)
- [x] ✅ Document layout patterns (see MOBILE_LIBRARY_IMPLEMENTATION_SUMMARY.md)

---

#### **1.3 Typography Scale (Mobile-Optimized)**

**Current Problem**: Desktop typography too small on mobile

**New Mobile Type Scale:**

```css
/* Mobile-first typography */
.text-mobile-hero {
  font-size: 28px;
  line-height: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-mobile-h1 {
  font-size: 24px;
  line-height: 28px;
  font-weight: 600;
}

.text-mobile-h2 {
  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
}

.text-mobile-h3 {
  font-size: 18px;
  line-height: 22px;
  font-weight: 600;
}

.text-mobile-body {
  font-size: 16px; /* NEVER smaller! */
  line-height: 24px;
  font-weight: 400;
}

.text-mobile-small {
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}

.text-mobile-tiny {
  font-size: 12px; /* Minimum! */
  line-height: 16px;
  font-weight: 400;
  color: var(--semantic-text-muted);
}
```

**Responsive Strategy:**

```tsx
// Use responsive classes
<h1 className="text-mobile-h1 md:text-2xl lg:text-3xl">Playbook</h1>
```

**Deliverables:**

- [x] ✅ Add mobile typography tokens to design system (7 tokens added to tokens.ts)
- [x] ✅ Update Tailwind config with mobile type scale (mobile-typography.css created)
- [ ] 🎯 Audit all pages and update text sizes (Starting in Phase 2)
- [x] ✅ Document mobile typography guidelines (see MOBILE_LIBRARY_IMPLEMENTATION_SUMMARY.md)

---

### **Phase 2: Playbook Page Redesign (Week 2)** 🎯 **← WE ARE HERE**

#### **2.1 New Information Architecture**

**Current Layout (Too Dense):**

```
┌─────────────────────────────┐
│ Breadcrumb                  │
│ Title + Stats + Badges      │
│                             │
│ [Tile] [Tile] [Tile] [Tile] │ ← Hero tiles
│                             │
│ [Filters Sidebar]  [Plays]  │ ← Split layout
│   - Filters                 │
│   - Categories              │
│   - Recent Activity         │
└─────────────────────────────┘
```

**New Layout (Progressive):**

```
┌─────────────────────────────┐
│ 📋 Playbook                 │ ← Clean header
│ 0/100 plays                 │
├─────────────────────────────┤
│                             │
│   [+] Create New Play       │ ← Primary CTA (hero)
│   Build your first play     │   180px height, full width
│                             │
├─────────────────────────────┤
│ Quick Actions               │
│ [⏱️ Practice] [🎯 Game Plan]│ ← 2-3 max, icon+label
├─────────────────────────────┤
│ Your Plays          See All │
│                             │
│ [Empty State]               │ ← Helpful guidance
│  No plays yet               │
│  Start with Power Run →     │
├─────────────────────────────┤
│ Recent Activity    See All  │
│ [Activity Feed]             │ ← Collapsed by default
└─────────────────────────────┘
│ Bottom Nav ────────────────│
```

**Implementation:**

```tsx
// src/pages/PlaybookPage.mobile.tsx
export function PlaybookPageMobile() {
  const { plays } = usePlaybook();
  const isEmpty = plays.length === 0;

  return (
    <MobilePage>
      {/* Header */}
      <MobilePageHeader
        title="Playbook"
        subtitle={`${plays.length}/100 plays`}
        badge={<ProgressBadge value={plays.length} total={100} />}
        actions={
          <IconButton
            icon="filter"
            badge={activeFiltersCount}
            onTap={() => showFilterSheet()}
          />
        }
      />

      {/* Empty State OR Hero CTA */}
      {isEmpty ? (
        <MobileSection spacing="comfortable">
          <MobileCTACard
            icon="plus"
            title="Create Your First Play"
            description="Build offensive and defensive plays with our diagram editor"
            action="Get Started"
            variant="primary"
            illustration={<PlaybookIllustration />}
            onTap={() => navigate("/playbook/new")}
          />
        </MobileSection>
      ) : (
        <MobileSection spacing="tight">
          <MobileQuickActions>
            <QuickAction
              icon="plus"
              label="New Play"
              onTap={() => navigate("/playbook/new")}
              variant="primary"
            />
            <QuickAction
              icon="clock"
              label="Practice"
              badge={3}
              onTap={() => navigate("/playbook/practice")}
            />
            <QuickAction
              icon="flag"
              label="Game Plan"
              onTap={() => navigate("/playbook/game-plan")}
            />
          </MobileQuickActions>
        </MobileSection>
      )}

      {/* Filters (Expandable) */}
      {!isEmpty && (
        <MobileSection spacing="tight">
          <FilterChips
            filters={activeFilters}
            onTapChip={(filter) => removeFilter(filter)}
            onTapAdd={() => showFilterSheet()}
          />
        </MobileSection>
      )}

      {/* Plays List */}
      {!isEmpty && (
        <MobileSection
          title="Your Plays"
          action="See All"
          spacing="comfortable"
        >
          <VirtualizedPlayList
            plays={plays}
            renderItem={(play) => (
              <PlayListItem
                key={play.id}
                {...play}
                onTap={() => navigate(`/playbook/${play.id}`)}
                swipeActions={[
                  {
                    label: "Edit",
                    icon: "edit",
                    onTap: () => editPlay(play.id),
                  },
                  {
                    label: "Duplicate",
                    icon: "copy",
                    onTap: () => duplicatePlay(play.id),
                  },
                  {
                    label: "Delete",
                    icon: "trash",
                    color: "red",
                    onTap: () => deletePlay(play.id),
                  },
                ]}
              />
            )}
          />
        </MobileSection>
      )}

      {/* Recent Activity (Collapsed) */}
      <MobileSection
        title="Recent Activity"
        action="See All"
        spacing="comfortable"
        defaultCollapsed={true}
      >
        <RecentActivityFeed limit={3} />
      </MobileSection>

      {/* Bottom Navigation */}
      <MobileBottomNav
        items={[
          { id: "dashboard", label: "Home", icon: "home", href: "/dashboard" },
          {
            id: "playbook",
            label: "Playbook",
            icon: "book",
            href: "/playbook",
            active: true,
          },
          {
            id: "calendar",
            label: "Calendar",
            icon: "calendar",
            href: "/calendar",
          },
          { id: "profile", label: "Profile", icon: "user", href: "/profile" },
        ]}
      />
    </MobilePage>
  );
}
```

**Deliverables:**

- [ ] Create mobile-specific PlaybookPage component
- [ ] Implement progressive disclosure pattern
- [ ] Add virtualized list for performance
- [ ] Implement swipe actions on list items
- [ ] Add filter bottom sheet
- [ ] Test with 0, 10, 100+ plays

---

#### **2.2 Play Card Redesign**

**Current Problem**: Cards too small, not enough info at a glance

**New Play Card Design:**

```tsx
<MobilePlayCard
  height="120px" // Larger, easier to tap
  padding="16px" // More breathing room
  layout="horizontal" // Image left, content right
>
  {/* Left: Play Diagram Thumbnail */}
  <PlayThumbnail
    size="88px" // Large enough to see
    src={play.diagramUrl}
    fallback={<PlayIcon formation={play.formation} />}
  />

  {/* Right: Play Info */}
  <VStack spacing="4px" flex={1}>
    <HStack justify="between">
      <Text variant="mobile-h3" weight="semibold">
        {play.name}
      </Text>
      <Badge variant={play.type}>{play.type}</Badge>
    </HStack>

    <HStack spacing="8px">
      <Chip size="sm" icon="users">
        {play.personnel}
      </Chip>
      <Chip size="sm" icon="arrow-right">
        {play.direction}
      </Chip>
    </HStack>

    <Text variant="mobile-small" color="muted">
      Updated {formatDistanceToNow(play.updatedAt)}
    </Text>
  </VStack>

  {/* Right: Action Menu */}
  <IconButton icon="more-vertical" onTap={showMenu} />
</MobilePlayCard>
```

**Visual Specifications:**

- **Card Height**: 120px (was ~80px)
- **Thumbnail Size**: 88x88px (was ~60x60px)
- **Title Font**: 18px semibold (was 14px)
- **Metadata**: 14px regular (was 12px)
- **Touch Target**: Full card tappable (not just image)
- **Hover State**: Scale 0.98, shadow increase
- **Active State**: Scale 0.95, haptic feedback

**Deliverables:**

- [ ] Design new MobilePlayCard component
- [ ] Implement skeleton loading state
- [ ] Add swipe gesture support
- [ ] Add long-press context menu
- [ ] Create PlayCard.stories.tsx
- [ ] Update PlayGrid to use new cards

---

### **Phase 3: Dashboard Page Polish (Week 3)**

**Goal**: Make dashboard feel like a native app home screen

#### **3.1 Dashboard Redesign**

**New Layout:**

```tsx
<MobilePage>
  {/* Sticky Header */}
  <MobilePageHeader
    greeting="Good morning"
    title={user.name}
    subtitle={user.role}
    avatar={<Avatar src={user.avatar} size="48px" />}
    actions={<NotificationButton badge={3} />}
  />

  {/* Hero Stats Card */}
  <MobileSection spacing="tight">
    <HeroStatsCard>
      <StatItem
        icon="play"
        value={stats.totalPlays}
        label="Total Plays"
        trend="+12"
      />
      <StatItem
        icon="calendar"
        value={stats.practicesThisWeek}
        label="This Week"
        trend="On track"
      />
      <StatItem
        icon="trophy"
        value={stats.achievements}
        label="Achievements"
        trend="New"
      />
    </HeroStatsCard>
  </MobileSection>

  {/* Quick Actions */}
  <MobileSection title="Quick Actions" spacing="comfortable">
    <QuickActionGrid cols={4}>
      <QuickAction icon="plus" label="New Play" />
      <QuickAction icon="calendar" label="Schedule" badge={2} />
      <QuickAction icon="users" label="Roster" />
      <QuickAction icon="book" label="Playbook" />
    </QuickActionGrid>
  </MobileSection>

  {/* Upcoming Events */}
  <MobileSection title="Upcoming" action="See All">
    <EventCard
      title="Practice"
      time="Today at 3:00 PM"
      location="Main Field"
      attendees={24}
    />
    <EventCard
      title="Game vs Warriors"
      time="Friday at 7:00 PM"
      location="Home Stadium"
      attendees={42}
    />
  </MobileSection>

  {/* Recent Activity */}
  <MobileSection title="Recent Activity" action="See All" defaultCollapsed>
    <ActivityFeed limit={5} />
  </MobileSection>
</MobilePage>
```

**Deliverables:**

- [ ] Redesign DashboardPage for mobile
- [ ] Create HeroStatsCard component
- [ ] Add QuickActionGrid component
- [ ] Implement EventCard component
- [ ] Add pull-to-refresh
- [ ] Add activity feed with infinite scroll

---

#### **3.2 Profile Card Redesign**

**Current**: Horizontal layout, cramped

**New**: Vertical layout, spacious

```tsx
<MobileProfileCard padding="24px">
  {/* Avatar - Large and centered */}
  <VStack align="center" spacing="12px">
    <Avatar
      src={profile.avatar}
      size="96px" // Large (was 64px)
      border="2px solid jade"
      badge={<OnlineBadge />}
    />

    <VStack align="center" spacing="4px">
      <Text variant="mobile-h2" weight="semibold">
        {profile.name}
      </Text>
      <RoleBadge role={profile.role} />
    </VStack>
  </VStack>

  {/* Stats - 2x2 Grid */}
  <StatsGrid cols={2} spacing="12px" mt="24px">
    <StatCard icon="trophy" value={profile.achievements} label="Achievements" />
    <StatCard icon="fire" value={profile.streak} label="Day Streak" />
    <StatCard icon="star" value={profile.rating} label="Rating" />
    <StatCard icon="users" value={profile.teams} label="Teams" />
  </StatsGrid>

  {/* Bio */}
  {profile.bio && (
    <Text variant="mobile-body" color="muted" mt="16px">
      {profile.bio}
    </Text>
  )}

  {/* Actions */}
  <HStack spacing="12px" mt="24px">
    <Button variant="primary" fullWidth size="lg" minHeight="48px">
      View Profile
    </Button>
    <IconButton icon="edit" size="lg" minSize="48px" />
  </HStack>
</MobileProfileCard>
```

**Deliverables:**

- [ ] Redesign ProfileCard for mobile
- [ ] Make stats more prominent
- [ ] Add better CTA hierarchy
- [ ] Implement edit mode
- [ ] Add profile completion progress

---

### **Phase 4: Navigation & Flow (Week 4)**

#### **4.1 Bottom Navigation (App-Wide)**

**Goal**: Consistent, thumb-friendly primary navigation

```tsx
// Every page includes:
<MobileBottomNav
  items={[
    {
      id: "dashboard",
      label: "Home",
      icon: "home",
      href: "/dashboard",
      badge: 0,
    },
    {
      id: "playbook",
      label: "Playbook",
      icon: "book",
      href: "/playbook",
      badge: 0,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "calendar",
      href: "/calendar",
      badge: 2,
    },
    {
      id: "more",
      label: "More",
      icon: "menu",
      onTap: () => showMoreSheet(),
    },
  ]}
  active={currentRoute}
/>
```

**Specifications:**

- **Height**: 64px (+ safe area inset)
- **Touch Targets**: 48px
- **Active State**: Bold text + jade icon + dot indicator
- **Badge**: Red dot or number
- **Animation**: Scale bounce on tap

**Deliverables:**

- [ ] Add MobileBottomNav to all pages
- [ ] Implement "More" sheet with overflow items
- [ ] Add badge system
- [ ] Add tab bar haptics
- [ ] Test on notched devices

---

#### **4.2 Gesture Navigation**

**Add Swipe Gestures Throughout:**

1. **Swipe Back** (Pages)
   - Swipe from left edge → Go back
   - iOS-style pan gesture with progress indicator

2. **Swipe to Refresh** (Lists)
   - Pull down → Refresh content
   - Show loading spinner

3. **Swipe Actions** (List Items)
   - Swipe left → Edit, Delete
   - Swipe right → Star, Pin

4. **Bottom Sheet Gestures**
   - Swipe up → Expand
   - Swipe down → Collapse
   - Flick → Snap to next state

**Implementation:**

```tsx
import { useSwipeable } from "react-swipeable";

function MobileListItem({ onEdit, onDelete }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => showActions(["Edit", "Delete"]),
    onSwipedRight: () => showActions(["Star", "Pin"]),
    trackMouse: false,
  });

  return <div {...handlers}>{/* List item content */}</div>;
}
```

**Deliverables:**

- [ ] Add swipe-back navigation
- [ ] Implement pull-to-refresh on all lists
- [ ] Add swipe actions to list items
- [ ] Add haptic feedback to gestures
- [ ] Document gesture patterns

---

## 📏 Design Specifications

### Mobile Spacing System

```css
/* Consistent mobile spacing */
--mobile-space-0: 0;
--mobile-space-1: 4px; /* Inline spacing (chips, badges) */
--mobile-space-2: 8px; /* Compact spacing (icon to text) */
--mobile-space-3: 12px; /* Standard spacing (between items) */
--mobile-space-4: 16px; /* Group spacing (section internal) */
--mobile-space-5: 20px; /* Comfortable spacing */
--mobile-space-6: 24px; /* Section spacing (between sections) */
--mobile-space-8: 32px; /* Page spacing (page edges) */
--mobile-space-10: 40px; /* Hero spacing */
```

### Mobile Touch Targets

```css
/* Touch target sizing */
--mobile-touch-minimum: 44px; /* Apple HIG minimum */
--mobile-touch-comfortable: 48px; /* Recommended */
--mobile-touch-spacious: 56px; /* Large CTAs, FABs */
--mobile-touch-hero: 64px; /* Primary hero CTAs */
```

### Mobile Card Heights

```css
/* Standardized card heights */
--mobile-card-compact: 80px; /* List items, chips */
--mobile-card-standard: 120px; /* Play cards, content cards */
--mobile-card-comfortable: 160px; /* Featured content */
--mobile-card-hero: 180px; /* Primary CTA cards */
--mobile-card-tall: 240px; /* Stats, dashboards */
```

### Mobile Border Radius

```css
/* iOS-inspired rounded corners */
--mobile-radius-sm: 8px; /* Chips, badges */
--mobile-radius-md: 12px; /* Standard cards */
--mobile-radius-lg: 16px; /* Modals, sheets */
--mobile-radius-xl: 20px; /* Hero cards */
--mobile-radius-2xl: 24px; /* Bottom sheets */
```

---

## 🎨 Visual Design Guidelines

### Color Usage (Mobile)

**Background Hierarchy:**

```
Level 1: Surface (white/gray-50)     - Page background
Level 2: Card (white + shadow)       - Content cards
Level 3: Elevated (white + lg shadow)- Modals, sheets
Level 4: Overlay (black/10% alpha)   - Backdrops
```

**Interactive Colors:**

```
Primary: Jade (brand)         - CTAs, active states
Secondary: Navy (neutral)     - Secondary actions
Accent: Purple (premium)      - Special features
Success: Green                - Positive feedback
Warning: Amber                - Caution
Error: Red                    - Destructive actions
```

**Text Hierarchy:**

```
Primary: gray-900 (high contrast)    - Titles, body
Secondary: gray-700 (medium)         - Subtitles, labels
Muted: gray-500 (low)                - Metadata, timestamps
Disabled: gray-400 (minimal)         - Disabled state
```

### Shadow System (iOS-Style)

```css
/* Subtle elevation shadows */
--mobile-shadow-sm:
  0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.06);

--mobile-shadow-md:
  0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.08);

--mobile-shadow-lg:
  0 4px 8px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.12);

--mobile-shadow-xl:
  0 8px 16px rgba(0, 0, 0, 0.12), 0 16px 32px rgba(0, 0, 0, 0.16);
```

### Animation Curves

```css
/* Natural motion curves */
--mobile-ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* Exit */
--mobile-ease-in: cubic-bezier(0.7, 0, 0.84, 0); /* Enter */
--mobile-ease-bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6); /* Bounce */
--mobile-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring */
```

---

## 🧪 Testing & Validation

### Device Testing Matrix

**Must Test On:**

- [ ] iPhone SE (375px) - Small screen
- [ ] iPhone 14 Pro (393px) - Standard
- [ ] iPhone 14 Pro Max (430px) - Large
- [ ] iPad Mini (768px) - Tablet
- [ ] iPad Pro (1024px) - Large tablet

**Browsers:**

- [ ] Safari iOS
- [ ] Chrome iOS
- [ ] Chrome Android
- [ ] Samsung Internet

### Accessibility Checklist

- [ ] All touch targets ≥ 44px
- [ ] Text contrast ≥ 4.5:1 (WCAG AA)
- [ ] Focus indicators visible
- [ ] Screen reader labels accurate
- [ ] Keyboard navigation works
- [ ] Haptic feedback on actions
- [ ] Reduced motion respected
- [ ] Dark mode tested

### Performance Metrics

**Target:**

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90
- [ ] 60fps animations
- [ ] Smooth scrolling (no jank)

---

## 📦 Deliverables Summary

### Week 1: Foundation

- [ ] Mobile component library (6 components)
- [ ] Mobile layout system
- [ ] Mobile typography scale
- [ ] Documentation

### Week 2: Playbook Page

- [ ] Redesigned PlaybookPage
- [ ] New PlayCard component
- [ ] Filter bottom sheet
- [ ] Empty states
- [ ] Swipe actions

### Week 3: Dashboard

- [ ] Redesigned DashboardPage
- [ ] New ProfileCard
- [ ] HeroStatsCard
- [ ] QuickActionGrid
- [ ] EventCard

### Week 4: Navigation & Polish

- [ ] Bottom navigation (app-wide)
- [ ] Gesture navigation
- [ ] Pull-to-refresh
- [ ] Haptic feedback
- [ ] Dark mode polish
- [ ] Performance optimization

---

## 🚀 Success Metrics

**Quantitative:**

- Mobile bounce rate: Target < 20%
- Session duration: Target > 5 minutes
- Task completion rate: Target > 85%
- App store rating: Target 4.5+ stars
- Load time: Target < 2 seconds

**Qualitative:**

- "Feels like a native app"
- "Easy to use with one hand"
- "Clear what to do next"
- "Professional and polished"
- "Faster than the website"

---

## 💡 Future Enhancements (Post-Launch)

1. **Offline Support** - PWA with service workers
2. **Native App Wrapper** - Capacitor or React Native
3. **3D Touch / Haptics** - Pressure-sensitive interactions
4. **Siri Shortcuts** - Voice commands
5. **Apple Watch Companion** - Quick stats on wrist
6. **Widgets** - Home screen widgets for upcoming practices
7. **AR Playbook** - View plays in AR on the field

---

## 📚 References & Inspiration

**Design Systems:**

- Apple HIG (Human Interface Guidelines)
- Material Design 3 (Google)
- Fluent Design (Microsoft)
- Atlassian Design System
- Polaris (Shopify)

**Apps to Study:**

- **Todoist** - Progressive disclosure, clear hierarchy
- **Linear** - Keyboard shortcuts, fast interactions
- **Notion** - Flexible layouts, smooth animations
- **Superhuman** - Guided onboarding, shortcuts
- **Figma** - Gesture controls, contextual menus
- **Slack** - Bottom sheets, swipe actions
- **Instagram** - Story interactions, bottom nav

---

## ✅ Implementation Checklist

### Before You Start

- [ ] Review this entire document
- [ ] Set up mobile device testing
- [ ] Create mobile Storybook viewport
- [ ] Install mobile debugging tools
- [ ] Create feature branch

### During Implementation

- [ ] Build components in isolation (Storybook)
- [ ] Test on real devices (not just simulators)
- [ ] Get design review on each component
- [ ] Write accessibility tests
- [ ] Document all patterns

### Before Launch

- [ ] Full QA pass on 5+ devices
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] User testing (5+ users)
- [ ] Stakeholder demo
- [ ] Analytics instrumented

---

## 🎯 Conclusion

This roadmap transforms BoxCall from a "mobile-responsive website" into a **professional, native-feeling mobile app** that coaches will love to use.

**Key Principles:**

1. **Mobile-first, always** - Design for thumb, enhance for desktop
2. **Clarity over density** - One thing at a time, guide the user
3. **Consistent patterns** - Same interactions everywhere
4. **Delightful details** - Animations, haptics, polish
5. **Performance obsessed** - Fast loads, smooth scrolling

**Remember:** A great mobile experience isn't just "smaller desktop" — it's a fundamentally different way of thinking about UI/UX. Focus on the user's context: they're often moving, one-handed, in bright sunlight, and need quick answers.

Let's build something coaches love to use! 🏈📱✨
