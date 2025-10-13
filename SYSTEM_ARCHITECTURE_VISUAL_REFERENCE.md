# 📊 BoxCall System Architecture - Visual Reference

## 🗺️ Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BOXCALL PLAYBOOK SYSTEM                                 │
│                   Complete Integration Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│     TEAMS       │ ← Root entity
│  id (PK)        │
│  name           │
│  season_year    │
└────────┬────────┘
         │ 1:N (team_id FK)
         ↓
┌─────────────────┐
│   PLAYBOOKS     │ ← Organization layer
│  id (PK)        │
│  team_id (FK)   │
│  name           │
│  is_active      │
└────────┬────────┘
         │
         ├───────────────────────────────────────────────────────────────────┐
         │                                                                    │
         │ 1:N                                  1:N                          │ 1:N
         ↓                                      ↓                            ↓
┌──────────────────────┐              ┌──────────────────────┐    ┌──────────────────────┐
│ PERSONNEL_           │              │    FORMATIONS        │    │       PLAYS          │
│ CONFIGURATIONS       │◄─────────────│  id (PK)             │◄───│  id (PK)             │
│  id (PK)             │  optional FK │  playbook_id (FK)    │ FK │  playbook_id (FK)    │
│  playbook_id (FK)    │  (personnel_ │  name                │ opt│  play_name           │
│  name                │   id)        │  description         │    │  formation (TEXT)    │ ← Legacy
│  description         │              │  category            │    │  formation_id (FK)   │ ← New
│  created_at          │              │                      │    │  formation_direction │
│  updated_at          │              │  ┌────────────────┐  │    │  personnel (TEXT)    │ ← Legacy
└──────────┬───────────┘              │  │ PERSONNEL      │  │    │  personnel_id (FK)   │ ← TO ADD
           │                          │  │ INTEGRATION    │  │    │  diagram_data (JSONB)│
           │ 1:N (config_id FK)       │  └────────────────┘  │    │  p_type              │
           ↓                          │  personnel_id (FK)   │    │  notes               │
┌──────────────────────┐              │  personnel_name      │    │  tags[]              │
│ PERSONNEL_PLAYERS    │              │  personnel_packages[]│←┐  │  created_at          │
│  id (PK)             │              │    (UUID array)      │ │  │  updated_at          │
│  config_id (FK)      │              │                      │ │  └──────────────────────┘
│  player_position     │              │  ┌────────────────┐  │ │
│    (QB/RB/TE/WR)     │              │  │ VARIANT SYSTEM │  │ │
│  label (Q/R/X/Y/Z)   │              │  └────────────────┘  │ │
│  sort_order          │              │  base_formation_id   │ │
│  is_wildcat_qb       │              │    (self FK)         │ │
└──────────────────────┘              │  direction           │ │
                                      │    (base/left/right) │ │
                                      │                      │ │
                                      │  ┌────────────────┐  │ │
                                      │  │ POSITIONING    │  │ │
                                      │  └────────────────┘  │ │
                                      │  player_positions    │ │
                                      │    (JSONB array)     │ │
                                      │  strength_player_    │ │
                                      │    position          │ │
                                      │  strength_player_    │ │
                                      │    label             │ │
                                      │                      │ │
                                      │  ┌────────────────┐  │ │
                                      │  │ METADATA       │  │ │
                                      │  └────────────────┘  │ │
                                      │  tags[]              │ │
                                      │  usage_count         │ │
                                      │  is_custom           │ │
                                      │  created_by          │ │
                                      │  created_at          │ │
                                      │  updated_at          │ │
                                      └──────────────────────┘ │
                                               ▲               │
                                               └───────────────┘
                                         (multi-select personnel
                                          for one formation)
```

---

## 🔗 Integration Flow: Create Play with Formation & Personnel

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     USER ACTION: "Create New Play"                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  1. User selects personnel from dropdown                                │
│     → Fetches from personnel_configurations table                       │
│     → Displays: "11 Personnel (1 RB, 1 TE, 3 WR)"                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  2. User selects formation from dropdown                                │
│     → Filters formations by selected personnel (via personnel_packages) │
│     → Shows only compatible formations                                  │
│     → Displays: "Trips Right", "Trips Left", "Doubles"                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  3. User enters play name and details                                   │
│     → Play name: "Trips Right Z Sail"                                  │
│     → Play type: "Pass"                                                 │
│     → Notes, tags, etc.                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  4. PlaysService.createPlay() called                                    │
│     → Saves play with:                                                  │
│       • formation_id (FK to formations table)                           │
│       • formation (TEXT - legacy, for backward compatibility)           │
│       • personnel_id (FK to personnel_configurations) [TO ADD]          │
│       • personnel (TEXT - legacy)                                       │
│       • Other play metadata                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  5. Database triggers fire                                              │
│     → update_formation_usage_count() increments formations.usage_count  │
│     → Auto-tracking of formation popularity                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  6. User opens diagram editor                                           │
│     → Loads formation via formation_id FK                               │
│     → Fetches formation.player_positions (JSONB)                        │
│     → Loads personnel via personnel name                                │
│     → Fetches personnel_players for that config                         │
│     → Pre-positions players on field (QB, RB, TE, WRs)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  7. User draws routes and saves diagram                                 │
│     → Saves diagram_data (JSONB) with player positions, routes, symbols │
│     → Links back to play                                                │
└─────────────────────────────────────────────────────────────────────────┘

✅ COMPLETE: Play, Formation, and Personnel all linked and working together!
```

---

## 🔄 Update Flow: Rename Formation

```
┌──────────────────────────────────────────────────────────────────────────┐
│                USER ACTION: "Rename Formation"                           │
│                "Trips Right" → "Trips R"                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  1. FormationService.updateFormation() called                           │
│     → UPDATE formations SET name = 'Trips R' WHERE id = 'uuid'         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  2. Database trigger fires: trigger_sync_play_formation_name            │
│     → Finds all plays with formation = 'Trips Right'                   │
│     → Updates them to formation = 'Trips R'                            │
│     → Sets updated_at = NOW()                                           │
│     → Logs: "Synced 12 plays from 'Trips Right' to 'Trips R'"         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  3. React Query cache invalidated                                       │
│     → useFormations hook refetches data                                 │
│     → usePlays hook refetches data                                      │
│     → UI updates automatically                                          │
└─────────────────────────────────────────────────────────────────────────┘

✅ RESULT: All plays automatically show new formation name!
           No orphaned references!
```

---

## 🗑️ Delete Flow: Delete Personnel (with trigger)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                USER ACTION: "Delete Personnel"                           │
│                Delete "11 Personnel"                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  1. PersonnelService.checkPersonnelUsage() called                       │
│     → Counts plays using this personnel                                 │
│     → Counts formations using this personnel                            │
│     → Returns: { playsCount: 45, formationsCount: 8, inUse: true }    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  2. DeleteConfirmationDialog shown                                      │
│     ┌────────────────────────────────────────────────────────────────┐ │
│     │  ⚠️ Delete "11 Personnel"?                                     │ │
│     │                                                                │ │
│     │  This entity is currently in use:                             │ │
│     │  • 45 plays                                                    │ │
│     │  • 8 formations                                                │ │
│     │                                                                │ │
│     │  These will lose their reference to this entity.              │ │
│     │                                                                │ │
│     │  [Cancel]  [Delete Anyway]                                     │ │
│     └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ↓ User clicks Cancel            ↓ User clicks Delete Anyway
            ┌───────────────────┐          ┌───────────────────────────┐
            │  Nothing happens  │          │  PersonnelService.delete() │
            │  Modal closes     │          │  DELETE FROM personnel_    │
            └───────────────────┘          │    configurations          │
                                           │  WHERE id = 'uuid'         │
                                           └───────┬───────────────────┘
                                                   │
                                                   ↓
                                           ┌──────────────────────────────┐
                                           │  CASCADE & SET NULL effects: │
                                           │                              │
                                           │  • personnel_players:        │
                                           │    → CASCADE DELETE (removed)│
                                           │                              │
                                           │  • formations.personnel_id:  │
                                           │    → SET NULL (preserved)    │
                                           │                              │
                                           │  • plays.personnel (TEXT):   │
                                           │    → No change (orphaned)    │
                                           │                              │
                                           │  • plays.personnel_id (FK):  │
                                           │    → SET NULL (when added)   │
                                           └──────────────────────────────┘

✅ RESULT: Entity deleted, related data preserved (SET NULL) or removed (CASCADE)
⚠️  NOTE: TEXT fields become orphaned without trigger/FK
```

---

## 📈 Analytics Flow: Formation Success Rate (Future)

```
┌──────────────────────────────────────────────────────────────────────────┐
│              FUTURE ENHANCEMENT: Game Results Integration                │
└──────────────────────────────────────────────────────────────────────────┘

game_results
  ↓ 1:N
game_play_calls
  - play_id (FK → plays)
  - formation_id (FK → formations)
  - personnel_id (FK → personnel_configurations)
  - result (gain/loss/TD/incomplete)
  - yards_gained

Query: Formation Success Rate
┌────────────────────────────────────────────────────────────────────────┐
│ SELECT                                                                 │
│   f.name AS formation_name,                                           │
│   COUNT(*) AS times_called,                                           │
│   AVG(gpc.yards_gained) AS avg_yards,                                 │
│   SUM(CASE WHEN gpc.result = 'touchdown' THEN 1 ELSE 0 END) AS tds   │
│ FROM formations f                                                      │
│ JOIN game_play_calls gpc ON gpc.formation_id = f.id                  │
│ GROUP BY f.id, f.name                                                 │
│ ORDER BY avg_yards DESC;                                              │
└────────────────────────────────────────────────────────────────────────┘

Result:
┌─────────────────┬──────────────┬───────────┬─────┐
│ formation_name  │ times_called │ avg_yards │ tds │
├─────────────────┼──────────────┼───────────┼─────┤
│ Trips Right     │ 45           │ 8.2       │ 4   │
│ Doubles         │ 38           │ 6.5       │ 2   │
│ Trips Left      │ 29           │ 5.1       │ 1   │
└─────────────────┴──────────────┴───────────┴─────┘

✅ Coaches can see which formations are most effective!
```

---

## 🎨 UI Component Hierarchy

```
App
└── PlaybookView
    ├── PlaybookHeader
    │   └── TeamSelector
    │
    ├── PlaybookSidebar
    │   ├── PersonnelBuilder (opens PersonnelConfigurationModal)
    │   ├── FormationBuilder (opens FormationBuilderModal)
    │   └── FilterPanel
    │       ├── PersonnelFilter (multi-select)
    │       ├── FormationFilter (multi-select)
    │       └── PlayTypeFilter
    │
    ├── PlayGrid (shows all plays)
    │   └── PlayCard (repeats for each play)
    │       ├── PlayCardTileHeader
    │       │   ├── PersonnelBadge (shows play.personnel)
    │       │   ├── FormationBadge (shows play.formation)
    │       │   └── PlayTypeBadge
    │       └── PlayCardActions
    │           ├── Edit
    │           ├── Duplicate
    │           └── Delete
    │
    └── DiagramEditor (when play selected)
        ├── DiagramHeader
        │   ├── PlayNameDisplay
        │   ├── PersonnelBadge (auto-loaded from play.personnel)
        │   └── FormationDisplay (from play.formation_id)
        │
        ├── FieldCanvas (PixiJS)
        │   ├── PlayerSprites (from personnel_players)
        │   │   └── Labels (Q, R, X, Y, Z)
        │   ├── Routes (user-drawn)
        │   └── Symbols (user-placed)
        │
        └── DiagramToolbar
            ├── RouteTools
            ├── SymbolTools
            └── SaveButton
```

---

## 🔐 Security: RLS Policy Chain

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY (RLS) CHAIN                        │
└──────────────────────────────────────────────────────────────────────────┘

User (auth.users)
  ↓
team_members (user_id FK, team_role)
  ↓
teams (team_id FK)
  ↓
playbooks (team_id FK)
  ↓
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ personnel_          │    formations       │      plays          │
│ configurations      │                     │                     │
│                     │                     │                     │
│ RLS: Can access if  │ RLS: Can access if  │ RLS: Can access if  │
│ playbook belongs    │ playbook belongs    │ playbook belongs    │
│ to user's team      │ to user's team      │ to user's team      │
│                     │                     │                     │
│ Coaches: Can modify │ Coaches: Can modify │ Coaches: Can modify │
│ Players: Read-only  │ Players: Read-only  │ Players: Read-only  │
└─────────────────────┴─────────────────────┴─────────────────────┘

✅ RESULT: Team members can only see/edit their team's data
           Role-based permissions (coach vs player)
```

---

## 🚀 Performance: Query Optimization

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    OPTIMIZED QUERY PATTERNS                              │
└──────────────────────────────────────────────────────────────────────────┘

❌ BAD: N+1 Query Problem
┌────────────────────────────────────────────────────────────────────────┐
│ // Fetch all formations                                                │
│ const formations = await getFormations(playbookId);                    │
│                                                                         │
│ // Then fetch personnel for each formation (N queries!)                │
│ for (const formation of formations) {                                  │
│   const personnel = await getPersonnel(formation.personnel_id);        │
│ }                                                                       │
└────────────────────────────────────────────────────────────────────────┘

✅ GOOD: Single Query with JOIN
┌────────────────────────────────────────────────────────────────────────┐
│ const { data } = await supabase                                        │
│   .from('formations')                                                  │
│   .select(`                                                            │
│     *,                                                                 │
│     personnel_configurations(*)                                        │
│   `)                                                                   │
│   .eq('playbook_id', playbookId);                                     │
└────────────────────────────────────────────────────────────────────────┘

✅ BEST: Materialized View (Future)
┌────────────────────────────────────────────────────────────────────────┐
│ CREATE MATERIALIZED VIEW formation_with_personnel AS                   │
│ SELECT                                                                 │
│   f.*,                                                                 │
│   pc.name AS personnel_name,                                          │
│   pc.description AS personnel_description,                            │
│   COUNT(p.id) AS usage_count                                          │
│ FROM formations f                                                      │
│ LEFT JOIN personnel_configurations pc ON pc.id = f.personnel_id       │
│ LEFT JOIN plays p ON p.formation_id = f.id                            │
│ GROUP BY f.id, pc.id;                                                 │
│                                                                         │
│ -- Refresh periodically                                                │
│ REFRESH MATERIALIZED VIEW formation_with_personnel;                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Summary

Your BoxCall system has:

✅ **Strong Entity Relationships**

- Personnel → Formations (FK + array)
- Formations → Plays (optional FK)
- Playbooks → Everything (cascade)

✅ **Comprehensive Service Layer**

- PersonnelService (200+ lines)
- FormationService (645 lines)
- PlaysService (400+ lines)

✅ **Type-Safe TypeScript**

- Interfaces match database schema
- Validation before persistence

✅ **Secure Multi-Tenant**

- RLS policies on all tables
- Team-based access control

✅ **Future-Proof Architecture**

- UUID primary keys
- JSONB for flexibility
- Array types for multi-relationships

**Score: 9/10** 🏆

Minor improvements (3-4 hours) will make it bulletproof!
