# Player View: Navigation & RLS (Row Level Security)

**Date:** October 16, 2025  
**Context:** Player invitation system MVP complete - documenting what players see and can access

---

## 🎯 What Players See (Navigation)

Based on **`src/utils/navigation.ts`** and player role permissions:

### ✅ Player Navigation Items

1. **Dashboard** (`/dashboard`)
   - Icon: `home`
   - Personal dashboard with live feed and notifications
   - Available to: **Everyone**

2. **Team Bulletin** (`/teams/:teamId/bulletin`)
   - Icon: `users`
   - Team-specific feed, announcements, and quick actions
   - Available to: **Everyone**
   - Replaces old "Team Dashboard" concept

3. **Playbook** (`/playbook`)
   - Icon: `book`
   - Team plays and strategies (READ-ONLY for players)
   - Available to: **Coaches, Players, Super Admins**
   - Players can: **Study plays** (view, search)
   - Players CANNOT: Create, edit, or delete plays

4. **Calendar** (`/teams/:teamId/calendar` or `/calendar`)
   - Icon: `calendar`
   - Personal and team calendars
   - Available to: **Everyone**
   - Players can: RSVP to events

5. **Planner** (`/planner`)
   - Icon: `clipboard-list`
   - Weekly planning dashboard
   - Available to: **Everyone**

6. **Profile** (`/profile`)
   - Icon: `user`
   - Edit user settings and preferences
   - Available to: **Everyone**

---

7. **About** (`/about`)
   - Icon: `info`
   - Learn about BoxCall
   - Available to: **Everyone**

8. **Design System** (`/design-system`)
   - Icon: `sparkles`
   - Explore design system and theming
   - Available to: **Everyone** (dev/demo feature)

9. **Social Demo** (`/social`)
   - Icon: `message`
   - Social features and interactions
   - Available to: **Everyone** (dev/demo feature)

### ❌ Pages Players CANNOT See

- **BoxCall** (`/boxcall`) - Premium coaching tools (Coaches only)
- **Roster** (`/roster`) - Manage team roster (Coaches only)
- **Awards** (`/awards`) - Give awards (Coaches only)
- **Team Settings** (`/teams/:teamId/settings`) - Team configuration (Coaches only)

---

## 🔐 Player Capabilities (Domain-Level Permissions)

From **`src/services/capabilities/capabilityMap.ts`**:

```typescript
player: [
  CAPABILITIES.VIEW_STATS, // Can view their own stats
  CAPABILITIES.STUDY_PLAYS, // Can view playbook (read-only)
  CAPABILITIES.RSVP_EVENT, // Can RSVP to calendar events
  CAPABILITIES.TEAM_CHAT, // Can participate in team chat
];
```

### What Players CAN Do:

1. ✅ **View Stats** - See their own performance statistics
2. ✅ **Study Plays** - Read and search playbook (no editing)
3. ✅ **RSVP Events** - Respond to calendar events (practices, games)
4. ✅ **Team Chat** - Participate in team messaging
5. ✅ **View Team Bulletin** - See announcements and posts
6. ✅ **Update Profile** - Edit their own profile information

### What Players CANNOT Do:

- ❌ Create/edit/delete plays in playbook
- ❌ Manage roster (view/edit other players)
- ❌ Award helmet stickers
- ❌ Log game results
- ❌ Upload film/video
- ❌ Manage team settings
- ❌ Pin posts to bulletin
- ❌ View practice templates
- ❌ View all players' stats (only their own)

---

## 🛡️ Row Level Security (RLS) Policies

### How RLS Works for Players

**Security Chain:**

```
User (auth.users)
  ↓
team_members (user_id FK, team_role='player')
  ↓
teams (team_id FK)
  ↓
[All team-scoped tables]
```

### Key RLS Patterns for Players

#### 1. **Playbook Access** (READ-ONLY)

**Schema:** `database/schema.sql` line ~470-550

```sql
-- Players can VIEW plays for their team
CREATE POLICY "Team members can view plays" ON plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Coaches can MANAGE plays (INSERT/UPDATE/DELETE)
CREATE POLICY "Team coaches can manage plays" ON plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );
```

**Result:**

- ✅ Players: Can SELECT (view) plays
- ❌ Players: Cannot INSERT/UPDATE/DELETE plays

---

#### 2. **Roster Access** (NO ACCESS)

**Schema:** `database/schema.sql` line ~53+

```sql
-- Team members can view roster
CREATE POLICY "Team members can view players" ON team_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_players.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Only COACHES can manage roster
CREATE POLICY "Team coaches can manage players" ON team_players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_players.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );
```

**Result:**

- ✅ Players: Can SELECT (view) roster
- ❌ Players: Cannot INSERT/UPDATE/DELETE roster entries

**Frontend Gate:**

- Roster page (`/roster`) is hidden from players in navigation
- Route guard blocks direct URL access

---

#### 3. **Calendar/Events Access** (RSVP Only)

**Schema:** `database/schema.sql` line ~700+

```sql
-- Team members can view calendar events
CREATE POLICY "Team members can view calendar events" ON calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = calendar_events.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- Players can RSVP (update their attendance)
CREATE POLICY "Team members can update event attendance" ON event_attendance
  FOR UPDATE USING (
    user_id = auth.uid()
  );
```

**Result:**

- ✅ Players: Can view all team events
- ✅ Players: Can RSVP (update their own attendance)
- ❌ Players: Cannot create/edit/delete events

---

#### 4. **Team Bulletin/Posts Access** (View + Chat)

**Schema:** `database/schema.sql` line ~650+

```sql
-- Team members can view posts
CREATE POLICY "Team members can view posts" ON team_posts
  FOR SELECT USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Team members can create comments (chat)
CREATE POLICY "Team members can comment on posts" ON post_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_posts tp
      JOIN team_members tm ON tm.team_id = tp.team_id
      WHERE tp.id = post_comments.post_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );
```

**Result:**

- ✅ Players: Can view all team posts
- ✅ Players: Can comment on posts (team chat)
- ✅ Players: Can like posts
- ❌ Players: Cannot create new posts (unless coaches grant permission)
- ❌ Players: Cannot pin posts

---

#### 5. **Profile Access** (Own Profile Only)

**Schema:** `database/schema.sql` line ~500+

```sql
-- Users can view profiles of team members
CREATE POLICY "Users can view profiles of team members" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = profiles.id
      AND EXISTS (
        SELECT 1 FROM team_members tm2
        WHERE tm2.team_id = tm.team_id
        AND tm2.user_id = auth.uid()
        AND tm2.status = 'active'
      )
    )
  );

-- Users can update their own profiles
CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (
    id = auth.uid()
  );
```

**Result:**

- ✅ Players: Can view all teammate profiles
- ✅ Players: Can edit ONLY their own profile
- ❌ Players: Cannot edit other profiles

---

## 🚀 Player Invitation Flow (New Feature)

### When a Player is Invited:

1. **Coach adds player with email** → Click "Invite to Team" button
2. **System generates UUID token** → Stored in `team_players.invitation_token`
3. **Email sent** (console.log MVP) → URL: `https://boxcall.com/invite/accept?token=<uuid>`
4. **Player clicks link** → Accept invitation page (TODO: Phase 2)
5. **Player signs up/logs in** → Creates account or logs in
6. **System links player** → Updates `team_players.user_id` with authenticated user
7. **System adds to team_members** → Creates `team_members` record with `team_role='player'`
8. **Player sees player navigation** → Full access to player pages

### Invitation Status:

- **`not_invited`** - No email provided, no invitation sent
- **`pending`** - Invitation sent, waiting for acceptance
- **`accepted`** - Player accepted and linked account
- **`declined`** - Player declined invitation (future)

### Badge Display on Roster:

```tsx
{
  player.invitation_status === "pending" && (
    <span className="... bg-gradient-to-r from-amber-500 to-orange-500">
      Invited
    </span>
  );
}
{
  player.invitation_status === "accepted" && (
    <span className="... bg-gradient-to-r from-green-500 to-emerald-500">
      ✓ Accepted
    </span>
  );
}
```

---

## 📊 Role Hierarchy

From **`src/services/roleService.ts`**:

```typescript
const TEAM_ROLE_HIERARCHY = {
  head_coach: 5, // Highest authority
  assistant_coach: 4,
  coordinator: 3,
  manager: 2,
  player: 1, // Player role
  family: 0,
  alumni: 0,
  viewer: 0,
};
```

**Implications:**

- Players have minimal permissions (level 1)
- Cannot access coach-level features
- RLS enforces this at database level
- UI navigation respects role hierarchy

---

## 🎨 Player Dashboard Summary

### What the Dashboard Should Show (Player Version):

**Based on navigation and capabilities:**

```
┌─────────────────────────────────────────────────┐
│  BoxCall - Player Dashboard                    │
├─────────────────────────────────────────────────┤
│  [Profile Picture] John "Johnny" Doe            │
│  #12 | Wide Receiver | Junior                  │
│                                                 │
│  📊 My Stats                                    │
│  ├─ Games Played: 8                            │
│  ├─ Receptions: 24                             │
│  └─ Touchdowns: 3                              │
│                                                 │
│  📖 Study Playbook                             │
│  ├─ 4 new plays added this week                │
│  └─ [View Playbook] →                          │
│                                                 │
│  📅 Upcoming Events                            │
│  ├─ Practice Today (4:00 PM) [RSVP]           │
│  ├─ Game Friday (7:00 PM) [RSVP'd]            │
│  └─ [View Calendar] →                          │
│                                                 │
│  💬 Team Bulletin                              │
│  ├─ Coach posted new practice plan             │
│  ├─ 3 new comments on game recap               │
│  └─ [View Team Bulletin] →                     │
│                                                 │
│  🏆 Recent Achievements                        │
│  ├─ Great Catch! (Yesterday)                   │
│  └─ Hustle Award (Last week)                   │
└─────────────────────────────────────────────────┘
```

### Sidebar Navigation (Player View):

```
┌─────────────────────┐
│ 🏠 Dashboard        │ ← Active
│ 👥 Team Bulletin    │
│ 📖 Playbook         │
│ 📅 Calendar         │
│ 📋 Planner          │
│ 👤 Profile          │
├─────────────────────┤
│ ℹ️  About           │
│ ✨ Design System    │
│ 💬 Social Demo      │
│ 🚪 Logout           │
└─────────────────────┘

❌ NOT SHOWN:
- BoxCall (Pro)
- Roster
- Awards
- Team Settings
```

---

## 🔧 Next Steps for Player Experience

### Phase 2: Invitation Acceptance Flow

**TODO:**

1. **Create `/invite/accept` page** (`src/pages/AcceptInvitationPage.tsx`)
   - Token validation
   - Sign up / Sign in flow
   - Link user_id to team_player record
   - Create team_members entry with `team_role='player'`

2. **Update invitationService** (`src/services/invitationService.ts`)
   - Implement `acceptInvitation(token, userId)`
   - Update `invitation_status = 'accepted'`
   - Set `invitation_accepted_at = NOW()`

3. **Email Service Integration**
   - Replace console.log with Resend/SendGrid
   - HTML email templates
   - Delivery tracking

### Phase 3: Player Onboarding

**Features:**

- Welcome modal for new players
- Profile completion checklist
- Playbook tutorial ("Study these 5 plays first")
- Calendar RSVP reminders
- Parent/guardian invitation flow

### Phase 4: Player Analytics

**Player-Specific Dashboard:**

- Personal stats dashboard
- Play study progress
- Attendance tracking
- Achievement history
- Peer comparisons (opt-in)

---

## 📝 Summary

### Current State ✅

- **Navigation**: Player role sees 9 navigation items (no coach features)
- **Capabilities**: Players can view stats, study plays, RSVP events, chat
- **RLS**: Database enforces read-only playbook, no roster management
- **Invitation MVP**: Database ready, UI ready, awaiting email service

### Player Access Pattern

```
VIEW (Read):  Playbook, Calendar, Team Bulletin, Profile (teammates)
INTERACT:     RSVP events, Comment on posts, Update own profile
BLOCKED:      Roster, Team Settings, Play editing, Awards, BoxCall
```

### Security Layers

1. **RLS Policies** - Database-level enforcement
2. **Navigation Gates** - UI hides unauthorized pages
3. **Capability Checks** - Feature flags for actions
4. **Route Guards** - Blocks direct URL access

---

**Status:** ✅ Player view fully documented  
**Next Action:** Test invitation flow in browser, then plan Phase 2 (acceptance page)
