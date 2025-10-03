# BoxCall Database Rebuild Guide

## Overview

This guide provides a systematic, step-by-step approach to completely rebuild the BoxCall database from scratch. Each step includes:

- **Purpose**: What the script does
- **Prerequisites**: What must be true before running
- **Execution**: How to run the script
- **Verification**: How to test that it worked
- **Expected Results**: What you should see

**⚠️ IMPORTANT**: Do NOT proceed to the next step until the current step passes all verification tests.

## Admin Account Setup

**Admin Account Credentials:**

- **Email**: justindepierro@gmail.com
- **Password**: MiniCooper2010!

**Setup Instructions:**

1. After completing the database rebuild (all steps 1-14)
2. Go to your Supabase dashboard → Authentication → Users
3. Create a new user with the email above
4. Set the password to "MiniCooper2010!"
5. In the user metadata, add: `{"role": "admin"}`
6. The user will be assigned admin role in the profiles table when they first log in

**Verification:**

- Admin user can log into the application
- Admin has access to all team management features
- Admin can create teams, manage users, and access all functionality

---

## Step 0: Complete Database Reset

### Purpose

Completely clear the database of all user tables, data, and policies to ensure a clean starting state.

### Prerequisites

- Supabase CLI installed and configured
- Access to the remote database
- Environment variables configured (.env.local with VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY)

### Execution

```bash
# Run the complete database reset script
npx tsx scripts/complete-database-reset.ts
```

### Verification

```bash
# Check that database is completely clean
npx tsx scripts/database-audit.ts
```

### Expected Results

- Script output shows successful table drops and data clearing
- Audit shows "Database is clean - no user tables remaining"
- No user tables should exist (only Supabase system tables)
- No errors in the reset or audit output

---

## Step 1: Clean Slate (01_clean_slate.sql)

### Purpose

Drop all existing tables and functions to ensure a clean starting state.

### Prerequisites

- Database has been reset (Step 0 completed)
- No active connections using the tables

### Execution

```bash
# Apply the clean slate script
supabase db sql --file database/rebuild/01_clean_slate.sql
```

### Verification

```bash
# Run database audit
npx tsx scripts/database-audit.ts
```

### Expected Results

- All tables should be gone (queries should return "relation does not exist")
- No errors from the SQL execution
- Clean audit output showing no tables

---

## Step 2: Profiles Table (02_profiles.sql)

### Purpose

Create the profiles table and basic user management structure.

### Prerequisites

- Clean slate completed (Step 1)
- Database is empty

### Execution

```bash
supabase db sql --file database/rebuild/02_profiles.sql
```

### Verification

```bash
# Test profiles table creation
npx tsx scripts/database-audit.ts

# Test basic profile operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // Test insert
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: 'test-user', full_name: 'Test User' })
    .select();
  console.log('Insert result:', { data, error });

  // Test select
  const { data: selectData, error: selectError } = await supabase
    .from('profiles')
    .select('*');
  console.log('Select result:', { count: selectData?.length, error: selectError });
}

test();
"
```

### Expected Results

- ✅ profiles: 1 records (from our test insert)
- No errors in SQL execution
- Basic CRUD operations work

---

## Step 3: Teams System (03_teams.sql)

### Purpose

Create teams, team_members tables and team-based access control.

### Prerequisites

- Profiles table exists (Step 2 completed)
- Basic user management working

### Execution

```bash
supabase db sql --file database/rebuild/03_teams.sql
```

### Verification

```bash
# Test teams functionality
npx tsx scripts/database-audit.ts

# Test team operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // Create a team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name: 'Test Football Team', school_name: 'Test High School' })
    .select()
    .single();
  console.log('Team creation:', { team: team?.name, error: teamError });

  // Add team member
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: 'test-user',
      role: 'head_coach'
    })
    .select();
  console.log('Team member creation:', { member: member?.length, error: memberError });
}

test();
"
```

### Expected Results

- ✅ teams: 1 records
- ✅ team_members: 1 records
- Team creation and membership work
- No RLS policy errors

---

## Step 4: Playbooks System (04_playbooks.sql)

### Purpose

Create playbooks and plays tables for offensive/defensive strategy management.

### Prerequisites

- Teams system working (Step 3 completed)
- Team-based access control established

### Execution

```bash
supabase db sql --file database/rebuild/04_playbooks.sql
```

### Verification

```bash
# Test playbooks functionality
npx tsx scripts/database-audit.ts

# Test playbook operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create playbook
  const { data: playbook, error: playbookError } = await supabase
    .from('playbooks')
    .insert({
      team_id: teams[0].id,
      name: 'Test Playbook',
      description: 'A test playbook'
    })
    .select()
    .single();
  console.log('Playbook creation:', { name: playbook?.name, error: playbookError });

  // Create play
  const { data: play, error: playError } = await supabase
    .from('plays')
    .insert({
      playbook_id: playbook.id,
      name: 'Test Play',
      formation: 'Shotgun',
      play_type: 'pass'
    })
    .select();
  console.log('Play creation:', { play: play?.length, error: playError });
}

test();
"
```

### Expected Results

- ✅ playbooks: 1 records
- ✅ plays: 1 records
- Playbook and play creation work
- Foreign key relationships intact

---

## Step 5: Social Features (05_social.sql)

### Purpose

Create team_posts and social interaction tables for team communication.

### Prerequisites

- Teams system working (Step 3)
- User profiles available (Step 2)

### Execution

```bash
supabase db sql --file database/rebuild/05_social.sql
```

### Verification

```bash
# Test social features
npx tsx scripts/database-audit.ts

# Test social operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create team post
  const { data: post, error: postError } = await supabase
    .from('team_posts')
    .insert({
      team_id: teams[0].id,
      author_id: 'test-user',
      content: 'Welcome to the team bulletin!',
      is_pinned: true
    })
    .select()
    .single();
  console.log('Team post creation:', { content: post?.content?.substring(0, 20), error: postError });
}

test();
"
```

### Expected Results

- ✅ team_posts: 1 records
- Team post creation works
- Social features functional

---

## Step 6: Additional Features (06_additional_features.sql)

### Purpose

Create equipment and basic additional feature tables.

### Prerequisites

- Teams system working (Step 3)

### Execution

```bash
supabase db sql --file database/rebuild/06_additional_features.sql
```

### Verification

```bash
# Test additional features
npx tsx scripts/database-audit.ts

# Test equipment operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create equipment
  const { data: equipment, error: equipError } = await supabase
    .from('equipment')
    .insert({
      team_id: teams[0].id,
      name: 'Football',
      category: 'balls',
      quantity: 10
    })
    .select();
  console.log('Equipment creation:', { equipment: equipment?.length, error: equipError });
}

test();
"
```

### Expected Results

- ✅ equipment: 1 records
- Equipment management works

---

## Step 7: Team Players & Play Calls (07_team_players_and_play_calls.sql)

### Purpose

Create team_players and play_calls tables for roster and play execution tracking.

### Prerequisites

- Teams system working (Step 3)
- Playbooks system working (Step 4)

### Execution

```bash
supabase db sql --file database/rebuild/07_team_players_and_play_calls.sql
```

### Verification

```bash
# Test team players functionality
npx tsx scripts/database-audit.ts

# Test player operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create team player
  const { data: player, error: playerError } = await supabase
    .from('team_players')
    .insert({
      team_id: teams[0].id,
      first_name: 'John',
      last_name: 'Doe',
      jersey_number: 12,
      position: 'QB'
    })
    .select();
  console.log('Player creation:', { player: player?.length, error: playerError });
}

test();
"
```

### Expected Results

- ✅ team_players: 1 records
- Player roster management works

---

## Step 8: Game Plan Details (08_game_plan_details.sql)

### Purpose

Create game_plans and related strategic planning tables.

### Prerequisites

- Teams system working (Step 3)

### Execution

```bash
supabase db sql --file database/rebuild/08_game_plan_details.sql
```

### Verification

```bash
# Test game planning
npx tsx scripts/database-audit.ts

# Test game plan operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create game plan
  const { data: plan, error: planError } = await supabase
    .from('game_plans')
    .insert({
      team_id: teams[0].id,
      opponent_name: 'Rival High School',
      game_date: '2025-10-01',
      home_away: 'home'
    })
    .select();
  console.log('Game plan creation:', { plan: plan?.length, error: planError });
}

test();
"
```

### Expected Results

- ✅ game_plans: 1 records
- Game planning functionality works

---

## Step 9: Game Results (09_game_results.sql)

### Purpose

Create game_results table for tracking game outcomes and statistics.

### Prerequisites

- Teams system working (Step 3)
- Game plans working (Step 8)

### Execution

```bash
supabase db sql --file database/rebuild/09_game_results.sql
```

### Verification

```bash
# Test game results
npx tsx scripts/database-audit.ts

# Test game result operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create game result
  const { data: result, error: resultError } = await supabase
    .from('game_results')
    .insert({
      team_id: teams[0].id,
      opponent_name: 'Rival High School',
      game_date: '2025-10-01',
      our_score: 28,
      opponent_score: 21,
      result: 'win'
    })
    .select();
  console.log('Game result creation:', { result: result?.length, error: resultError });
}

test();
"
```

### Expected Results

- ✅ game_results: 1 records
- Game result tracking works

---

## Step 10: Practice Management (10_practice_management.sql)

### Purpose

Create practice_schedules and practice_attendance tables for training management.

### Prerequisites

- Teams system working (Step 3)

### Execution

```bash
supabase db sql --file database/rebuild/10_practice_management.sql
```

### Verification

```bash
# Test practice management
npx tsx scripts/database-audit.ts

# Test practice operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create practice schedule
  const { data: practice, error: practiceError } = await supabase
    .from('practice_schedules')
    .insert({
      team_id: teams[0].id,
      title: 'Weekly Practice',
      description: 'Regular team practice',
      scheduled_date: '2025-09-25',
      start_time: '15:00',
      end_time: '17:00'
    })
    .select();
  console.log('Practice creation:', { practice: practice?.length, error: practiceError });
}

test();
"
```

### Expected Results

- ✅ practice_schedules: 1 records
- Practice scheduling works

---

## Step 11: Achievements (11_achievements.sql)

### Purpose

Create achievements and helmet_stickers tables for player recognition.

### Prerequisites

- Teams system working (Step 3)
- Profiles working (Step 2)

### Execution

```bash
supabase db sql --file database/rebuild/11_achievements.sql
```

### Verification

```bash
# Test achievements
npx tsx scripts/database-audit.ts

# Test achievement operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // Create achievement
  const { data: achievement, error: achievementError } = await supabase
    .from('achievements')
    .insert({
      name: 'First Touchdown',
      description: 'Scored the team\'s first touchdown',
      category: 'performance'
    })
    .select();
  console.log('Achievement creation:', { achievement: achievement?.length, error: achievementError });
}

test();
"
```

### Expected Results

- ✅ achievements: 1 records
- Achievement system works

---

## Step 12: Calendar Events (12_calendar_events.sql)

### Purpose

Create calendar_events and team_events tables for scheduling.

### Prerequisites

- Teams system working (Step 3)

### Execution

```bash
supabase db sql --file database/rebuild/12_calendar_events.sql
```

### Verification

```bash
# Test calendar events
npx tsx scripts/database-audit.ts

# Test calendar operations
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: teams } = await supabase.from('teams').select('id').limit(1);

  // Create calendar event
  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .insert({
      team_id: teams[0].id,
      title: 'Team Meeting',
      description: 'Weekly team meeting',
      starts_at: '2025-09-25T18:00:00Z',
      ends_at: '2025-09-25T19:00:00Z'
    })
    .select();
  console.log('Calendar event creation:', { event: event?.length, error: eventError });
}

test();
"
```

### Expected Results

- ✅ calendar_events: 1 records
- Calendar functionality works

---

## Step 13: Indexes (13_indexes.sql)

### Purpose

Create performance indexes for optimal query performance.

### Prerequisites

- All tables created (Steps 1-12 completed)

### Execution

```bash
supabase db sql --file database/rebuild/13_indexes.sql
```

### Verification

```bash
# Test that indexes were created (this is mainly a performance optimization)
npx tsx scripts/database-audit.ts

# Verify no errors in index creation
echo "Indexes created successfully - no errors reported"
```

### Expected Results

- No errors in SQL execution
- Database performance optimized

---

## Step 14: Season Stats View (14_season_stats_view.sql)

### Purpose

Create the season_stats view for analytics and reporting.

### Prerequisites

- All tables created (Steps 1-13)
- Game results and other data tables available

### Execution

```bash
supabase db sql --file database/rebuild/14_season_stats_view.sql
```

### Verification

```bash
# Test season stats view
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // Test season stats view
  const { data: stats, error: statsError } = await supabase
    .from('season_stats')
    .select('*');
  console.log('Season stats view:', { count: stats?.length, error: statsError });
}

test();
"
```

### Expected Results

- Season stats view accessible
- Analytics functionality working

---

## Final Verification: Complete Database Audit

### Purpose

Run comprehensive tests to ensure the entire database is working correctly.

### Prerequisites

- All 14 steps completed successfully

### Execution

```bash
# Run full database audit
npx tsx scripts/database-audit.ts

# Test RLS policies
npx tsx scripts/test-rls.ts

# Test basic application functionality
npm run test
```

### Expected Results

- All tables show correct record counts
- RLS policies working properly
- No errors in any tests
- Application starts and runs without issues

---

## Demo Data Setup

### Purpose

Create sample data for testing and demonstration.

### Prerequisites

- Full database rebuild completed
- All tables and relationships working

### Execution

```bash
# Create demo data
npx tsx scripts/create-corrected-demo-data.ts

# Verify demo data
npx tsx scripts/database-audit.ts
```

### Expected Results

- Demo team, admin user, playbook, and posts created
- Ready for application testing

---

## Troubleshooting

### Common Issues

**UUID Extension Error**: If you get "uuid_generate_v4() does not exist"

```sql
-- Run this in Supabase SQL Editor first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Table Already Exists**: If a table creation fails

```sql
-- Drop the table first
DROP TABLE IF EXISTS table_name CASCADE;
```

**RLS Policy Errors**: If access is denied

```sql
-- Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**Foreign Key Violations**: If relationships fail

- Ensure parent records exist before child records
- Check data types match (especially TEXT vs UUID)

### Recovery Steps

1. **If a step fails**: Go back to Step 0 and restart
2. **If RLS issues**: Check that team_members relationships are correct
3. **If data issues**: Clear test data and recreate

---

## Success Criteria

✅ **Database connects without errors**
✅ **All 14 rebuild scripts execute successfully**
✅ **Database audit shows all tables present**
✅ **Basic CRUD operations work on all tables**
✅ **RLS policies allow proper access control**
✅ **Foreign key relationships intact**
✅ **Demo data creates successfully**
✅ **Application starts and basic features work**

🎉 **Congratulations!** Your BoxCall database is now properly rebuilt and ready for production use.
