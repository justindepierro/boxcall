# BoxCall Database Architecture - Complete Reference

**Last Updated:** November 28, 2025  
**Database:** PostgreSQL 17.6.1.017 via Supabase  
**Tables:** 31 total

---

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Data Flow & Analytics](#data-flow--analytics)
3. [Table Relationships](#table-relationships)
4. [Complete Table Reference](#complete-table-reference)

---

## Core Architecture

### Primary Data Flow

```
TEAMS (organization)
  ↓
TEAM_MEMBERS (users + roles)
  ↓
PLAYBOOKS (team playbooks)
  ↓
PLAYS (main data house) ← THIS IS YOUR SOURCE OF TRUTH
  ↓
PLAY_CALLS (practice/game execution)
  ↓
ANALYTICS (times_called, times_successful, results)
```

### Key Design Principles

1. **plays table = Central Data House**
   - All play information stored here (formation, personnel, diagram)
   - Direct analytics via times_called, times_successful counters
   - No FK constraints to separate formation table

2. **Team-Based Isolation**
   - All data scoped to teams via team_id or playbook_id
   - RLS policies enforce team membership access
   - Coaches have elevated permissions

3. **Personnel System**
   - personnel_configurations: Define packages ("11", "12", "21")
   - personnel_players: Player positions within packages
   - Linked to plays via TEXT field, not FK

4. **formations table Status**
   - ⚠️ OPTIONAL: Not currently used in main flow
   - Can be used for formation templates/library
   - NOT linked to plays via FK (plays.formation is TEXT)

---

## Data Flow & Analytics

### Play Creation Flow

```sql
-- Step 1: Create Play
INSERT INTO plays (
  playbook_id,
  formation,     -- TEXT: "Shotgun Trips Right"
  play_name,     -- TEXT: "Z Spot"
  p_type,        -- TEXT: "Pass"
  personnel,     -- TEXT: "11"
  diagram_data   -- JSONB: player positions
) VALUES (...);

-- Step 2: Call Play in Practice/Game
INSERT INTO play_calls (
  play_id,       -- FK to plays.id
  game_id,       -- NULL for practice
  quarter,
  result         -- "Complete 15 yards"
) VALUES (...);

-- Step 3: Analytics Query
SELECT
  p.formation,
  p.personnel,
  p.p_type,
  COUNT(pc.id) as times_run,
  COUNT(CASE WHEN pc.result LIKE '%Complete%' THEN 1 END) as successes,
  AVG(CAST(SUBSTRING(pc.result FROM '\d+') AS INTEGER)) as avg_yards
FROM plays p
LEFT JOIN play_calls pc ON pc.play_id = p.id
WHERE p.playbook_id = 'xxx'
GROUP BY p.formation, p.personnel, p.p_type;
```

### Formation Analytics (Grouping Left/Right Variants)

```sql
-- Group by base formation name (ignore directional suffix)
SELECT
  REGEXP_REPLACE(formation, ' (Left|Right)$', '') as base_formation,
  COUNT(*) as total_plays,
  SUM(times_called) as total_calls
FROM plays
GROUP BY REGEXP_REPLACE(formation, ' (Left|Right)$', '');

-- Example Results:
-- "Shotgun Trips" → includes "Shotgun Trips Left" + "Shotgun Trips Right"
```

---

## Table Relationships

### Entity Relationship Diagram

```
teams (id)
  ├─→ team_members (team_id)
  ├─→ team_players (team_id)
  ├─→ playbooks (team_id)
  ├─→ game_plans (team_id)
  ├─→ practice_scripts (team_id)
  ├─→ team_posts (team_id)
  └─→ game_results (team_id)

playbooks (id)
  ├─→ plays (playbook_id) ← MAIN DATA
  ├─→ formations (playbook_id) ← OPTIONAL/UNUSED
  └─→ personnel_configurations (playbook_id)

plays (id) ← CENTRAL HUB
  ├─→ play_calls (play_id) ← ANALYTICS
  └─→ game_plan_plays (play_id)

personnel_configurations (id)
  └─→ personnel_players (config_id)

game_plans (id)
  └─→ game_plan_situations (game_plan_id)
      └─→ game_plan_plays (situation_id)
```

### FK Constraint Summary

**plays table:**

- `playbook_id` → `playbooks.id` (CASCADE)
- `formation` → TEXT (no FK - intentional!)
- `personnel` → TEXT (no FK - intentional!)

**play_calls table:**

- `play_id` → `plays.id` (CASCADE) ✅ Analytics flow!
- `game_id` → `game_results.id` (optional)

**formations table:**

- `playbook_id` → `playbooks.id` (CASCADE)
- NOT referenced by plays! (unused in main flow)

---

## Complete Table Reference

### 1. Core Team Tables

#### teams

```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
school_name TEXT
mascot TEXT
season_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())
play_count INTEGER DEFAULT 0
last_backup_at TIMESTAMPTZ
backup_version INTEGER DEFAULT 1
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Users can create teams
```

#### team_members

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
user_id UUID FK → auth.users.id (CASCADE)
team_role TEXT CHECK (head_coach|assistant_coach|coordinator|manager|coach|player|family|alumni)
capabilities JSONB DEFAULT {...}
assigned_at TIMESTAMPTZ
status TEXT DEFAULT 'active' CHECK (active|inactive|pending)
role_notes TEXT

UNIQUE(team_id, user_id)

RLS: Users can join teams (if existing member allows)
```

#### team_players

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
first_name TEXT NOT NULL
last_name TEXT NOT NULL
nickname TEXT
jersey_number INTEGER
position TEXT
grade_level TEXT
height_inches INTEGER
weight_lbs INTEGER
is_active BOOLEAN DEFAULT true
user_id UUID FK → auth.users.id (SET NULL)
invitation_token UUID
invitation_status TEXT DEFAULT 'not_invited'
invitation_sent_at TIMESTAMPTZ
invitation_accepted_at TIMESTAMPTZ
invitation_expires_at TIMESTAMPTZ
invited_by UUID FK → auth.users.id (SET NULL)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Team-based access
```

#### profiles

```sql
id UUID PRIMARY KEY FK → auth.users.id (CASCADE)
full_name TEXT
avatar_url TEXT
role TEXT DEFAULT 'player'
bio TEXT
phone TEXT
email TEXT
display_name TEXT
address TEXT
settings JSONB DEFAULT '{}'
position TEXT
jersey_number INTEGER
emergency_contact TEXT
emergency_phone TEXT
grade_level TEXT
height_inches INTEGER
weight_lbs INTEGER
is_active BOOLEAN DEFAULT true
notification_preferences JSONB
last_login TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Users can insert their own profiles
```

---

### 2. Playbook & Plays (CORE SYSTEM)

#### playbooks

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
name TEXT NOT NULL DEFAULT 'Main Playbook'
description TEXT
is_active BOOLEAN DEFAULT true
play_count INTEGER DEFAULT 0
last_modified_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_playbooks_team_active (team_id, is_active)

RLS: Team coaches can manage, members can view
```

#### plays ← **MAIN DATA HOUSE**

```sql
id UUID PRIMARY KEY
playbook_id UUID FK → playbooks.id (CASCADE)

-- Formation Data (TEXT - no FK!)
formation TEXT NOT NULL              ← "Shotgun Trips Right"
f_type TEXT                          ← "Shotgun"
f_dir TEXT                           ← "Right"

-- Play Data
play_name TEXT NOT NULL              ← "Z Spot"
one_word_play TEXT                   ← "Spot"
p_type TEXT NOT NULL CHECK (Pass|Run|RPO|Play Action)
personnel TEXT                       ← "11", "12", "21"

-- Play Details
protection TEXT
p_dir TEXT
r_str TEXT                           ← Run strength
p_str TEXT                           ← Pass strength
back_align TEXT
shift TEXT
motion TEXT

-- Situational Preferences
pref_down TEXT
pref_dis TEXT
pref_hash TEXT
pref_cov TEXT
pref_front TEXT

-- Tags & Metadata
ftag1 TEXT                           ← Formation tag 1
ftag2 TEXT                           ← Formation tag 2
p_tag1 TEXT                          ← Play tag 1
p_tag2 TEXT                          ← Play tag 2
key_player1 TEXT
key_player2 TEXT
check_into TEXT
notes TEXT

-- Analytics Counters ← BUILT-IN!
confidence_base INTEGER DEFAULT 70
times_called INTEGER DEFAULT 0       ← Incremented by triggers
times_successful INTEGER DEFAULT 0   ← Updated by results

-- Diagram
diagram_data JSONB                   ← Player positions, routes

-- Tracking
creation_source play_creation_source DEFAULT 'unknown'
creation_context JSONB DEFAULT '{}'

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_plays_playbook (playbook_id)
  - idx_plays_type (p_type)
  - idx_plays_creation_source (creation_source)
  - idx_plays_diagram_data GIN (diagram_data)

RLS: Team coaches can manage, members can view
```

#### play_calls ← **ANALYTICS TRACKING**

```sql
id UUID PRIMARY KEY
play_id UUID FK → plays.id (CASCADE)  ← Links to plays!
game_id UUID                           ← NULL for practice
quarter INTEGER
time_remaining TEXT
yard_line INTEGER
down INTEGER
distance INTEGER
result TEXT                            ← "Complete 15 yards", "Incomplete"
created_at TIMESTAMPTZ

RLS: Currently disabled (needs fixing)

PURPOSE: Track every time a play is called in practice or games
ANALYTICS: Join with plays to get formation/personnel stats
```

---

### 3. Personnel System

#### personnel_configurations

```sql
id UUID PRIMARY KEY
playbook_id UUID FK → playbooks.id (CASCADE)
name TEXT NOT NULL                   ← "11", "12", "21", "Blue"
description TEXT                     ← "1 RB, 1 TE, 3 WR"
badge_customization JSONB            ← Colors, styles
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

UNIQUE(playbook_id, name)

INDEXES:
  - idx_personnel_configurations_playbook_id
  - idx_personnel_configurations_playbook_name

RLS: Coaches can manage, users can view
TRIGGER: personnel_configurations_updated_at
```

#### personnel_players

```sql
id UUID PRIMARY KEY
config_id UUID FK → personnel_configurations.id (CASCADE)
player_position TEXT NOT NULL CHECK (QB|RB|TE|WR)
label TEXT NOT NULL                  ← "Blue", "Black", "Green"
sort_order INTEGER NOT NULL
is_wildcat_qb BOOLEAN DEFAULT false
created_at TIMESTAMPTZ

UNIQUE(config_id, sort_order)

CHECK: label ~ '^[A-Z0-9]{1,3}$'

INDEXES:
  - idx_personnel_players_config_id
  - idx_personnel_players_config_sort

RLS: Coaches can manage, users can view
```

---

### 4. formations ← **OPTIONAL/UNUSED**

#### formations

```sql
id UUID PRIMARY KEY
playbook_id UUID FK → playbooks.id (CASCADE)
name TEXT NOT NULL
description TEXT
diagram_data JSONB
personnel_packages UUID[]            ← Array of personnel_configurations IDs
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

UNIQUE(playbook_id, name)

INDEXES:
  - idx_formations_playbook_id
  - idx_formations_playbook_name

RLS: Coaches can create/update/delete, users can view
TRIGGER: formations_updated_at

⚠️ STATUS: Not currently linked to plays table!
⚠️ plays.formation is TEXT, not UUID FK
⚠️ Can be used for formation library/templates (future)
```

---

### 5. Game Planning

#### game_plans

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
opponent TEXT NOT NULL
game_date DATE NOT NULL
venue TEXT
home_away TEXT CHECK (home|away)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_game_plans_team_date

RLS: Coaches can manage, members can view
```

#### game_plan_situations

```sql
id UUID PRIMARY KEY
game_plan_id UUID FK → game_plans.id (CASCADE)
situation_type TEXT NOT NULL
yard_line INTEGER
down INTEGER
distance INTEGER
created_at TIMESTAMPTZ

RLS: Coaches can manage, members can view
```

#### game_plan_plays

```sql
id UUID PRIMARY KEY
situation_id UUID FK → game_plan_situations.id (CASCADE)
play_id UUID FK → plays.id (CASCADE)
priority INTEGER DEFAULT 1
notes TEXT
created_at TIMESTAMPTZ

RLS: Coaches can manage, members can view
```

---

### 6. Practice System

#### practice_scripts

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
name TEXT NOT NULL
description TEXT
practice_date DATE
script_data JSONB                    ← 8-box layout structure
created_by UUID FK → auth.users.id
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Team-based access
```

#### practice_templates

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
name TEXT NOT NULL
description TEXT
template_data JSONB
is_public BOOLEAN DEFAULT false
created_by UUID FK → auth.users.id
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Team-based access
```

#### practice_attendance

```sql
id UUID PRIMARY KEY
practice_schedule_id UUID
player_id UUID FK → team_players.id (CASCADE)
status TEXT DEFAULT 'unknown' CHECK (present|absent|excused|late|unknown)
notes TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Team-based access
```

---

### 7. Social Features

#### team_posts

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
author_id UUID FK → auth.users.id (CASCADE)
content TEXT NOT NULL
post_type TEXT DEFAULT 'announcement' CHECK (announcement|update|achievement|news)
is_pinned BOOLEAN DEFAULT false
hashtags TEXT[]
metadata JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_team_posts_team_created
  - idx_team_posts_author_team
  - idx_team_posts_hashtags GIN

RLS: Team-based access
```

#### post_likes, post_comments, post_shares

```sql
-- Standard social interaction tables
-- Link to team_posts via post_id FK

RLS: Team-based access
```

---

### 8. Analytics & Tracking

#### play_creation_analytics

```sql
id UUID PRIMARY KEY
playbook_id UUID FK → playbooks.id (CASCADE)
user_id UUID FK → auth.users.id (CASCADE)
tab_opened TEXT NOT NULL
session_id TEXT
time_spent INTEGER
diagrams_viewed INTEGER
diagrams_exported INTEGER
formations_selected INTEGER
created_at TIMESTAMPTZ

PURPOSE: Track how users interact with play creation tools
```

#### play_tab_usage_analytics

```sql
id UUID PRIMARY KEY
playbook_id UUID FK → playbooks.id (CASCADE)
user_id UUID FK → auth.users.id (CASCADE)
tab_name TEXT NOT NULL
session_id TEXT
time_spent INTEGER
actions_taken INTEGER
created_at TIMESTAMPTZ

PURPOSE: Track which tabs users spend time in
```

---

### 9. Game Results

#### game_results

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
opponent TEXT NOT NULL
game_date DATE NOT NULL
our_score INTEGER DEFAULT 0
opponent_score INTEGER DEFAULT 0
result TEXT CHECK (win|loss|tie)
venue TEXT
home_away TEXT CHECK (home|away)
notes TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_game_results_team_date

RLS: Coaches can manage, members can view
```

---

### 10. Miscellaneous

#### achievements

```sql
id UUID PRIMARY KEY
player_id UUID FK → team_players.id (CASCADE)
achievement_type TEXT NOT NULL
description TEXT
earned_date DATE NOT NULL
created_at TIMESTAMPTZ

RLS: Team-based access
```

#### helmet_stickers

```sql
id UUID PRIMARY KEY
player_id UUID FK → team_players.id (CASCADE)
sticker_type TEXT NOT NULL
earned_date DATE NOT NULL
created_at TIMESTAMPTZ

RLS: Team-based access
```

#### equipment

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
name TEXT NOT NULL
category TEXT NOT NULL
quantity INTEGER DEFAULT 1
condition TEXT DEFAULT 'good' CHECK (excellent|good|fair|poor)
last_checked DATE
notes TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_equipment_team_category

RLS: Team-based access
```

#### calendar_events

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
title TEXT NOT NULL
description TEXT
event_date DATE NOT NULL
start_time TIME
end_time TIME
event_type TEXT DEFAULT 'other' CHECK (game|practice|meeting|other)
location TEXT
created_by UUID FK → auth.users.id
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

INDEXES:
  - idx_calendar_events_team_date

RLS: Team-based access
```

#### season_stats

```sql
id UUID PRIMARY KEY
player_id UUID FK → team_players.id (CASCADE)
season_year INTEGER
stats_data JSONB                     ← Flexible stats storage
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

RLS: Team-based access
```

#### team_events

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
event_type TEXT NOT NULL
event_data JSONB
created_at TIMESTAMPTZ

PURPOSE: Event log for team activities
RLS: Team-based access
```

#### invitation_attempts

```sql
id UUID PRIMARY KEY
team_id UUID FK → teams.id (CASCADE)
player_id UUID FK → team_players.id (CASCADE)
email TEXT NOT NULL
attempted_by UUID FK → auth.users.id (SET NULL)
attempted_at TIMESTAMPTZ DEFAULT now()
success BOOLEAN DEFAULT false

INDEXES:
  - idx_invitation_attempts_email_time
  - idx_invitation_attempts_team_time

PURPOSE: Track invitation attempts for rate limiting
RLS: System can insert, coaches can view
```

---

## Key Insights for Development

### 1. plays Table is Central Hub

- **Formation:** Stored as TEXT, not FK
- **Personnel:** Stored as TEXT, not FK
- **Analytics:** Built-in counters (times_called, times_successful)
- **Diagram:** JSONB storage for player positions

### 2. formations Table is Optional

- Not linked to plays via FK
- Can be used for formation templates
- Currently unused in main data flow

### 3. Analytics Flow

```
play_calls → plays → aggregation queries
```

All analytics can be derived from plays + play_calls join

### 4. Personnel System

- Separate tables for configuration management
- Linked to plays via TEXT field (personnel)
- Not enforced by FK constraints

### 5. RLS Policies

- All tables have team-based access control
- Coaches have elevated permissions
- Some tables need RLS policy fixes (play_calls)

---

## Migration Recommendations

### ✅ KEEP AS-IS

- plays.formation as TEXT (flexible, no FK)
- plays.personnel as TEXT (flexible, no FK)
- Built-in analytics counters
- JSONB for diagram_data

### ⚠️ CONSIDER ADDING

- RLS policies to play_calls table
- Indexes for common query patterns
- Triggers for automatic counter updates

### ❌ DON'T DO

- Add FK from plays.formation to formations.id
- Require formation creation before play creation
- Over-normalize the schema

---

## Usage Examples

### Create Play (Simple)

```typescript
const { data, error } = await supabase.from("plays").insert({
  playbook_id: "xxx",
  formation: "Shotgun Trips Right",
  play_name: "Z Spot",
  p_type: "Pass",
  personnel: "11",
});
```

### Get Formation Analytics

```typescript
const { data } = await supabase
  .from("plays")
  .select(
    `
    formation,
    personnel,
    times_called,
    times_successful,
    play_calls (
      result,
      created_at
    )
  `
  )
  .eq("playbook_id", playbookId);
```

### Track Play Call

```typescript
const { data } = await supabase.from("play_calls").insert({
  play_id: "xxx",
  quarter: 2,
  result: "Complete 15 yards",
});
```

---

## Conclusion

The BoxCall database is designed with **plays table as the central data house**. All play information, including formation and personnel, is stored directly in the plays table as TEXT fields. This provides maximum flexibility while maintaining excellent query performance through proper indexing.

The formations table exists but is **optional** and not currently linked to plays. It can be used for formation templates or library features in the future, but it's not required for the core playbook functionality to work.

Analytics flow naturally through the plays → play_calls relationship, with built-in counters in the plays table for quick access to common metrics.
