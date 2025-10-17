# Formation Direction System - Visual Guide

## 📊 The Three Formation Types

### 🔄 Type 1: Mirror Variants (Most Common)

```
Example: "Trips"

User Creates:                  System Creates:
┌──────────────┐              ┌──────────────┐  ┌──────────────┐
│   Base       │              │  Left        │  │  Right       │
│   Drawing    │    ──────>   │  Variant     │  │  Variant     │
│              │              │              │  │              │
│   ○○○        │              │  ○○○         │  │         ○○○  │
│   ╶─┴─╴      │              │  ╶─┴─╴       │  │       ╶─┴─╴  │
│  ○   ○   ○   │              │ ○   ○   ○    │  │    ○   ○   ○ │
└──────────────┘              └──────────────┘  └──────────────┘
direction: base               direction: left    direction: right
base_id: null                 base_id: null      base_id: left_id
run_strength: left            run_strength: left run_strength: RIGHT ✅
```

**Metadata Inheritance:**

- ✅ **SHARED**: name, personnel, category, formation_type
- ↔️ **FLIPPED**: run_strength, pass_strength, player X coords
- 🆔 **UNIQUE**: id, description, usage_count

---

### 🧭 Type 2: Built-In Direction

```
Example: "Spread East" vs "Spread West"

User Creates East:            User Creates West:
┌──────────────┐              ┌──────────────┐
│ Spread East  │              │ Spread West  │
│              │              │              │
│    ○  ○      │              │      ○  ○    │
│   ╶─┴─╴      │              │     ╶─┴─╴    │
│ ○   ○   ○  ○ │              │ ○  ○   ○   ○ │
└──────────────┘              └──────────────┘
direction: base               direction: base
base_id: null                 base_id: null
directionality: built-in      directionality: built-in

❌ NO LINKING - These are separate formations
```

**Metadata Inheritance:**

- ❌ **INDEPENDENT**: All fields are separate
- ℹ️ Direction is in the NAME, not the variant system

---

### ⚖️ Type 3: Symmetric

```
Example: "Empty"

User Creates:
┌──────────────┐
│    Empty     │
│              │
│  ○  ○    ○  │
│    ╶─┴─╴     │
│  ○         ○ │
└──────────────┘
direction: base
base_id: null
directionality: symmetric

❌ NO VARIANTS NEEDED - Formation is symmetric
```

---

## 🔀 Metadata Flow Diagram

### Mirror Variant Creation Flow

```
User Draws Formation (Left Side)
           │
           ▼
    ┌──────────────────────────┐
    │ System Creates Base      │
    │ - direction: "base"      │
    │ - run_strength: "left"   │
    │ - personnel_id: "11"     │
    │ - category: "spread"     │
    └──────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────┐
    │ Auto-Create Left & Right Variants        │
    └──────────────────────────────────────────┘
           │
           ├─────────────────┬──────────────────┐
           ▼                 ▼                  ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Base → Left │   │ Create Right│   │             │
    │ direction:  │   │ direction:  │   │             │
    │   "left"    │   │   "right"   │   │             │
    │ base_id:    │   │ base_id:    │   │             │
    │   null      │   │   left_id   │   │             │
    └─────────────┘   └─────────────┘   └─────────────┘
           │                 │
           │                 │
           ▼                 ▼
    ┌─────────────────────────────────────────┐
    │ Copy SHARED Metadata:                   │
    │ ✓ personnel_id      (same)              │
    │ ✓ category          (same)              │
    │ ✓ formation_type    (same)              │
    │ ✓ name              (same - "Trips")    │
    └─────────────────────────────────────────┘
           │                 │
           ▼                 ▼
    ┌─────────────────────────────────────────┐
    │ FLIP Directional Metadata:              │
    │ ↔️ run_strength     (left ↔ right)      │
    │ ↔️ pass_strength    (left ↔ right)      │
    │ ↔️ player X coords  (flip across field) │
    └─────────────────────────────────────────┘
           │                 │
           ▼                 ▼
    ┌─────────────────────────────────────────┐
    │ Result: Linked Variants                 │
    │ - Same personnel, category, type        │
    │ - Opposite strengths                    │
    │ - Mirrored positions                    │
    └─────────────────────────────────────────┘
```

---

## 🎯 Strength Flipping Logic

### Current Bug ❌

```typescript
// BEFORE (incorrect)
createLeftVariant(base) {
  return {
    run_strength: base.run_strength,   // ❌ NOT FLIPPED
    pass_strength: base.pass_strength, // ❌ NOT FLIPPED
  }
}
```

**Problem**: If base has `run_strength: "left"`, left variant also gets "left"!

### Fixed Implementation ✅

```typescript
// AFTER (correct)
flipStrength(strength: StrengthType): StrengthType {
  if (strength === "left") return "right";
  if (strength === "right") return "left";
  return "balanced"; // Balanced stays balanced
}

createLeftVariant(base) {
  return {
    run_strength: flipStrength(base.run_strength),   // ✅ FLIPPED
    pass_strength: flipStrength(base.pass_strength), // ✅ FLIPPED
  }
}
```

**Result**: If base has `run_strength: "left"`, right variant gets "right" ✅

---

## 🗄️ Database Relationships

### Mirror Variants (Linked)

```sql
-- Left Variant (Base)
{
  id: 'abc-123',
  name: 'Trips',
  direction: 'left',
  base_formation_id: null,          -- This IS the base
  personnel_id: '11-personnel',
  run_strength: 'left',
  player_positions: [{x: 10, ...}]  -- Left side
}

-- Right Variant (Child)
{
  id: 'def-456',
  name: 'Trips',
  direction: 'right',
  base_formation_id: 'abc-123',     -- Points to left
  personnel_id: '11-personnel',     -- ✅ SAME
  run_strength: 'right',            -- ✅ FLIPPED
  player_positions: [{x: 43.3, ...}] -- Right side (FLIPPED X)
}
```

**Query All Variants:**

```sql
SELECT * FROM formations
WHERE id = 'abc-123'
   OR base_formation_id = 'abc-123'
ORDER BY direction;
-- Returns: Left, Right
```

### Built-In Direction (Independent)

```sql
-- Spread East (Independent)
{
  id: 'east-123',
  name: 'Spread East',
  direction: 'base',
  base_formation_id: null,
  directionality_type: 'built-in'
}

-- Spread West (Independent)
{
  id: 'west-456',
  name: 'Spread West',
  direction: 'base',
  base_formation_id: null,
  directionality_type: 'built-in'
}
```

**Query**: Each query returns one formation (no linking)

---

## 🎨 UI Visualization

### Formation Library Display

```
┌────────────────────────────────────────────────┐
│ Formation Library                              │
├────────────────────────────────────────────────┤
│                                                │
│ 🔄 Trips (Mirror)                              │
│    ├── ◀ Left  (5 plays) [Edit] [Delete]      │
│    └── ▶ Right (3 plays) [Edit] [Delete]      │
│                                                │
│ 🧭 Spread East (Built-In)                     │
│    └── 📍 (8 plays) [Edit] [Delete]           │
│                                                │
│ 🧭 Spread West (Built-In)                     │
│    └── 📍 (6 plays) [Edit] [Delete]           │
│                                                │
│ ⚖️  Empty (Symmetric)                          │
│    └── ⚖️  (12 plays) [Edit] [Delete]         │
│                                                │
└────────────────────────────────────────────────┘
```

### Formation Selector in Play Builder

```
┌────────────────────────────────────────────────┐
│ Select Formation:                              │
├────────────────────────────────────────────────┤
│                                                │
│ [ Trips ▼ ]  [◀ Left]  [▶ Right]              │
│                                                │
│ [ Spread East ▼ ]                             │
│   (No direction buttons - built-in)           │
│                                                │
│ [ Empty ▼ ]                                   │
│   (No direction buttons - symmetric)          │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 🔍 Metadata Comparison Tool

### Link Formations Confirmation Modal

```
┌────────────────────────────────────────────────┐
│ Link Formation Variants                        │
├────────────────────────────────────────────────┤
│                                                │
│ Left: Trips Left                               │
│ Right: Trips Right                             │
│                                                │
│ Metadata Validation:                           │
│                                                │
│ ✅ Personnel:        11 ↔ 11                   │
│ ✅ Category:         spread ↔ spread           │
│ ✅ Formation Type:   Shotgun ↔ Shotgun         │
│ ✅ Run Strength:     left ↔ right (Flipped)    │
│ ⚠️  Pass Strength:   left ↔ balanced (Diff)    │
│                                                │
│ ⚠️  Warning: Pass strengths differ             │
│    This may indicate different formations      │
│                                                │
│ [Cancel]  [Link Anyway]                        │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 📋 Formation Creation Decision Tree

```
User wants to create a formation
           │
           ▼
    Does formation have
    left/right variants?
           │
      ┌────┴────┐
      │         │
     YES        NO
      │         │
      ▼         ▼
Is direction   Is formation
in the name?   symmetric?
      │            │
  ┌───┴───┐    ┌───┴───┐
  │       │    │       │
 YES     NO   YES     NO
  │       │    │       │
  ▼       ▼    ▼       ▼
Built-In Mirror Symmetric  ???
Direction Type  Type     (Error)
  │       │      │
  ▼       ▼      ▼
Create  Create  Create
separate base,  single
formations auto- base
          create
          variants
```

**Examples by Type:**

- **Mirror**: Trips, Twins, Bunch, Ace → Auto-create left/right
- **Built-In**: East/West, Rip/Liz → Create separately, no linking
- **Symmetric**: Empty, Stack, Balanced → Single formation, no variants

---

## 🛠️ Implementation Priority

### Phase 1: Critical Fixes (Do First) 🔥

```typescript
// File: src/services/formationService.ts

// 1. Add strength flipping utility
static flipStrength(strength: StrengthType): StrengthType {
  switch (strength) {
    case "left": return "right";
    case "right": return "left";
    case "balanced": return "balanced";
    default: return "balanced";
  }
}

// 2. Update createLeftVariant
static async createLeftVariant(baseFormationId: string): Promise<Formation> {
  const baseFormation = await this.getFormationById(baseFormationId);
  const flippedPositions = this.flipPositions(baseFormation.player_positions);

  return this.createFormation({
    // ... existing fields ...
    run_strength: this.flipStrength(baseFormation.run_strength),   // ✅ NEW
    pass_strength: this.flipStrength(baseFormation.pass_strength), // ✅ NEW
  });
}

// 3. Update createRightVariant (same changes)
```

### Phase 2: UI Improvements

- Add directionality type selector to FormationBuilderPanel
- Show metadata comparison in Link Formations tab
- Add visual indicators for formation types (🔄, 🧭, ⚖️)

### Phase 3: Database Validation

- Add trigger to validate variant metadata consistency
- Add warnings for mismatched metadata when linking

---

## 📖 Quick Reference

### Metadata Rules

| Metadata      | Mirror Variants | Built-In  | Symmetric |
| ------------- | --------------- | --------- | --------- |
| Name          | **SAME**        | Different | N/A       |
| Personnel     | **SAME**        | Different | N/A       |
| Category      | **SAME**        | Different | N/A       |
| Type          | **SAME**        | Different | N/A       |
| Run Strength  | **FLIPPED**     | Different | N/A       |
| Pass Strength | **FLIPPED**     | Different | N/A       |
| Positions     | **FLIPPED**     | Different | N/A       |
| Description   | Can differ      | Different | N/A       |
| Tags          | Can differ      | Different | N/A       |

### Formation Types Quick Check

```typescript
// How to determine formation type:
if (formation.directionality_type === "mirror") {
  // Has left/right variants
  // Show direction buttons
  // Flip strengths when creating variants
} else if (formation.directionality_type === "built-in") {
  // Direction in name
  // No variants needed
  // Each is independent
} else if (formation.directionality_type === "symmetric") {
  // No direction
  // Single formation
  // No variants
}
```

---

## 🚀 Next Steps

1. **Implement** `flipStrength()` utility function
2. **Update** variant creation to flip strengths
3. **Add** UI for directionality type selection
4. **Create** metadata comparison modal
5. **Add** database validation trigger
6. **Test** all three formation types

**Start Here**: `src/services/formationService.ts` - Add strength flipping!
