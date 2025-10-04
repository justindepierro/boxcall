# BoxCall Database Audit & Documentation

**Date:** October 4, 2025
**Status:** Current Production Schema

## Executive Summary

This document provides a comprehensive audit of the BoxCall database structure, including all tables, relationships, and application integrations. The database contains 24 core tables supporting team management, playbook systems, social features, and analytics.

## Database Architecture Overview

### Technology Stack

- **Database:** PostgreSQL (Supabase)
- **Extensions:** uuid-ossp, pgcrypto
- **Authentication:** Supabase Auth (auth.users)
- **RLS:** Row Level Security enabled on all tables
- **Connection:** Remote Supabase instance (lvmuiqwihlpnwppdqqfl.supabase.co)

### Core Modules

1. **Team Management** - Teams, members, players, profiles
2. **Playbook System** - Playbooks, plays, formations, analytics
3. **Social Features** - Posts, comments, likes, shares
4. **Game Management** - Game plans, results, play calling
5. **Practice Management** - Scripts, schedules, attendance
6. **Analytics & Performance** - Achievements, statistics, analytics
7. **Equipment & Assets** - Equipment tracking, helmet stickers
8. **Calendar & Events** - Team events, scheduling

## Table Inventory & Schema Documentation

### 1. Core Team Management Tables

#### `teams`

**Purpose:** Core team information and metadata
**Primary Key:** `id` (UUID)
**Relationships:**

- Referenced by: `team_members`, `team_players`, `playbooks`, `team_posts`, `game_plans`, `practice_scripts`, `practice_schedules`, `equipment`, `calendar_events`, `team_events`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `name` TEXT NOT NULL
- `school_name` TEXT
- `mascot` TEXT
- `season_year` INTEGER DEFAULT EXTRACT(YEAR FROM NOW())
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()
- `play_count` INTEGER DEFAULT 0
- `last_backup_at` TIMESTAMPTZ
- `backup_version` INTEGER DEFAULT 1

#### `team_members`

**Purpose:** Team staff and their roles/capabilities
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`, `auth.users(id)`
- Unique: `(team_id, user_id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `team_role` TEXT NOT NULL CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach'))
- `capabilities` JSONB DEFAULT capabilities object
- `assigned_at` TIMESTAMPTZ DEFAULT NOW()
- `status` TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'))
- `role_notes` TEXT

#### `team_players`

**Purpose:** Player roster information
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `first_name` TEXT NOT NULL
- `last_name` TEXT NOT NULL
- `jersey_number` INTEGER
- `position` TEXT
- `grade_level` TEXT
- `height_inches` INTEGER
- `weight_lbs` INTEGER
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `profiles`

**Purpose:** User profiles (consolidated player/staff info)
**Primary Key:** `id` (UUID) REFERENCES auth.users(id)
**Relationships:**

- References: `auth.users(id)`

**Columns:**

- `id` UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- `full_name` TEXT
- `avatar_url` TEXT
- `role` TEXT DEFAULT 'player'
- `bio` TEXT
- `phone` TEXT
- `email` TEXT
- `display_name` TEXT
- `address` TEXT
- `settings` JSONB DEFAULT '{}'
- `position` TEXT
- `jersey_number` INTEGER
- `emergency_contact` TEXT
- `emergency_phone` TEXT
- `grade_level` TEXT
- `height_inches` INTEGER
- `weight_lbs` INTEGER
- `is_active` BOOLEAN DEFAULT true
- `notification_preferences` JSONB DEFAULT notification object
- `last_login` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 2. Playbook & Plays System

#### `playbooks`

**Purpose:** Playbook containers
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`
- Referenced by: `plays`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `name` TEXT NOT NULL DEFAULT 'Main Playbook'
- `description` TEXT
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()
- `play_count` INTEGER DEFAULT 0
- `last_modified_at` TIMESTAMPTZ DEFAULT NOW()

#### `plays`

**Purpose:** Individual plays within playbooks
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `playbooks(id)`
- Referenced by: `play_calls`, `game_plan_plays`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `playbook_id` UUID REFERENCES playbooks(id) ON DELETE CASCADE
- `formation` TEXT NOT NULL
- `play_name` TEXT NOT NULL
- `one_word_play` TEXT
- `p_type` TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action'))
- `personnel` TEXT
- `f_type` TEXT
- `f_dir` TEXT
- `protection` TEXT
- `p_dir` TEXT
- `r_str` TEXT
- `p_str` TEXT
- `pref_down` TEXT
- `pref_dis` TEXT
- `pref_hash` TEXT
- `pref_cov` TEXT
- `pref_front` TEXT
- `ftag1` TEXT
- `ftag2` TEXT
- `p_tag1` TEXT
- `p_tag2` TEXT
- `back_align` TEXT
- `shift` TEXT
- `motion` TEXT
- `key_player1` TEXT
- `key_player2` TEXT
- `check_into` TEXT
- `notes` TEXT
- `confidence_base` INTEGER DEFAULT 70
- `times_called` INTEGER DEFAULT 0
- `times_successful` INTEGER DEFAULT 0
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `play_calls`

**Purpose:** Game-time play execution tracking
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `plays(id)`
- References: `game_results(id)` (future)

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `game_id` UUID (references game_results when created)
- `play_id` UUID REFERENCES plays(id) ON DELETE CASCADE
- `quarter` INTEGER
- `time_remaining` TEXT
- `yard_line` INTEGER
- `down` INTEGER
- `distance` INTEGER
- `result` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()

### 3. Social Features

#### `team_posts`

**Purpose:** Team social media posts
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`, `auth.users(id)`
- Referenced by: `post_likes`, `post_comments`, `post_shares`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `team_id` UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE
- `author_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `content` TEXT NOT NULL
- `is_pinned` BOOLEAN DEFAULT false
- `likes_count` INTEGER DEFAULT 0
- `comments_count` INTEGER DEFAULT 0
- `shares_count` INTEGER DEFAULT 0
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `post_likes`

**Purpose:** Post like tracking
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `team_posts(id)`, `auth.users(id)`
- Unique: `(post_id, user_id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `post_id` UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `created_at` TIMESTAMPTZ DEFAULT NOW()

#### `post_comments`

**Purpose:** Post comments and replies
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `team_posts(id)`, `auth.users(id)`
- Self-reference: `parent_comment_id` REFERENCES post_comments(id)

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `post_id` UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE
- `author_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `content` TEXT NOT NULL
- `parent_comment_id` UUID REFERENCES post_comments(id) ON DELETE CASCADE
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `post_shares`

**Purpose:** Post sharing tracking
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `team_posts(id)`, `auth.users(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `post_id` UUID NOT NULL REFERENCES team_posts(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `created_at` TIMESTAMPTZ DEFAULT NOW()

### 4. Game Management

#### `game_plans`

**Purpose:** Game planning and strategy
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`
- Referenced by: `game_plan_situations`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `opponent` TEXT NOT NULL
- `game_date` DATE NOT NULL
- `venue` TEXT
- `is_home` BOOLEAN DEFAULT true
- `formation_focus` TEXT
- `personnel_packages` TEXT[]
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `game_plan_situations`

**Purpose:** Game situations and recommended plays
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `game_plans(id)`
- Referenced by: `game_plan_plays`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `game_plan_id` UUID REFERENCES game_plans(id) ON DELETE CASCADE
- `situation_type` TEXT NOT NULL
- `down` INTEGER
- `distance` INTEGER
- `yard_line` INTEGER
- `time_remaining` TEXT
- `score_differential` INTEGER
- `personnel` TEXT
- `formation` TEXT
- `recommended_plays` TEXT[]
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()

#### `game_plan_plays`

**Purpose:** Specific plays assigned to situations
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `game_plan_situations(id)`, `plays(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `situation_id` UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE
- `play_id` UUID REFERENCES plays(id) ON DELETE CASCADE
- `priority` INTEGER DEFAULT 1
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()

#### `game_results`

**Purpose:** Game result tracking
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `opponent` TEXT NOT NULL
- `game_date` DATE NOT NULL
- `venue` TEXT
- `is_home` BOOLEAN DEFAULT true
- `team_score` INTEGER DEFAULT 0
- `opponent_score` INTEGER DEFAULT 0
- `result` TEXT CHECK (result IN ('win', 'loss', 'tie'))
- `quarter_scores` JSONB DEFAULT '[]'
- `stats` JSONB DEFAULT '{}'
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 5. Practice Management

#### `practice_scripts`

**Purpose:** Practice planning and scripting
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`
- Referenced by: `practice_schedules`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `title` TEXT NOT NULL
- `description` TEXT
- `duration_minutes` INTEGER
- `focus_areas` TEXT[]
- `script_content` JSONB DEFAULT '[]'
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `practice_schedules`

**Purpose:** Scheduled practice sessions
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`, `practice_scripts(id)`
- Referenced by: `practice_attendance`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `practice_script_id` UUID REFERENCES practice_scripts(id)
- `scheduled_date` DATE NOT NULL
- `start_time` TIME NOT NULL
- `end_time` TIME NOT NULL
- `location` TEXT
- `notes` TEXT
- `status` TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `practice_attendance`

**Purpose:** Practice attendance tracking
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `practice_schedules(id)`, `profiles(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `practice_id` UUID REFERENCES practice_schedules(id) ON DELETE CASCADE
- `player_id` UUID REFERENCES profiles(id) ON DELETE CASCADE
- `status` TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused'))
- `notes` TEXT
- `check_in_time` TIMESTAMPTZ
- `check_out_time` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ DEFAULT NOW()

#### `practice_templates`

**Purpose:** Reusable practice templates
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `name` TEXT NOT NULL
- `description` TEXT
- `duration_minutes` INTEGER
- `focus_areas` TEXT[]
- `template_content` JSONB DEFAULT '[]'
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 6. Analytics & Performance

#### `achievements`

**Purpose:** Player and team achievements
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`, `profiles(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `player_id` UUID REFERENCES profiles(id) ON DELETE CASCADE
- `achievement_type` TEXT NOT NULL
- `title` TEXT NOT NULL
- `description` TEXT
- `value` INTEGER
- `metadata` JSONB DEFAULT '{}'
- `earned_at` TIMESTAMPTZ DEFAULT NOW()
- `created_at` TIMESTAMPTZ DEFAULT NOW()

#### `helmet_stickers`

**Purpose:** Helmet sticker achievements
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`, `profiles(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `player_id` UUID REFERENCES profiles(id) ON DELETE CASCADE
- `sticker_type` TEXT NOT NULL
- `earned_date` DATE NOT NULL
- `notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT NOW()

### 7. Equipment & Assets

#### `equipment`

**Purpose:** Equipment inventory and tracking
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `name` TEXT NOT NULL
- `category` TEXT NOT NULL
- `description` TEXT
- `serial_number` TEXT
- `purchase_date` DATE
- `warranty_expiry` DATE
- `condition` TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'broken'))
- `location` TEXT
- `assigned_to` UUID REFERENCES profiles(id)
- `quantity` INTEGER DEFAULT 1
- `value` DECIMAL(10,2)
- `notes` TEXT
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

### 8. Calendar & Events

#### `calendar_events`

**Purpose:** General calendar events
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `title` TEXT NOT NULL
- `description` TEXT
- `event_date` DATE NOT NULL
- `start_time` TIME
- `end_time` TIME
- `location` TEXT
- `event_type` TEXT DEFAULT 'general'
- `is_all_day` BOOLEAN DEFAULT false
- `created_by` UUID REFERENCES auth.users(id)
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

#### `team_events`

**Purpose:** Team-specific events
**Primary Key:** `id` (UUID)
**Relationships:**

- References: `teams(id)`, `auth.users(id)`

**Columns:**

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `team_id` UUID REFERENCES teams(id) ON DELETE CASCADE
- `title` TEXT NOT NULL
- `description` TEXT
- `event_date` DATE NOT NULL
- `event_type` TEXT NOT NULL CHECK (event_type IN ('game', 'practice', 'meeting', 'travel', 'other'))
- `start_time` TIME
- `end_time` TIME
- `location` TEXT
- `opponent` TEXT
- `is_home` BOOLEAN
- `notes` TEXT
- `created_by` UUID REFERENCES auth.users(id) ON DELETE SET NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

## Application Integration Mapping

### Frontend Components ↔ Database Tables

#### Team Management

- **TeamSettings.tsx** → `teams`, `team_members`
- **RosterPage.tsx** → `team_players`, `profiles`
- **TeamService.ts** → `teams`, `team_members`

#### Playbook System

- **Playbook pages** → `playbooks`, `plays`
- **PlayService.ts** → `plays`, `playbooks`
- **Game planning** → `game_plans`, `game_plan_situations`, `game_plan_plays`

#### Social Features

- **Social feed** → `team_posts`, `post_likes`, `post_comments`, `post_shares`
- **PostsService.ts** → `team_posts` and related tables

#### Analytics & Performance

- **Analytics components** → `achievements`, `helmet_stickers`
- **Performance services** → `plays` (stats), `game_results`

#### Calendar & Scheduling

- **Calendar components** → `calendar_events`, `team_events`, `practice_schedules`
- **CalendarService.ts** → `calendar_events`, `team_events`

### Service Layer Architecture

#### Core Services

- **rosterService.ts** → `team_players` CRUD operations
- **teamService.ts** → `teams`, `team_members` management
- **playsService.ts** → `plays`, `playbooks` operations
- **postsService.ts** → Social features (`team_posts`, etc.)
- **gamePlanService.ts** → Game planning functionality
- **practiceService.ts** → Practice management
- **calendarService.ts** → Event scheduling

#### Analytics Services

- **performanceAnalyticsService.ts** → Player/team performance
- **playAnalyticsService.ts** → Play success rates
- **gamePlanningAnalyticsService.ts** → Game strategy analytics

#### Utility Services

- **csvService.ts** → Data import/export
- **pdfExportService.tsx** → Report generation
- **thumbnailUploadService.ts** → Asset management

## Row Level Security (RLS) Policies

All tables implement RLS with policies based on:

- **Team membership** (team_members table)
- **User authentication** (auth.users)
- **Team ownership** (teams table)

### Policy Patterns

1. **Team-based access**: Users can only access data for teams they belong to
2. **Role-based permissions**: Different access levels for coaches vs players
3. **Ownership checks**: Users can modify their own data
4. **Public read access**: Some data (like team rosters) may be publicly readable

## Data Relationships & Dependencies

### Core Dependencies

```
auth.users (Supabase Auth)
    ↓
profiles (user profiles)
    ↓
team_members (team membership)
    ↓
teams (team data)
    ↙        ↘
team_players   playbooks
    ↓           ↓
               plays
               ↓
            play_calls
```

### Extended Relationships

- **Social**: `team_posts` → `post_likes`, `post_comments`, `post_shares`
- **Games**: `game_plans` → `game_plan_situations` → `game_plan_plays`
- **Practice**: `practice_scripts` → `practice_schedules` → `practice_attendance`
- **Analytics**: `achievements`, `helmet_stickers` link to players/teams

## Migration History & Current State

### Recent Migrations

- **20250928012435**: Complete schema rebuild
- **20250928013235**: Profiles insert policy
- **20250928104149**: Team roles and policies alignment

### Current Schema Status

- **Total Tables**: 24
- **Total Relationships**: ~50 foreign key constraints
- **RLS Policies**: Implemented on all tables
- **Indexes**: Primary keys, foreign keys, common query patterns
- **Triggers**: Automatic timestamps, counters

## Recommendations

### Immediate Actions

1. **Clean up SQL files**: Remove all loose .sql files (25+ files) to reduce confusion
2. **Consolidate migrations**: Keep only essential migration files
3. **Document RLS policies**: Create detailed policy documentation
4. **Audit service usage**: Ensure all services align with current schema

### Future Improvements

1. **Schema versioning**: Implement proper schema versioning
2. **Data validation**: Add more constraints and validations
3. **Performance optimization**: Add strategic indexes
4. **Backup strategy**: Implement automated backup procedures

## File Inventory for Cleanup

### SQL Files to Remove (25+ files)

Located in `/database/` directory:

- Individual migration files
- Test/debug SQL files
- Schema fragments
- Policy files

### Files to Keep

- `database/schema.sql` (authoritative schema)
- Essential migration files in `supabase/migrations/`
- Seed data files (if needed)

### Code References to Update

- Any imports of removed SQL files
- Hardcoded SQL queries
- Database setup scripts

---

**Audit Completed:** October 4, 2025
**Next Steps:** Clean up SQL files and update references</content>
<parameter name="filePath">/Users/justindepierro/Documents/boxcall/docs/DATABASE_AUDIT_2025.md
