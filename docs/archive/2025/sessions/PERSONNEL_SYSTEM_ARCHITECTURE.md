# Personnel System Architecture

## Overview

Complete personnel management system that flows from configuration → plays → diagrams. Everything works together through the existing `plays.personnel` column.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXISTING STRUCTURE (✅)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   teams                  playbooks                    plays             │
│   ├─ id              ┌─→ ├─ id              ┌──────→ ├─ id            │
│   ├─ name            │   ├─ team_id ────────┘        ├─ playbook_id   │
│   └─ ...             │   ├─ name                      ├─ play_name     │
│                      │   └─ ...                       ├─ personnel ◄──┐│
│                      │                                └─ ...          ││
└──────────────────────┼────────────────────────────────────────────────┼┘
                       │                                                 │
┌──────────────────────┼─────────────────────────────────────────────────┼┐
│                      │       NEW PERSONNEL SYSTEM (🆕)                 ││
├──────────────────────┼─────────────────────────────────────────────────┼┤
│                      │                                                 ││
│   personnel_configurations                                             ││
│   ├─ id                                                                ││
│   ├─ playbook_id ────┘                                                 ││
│   ├─ name (PK: "11 Personnel", "12 Personnel") ─────────────────────────┘
│   ├─ description ("1 RB, 1 TE, 2 WR")                                  │
│   └─ created_at                                                        │
│                                                                         │
│   personnel_players (positions in each config)                         │
│   ├─ id                                                                │
│   ├─ config_id ──→ personnel_configurations.id                        │
│   ├─ position ("QB", "RB", "TE", "WR")                                │
│   ├─ label ("Q", "R", "T", "X", "Y")                                  │
│   ├─ sort_order (display order in UI)                                 │
│   └─ is_wildcat_qb (boolean, for trick plays)                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Configuration → Plays → Diagrams

### 1. Personnel Configuration (Modal)

```typescript
// User creates "11 Personnel" config
{
  name: "11 Personnel",
  description: "1 RB, 1 TE, 2 WR",
  players: [
    { position: "QB", label: "Q", sort_order: 0 },      // LOCKED at top
    { position: "RB", label: "R", sort_order: 1 },
    { position: "TE", label: "T", sort_order: 2 },
    { position: "WR", label: "X", sort_order: 3 },
    { position: "WR", label: "Y", sort_order: 4 }
  ]
}
```

### 2. Play Creation (AddNewPlayModal)

```typescript
// User creates play, selects "11 Personnel"
INSERT INTO plays (playbook_id, play_name, personnel, ...)
VALUES (uuid, "Power O Right", "11 Personnel", ...);
//                                ^^^^^^^^^^^^
//                    Stored as TEXT in existing column!
```

### 3. Diagram Loading (FieldCanvas)

```typescript
// When play diagram opens:
const play = await getPlay(playId);
// play.personnel = "11 Personnel"

const personnelConfig = await getPersonnelConfiguration(
  play.playbook_id,
  play.personnel
);
// Returns: { players: [QB, RB, TE, WR, WR] }

// FieldCanvas preloads sprites for these positions
loadPlayerSprites(personnelConfig.players);
// QB behind center, RB in backfield, TE/WR split out
```

## Key Design Decisions

### ✅ Reuse Existing `plays.personnel` Column

- **Already exists** as TEXT column
- No migration needed for plays table
- Store config name: "11 Personnel", "12 Personnel", etc.
- Backward compatible with any existing data

### ✅ Personnel Configs at Playbook Level

- Each playbook can have custom personnel groupings
- Teams can define their own position labels
- Templates provided but fully customizable

### ✅ QB Always Locked

- QB position fixed at top (sort_order: 0)
- Only ONE QB per personnel configuration
- Represents center-QB exchange player
- Other positions use dropdown selector

### ✅ Skill Positions Only

- Position options: QB, RB, TE, WR
- No offensive line in personnel groupings
- OL assumed to be standard 5 (LT, LG, C, RG, RT)
- Focus on skill player substitution patterns

### ✅ Wildcat QB Flag

- Optional `is_wildcat_qb` boolean on any player
- For trick plays where RB/WR takes direct snap
- Still maintains QB position as primary signal caller

## Common Personnel Templates

| Name             | Description  | QB  | RB  | TE  | WR  | Usage                    |
| ---------------- | ------------ | --- | --- | --- | --- | ------------------------ |
| **11 Personnel** | Base offense | 1   | 1   | 1   | 2   | Most common, balanced    |
| **12 Personnel** | Heavy set    | 1   | 1   | 2   | 1   | Run-heavy, power game    |
| **21 Personnel** | I-Formation  | 1   | 2   | 1   | 1   | Power run, fullback      |
| **10 Personnel** | Spread/Empty | 1   | 0   | 1   | 3   | Pass-heavy, 4 receivers  |
| **13 Personnel** | Jumbo        | 1   | 1   | 3   | 0   | Goal line, short yardage |
| **20 Personnel** | Split backs  | 1   | 2   | 0   | 2   | Pro-style offense        |
| **22 Personnel** | Heavy I-Form | 1   | 2   | 2   | 0   | Power run, blocking      |

## Component Integration

### PersonnelConfigurationModal

- Create/Edit personnel configurations
- QB locked at top
- Dropdown for other positions (RB/TE/WR)
- Template selector ("Start from 11 Personnel")
- Saves to `personnel_configurations` + `personnel_players`

### AddNewPlayModal

- Dropdown to select personnel
- Shows: "11 Personnel (1RB, 1TE, 2WR)"
- Saves selected name to `plays.personnel`

### PlayCard

- Badge showing personnel ("11")
- Tooltip with full description
- Filter by personnel in playbook view

### FieldCanvas

- Reads `play.personnel` on load
- Fetches configuration from database
- Preloads player sprites (QB, RB, TE, WR × 2)
- Auto-positions based on formation + personnel
- User can still manually adjust

## RLS Policies

```sql
-- Personnel configurations: team-level access via playbook
CREATE POLICY "Users can view personnel configurations"
ON personnel_configurations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

CREATE POLICY "Coaches can manage personnel configurations"
ON personnel_configurations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM playbooks pb
    JOIN team_members tm ON tm.team_id = pb.team_id
    WHERE pb.id = personnel_configurations.playbook_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
  )
);

-- Similar policies for personnel_players table
```

## Migration Strategy

### Phase 1: Add Personnel Tables

```sql
-- Add new tables WITHOUT touching plays.personnel
-- plays.personnel already exists and works!
```

### Phase 2: Seed Default Templates

```sql
-- For each playbook, create "11 Personnel" default config
INSERT INTO personnel_configurations (playbook_id, name, description)
SELECT id, '11 Personnel', '1 RB, 1 TE, 2 WR'
FROM playbooks;
```

### Phase 3: Update Existing Plays (Optional)

```sql
-- If plays have NULL or old values in personnel column
UPDATE plays
SET personnel = '11 Personnel'
WHERE personnel IS NULL OR personnel = '';
```

## API Service Layer

### personnelService.ts

```typescript
export const personnelService = {
  // Fetch all configs for a playbook
  getConfigurations(playbookId: string): Promise<PersonnelConfiguration[]>,

  // Create new configuration
  createConfiguration(config: CreatePersonnelConfig): Promise<PersonnelConfiguration>,

  // Update existing configuration
  updateConfiguration(id: string, updates: Partial<PersonnelConfiguration>): Promise<void>,

  // Delete configuration
  deleteConfiguration(id: string): Promise<void>,

  // Get configuration by name (for diagram loading)
  getConfigurationByName(playbookId: string, name: string): Promise<PersonnelConfiguration>,

  // Get default templates
  getTemplates(): PersonnelTemplate[]
};
```

## Success Metrics

### Phase 1 (Modal)

- ✅ QB locked at top, cannot change position
- ✅ Only one QB allowed per config
- ✅ Dropdown for RB/TE/WR positions
- ✅ Wildcat QB checkbox works
- ✅ Defaults to 11 Personnel

### Phase 2 (Database)

- ✅ Tables created with RLS policies
- ✅ Foreign keys to playbooks
- ✅ plays.personnel column used (no migration)
- ✅ Default 11 Personnel seeded

### Phase 3 (Service Layer)

- ✅ CRUD operations work
- ✅ Templates load correctly
- ✅ Data syncs with UI

### Phase 4 (Play Integration)

- ✅ Create play with personnel selection
- ✅ Play card shows personnel badge
- ✅ Filter plays by personnel
- ✅ plays.personnel stores config name

### Phase 5 (Diagram Integration) ✅

- ✅ Diagram reads play.personnel
- ✅ Fetches configuration from database
- ✅ Preloads correct player sprites
- ✅ Auto-positions players on field
- ✅ User can manually adjust
- ✅ Personnel display in diagram header
- ✅ Fallback to default 11 Personnel

## Future Enhancements

### Player Linking (Future)

- Link personnel positions to team_players roster
- Show actual player names in diagrams
- Jersey numbers on sprites
- Player-specific playbook views

### Substitution Patterns (Future)

- Define sub packages (3rd down, red zone, 2-minute)
- Auto-suggest personnel based on down/distance
- Analytics on personnel effectiveness

### Formation Integration (Future)

- Link personnel to formations
- "11 Personnel works best with Shotgun Spread"
- Formation + Personnel = complete offensive package

---

**Last Updated:** October 12, 2025  
**Status:** Phase 5 Complete! ✅🎉  
**Next Step:** Optional enhancements (personnel switcher in diagram, formation templates)
