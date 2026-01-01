# Team Bulletin Social Enhancement Plan

## 🎯 Vision

Transform the Team Bulletin into the "Facebook/MySpace of social football" - a daily check-in destination where teams connect, celebrate, and stay aligned.

## ✅ What We Already Have (Solid Foundation)

### Layout & Structure

- **3-Column Dashboard**: Left sidebar (actions), center feed, right sidebar (roster/calendar)
- **Hero Section**: 4 AuroraTiles showcasing Trophy Case, Goals & Progress, Team Decisions, Season Stats
- **TeamFeed Component**: Posts with likes, comments, shares, pinning
- **UserAvatar with Popovers**: Rich profile previews on hover
- **Collaboration Widgets**: SharedGoalTracker, TeamVoteWidget, ProgressSharing
- **Design System**: Aurora variants, semantic tokens, responsive grid

### Current Features

- Post creation with content
- Like/unlike posts (with counts)
- Comments (with counts)
- Share functionality
- Pin important posts
- User profiles with avatars
- Team calendar integration
- Roster display
- Trophy case
- Season stats tracking

## 🚀 Sprint 1 Features to Wire Up

### 1. Enhanced Reactions (Instead of Just "Like")

**Status**: Service & Component built, needs integration

**What We Have**:

- `ReactionsService` with 8 emoji types (like, love, fire, clap, celebrate, football, target, hundred)
- `ReactionPicker` component with dropdown + tooltips showing "who reacted"
- Database table: `announcement_reactions` with RLS policies

**Integration Tasks**:

- [ ] Replace simple "Like" button with ReactionPicker in TeamFeed posts
- [ ] Update post cards to show reaction summary (8 emojis with counts)
- [ ] Add "Who reacted" tooltips on hover
- [ ] Migrate from `likes_count` to reaction aggregation
- [ ] Update real-time subscriptions to include reactions

### 2. @Mention Notifications

**Status**: Service & Component built, needs integration

**What We Have**:

- `NotificationsService` with full CRUD operations
- `NotificationBell` component with badge, dropdown, mark read/delete
- Database table: `notifications` with RLS policies
- `MentionsService` for extracting mentions from TipTap JSON

**Integration Tasks**:

- [ ] Add NotificationBell to TeamBulletinHeader (top right)
- [ ] Wire up announcement editor to detect @mentions
- [ ] Create notifications when users are mentioned
- [ ] Link notifications to announcement/comment context
- [ ] Show unread count badge
- [ ] Real-time polling (30s interval)

### 3. Full Announcements System

**Status**: AnnouncementsList & AnnouncementCard components exist

**What We Have**:

- Rich text editor with TipTap
- Announcement cards with reactions, comments
- RichTextDisplay with formatting
- Draft mode (status column)
- Hashtag support

**Integration Tasks**:

- [ ] Replace generic TeamFeed posts with rich announcements
- [ ] Show formatted content with links, mentions, hashtags
- [ ] Add inline comment threads below each announcement
- [ ] Show read receipts ("12 people read this")
- [ ] Add search bar at top of feed
- [ ] Clickable hashtags to filter feed

### 4. Activity Indicators (Make it Feel Social)

**Status**: New feature to add

**What to Build**:

- [ ] "X people online now" indicator (green dots on avatars)
- [ ] "32 active today" stat in hero section
- [ ] "Someone is typing..." in comment threads
- [ ] Real-time "New posts" banner (Supabase subscriptions)
- [ ] "Scroll to top" button when new content arrives
- [ ] Last active timestamp on user popovers

### 5. Enhanced Feed Composer

**Status**: Needs upgrade from basic textarea

**What to Build**:

- [ ] Rich text editor at top of feed (TipTap)
- [ ] @mention autocomplete dropdown
- [ ] Hashtag suggestions (#defense, #offense, #gameday)
- [ ] Image/video upload preview
- [ ] Draft auto-save
- [ ] Character count (optional limit)
- [ ] Post visibility toggle (public/team-only)

## 🎨 Design Enhancements

### Visual Hierarchy

- **Pinned Posts**: Gold gradient border + star icon
- **Unread Notifications**: Blue dot indicator
- **New Posts**: Fade-in animation on load
- **Reactions**: Scale-up animation on click
- **Online Users**: Green pulse animation on avatar

### Mobile Responsive

- **Stack Layout**: Hero tiles → Feed → Sidebar (vertical)
- **Bottom Nav**: Quick actions accessible via floating button
- **Pull to Refresh**: Native mobile gesture support
- **Swipe Actions**: Swipe post left for quick actions

### Micro-Interactions

- **Reaction Pop**: Emoji bounces on add/remove
- **Comment Expand**: Smooth height transition
- **Notification Badge**: Pulse animation when new
- **Hashtag Highlight**: Background color on hover
- **Avatar Popover**: 200ms delay, smooth fade

## 📊 Data Architecture

### Existing Tables (Use These)

```sql
team_announcements (id, team_id, author_id, title, content, created_at, status)
announcement_comments (id, announcement_id, author_id, content, created_at)
announcement_reactions (id, announcement_id, user_id, reaction_type, created_at)
notifications (id, user_id, type, title, message, announcement_id, read, created_at)
profiles (id, display_name, full_name, avatar_url, last_active)
team_members (id, team_id, user_id, role, joined_at)
```

### Real-Time Subscriptions

```typescript
// Subscribe to new announcements
supabase
  .channel("team-announcements")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "team_announcements",
      filter: `team_id=eq.${teamId}`,
    },
    handleNewAnnouncement
  )
  .subscribe();

// Subscribe to new reactions
supabase
  .channel("announcement-reactions")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "announcement_reactions",
    },
    handleReactionChange
  )
  .subscribe();
```

## 🚧 Implementation Phases

### Phase 1: Wire Up Core Features (Today - 2-3 hours)

1. **Replace TeamFeed with AnnouncementsList** ✅
   - Import AnnouncementsList component
   - Pass teamId and userRole props
   - Remove old post creation form
   - Test basic display

2. **Add NotificationBell to Header** ✅
   - Import NotificationBell component
   - Place in TeamBulletinHeader (top right)
   - Pass userId from auth context
   - Test notification dropdown

3. **Wire Up Reactions** ✅
   - Replace like button with ReactionPicker
   - Show reaction summary on posts
   - Test tooltip on hover
   - Update counts in real-time

4. **Add Search & Hashtag Filtering** ✅
   - Add search input above feed
   - Wire up handleHashtagClick
   - Smooth scroll on filter change

### Phase 2: Activity Indicators (Tomorrow - 2 hours)

1. **Online Status**
   - Update last_active on user activity
   - Query users active in last 5 minutes
   - Show green dot on avatars
   - "12 people online" badge in header

2. **Real-Time Updates**
   - Supabase channel subscriptions
   - "New posts available" banner
   - Auto-refresh on click
   - Typing indicators in comments

3. **Enhanced Stats**
   - "32 active today" in hero section
   - "85% read rate" on announcements
   - "12 reactions this week" trend

### Phase 3: Polish & Animations (Day 3 - 2 hours)

1. **Animations**
   - Fade-in for new posts
   - Scale-up for reactions
   - Slide-in for notifications
   - Smooth collapse/expand comments

2. **Mobile Optimization**
   - Test on 375px width
   - Adjust font sizes
   - Touch-friendly tap targets (44px min)
   - Bottom nav for quick actions

3. **Performance**
   - Lazy load images
   - Virtual scrolling for long feeds
   - Debounce search input
   - Memoize expensive components

## ✅ Success Metrics

### Engagement (Goal: 70%+ Daily Active Users)

- [ ] 5-10 announcements posted per day
- [ ] 3-5 comments per announcement average
- [ ] 10+ reactions per announcement
- [ ] 80%+ read rate within 24 hours
- [ ] < 2 second load time

### User Feedback (Goal: "I check BoxCall every day")

- [ ] Net Promoter Score > 8/10
- [ ] 50%+ daily return rate
- [ ] Average session > 5 minutes
- [ ] < 5% bounce rate

## 🎯 Quick Wins (Do First)

1. **Replace TeamFeed with AnnouncementsList** - Instant rich content upgrade
2. **Add NotificationBell** - Immediate engagement boost
3. **Wire up ReactionPicker** - More expressive than "like"
4. **Add search bar** - Essential discoverability

## 🔧 Technical Notes

### Component Locations

```
src/components/team/AnnouncementsList.tsx       ← Main feed component
src/components/team/AnnouncementCard.tsx        ← Individual post
src/components/team/AnnouncementEditor.tsx      ← Rich composer
src/components/ui/ReactionPicker.tsx            ← 8 emoji reactions
src/components/ui/NotificationBell.tsx          ← Bell icon + dropdown
src/services/announcementsService.ts            ← CRUD operations
src/services/reactionsService.ts                ← Reactions logic
src/services/notificationsService.ts            ← Notifications logic
```

### Design System Tokens

```typescript
// Use these instead of raw Tailwind colors
bg - surface - primary; // Main backgrounds
bg - surface - secondary; // Card backgrounds
text - primary; // Main text
text - secondary; // Muted text
border - subtle; // Dividers
bg - aurora - emerald; // Accent tiles
glow - aurora - amber; // Trophy case glow
```

### Real-Time Best Practices

- Use Supabase channels for live updates
- Debounce user activity tracking (5s)
- Poll notifications every 30s (or use websockets)
- Optimistic UI updates for instant feedback
- Rollback on error with toast notification

## 🎉 The Goal

**Transform Team Bulletin from a "dashboard" into a "hangout"** - where coaches post game plans, players react with fire emojis, families comment with encouragement, and everyone checks in daily to stay connected with their team.

It's not just announcements anymore - it's the **heartbeat of the team**.
