# Formation Direction Workflow Design

**Date**: October 16, 2025  
**Status**: 🎯 Design Proposal  
**Purpose**: Systematic approach to formation direction, metadata sharing, and strength flipping

---

## 🎯 The Problem

### Current Issues

1. **"Base" formations are hidden but may have shared metadata**
   - Base formation exists but isn't user-facing
   - Left/Right variants should share some metadata (personnel, type)
   - Other metadata should be flipped (run_strength, pass_strength)

2. **Direction is implied in some formations**
   - "Trips Left" has direction in name AND `direction` field
   - "Spread East" has direction in name but no variant system
   - "Empty" has no direction at all

3. **Metadata sharing is unclear**
   - What gets shared? Personnel, category, type?
   - What gets flipped? Strengths, player positions?
   - What's independent? Description, tags?

4. **Formation creation workflow is confusing**
   - Should user create base first, then variants?
   - Should user create left/right independently, then link?
   - What happens when linking formations with different metadata?

---

## 📊 Formation Direction Types (3 Types)

### Type 1: Mirror Variants (Most Common)

**Examples**: Trips, Twins, Bunch, Ace  
**Pattern**: One logical formation with left/right physical variants

```
Trips (logical concept)
├── Trips Left  (direction: "left",  base_formation_id: base_id)
└── Trips Right (direction: "right", base_formation_id: base_id)
```

**Characteristics**:

- Same name for all variants
- Direction applied via `direction` field
- Player positions are horizontally flipped
- Run/Pass strengths are flipped
- Personnel, category, type are SHARED

### Type 2: Built-In Direction (Less Common)

**Examples**: Spread East/West, Ace Rip/Liz, Brown/Trey  
**Pattern**: Direction is part of the formation's identity/name

```
Spread East (base, direction: "base", directionality_type: "built-in")
Spread West (base, direction: "base", directionality_type: "built-in")
```

**Characteristics**:

- Different names
- Each is its own base formation
- No variant linking needed
- All metadata is independent

### Type 3: Symmetric (Occasional)

**Examples**: Empty, 4-Wide Stack, Balanced  
**Pattern**: Formation is symmetric or direction doesn't matter

```
Empty (base, direction: "base", directionality_type: "symmetric")
```

**Characteristics**:

- Single formation
- No variants needed
- All metadata is independent

---

## 🏗️ Data Model: Metadata Sharing Rules

### Shared Metadata (Left ← → Right)

These fields should be **identical** across all variants:

```typescript
// SHARED: Same for Left and Right variants
{
  playbook_id: string;           // Same playbook
  name: string;                  // "Trips" (not "Trips Left")
  personnel_id: string;          // Same personnel package
  personnel_name: string;        // "11 Personnel"
  personnel_packages: string[];  // Same packages
  category: FormationCategory;   // "spread", "pro", etc.
  formation_type: FormationType; // "Shotgun", "Singleback", etc.
  directionality_type: "mirror"; // Always "mirror" for variants
  is_custom: boolean;            // Same custom flag
}
```

### Flipped Metadata (Left ↔ Right)

These fields should be **mirrored** when creating variants:

```typescript
// FLIPPED: Opposite for Left vs Right
{
  direction: "left" | "right";           // Left vs Right
  player_positions: FormationPlayerPosition[]; // X coords flipped
  run_strength: "left" ↔ "right";        // Flipped
  pass_strength: "left" ↔ "right";       // Flipped
  strength_player_position: string;      // Potentially flipped (X vs Z)
  strength_player_label: string;         // May be flipped
}
```

### Independent Metadata (Left ≠ Right)

These fields can be **different** for each variant:

```typescript
// INDEPENDENT: Can differ
{
  id: string;                    // Unique ID
  description: string;           // Can be customized per variant
  tags: string[];                // Can be customized per variant
  usage_count: number;           // Tracked independently
  created_at: Date;              // Different timestamps
  updated_at: Date;              // Different timestamps
  creation_source: string;       // May differ
  creation_context: object;      // May differ
  metadata_completeness: number; // May differ
  metadata_quality: string;      // May differ
}
```

---

## 🔄 Strength Flipping Logic

### Current Behavior (NEEDS FIX)

```typescript
// ❌ PROBLEM: Strengths are NOT flipped
static async createLeftVariant(baseFormationId: string): Promise<Formation> {
  const baseFormation = await this.getFormationById(baseFormationId);
  const flippedPositions = this.flipPositions(baseFormation.player_positions);

  return this.createFormation({
    // ... other fields ...
    run_strength: baseFormation.run_strength,  // ❌ NOT FLIPPED!
    pass_strength: baseFormation.pass_strength, // ❌ NOT FLIPPED!
  });
}
```

### Proposed Fix

```typescript
// ✅ NEW: Flip strengths when creating variants
static flipStrength(strength: StrengthType): StrengthType {
  if (strength === "left") return "right";
  if (strength === "right") return "left";
  return "balanced"; // Balanced stays balanced
}

static async createLeftVariant(baseFormationId: string): Promise<Formation> {
  const baseFormation = await this.getFormationById(baseFormationId);
  const flippedPositions = this.flipPositions(baseFormation.player_positions);

  return this.createFormation({
    // ... shared metadata ...
    playbook_id: baseFormation.playbook_id,
    name: baseFormation.name, // ✅ Same name
    personnel_id: baseFormation.personnel_id,
    category: baseFormation.category,
    formation_type: baseFormation.formation_type,

    // ✅ FLIPPED metadata
    direction: "left",
    player_positions: flippedPositions,
    run_strength: this.flipStrength(baseFormation.run_strength),   // ✅ FLIPPED
    pass_strength: this.flipStrength(baseFormation.pass_strength), // ✅ FLIPPED

    // ✅ INDEPENDENT metadata
    description: `Left variant of ${baseFormation.name}`,
    tags: [...baseFormation.tags], // Copy but allow customization
  });
}
```

---

## 🎨 User Workflows

### Workflow 1: Create Mirror Formation (Type 1)

**Goal**: Create "Trips Left" and "Trips Right"

#### Step 1: Draw Base Formation

1. User opens **Formation Builder → Draw Formation** tab
2. Clicks **"New Formation"** button
3. Enters name: `"Trips"`
4. Selects personnel: `"11 Personnel"`
5. Selects directionality: `"mirror"` (has left/right variants)
6. Draws player positions on LEFT side of field
7. Clicks **"Save"**

**Result**:

```typescript
{
  id: "abc-123",
  name: "Trips",
  direction: "base", // Hidden base formation
  directionality_type: "mirror",
  personnel_id: "11-personnel-id",
  run_strength: "left",  // Based on drawing
  pass_strength: "left", // Based on drawing
  player_positions: [/* Left side positions */],
}
```

#### Step 2: System Auto-Creates Variants

System automatically creates:

**Left Variant** (make base → left):

```typescript
{
  id: "abc-123", // Same ID, becomes left variant
  name: "Trips",
  direction: "left",
  base_formation_id: null, // This IS the base
  personnel_id: "11-personnel-id", // ✅ SHARED
  run_strength: "left",   // ✅ SAME (already left)
  pass_strength: "left",  // ✅ SAME
  player_positions: [/* Left side positions */],
}
```

**Right Variant** (new record):

```typescript
{
  id: "def-456", // New ID
  name: "Trips",
  direction: "right",
  base_formation_id: "abc-123", // Points to left as base
  personnel_id: "11-personnel-id", // ✅ SHARED
  run_strength: "right",  // ✅ FLIPPED
  pass_strength: "right", // ✅ FLIPPED
  player_positions: [/* Right side positions (flipped X) */],
}
```

#### Step 3: User Sees Both Variants

In Formation Library:

```
Trips
├── ◀ Left  (3 plays) [Edit] [Delete]
└── ▶ Right (5 plays) [Edit] [Delete]
```

---

### Workflow 2: Create Built-In Direction (Type 2)

**Goal**: Create "Spread East" and "Spread West"

#### Step 1: Create East Formation

1. User opens **Formation Builder → Draw Formation** tab
2. Enters name: `"Spread East"`
3. Selects directionality: `"built-in"` (direction in name)
4. Draws player positions
5. Clicks **"Save"**

**Result**:

```typescript
{
  id: "east-123",
  name: "Spread East",
  direction: "base",
  directionality_type: "built-in",
  personnel_id: "11-personnel-id",
  run_strength: "right",
}
```

#### Step 2: Create West Formation (Separate)

1. User creates another formation
2. Enters name: `"Spread West"`
3. Selects directionality: `"built-in"`
4. Draws player positions
5. Clicks **"Save"**

**Result**:

```typescript
{
  id: "west-456",
  name: "Spread West",
  direction: "base",
  directionality_type: "built-in",
  personnel_id: "11-personnel-id",
  run_strength: "left",
}
```

**No linking needed** - These are independent formations.

---

### Workflow 3: Link Existing Formations

**Goal**: Link two existing formations as left/right variants

#### Before Linking

```typescript
Formation A: { id: "a", name: "Trips Right", direction: "base" }
Formation B: { id: "b", name: "Trips Left",  direction: "base" }
```

#### Link Process

1. User opens **Formation Builder → Link Formations** tab
2. Selects:
   - Left: "Trips Left"
   - Right: "Trips Right"
3. System shows **confirmation modal**:

   ```
   ⚠️ Linking Confirmation

   This will:
   ✓ Rename both to "Trips" (remove Left/Right from names)
   ✓ Set left variant: direction="left", base_formation_id=null
   ✓ Set right variant: direction="right", base_formation_id=left_id
   ✓ Copy personnel packages to both
   ✓ Validate metadata matches

   Metadata Comparison:
   Personnel: "11" ✓ Match
   Run Strength: Left="left", Right="right" ✓ Flipped (correct)
   Pass Strength: Left="left", Right="balanced" ⚠️ Different

   [Cancel] [Link Anyway]
   ```

4. User clicks **"Link Anyway"**

#### After Linking

```typescript
Formation A (Left):
{
  id: "a",
  name: "Trips", // ✅ Cleaned
  direction: "left",
  base_formation_id: null, // Base
  personnel_id: "11",
  run_strength: "left",
}

Formation B (Right):
{
  id: "b",
  name: "Trips", // ✅ Cleaned
  direction: "right",
  base_formation_id: "a", // Points to left
  personnel_id: "11",
  run_strength: "right",
}
```

---

## 🗄️ Database Schema Updates

### Add Directionality Type (Already Exists)

```sql
-- ✅ Already in database
ALTER TABLE formations
  ADD COLUMN directionality_type TEXT
    CHECK (directionality_type IN ('mirror', 'built-in', 'symmetric', 'unspecified'))
    DEFAULT 'unspecified';
```

### Update Formation Validation Trigger

```sql
-- NEW: Validate metadata consistency for variants
CREATE OR REPLACE FUNCTION validate_formation_variants()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a variant (has base_formation_id)
  IF NEW.base_formation_id IS NOT NULL THEN
    -- Get base formation
    SELECT INTO base_formation * FROM formations WHERE id = NEW.base_formation_id;

    -- Validate shared metadata matches
    IF NEW.personnel_id != base_formation.personnel_id THEN
      RAISE WARNING 'Variant personnel_id (%) differs from base (%)',
        NEW.personnel_id, base_formation.personnel_id;
    END IF;

    IF NEW.category != base_formation.category THEN
      RAISE WARNING 'Variant category (%) differs from base (%)',
        NEW.category, base_formation.category;
    END IF;

    -- ✅ ALLOW flipped strengths (left ↔ right)
    -- This is correct behavior for variants
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_formation_variants_trigger
  BEFORE INSERT OR UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION validate_formation_variants();
```

---

## 🎯 Implementation Checklist

### Phase 1: Core Strength Flipping ✅ PRIORITY

- [ ] Add `flipStrength()` utility function to `FormationService`
- [ ] Update `createLeftVariant()` to flip strengths
- [ ] Update `createRightVariant()` to flip strengths
- [ ] Update `linkFormations()` to validate/flip strengths
- [ ] Write unit tests for strength flipping

**File**: `src/services/formationService.ts`

```typescript
// Add new utility
static flipStrength(strength: StrengthType): StrengthType {
  switch (strength) {
    case "left": return "right";
    case "right": return "left";
    case "balanced": return "balanced";
    default: return "balanced";
  }
}
```

### Phase 2: Metadata Sharing Documentation

- [ ] Create `FORMATION_METADATA_GUIDE.md`
- [ ] Document shared vs flipped vs independent fields
- [ ] Add inline comments to Formation interface
- [ ] Update FormationBuilderPanel to show metadata sharing

### Phase 3: UI Enhancements

- [ ] Add "Directionality Type" selector to FormationBuilderPanel
- [ ] Show metadata comparison in LinkFormationsTab
- [ ] Add validation warnings when linking mismatched formations
- [ ] Update FormationBadge to show directionality type

### Phase 4: Validation & Testing

- [ ] Add database trigger for variant validation
- [ ] Add backend validation in FormationService
- [ ] Write integration tests for variant creation
- [ ] Test all three formation types (mirror, built-in, symmetric)

---

## 📋 Metadata Reference Table

| Field                      | Mirror Variants | Built-In Dir | Symmetric   | Notes                    |
| -------------------------- | --------------- | ------------ | ----------- | ------------------------ |
| `id`                       | Different       | N/A          | N/A         | Unique IDs               |
| `name`                     | **SAME**        | Different    | N/A         | "Trips" not "Trips Left" |
| `direction`                | **DIFFERENT**   | "base"       | "base"      | left/right/base          |
| `base_formation_id`        | Points to base  | null         | null        | Variant linking          |
| `directionality_type`      | "mirror"        | "built-in"   | "symmetric" | How direction works      |
| `personnel_id`             | **SAME**        | Different    | N/A         | Shared personnel         |
| `personnel_name`           | **SAME**        | Different    | N/A         | "11", "12", etc.         |
| `personnel_packages`       | **SAME**        | Different    | N/A         | Array of IDs             |
| `category`                 | **SAME**        | Different    | N/A         | "spread", "pro"          |
| `formation_type`           | **SAME**        | Different    | N/A         | "Shotgun", etc.          |
| `run_strength`             | **FLIPPED**     | Different    | N/A         | left ↔ right            |
| `pass_strength`            | **FLIPPED**     | Different    | N/A         | left ↔ right            |
| `player_positions`         | **FLIPPED**     | Different    | N/A         | X coords flipped         |
| `strength_player_position` | May flip        | Different    | N/A         | "X" vs "Z"               |
| `description`              | Can differ      | Different    | N/A         | Independent              |
| `tags`                     | Can differ      | Different    | N/A         | Independent              |
| `usage_count`              | Different       | Different    | N/A         | Tracked per variant      |
| `is_custom`                | **SAME**        | Different    | N/A         | Shared flag              |

---

## 🎨 Visual Diagram: Formation Relationships

```
MIRROR VARIANTS (directionality_type: "mirror")
┌─────────────────────────────────────────────────────────┐
│ Logical Concept: "Trips"                                │
│ ┌─────────────────────┐  ┌──────────────────────┐      │
│ │ Trips Left          │  │ Trips Right          │      │
│ │ direction: "left"   │  │ direction: "right"   │      │
│ │ base_id: null       │  │ base_id: left_id     │      │
│ │ run_strength: LEFT  │  │ run_strength: RIGHT  │  ✅  │
│ │ personnel: "11"     │  │ personnel: "11"      │  ✅  │
│ │ category: "spread"  │  │ category: "spread"   │  ✅  │
│ └─────────────────────┘  └──────────────────────┘      │
│ ▲ SHARED: personnel, category, name                    │
│ ◀▶ FLIPPED: strength, positions                        │
└─────────────────────────────────────────────────────────┘

BUILT-IN DIRECTION (directionality_type: "built-in")
┌─────────────────────────────────────────────────────────┐
│ Independent Formations                                  │
│ ┌─────────────────────┐  ┌──────────────────────┐      │
│ │ Spread East         │  │ Spread West          │      │
│ │ direction: "base"   │  │ direction: "base"    │      │
│ │ base_id: null       │  │ base_id: null        │      │
│ │ run_strength: RIGHT │  │ run_strength: LEFT   │      │
│ │ personnel: "11"     │  │ personnel: "11"      │      │
│ └─────────────────────┘  └──────────────────────┘      │
│ ❌ NOT LINKED - Separate formations                    │
└─────────────────────────────────────────────────────────┘

SYMMETRIC (directionality_type: "symmetric")
┌─────────────────────────────────────────────────────────┐
│ Single Formation                                        │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Empty                                           │    │
│ │ direction: "base"                               │    │
│ │ base_id: null                                   │    │
│ │ run_strength: "balanced"                        │    │
│ │ personnel: "10" (empty backfield)               │    │
│ └─────────────────────────────────────────────────┘    │
│ ❌ NO VARIANTS NEEDED                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

1. **Immediate**: Implement `flipStrength()` utility
2. **Short-term**: Update variant creation methods
3. **Medium-term**: Add UI for directionality type selection
4. **Long-term**: Add database validation trigger

**Start with Phase 1** - This fixes the critical bug where strengths aren't flipped!
