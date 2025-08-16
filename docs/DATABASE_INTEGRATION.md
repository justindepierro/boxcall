# Database Integration Guide

## Overview

BoxCall uses a sophisticated PostgreSQL database hosted on Supabase, implementing advanced football coaching methodologies with modern database practices.

## Database Schema

### Game Planning System

The core of our database is built around Coach Brian Billick's proven game planning methodology, providing a structured approach to situational football preparation.

#### Primary Tables

##### `game_plans`

Master table for all game plans with comprehensive preparation data:

```sql

```

# Database Integration (Condensed)

This guide was condensed to satisfy the 300-line documentation policy. Detailed schema definitions now live in:

- `docs/database/` (structured per domain)
- `database/schema.sql` (authoritative DDL)
- `docs/database/COMPLETE_SCHEMA_REFERENCE.md` (raw full export; excluded from line-limit policy via future allow marker if needed)

Key Integration Principles:

1. All app data access via typed service layer + Supabase RPC / policies (no direct table access from UI components).
2. RLS always enabled; capability-driven policies (role → capabilities → policy predicates).
3. Migrations are idempotent and sequential; verification scripts live in `database/verify_*.sql`.
4. Derived views (e.g., season_stats) expose read-optimized aggregates; never mutate views.
5. Search layer (plays) maintained by trigger-populated tsvector + trigram similarity fallback.

For historical detailed narrative, recover prior version:

```
git log --follow -- docs/DATABASE_INTEGRATION.md
git show <commit>:docs/DATABASE_INTEGRATION.md > /tmp/DATABASE_INTEGRATION_legacy.md
```

<!-- allow-empty -->

##### `game_plan_situations`

Brian Billick situational categories for strategic play calling:

```sql
- id (UUID, Primary Key)
- game_plan_id (UUID, FK to game_plans)
- category_name (TEXT) - "1st & 10", "Red Zone", etc.
- category_type (TEXT) - down_distance, field_position, game_situation, special_teams
- description (TEXT) - Detailed situation description
- success_criteria (TEXT) - What defines success
- preferred_personnel (TEXT) - "11", "12", "21" personnel
- down_distance_range (TEXT) - "3rd-1-3", "1st-10+"
- field_position (TEXT) - red_zone, goal_line, plus_territory, etc.
- game_situation (TEXT) - two_minute, clock_management, fourth_down, etc.
- priority_level (INTEGER 1-5) - Situation importance
- sequence_order (INTEGER) - Display order
- total_plays_assigned (INTEGER) - Auto-calculated
```

##### `game_plan_plays`

Individual play assignments within situations with advanced analytics:

```sql
- id (UUID, Primary Key)
- game_plan_id (UUID, FK to game_plans)
- situation_id (UUID, FK to game_plan_situations)
- play_id (UUID, FK to plays)
- priority_level (INTEGER 1-5) - Play call priority
- personnel_required (TEXT) - Required personnel group
- formation_strength (TEXT) - strong_right, strong_left, etc.
- expected_coverage (TEXT[]) - Expected defensive coverage
- success_probability (DECIMAL 0.00-1.00) - Expected success rate
- risk_level (INTEGER 1-5) - Risk assessment
- coaching_notes (TEXT) - Specific coaching points
- sequence_order (INTEGER) - Call sequence
- is_scripted (BOOLEAN) - Part of scripted series
- execution_count (INTEGER) - Times executed
- success_count (INTEGER) - Successful executions
```

##### `coach_cards`

Printable sideline reference system:

```sql
- id (UUID, Primary Key)
- game_plan_id (UUID, FK to game_plans)
- card_type (TEXT) - situation, personnel, two_minute, red_zone, special_teams, adjustments
- title (TEXT) - Card title
- subtitle (TEXT) - Card subtitle
- content (JSONB) - Card layout and play information
- print_order (INTEGER) - Printing sequence
- card_size (TEXT) - standard, large, pocket
```

##### `game_plan_templates`

Reusable game plan patterns and philosophies:

```sql
- id (UUID, Primary Key)
- team_id (UUID, FK to teams)
- template_name (TEXT) - Template identifier
- template_type (TEXT) - base_offense, situational, opponent_specific, weather_specific
- situation_categories (JSONB) - Template situations
- default_plays (JSONB) - Default play assignments
- coaching_philosophy (TEXT) - Philosophical approach
- is_public (BOOLEAN) - Available to other teams
- usage_count (INTEGER) - Popularity tracking
```

##### `game_plan_analytics`

Real-time execution tracking and performance analysis:

```sql
- id (UUID, Primary Key)
- game_plan_id (UUID, FK to game_plans)
- situation_id (UUID, FK to game_plan_situations)
- play_id (UUID, FK to plays)
- execution_time (TIMESTAMPTZ) - When executed
- game_context (JSONB) - Down, distance, field position, score, time
- outcome (TEXT) - success, partial_success, failure, penalty, turnover
- yards_gained (INTEGER) - Result yardage
- execution_quality (INTEGER 1-10) - Execution assessment
- coaching_assessment (TEXT) - Post-execution notes
- adjustments_made (TEXT) - Changes implemented
```

## Automated Database Features

### Trigger-Based Count Maintenance

Our database automatically maintains accurate counts through PostgreSQL triggers:

#### Situation Count Triggers

```sql
CREATE TRIGGER trigger_game_plan_situation_count
  AFTER INSERT OR UPDATE OR DELETE ON game_plan_situations
  FOR EACH ROW
  EXECUTE FUNCTION update_game_plan_counts();
```

#### Play Count Triggers

```sql
CREATE TRIGGER trigger_game_plan_play_count
  AFTER INSERT OR UPDATE OR DELETE ON game_plan_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_play_counts();
```

### Performance Indexes

Strategic indexes for optimal query performance:

```sql
-- Game Plans
CREATE INDEX idx_game_plans_team_week ON game_plans(team_id, week_number DESC);
CREATE INDEX idx_game_plans_status_team ON game_plans(team_id, preparation_status);
CREATE INDEX idx_game_plans_active ON game_plans(is_active, team_id);

-- Situations
CREATE INDEX idx_situations_game_plan ON game_plan_situations(game_plan_id, is_active);
CREATE INDEX idx_situations_category_type ON game_plan_situations(category_type, priority_level);

-- Plays
CREATE INDEX idx_game_plan_plays_situation ON game_plan_plays(situation_id, priority_level, sequence_order);
CREATE INDEX idx_game_plan_plays_performance ON game_plan_plays(success_probability DESC, risk_level ASC);

-- Analytics
CREATE INDEX idx_analytics_game_plan_time ON game_plan_analytics(game_plan_id, execution_time);
CREATE INDEX idx_analytics_performance ON game_plan_analytics(play_id, outcome, execution_quality);
```

## Row Level Security (RLS)

All tables implement comprehensive security policies:

### Team-Based Data Isolation

```sql
-- Example: Game plans are restricted to team members
CREATE POLICY "team_members_game_plans" ON game_plans
  FOR ALL TO authenticated
  USING (team_id IN (
    SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
  ));
```

### Template Sharing

```sql
-- Templates can be shared publicly or kept private
CREATE POLICY "team_members_templates" ON game_plan_templates
  FOR ALL TO authenticated
  USING (
    team_id IN (SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid())
    OR is_public = true
  );
```

## Integration Patterns

### TypeScript Integration

All database tables have corresponding TypeScript interfaces for type safety:

```typescript
interface GamePlan {
  id: string;
  team_id: string;
  name: string;
  week_number?: number;
  opponent?: string;
  game_date?: string;
  scouting_report: Record<string, any>;
  preparation_status: "draft" | "in_progress" | "complete" | "game_ready";
  total_situations: number;
  total_plays_assigned: number;
  is_active: boolean;
  // ... other fields
}
```

### Supabase Client Usage

```typescript
// Query game plans with related data
const { data: gamePlans } = await supabase
  .from("game_plans")
  .select(
    `
    *,
    game_plan_situations (
      *,
      game_plan_plays (
        *,
        plays (*)
      )
    )
  `
  )
  .eq("team_id", teamId)
  .eq("is_active", true);
```

## Migration Management

### Version Control

- All schema changes are version controlled in `/database/migrations/`
- Migrations are numbered and dated for proper sequencing
- Complete rebuild scripts available for fresh deployments

### Deployment Safety

- Migrations include rollback procedures
- Non-destructive changes when possible
- Comprehensive testing before production deployment

## Monitoring & Maintenance

### Performance Monitoring

- Query performance tracking through Supabase dashboard
- Index usage analysis
- Slow query identification and optimization

### Data Integrity

- Foreign key constraints ensure referential integrity
- Check constraints validate data quality
- Trigger functions maintain data consistency

## Best Practices

### Query Optimization

- Use selective indexes for common query patterns
- Leverage RLS for security without application-level filtering
- Batch operations when possible to reduce round trips

### Data Modeling

- JSONB for flexible, evolving data structures
- Arrays for simple lists (tags, matchups)
- Proper normalization for relational data

### Security

- Never bypass RLS in application code
- Use parameterized queries to prevent SQL injection
- Regular security audits of policies and permissions
