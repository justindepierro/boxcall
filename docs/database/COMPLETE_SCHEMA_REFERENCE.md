<!-- allow-empty -->

# BoxCall Database Schema - Complete Table Reference

> Note: This document is a historical snapshot and some parts are now legacy.
> For execution tracking and play analytics, `play_executions` is the canonical source of truth.
> The older `play_calls` table is deprecated and retained only for backward compatibility.

## All 21 Database Tables

### 🏠 Core User & Team Management (8 tables)

1. **`profiles`** - Basic user profiles (linked to auth.users)
2. **`user_profiles`** - Extended profiles with football-specific data (height, weight, position, jersey #)
3. **`teams`** - Team information and settings
4. **`team_members`** - Primary team membership table
5. **`team_memberships`** - Alternative team membership structure
6. **`team_invites`** - Team invitation system with email-based invites
7. **`super_admins`** - Platform-level administration and permissions
8. **`games`** - Game scheduling, results, and match details

### 🏈 Football Operations (5 tables)

9. **`playbooks`** - Team playbooks (offense/defense/special teams)
10. **`plays`** - Individual plays with formations and routes
11. **`play_executions`** - Canonical play execution event log (practice/game tracking + analytics)
12. **`practice_scripts`** - Practice planning and templates
13. **`script_plays`** - Plays assigned to practice sessions

### 🏆 Recognition & Goals (3 tables)

14. **`achievements`** - Player achievements and awards
15. **`helmet_stickers`** - Individual helmet sticker rewards
16. **`team_goals`** - Team goal setting and progress tracking

### 💬 Communication & Social (4 tables)

17. **`team_announcements`** - Official team announcements
18. **`team_posts`** - Team social feed and updates
19. **`post_comments`** - Comments on team posts
20. **`post_reactions`** - Post reactions (like, love, celebrate, support, fire)

### 📁 File Management (1 table)

21. **`team_files`** - Document and media file storage

## Key Features by Category

### User Management

- **Dual Profile System**: `profiles` (basic) + `user_profiles` (football-specific)
- **Flexible Team Membership**: Both `team_members` and `team_memberships` for different use cases
- **Invitation System**: Email-based team invites with role assignment
- **Admin Hierarchy**: Platform super admins with granular permissions

### Football Operations

- **Comprehensive Play Management**: Playbooks → Plays → Play Executions
- **Practice Planning**: Scripts with assigned plays and timing
- **Game Tracking**: Full game details with play-by-play calling
- **Advanced Play Data**: Formations, personnel, success rates, confidence scores

### Recognition System

- **Multi-Level Recognition**: Achievements, helmet stickers, team goals
- **Goal Tracking**: Quantified team objectives with progress monitoring
- **Flexible Achievement Types**: Helmets, medals, trophies, certificates

### Communication Platform

- **Rich Social Features**: Posts, comments, reactions
- **Announcement System**: Priority-based team communications
- **Engagement Tracking**: Reaction types and user interactions

### File Management

- **Team File Storage**: Documents, videos, images
- **Access Control**: Public/private file permissions
- **Download Tracking**: File usage analytics

## Database Relationships

### Core Relationships

```
auth.users (Supabase Auth)
├── profiles (1:1)
├── user_profiles (1:1)
├── team_members (1:many)
├── team_memberships (1:many)
└── super_admins (1:1)

teams
├── team_members (1:many)
├── games (1:many)
├── playbooks (1:many)
├── team_goals (1:many)
├── team_posts (1:many)
└── team_files (1:many)

games
└── play_executions (1:many)

playbooks
└── plays (1:many)

plays
└── play_executions (1:many)

> Legacy note: `play_calls` exists in older schema snapshots but is deprecated in favor of `play_executions`.

practice_scripts
└── script_plays (1:many)

team_posts
├── post_comments (1:many)
└── post_reactions (1:many)
```

## Access Patterns

### ✅ Public Access (No Auth Required)

- `profiles` - Basic user information
- `games` - Game schedules and results

### 🔒 Protected Access (Authentication Required)

All other 19 tables require user authentication due to Row Level Security (RLS) policies.

## TypeScript Integration

All tables have complete TypeScript definitions with:

- **Row types** - For reading data
- **Insert types** - For creating records
- **Update types** - For modifying records
- **Convenience exports** - Easy-to-use type aliases

Example usage:

```typescript
import type { Team, UserProfile, PlayCall } from "./types/database";

const team: Team = await getTeam(teamId);
const profile: UserProfile = await getUserProfile(userId);
const playCalls: PlayCall[] = await getGamePlayCalls(gameId);
```

Your BoxCall platform is now ready for comprehensive football team management! 🏈

heres what we got in Supabase Tables -

create table public.achievements (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
user_id uuid not null,
achievement_type text not null,
title text not null,
description text null,
category text null,
icon_name text null,
awarded_by uuid not null,
earned_at timestamp with time zone null default now(),
is_public boolean null default true,
constraint achievements_pkey primary key (id),
constraint achievements_awarded_by_fkey foreign KEY (awarded_by) references auth.users (id),
constraint achievements_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint achievements_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
constraint achievements_achievement_type_check check (
(
achievement_type = any (
array[
'helmet_sticker'::text,
'medal'::text,
'trophy'::text,
'certificate'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.games (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
opponent_name text not null,
game_date date not null,
game_time time without time zone null,
location text null,
home_away text null,
final_score_us integer null,
final_score_them integer null,
weather_conditions text null,
game_notes text null,
created_at timestamp with time zone null default now(),
constraint games_pkey primary key (id),
constraint games_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint games_home_away_check check (
(
home_away = any (
array['home'::text, 'away'::text, 'neutral'::text]
)
)
)
) TABLESPACE pg_default;

create table public.helmet_stickers (
id uuid not null default gen_random_uuid (),
user_id uuid not null,
team_id uuid not null,
reason text not null,
sticker_type text null default 'star'::text,
game_id uuid null,
awarded_by uuid not null,
awarded_at timestamp with time zone null default now(),
constraint helmet_stickers_pkey primary key (id),
constraint helmet_stickers_awarded_by_fkey foreign KEY (awarded_by) references auth.users (id),
constraint helmet_stickers_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint helmet_stickers_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
constraint helmet_stickers_sticker_type_check check (
(
sticker_type = any (
array[
'star'::text,
'flame'::text,
'lightning'::text,
'crown'::text,
'diamond'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.play_calls (
id uuid not null default gen_random_uuid (),
game_id uuid not null,
play_id uuid not null,
quarter integer null,
time_remaining interval null,
down integer null,
distance integer null,
yard_line integer null,
hash_mark text null,
result_yards integer null,
result_type text null,
notes text null,
created_at timestamp with time zone null default now(),
constraint play_calls_pkey primary key (id),
constraint play_calls_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE,
constraint play_calls_play_id_fkey foreign KEY (play_id) references plays (id),
constraint play_calls_result_type_check check (
(
result_type = any (
array[
'success'::text,
'failure'::text,
'turnover'::text,
'touchdown'::text,
'first_down'::text
]
)
)
),
constraint play_calls_down_check check (
(
(down >= 1)
and (down <= 4)
)
),
constraint play_calls_yard_line_check check (
(
(yard_line >= 1)
and (yard_line <= 99)
)
),
constraint play_calls_hash_mark_check check (
(
hash_mark = any (
array['left'::text, 'middle'::text, 'right'::text]
)
)
),
constraint play_calls_quarter_check check (
(
(quarter >= 1)
and (quarter <= 4)
)
)
) TABLESPACE pg_default;

create table public.playbooks (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
name text not null,
description text null,
playbook_type text null default 'offense'::text,
is_active boolean null default true,
created_by uuid not null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint playbooks_pkey primary key (id),
constraint playbooks_created_by_fkey foreign KEY (created_by) references auth.users (id),
constraint playbooks_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint playbooks_playbook_type_check check (
(
playbook_type = any (
array[
'offense'::text,
'defense'::text,
'special_teams'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.plays (
id uuid not null default gen_random_uuid (),
playbook_id uuid not null,
formation text not null,
f_dir text null,
ftag1 text null,
ftag2 text null,
back_align text null,
shift text null,
motion text null,
protection text null,
play_name text not null,
p_tag1 text null,
p_tag2 text null,
p_dir text null,
f_type text null,
p_type text not null,
key_player1 text null,
key_player2 text null,
pref_down text null,
pref_dis text null,
pref_hash text null,
pref_cov text null,
pref_front text null,
check_into text null,
r_str text null,
p_str text null,
personnel text null,
confidence_base numeric(5, 2) null default 70.0,
success_rate numeric(5, 2) null,
times_called integer null default 0,
times_successful integer null default 0,
diagram_url text null,
video_url text null,
notes text null,
tags text[] null,
created_by uuid not null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint plays_pkey primary key (id),
constraint plays_created_by_fkey foreign KEY (created_by) references auth.users (id),
constraint plays_playbook_id_fkey foreign KEY (playbook_id) references playbooks (id) on delete CASCADE,
constraint plays_p_type_check check (
(
p_type = any (array['Pass'::text, 'Run'::text, 'RPO'::text])
)
)
) TABLESPACE pg_default;

create index IF not exists idx_plays_playbook_id on public.plays using btree (playbook_id) TABLESPACE pg_default;

create index IF not exists idx_plays_formation on public.plays using btree (formation) TABLESPACE pg_default;

create index IF not exists idx_plays_p_type on public.plays using btree (p_type) TABLESPACE pg_default;

create index IF not exists idx_plays_pref_down on public.plays using btree (pref_down) TABLESPACE pg_default;

create index IF not exists idx_plays_pref_dis on public.plays using btree (pref_dis) TABLESPACE pg_default;

create table public.post_comments (
id uuid not null default gen_random_uuid (),
post_id uuid not null,
user_id uuid not null,
content text not null,
parent_comment_id uuid null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint post_comments_pkey primary key (id),
constraint post_comments_parent_comment_id_fkey foreign KEY (parent_comment_id) references post_comments (id),
constraint post_comments_post_id_fkey foreign KEY (post_id) references team_posts (id) on delete CASCADE,
constraint post_comments_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_post_comments_post_id on public.post_comments using btree (post_id) TABLESPACE pg_default;

create table public.post_reactions (
id uuid not null default gen_random_uuid (),
post_id uuid not null,
user_id uuid not null,
reaction_type text not null,
created_at timestamp with time zone null default now(),
constraint post_reactions_pkey primary key (id),
constraint post_reactions_post_id_user_id_key unique (post_id, user_id),
constraint post_reactions_post_id_fkey foreign KEY (post_id) references team_posts (id) on delete CASCADE,
constraint post_reactions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
constraint post_reactions_reaction_type_check check (
(
reaction_type = any (
array[
'like'::text,
'love'::text,
'celebrate'::text,
'support'::text,
'fire'::text
]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_post_reactions_post_id on public.post_reactions using btree (post_id) TABLESPACE pg_default;

create table public.practice_scripts (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
name text not null,
practice_date date null,
practice_time time without time zone null,
location text null,
duration_minutes integer null default 120,
focus_areas text[] null,
notes text null,
weather_conditions text null,
is_template boolean null default false,
created_by uuid not null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint practice_scripts_pkey primary key (id),
constraint practice_scripts_created_by_fkey foreign KEY (created_by) references auth.users (id),
constraint practice_scripts_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.profiles (
id uuid not null,
full_name text null,
avatar_url text null,
role public.user_role null default 'player'::user_role,
bio text null,
phone text null,
created_at timestamp with time zone null default now(),
email text null,
display_name text null,
address text null,
settings jsonb null default '{}'::jsonb,
last_login timestamp with time zone null,
updated_at timestamp with time zone null default now(),
constraint profiles_pkey primary key (id),
constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_profiles_role on public.profiles using btree (role) TABLESPACE pg_default;

create index IF not exists idx_profiles_email on public.profiles using btree (email) TABLESPACE pg_default;

create table public.script_plays (
id uuid not null default gen_random_uuid (),
script_id uuid not null,
play_id uuid not null,
order_index integer not null,
reps integer null default 1,
emphasis text null,
notes text null,
estimated_time_minutes integer null default 2,
created_at timestamp with time zone null default now(),
constraint script_plays_pkey primary key (id),
constraint script_plays_play_id_fkey foreign KEY (play_id) references plays (id) on delete CASCADE,
constraint script_plays_script_id_fkey foreign KEY (script_id) references practice_scripts (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.super_admins (
id uuid not null default gen_random_uuid (),
user_id uuid not null,
email text not null,
admin_level text null default 'admin'::text,
permissions jsonb null default '{"manage_teams": true, "manage_users": true, "view_analytics": true}'::jsonb,
added_by uuid null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint super_admins_pkey primary key (id),
constraint super_admins_email_key unique (email),
constraint super_admins_user_id_key unique (user_id),
constraint super_admins_added_by_fkey foreign KEY (added_by) references auth.users (id),
constraint super_admins_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
constraint super_admins_admin_level_check check (
(
admin_level = any (
array[
'super_admin'::text,
'admin'::text,
'moderator'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.team_announcements (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
author_id uuid not null,
title text not null,
content text not null,
priority text null default 'normal'::text,
target_roles text[] null default array['player'::text, 'coach'::text, 'family'::text],
expires_at timestamp with time zone null,
created_at timestamp with time zone null default now(),
constraint team_announcements_pkey primary key (id),
constraint team_announcements_author_id_fkey foreign KEY (author_id) references auth.users (id) on delete CASCADE,
constraint team_announcements_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint team_announcements_priority_check check (
(
priority = any (
array[
'low'::text,
'normal'::text,
'high'::text,
'urgent'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.team_files (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
uploaded_by uuid not null,
file_name text not null,
file_path text not null,
file_type text not null,
file_size_bytes bigint null,
mime_type text null,
description text null,
is_public boolean null default false,
download_count integer null default 0,
created_at timestamp with time zone null default now(),
constraint team_files_pkey primary key (id),
constraint team_files_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint team_files_uploaded_by_fkey foreign KEY (uploaded_by) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.team_goals (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
title text not null,
description text null,
goal_type text null,
target_value numeric(10, 2) null,
current_value numeric(10, 2) null default 0,
unit text null,
deadline date null,
is_achieved boolean null default false,
reward_description text null,
created_by uuid not null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint team_goals_pkey primary key (id),
constraint team_goals_created_by_fkey foreign KEY (created_by) references auth.users (id),
constraint team_goals_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint team_goals_goal_type_check check (
(
goal_type = any (
array[
'wins'::text,
'stats'::text,
'behavior'::text,
'academic'::text,
'fundraising'::text
]
)
)
)
) TABLESPACE pg_default;

create table public.team_invites (
id uuid not null default gen_random_uuid (),
team_id uuid null,
email text not null,
role public.user_role null default 'player'::user_role,
invited_by uuid null,
created_at timestamp with time zone null default now(),
expires_at timestamp with time zone null default (now() + '7 days'::interval),
constraint team_invites_pkey primary key (id),
constraint team_invites_invited_by_fkey foreign KEY (invited_by) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_team_invites_email on public.team_invites using btree (email) TABLESPACE pg_default;

create index IF not exists idx_team_invites_team_id on public.team_invites using btree (team_id) TABLESPACE pg_default;

create table public.team_members (
id uuid not null default gen_random_uuid (),
user_id uuid not null,
team_id uuid not null,
role text not null default 'player'::text,
permissions jsonb null default '{}'::jsonb,
status text null default 'active'::text,
joined_at timestamp with time zone null default now(),
invited_by uuid null,
constraint team_members_pkey primary key (id),
constraint team_members_user_id_team_id_key unique (user_id, team_id),
constraint team_members_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
constraint team_members_invited_by_fkey foreign KEY (invited_by) references auth.users (id),
constraint team_members_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint team_members_status_check check (
(
status = any (
array['active'::text, 'inactive'::text, 'pending'::text]
)
)
),
constraint team_members_role_check check (
(
role = any (
array[
'head_coach'::text,
'coach'::text,
'player'::text,
'manager'::text,
'family'::text
]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_team_members_team_id on public.team_members using btree (team_id) TABLESPACE pg_default;

create index IF not exists idx_team_members_user_id on public.team_members using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_team_members_role on public.team_members using btree (role) TABLESPACE pg_default;

create index IF not exists idx_team_members_status on public.team_members using btree (status) TABLESPACE pg_default;

create table public.team_memberships (
id uuid not null default gen_random_uuid (),
team_id uuid null,
user_id uuid null,
role public.user_role null default 'player'::user_role,
created_at timestamp with time zone null default now(),
constraint team_memberships_pkey primary key (id),
constraint team_memberships_team_id_user_id_key unique (team_id, user_id),
constraint team_memberships_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_team_memberships_user_id on public.team_memberships using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_team_memberships_team_id on public.team_memberships using btree (team_id) TABLESPACE pg_default;

create table public.team_posts (
id uuid not null default gen_random_uuid (),
team_id uuid not null,
author_id uuid not null,
content text not null,
post_type text null default 'general'::text,
media_urls text[] null,
is_pinned boolean null default false,
visibility text null default 'team'::text,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint team_posts_pkey primary key (id),
constraint team_posts_author_id_fkey foreign KEY (author_id) references auth.users (id) on delete CASCADE,
constraint team_posts_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE,
constraint team_posts_post_type_check check (
(
post_type = any (
array[
'general'::text,
'announcement'::text,
'achievement'::text,
'game_result'::text,
'practice_update'::text
]
)
)
),
constraint team_posts_visibility_check check (
(
visibility = any (
array[
'team'::text,
'coaches_only'::text,
'public'::text
]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_team_posts_team_id on public.team_posts using btree (team_id) TABLESPACE pg_default;

create index IF not exists idx_team_posts_created_at on public.team_posts using btree (created_at desc) TABLESPACE pg_default;

create table public.teams (
id uuid not null default gen_random_uuid (),
name text not null,
school_name text null,
mascot text null,
colors_primary text null,
colors_secondary text null,
logo_url text null,
created_by uuid not null,
subscription_tier text null default 'free'::text,
subscription_expires_at timestamp with time zone null,
team_code text null,
season_year integer null default EXTRACT(
year
from
now()
),
league_division text null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint teams_pkey primary key (id),
constraint teams_team_code_key unique (team_code),
constraint teams_created_by_fkey foreign KEY (created_by) references auth.users (id),
constraint teams_subscription_tier_check check (
(
subscription_tier = any (
array['free'::text, 'coach'::text, 'team_premium'::text]
)
)
)
) TABLESPACE pg_default;

create index IF not exists idx_teams_created_by on public.teams using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_teams_team_code on public.teams using btree (team_code) TABLESPACE pg_default;

create trigger trigger_set_team_code BEFORE INSERT on teams for EACH row
execute FUNCTION set_team_code ();

create trigger trigger_teams_updated_at BEFORE
update on teams for EACH row
execute FUNCTION update_updated_at_column ();

create table public.user_profiles (
id uuid not null default gen_random_uuid (),
user_id uuid not null,
display_name text null,
avatar_url text null,
phone text null,
emergency_contact text null,
emergency_phone text null,
position text null,
jersey_number integer null,
grade_level text null,
height_inches integer null,
weight_lbs integer null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
constraint user_profiles_pkey primary key (id),
constraint user_profiles_user_id_key unique (user_id),
constraint user_profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_user_id on public.user_profiles using btree (user_id) TABLESPACE pg_default;
