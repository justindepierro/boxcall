# Formation System Schema & Workflow Visualization

**Date:** October 17, 2025  
**Status:** Active Development - Phase 4 Complete

---

## 📊 Database Schema Overview

### **Formations Table Structure**

```sql
formations (
  -- Primary Key
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id              UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,

  -- Basic Formation Info
  name                     TEXT NOT NULL,
  description              TEXT,
  category                 TEXT CHECK (category IN ('spread', 'pro', 'power', 'special', 'goal_line', 'short_yardage')),

  -- Personnel Integration
  personnel_id             UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL,
  personnel_name           TEXT,  -- Denormalized: "11", "12", "21"
  personnel_packages       TEXT[],  -- Array of personnel IDs that can run this formation

  -- Left/Right Variant System (Simplified)
  opposite_formation_id    UUID REFERENCES formations(id) ON DELETE SET NULL,  -- Direct link to opposite
  direction                TEXT CHECK (direction IN ('left', 'right') OR direction IS NULL),  -- NULL = standalone

  -- Strength Player
  strength_player_position TEXT,  -- "X", "Y", "Z", "H", "F"
  strength_player_label    TEXT,  -- "Blue", "Black", "Green"

  -- Formation Metadata
  formation_type           TEXT,  -- "I Formation", "Shotgun", etc.
  run_strength             TEXT,  -- "left", "right", "balanced"
  pass_strength            TEXT,  -- "left", "right", "balanced"

  -- Player Positions (JSONB)
  player_positions         JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{position: "X", x: 10, y: 25, label: "Blue", isStrengthSetter: true, role: "WR"}, ...]

  -- Metadata
  tags                     TEXT[],
  is_custom                BOOLEAN DEFAULT true,
  usage_count              INTEGER DEFAULT 0,

  -- Creation Tracking (Telemetry)
  creation_source          TEXT,  -- "play_builder", "formation_builder", "bulk_import", etc.
  creation_context         JSONB,  -- Additional creation metadata
  metadata_completeness    INTEGER,  -- 0-100 score
  metadata_quality         TEXT,  -- "complete", "good", "needs_work", "incomplete"

  -- Timestamps
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Optimistic Locking
  version                  INTEGER DEFAULT 1,  -- Incremented on each update

  -- Constraints
  CONSTRAINT unique_formation_name_per_playbook UNIQUE(playbook_id, name)
);
```

### **Plays Table - Formation Relationship**

```sql
plays (
  id                       UUID PRIMARY KEY,
  playbook_id              UUID REFERENCES playbooks(id) ON DELETE CASCADE,

  -- Formation Relationship (NEW)
  formation_id             UUID REFERENCES formations(id) ON DELETE SET NULL,
  formation_direction      TEXT CHECK (formation_direction IN ('base', 'left', 'right')),

  -- Legacy Formation Fields (Kept for backwards compatibility)
  formation                TEXT NOT NULL,  -- Formation name (text)
  f_dir                    TEXT,  -- Formation direction: "R" or "L" (normalized)
  f_type                   TEXT,  -- Formation type

  -- Personnel
  personnel                TEXT,

  -- Other play fields...
  play_name                TEXT NOT NULL,
  p_type                   TEXT CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action')),
  ...
);
```

---

## 🔄 Formation Workflow Visualization

### **1. Formation Creation Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORMATION CREATION                           │
└─────────────────────────────────────────────────────────────────┘

Entry Points:
├── 📝 AddNewPlayModal (Play Builder)
│   └── User typing formation name → Direction detection → Warning modal
│       └── Creates formation if accepted
│
├── 🎨 Formation Builder Modal
│   ├── Tab 1: Create/Edit → Form inputs (name, personnel, type)
│   ├── Tab 2: Draw → Visual canvas (player positions)
│   └── Tab 3: Link Variants → Connect left/right pairs
│
├── 📚 Formation Library
│   └── Direct creation via form
│
└── 📥 Bulk Import
    └── CSV import with auto-normalization

All paths save to:
  ┌───────────────────┐
  │  formations table │
  └───────────────────┘
        ↓
  Auto-populates:
  - creation_source
  - creation_context
  - metadata_completeness
  - usage_count (via trigger)
```

### **2. Formation Direction Detection (Smart Validation)**

```
User types: "Trips Right" in formation name field
                ↓
┌─────────────────────────────────────────────────┐
│  detectDirectionInFormationName()               │
│  - Checks for: Right, Rt, R, Left, Lt, L       │
│  - Skips single-word names ("Right", "Rip")    │
└─────────────────────────────────────────────────┘
                ↓
        Has direction?
                ↓
          ┌─────┴─────┐
         Yes          No
          ↓            ↓
  Show Warning    Accept as-is
  Modal
          ↓
  User decides:
  ├── "Use Recommended"
  │   └── formation = "Trips"
  │       formationDir = "R"
  │       ✅ Clean data
  │
  └── "Keep As-Is"
      └── formation = "Trips Right"
          ⚠️ Direction in name
```

### **3. Formation Linking Flow**

```
┌───────────────────────────────────────────────────────────────┐
│              FORMATION LINKING (Left ↔ Right)                 │
└───────────────────────────────────────────────────────────────┘

Formation Builder Modal → Tab 3: Link Variants
                ↓
┌─────────────────────────────────────────────────┐
│  Left Dropdown          Right Dropdown          │
│  ────────────          ─────────────            │
│  Shows:                Shows:                   │
│  • direction='left'    • direction='right'      │
│  • direction=NULL      • direction=NULL         │
│    (unlinked)            (unlinked)             │
│                                                  │
│  Filters out:          Filters out:             │
│  • Already linked      • Already linked         │
│  • Selected on right   • Selected on left       │
└─────────────────────────────────────────────────┘
                ↓
          Select both
                ↓
         Click "Link"
                ↓
┌─────────────────────────────────────────────────┐
│  link_formations_bidirectional()                │
│  - Sets opposite_formation_id (both ways)       │
│  - Sets direction ('left'/'right')              │
│  - Normalizes f_dir in plays table to "R"/"L"   │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│  formations table                               │
│  ────────────                                   │
│  Formation A:                                   │
│    direction = 'left'                           │
│    opposite_formation_id = Formation B.id       │
│                                                  │
│  Formation B:                                   │
│    direction = 'right'                          │
│    opposite_formation_id = Formation A.id       │
└─────────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────────┐
│  plays table (auto-normalized)                  │
│  ────────────                                   │
│  All plays with formation="Twins":              │
│    f_dir = "R" or "L" (normalized)              │
│    (was: "Right", "Rt", "Left", "Lt")           │
└─────────────────────────────────────────────────┘
```

### **4. Play Creation with Formations**

```
┌───────────────────────────────────────────────────────────────┐
│                    CREATE PLAY WORKFLOW                       │
└───────────────────────────────────────────────────────────────┘

AddNewPlayModal
      ↓
Formation Section:
  ├── FormationSelector (dropdown)
  │   ├── Shows: formations from database
  │   ├── Grouped by: personnel → category
  │   └── OnSelect: Auto-fills formation metadata
  │       ├── formation_id
  │       ├── formation_direction
  │       ├── personnel
  │       └── formation_type
  │
  └── Direction Selector (R/L)
      └── User picks left or right variant

      ↓
Save Play:
  ┌───────────────────────────────────────────────┐
  │  plays table                                  │
  │  ────────────                                 │
  │  formation_id     = UUID (references DB)      │
  │  formation        = "Twins" (text, legacy)    │
  │  f_dir            = "R" or "L" (normalized)   │
  │  personnel        = "11"                      │
  │  formation_type   = "Shotgun"                 │
  └───────────────────────────────────────────────┘

Triggers:
  └── update_formation_usage_count()
      └── formations.usage_count++
```

### **5. Formation Display & Normalization**

```
┌───────────────────────────────────────────────────────────────┐
│               DIRECTION DISPLAY WORKFLOW                      │
└───────────────────────────────────────────────────────────────┘

Database Storage:          User Display:
┌──────────────┐          ┌──────────────────────┐
│ plays        │          │ User Preference:     │
│ ─────        │          │                      │
│ f_dir = "R"  │────────> │ • "full"    → Right  │
│              │          │ • "abbrev"  → Rt     │
│              │          │ • "letter"  → R      │
└──────────────┘          └──────────────────────┘
       ↑
       │
Normalization:
┌──────────────────────────────────┐
│ Input: "Right", "Rt", "R"        │
│ Output: "R"                      │
│                                  │
│ Input: "Left", "Lt", "L"         │
│ Output: "L"                      │
└──────────────────────────────────┘
```

---

## 🎯 Data Consistency Rules

### **1. Formation Direction Normalization**

| Input Variations                       | Normalized Value | Database Column |
| -------------------------------------- | ---------------- | --------------- |
| "Right", "right", "R", "r", "Rt", "rt" | `"R"`            | `plays.f_dir`   |
| "Left", "left", "L", "l", "Lt", "lt"   | `"L"`            | `plays.f_dir`   |
| null, empty                            | `NULL`           | `plays.f_dir`   |

### **2. Formation Linking Rules**

- ✅ **Left formations** → `direction = 'left'`, can link to right
- ✅ **Right formations** → `direction = 'right'`, can link to left
- ✅ **Standalone formations** → `direction = NULL`, cannot be linked
- ✅ **Bidirectional** → Both formations point to each other via `opposite_formation_id`
- ❌ **Cannot link** → Formations already linked, or same direction

### **3. Formation Name Validation**

| Input           | Single/Multi Word | Triggers Warning? | Action                                  |
| --------------- | ----------------- | ----------------- | --------------------------------------- |
| `"Right"`       | Single            | ❌ No             | Accept (legitimate name like "Rip")     |
| `"Trips Right"` | Multi             | ✅ Yes            | Suggest: name="Trips" + direction=Right |
| `"I Formation"` | Multi             | ❌ No             | Accept (no direction keyword)           |
| `"Left"`        | Single            | ❌ No             | Accept (legitimate name like "Liz")     |
| `"Bunch Lt"`    | Multi             | ✅ Yes            | Suggest: name="Bunch" + direction=Left  |

---

## 📈 Key Features & Benefits

### **✅ Completed Features**

1. **Smart Direction Detection**
   - Auto-detects direction keywords in formation names
   - Educational warning modal with visual examples
   - Respects single-word formations ("Right", "Left", "Rip", "Liz")

2. **Formation Linking System**
   - Simplified left ↔ right pairing
   - Filtered dropdowns (left vs right)
   - Bidirectional database constraints

3. **Direction Normalization**
   - All `f_dir` values normalized to "R" or "L"
   - Auto-normalization when formations are linked
   - Display format controlled by user preference

4. **Formation Builder Modal**
   - Consolidated 3-tab interface (was 7 tabs)
   - Tab 1: Create/Edit formation details
   - Tab 2: Draw player positions on canvas
   - Tab 3: Link left/right variants

### **🎯 Workflow Alignment**

| User Action        | Database Impact                         | UI Feedback                          |
| ------------------ | --------------------------------------- | ------------------------------------ |
| Type "Trips Right" | Direction detection fires               | Warning modal suggests clean format  |
| Accept suggestion  | `formation="Trips"`, `formationDir="R"` | Fields auto-populate correctly       |
| Link formations    | Both get `opposite_formation_id`        | Plays' `f_dir` normalized to "R"/"L" |
| Create play        | `formation_id` references DB            | Auto-fills metadata from formation   |
| Duplicate + Flip   | Uses `opposite_formation_id`            | Instant left ↔ right flip           |

---

## 🔍 TypeScript Type Alignment

### **Formation Interface**

```typescript
interface Formation {
  id: string;
  playbook_id: string;
  name: string;
  opposite_formation_id: string | null; // Direct link to opposite
  direction: "left" | "right" | null; // NULL = standalone
  personnel_id: string | null;
  personnel_name: string | null;
  player_positions: FormationPlayerPosition[];
  formation_type: FormationType | null;
  // ... metadata fields
}
```

### **Play Interface**

```typescript
interface Play {
  id: string;
  playbook_id: string;
  formation: string; // Legacy text field
  formation_id: string | null; // NEW: References formations.id
  formation_direction: "base" | "left" | "right" | null; // Which variant
  f_dir: string; // Normalized: "R" or "L"
  // ... other fields
}
```

---

## 🚀 Next Steps / Future Enhancements

1. **Formation Builder Panel Integration**
   - Add direction detection to controlled input
   - Currently has uncontrolled input (needs refactor)

2. **Bulk CSV Import**
   - Auto-detect and normalize directions on import
   - Show validation summary before commit

3. **Formation Health Dashboard**
   - Show unlinked formations that could be paired
   - Flag formations with inconsistent metadata

4. **AI-Powered Suggestions**
   - Suggest similar formations for linking
   - Auto-detect strength players from positions

---

## 📝 Migration History

| Date   | Migration                                  | Purpose                             |
| ------ | ------------------------------------------ | ----------------------------------- |
| Oct 12 | `20251012_create_formations_table`         | Initial formations table            |
| Oct 13 | `20251013000000_add_formation_metadata`    | Added telemetry fields              |
| Oct 14 | `20251014000001_formation_bulletproofing`  | Data quality enforcement            |
| Oct 16 | `20251016000001_add_opposite_formation_id` | Simplified linking system           |
| Oct 17 | `20251017000001_fix_formation_directions`  | Direction constraint fixes          |
| Oct 17 | **Current Session**                        | Direction detection & normalization |

---

**Generated:** October 17, 2025  
**Document Version:** 1.0  
**Status:** ✅ Schema matches workflow - Aligned!
