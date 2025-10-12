# Formation Builder - Complete Implementation Plan

## 🎯 Vision: Fully Integrated Formation System

Everything talks to each other:
- **Personnel Configurations** → Referenced by Formations
- **Formations** → Referenced by Plays
- **Plays** → Can duplicate + flip using formation data

---

## 📊 Current State Analysis

### What You Have Now:
1. **2 Plays in Playbook:**
   - "Twins Same Side Power" (formation: "Twins Same")
   - "Trips Iz" (formation: "Trips")

2. **3 Personnel Configurations:**
   - Blue
   - Black  
   - Green

3. **Template Formations in Code:**
   - Spread 2x2, Spread 3x1 Right/Left, Pro, Pistol, Trips (hardcoded in DiagramEditor)

### What's Missing:
- ❌ Formations are NOT saved to database
- ❌ Personnel NOT linked to formations
- ❌ Can't flip formations (no Left/Right versions stored)
- ❌ Can't tag strength-setting player in formation
- ❌ Plays reference formation by STRING, not by ID

---

## 🗄️ Database Schema Design

### New Table: `formations`

```sql
CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,                    -- "Twins Same", "Trips", "Spread 2x2"
  description TEXT,                      -- "2 WR same side, RB offset"
  category TEXT,                         -- "spread", "pro", "power", "special"
  
  -- Personnel Reference
  personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL,
  personnel_name TEXT,                   -- Denormalized for quick access: "11", "12", "21"
  
  -- Left/Right Variants
  base_formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,  -- NULL = this IS the base
  direction TEXT CHECK (direction IN ('base', 'left', 'right')),        -- Which variant this is
  has_left_variant BOOLEAN DEFAULT false,
  has_right_variant BOOLEAN DEFAULT false,
  
  -- Formation Strength
  strength_player_position TEXT,         -- Which position sets the strength: "X", "Y", "Z", "H", "F"
  strength_player_label TEXT,           -- From personnel config: "Blue", "Black", "Green"
  
  -- Player Positions (stored as JSONB)
  player_positions JSONB NOT NULL,      -- Array of {position: "X", x: 10, y: 20, label: "Blue"}
  
  -- Metadata
  tags TEXT[],                          -- ["twins", "compressed", "unbalanced"]
  is_custom BOOLEAN DEFAULT true,       -- vs system template
  usage_count INTEGER DEFAULT 0,        -- How many plays use this
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(playbook_id, name)
);

-- Index for quick lookups
CREATE INDEX idx_formations_playbook ON formations(playbook_id);
CREATE INDEX idx_formations_personnel ON formations(personnel_id);
CREATE INDEX idx_formations_base ON formations(base_formation_id);
```

### Updated Table: `plays`

```sql
ALTER TABLE plays 
  ADD COLUMN formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
  ADD COLUMN formation_direction TEXT CHECK (formation_direction IN ('base', 'left', 'right'));

-- Keep formation TEXT field for backwards compatibility, but eventually deprecate
-- CREATE INDEX for new formation_id
CREATE INDEX idx_plays_formation ON plays(formation_id);
```

### Player Position JSONB Structure

```typescript
interface FormationPlayerPosition {
  position: string;      // "X", "Y", "Z", "H", "F", "Q", "C", "G", "T", etc.
  x: number;            // Field X coordinate
  y: number;            // Field Y coordinate  
  label?: string;       // Personnel label: "Blue", "Black", "Green"
  isStrengthSetter?: boolean;  // TRUE for the player that sets formation strength
  role?: string;        // "WR", "TE", "RB", "QB", "OL"
}

// Example:
{
  "players": [
    {"position": "X", "x": 5, "y": 25, "label": "Blue", "isStrengthSetter": true, "role": "WR"},
    {"position": "Y", "x": 10, "y": 25, "label": "Black", "role": "WR"},
    {"position": "Z", "x": 45, "y": 25, "label": "Green", "role": "WR"},
    {"position": "H", "x": 30, "y": 22, "role": "RB"},
    {"position": "Q", "x": 26.6, "y": 18, "role": "QB"}
    // ... offensive line positions
  ]
}
```

---

## 🏗️ Implementation Phases

### Phase 1: Database Setup ✅ (Week 1)

**Goal:** Create formations table and relationships

1. **Migration File:** `20251012_create_formations_table.sql`
   ```sql
   -- Create formations table
   -- Add formation_id to plays table
   -- Create indexes
   ```

2. **Update TypeScript Types:**
   - `src/types/formation.ts` - New Formation interface
   - `src/types/play.ts` - Add formation_id, formation_direction fields

3. **Verify Schema:**
   - Run migration in Supabase
   - Test relationships work

---

### Phase 2: Formation Service Layer (Week 1-2)

**Goal:** CRUD operations for formations

**File:** `src/services/formationService.ts`

```typescript
export class FormationService {
  // Create
  async createFormation(data: FormationCreate): Promise<Formation>
  async createLeftVariant(baseFormationId: string): Promise<Formation>  // Flip positions
  async createRightVariant(baseFormationId: string): Promise<Formation> // Flip positions
  
  // Read
  async getFormationsByPlaybook(playbookId: string): Promise<Formation[]>
  async getFormationById(id: string): Promise<Formation>
  async getFormationVariants(baseFormationId: string): Promise<Formation[]>
  
  // Update
  async updateFormation(id: string, updates: FormationUpdate): Promise<Formation>
  async updatePlayerPositions(id: string, positions: FormationPlayerPosition[]): Promise<Formation>
  async setStrengthPlayer(id: string, position: string): Promise<Formation>
  
  // Delete
  async deleteFormation(id: string): Promise<void>
  
  // Utilities
  async duplicateFormation(id: string, newName: string): Promise<Formation>
  async flipFormation(positions: FormationPlayerPosition[]): FormationPlayerPosition[]
  async linkToPersonnel(formationId: string, personnelId: string): Promise<Formation>
}
```

---

### Phase 3: Formation Builder UI (Week 2-3)

**Goal:** Visual formation creator modal

**Component:** `src/components/playbook/FormationBuilderModal.tsx`

#### Features:
1. **Canvas View:**
   - Football field with player positioning
   - Drag-and-drop player placement
   - Snap to grid for alignment

2. **Personnel Integration:**
   - Dropdown to select personnel (Blue, Black, Green)
   - Shows player labels from personnel config
   - Auto-assigns colors based on personnel

3. **Strength Selector:**
   - Click any player to set as "strength setter"
   - Visual indicator (star icon, different color)
   - Explains how other players align relative to this

4. **Left/Right Variants:**
   - Toggle: "Create Left Variant" / "Create Right Variant"
   - Preview both sides simultaneously
   - Auto-flip button

5. **Save Options:**
   - Formation name input
   - Category selector (Spread, Pro, Power, Special)
   - Tags input (compressed, unbalanced, etc.)
   - "Save & Create Variants" button

#### UI Layout:
```
┌─────────────────────────────────────────┐
│ Formation Builder             [Close]   │
├─────────────────────────────────────────┤
│                                         │
│  [Personnel: Blue ▼]  [Category ▼]     │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │     🏈 Football Field Canvas    │  │
│  │                                  │  │
│  │     👤 👤 👤   Drag Players     │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Strength Setter: [Blue (X) ▼]         │
│  Tags: [twins][compressed] +           │
│                                         │
│  ☐ Create Left Variant                 │
│  ☐ Create Right Variant                │
│                                         │
│  [Cancel]  [Save Formation]            │
└─────────────────────────────────────────┘
```

---

### Phase 4: Play Integration (Week 3)

**Goal:** Link plays to formations

1. **Update AddNewPlayModal:**
   - Replace formation text input with formation selector
   - Show formation preview thumbnail
   - Direction dropdown (Base/Left/Right)

2. **Update PlaysService:**
   - Save formation_id instead of just formation string
   - Save formation_direction

3. **Update PlayCard:**
   - Display formation badge with direction
   - Link to view/edit formation

---

### Phase 5: Duplicate + Flip (Week 4)

**Goal:** Quick play duplication with formation flip

**Feature:** Duplicate Play Button

```typescript
async duplicatePlay(playId: string, options: {
  flipFormation?: boolean;  // TRUE = flip to opposite direction
  newName?: string;
}): Promise<Play> {
  // 1. Copy play data
  // 2. If flipFormation, change formation_direction (base→left, left→right, etc.)
  // 3. If has diagram_data, flip player positions
  // 4. Save new play
}
```

**UI:**
- Add "Duplicate" button to PlayCard
- Modal: "Duplicate to Left" / "Duplicate to Right" / "Duplicate Same"
- Preview shows flipped formation

---

## 🔗 Data Relationships Flow

```
Personnel Config (Blue/Black/Green)
        ↓
    Formation (Twins Same - Base)
        ↓
    ├─ Formation (Twins Same - Left)
    └─ Formation (Twins Same - Right)
        ↓
    Play (Twins Same Power - Left)
        ↓
    Diagram Data (player positions flipped)
```

---

## 📋 Migration Checklist

### Existing Data Migration:
1. **Extract formations from existing plays:**
   - Query: `SELECT DISTINCT formation FROM plays`
   - Result: "Twins Same", "Trips"

2. **Create formation records:**
   - Twins Same (Base, Left, Right)
   - Trips (Base, Left, Right)

3. **Update plays to reference formation_id:**
   - Match by formation name
   - Set appropriate direction

4. **Link to personnel:**
   - User manually assigns personnel to each formation
   - Or auto-assign based on play personnel field

---

## 🎨 UI Components Needed

1. **FormationBuilderModal** - Main builder interface
2. **FormationSelector** - Dropdown for AddNewPlayModal
3. **FormationPreview** - Thumbnail view of formation
4. **FormationLibrary** - Grid view of all formations
5. **FormationCard** - Card in library grid
6. **PlayerPositionEditor** - Drag-and-drop canvas
7. **StrengthIndicator** - Visual marker for strength player

---

## 🧪 Testing Plan

### Unit Tests:
- [ ] FormationService.createFormation()
- [ ] FormationService.flipFormation()
- [ ] FormationService.createLeftVariant()
- [ ] Integration between formations and plays
- [ ] Personnel linkage

### Integration Tests:
- [ ] Create formation → Link to personnel → Use in play
- [ ] Duplicate play + flip formation
- [ ] Update formation → Reflects in all plays using it

### User Acceptance:
- [ ] Create "Twins Same" formation with Blue personnel
- [ ] Add Left/Right variants
- [ ] Create play using formation
- [ ] Duplicate play and flip to opposite side
- [ ] Verify diagram flips correctly

---

## 📈 Success Metrics

1. **All formations stored in database** (not templates)
2. **Personnel properly linked** (Blue/Black/Green referenced)
3. **Left/Right variants work** (flip formations)
4. **Plays reference formation_id** (not just string)
5. **Duplicate + Flip works** (expedite play creation)
6. **Strength player tagged** (helps alignment logic)

---

## 🚀 Next Steps

**IMMEDIATE:**
1. Create database migration (`20251012_create_formations_table.sql`)
2. Create TypeScript types (`src/types/formation.ts`)
3. Build FormationService (`src/services/formationService.ts`)

**Week 1 Goal:**
- Database ready
- Service layer working
- Can CRUD formations via code

**Week 2 Goal:**
- FormationBuilderModal UI built
- Can create formations visually
- Personnel integration working

**Week 3 Goal:**
- Plays use formation_id
- AddNewPlayModal updated
- Duplicate + Flip working

---

## 💡 Key Design Decisions

1. **Formation Variants = Separate Records**
   - Base, Left, Right are separate rows
   - Linked via base_formation_id
   - Easier to query and display

2. **Personnel Reference by ID**
   - Denormalize name for performance
   - But keep ID for relationship integrity

3. **Strength Player = Position String**
   - Store "X", "Y", "Z", etc.
   - Lookup actual player data from personnel config

4. **Player Positions = JSONB**
   - Flexible for different personnel groupings
   - Easy to flip/transform coordinates

5. **Backwards Compatibility**
   - Keep formation TEXT field on plays
   - Gradually migrate to formation_id
   - Old plays still work

---

**READY TO START?** Let me know and I'll create:
1. The migration SQL file
2. TypeScript types
3. FormationService skeleton

