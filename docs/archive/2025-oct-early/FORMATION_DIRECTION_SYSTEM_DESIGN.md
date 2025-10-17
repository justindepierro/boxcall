# Formation Direction System Design

**Date**: October 14, 2025  
**Status**: 🎯 Design Proposal

## 🎯 Problem Statement

There are **three types of formations** with different directional needs:

### Type 1: Mirror Variants (Trips, Twins, Bunch)

- **Pattern**: Single base formation + LEFT/RIGHT mirror variants
- **Example**: "Trips" → "Trips Left" + "Trips Right"
- **Direction**: Applied via variant system (`direction: "left"|"right"`)
- **UI Need**: Show Left/Right selector buttons
- **Storage**: 3 database rows (base + left + right)

### Type 2: Directional Built-In (East/West, Rip/Liz)

- **Pattern**: Direction is part of the formation name/concept
- **Example**: "Spread East", "Spread West", "Ace Rip", "Ace Liz"
- **Direction**: Embedded in formation name
- **UI Need**: NO selector (already named)
- **Storage**: 1 database row per direction (each is its own formation)

### Type 3: Symmetric (Spread, Empty, Stack)

- **Pattern**: Formation is symmetric or direction doesn't matter
- **Example**: "Spread", "Empty", "4-Wide"
- **Direction**: Not applicable
- **UI Need**: NO selector
- **Storage**: 1 database row

## 🎨 Current System

### Database Structure (formations table)

```typescript
interface Formation {
  id: string;
  name: string; // "Trips", "Spread East", "Empty"
  direction: "base" | "left" | "right"; // Variant type
  base_formation_id: string | null; // Links variants to base
  // ... other fields
}
```

### Current Behavior

- **Type 1 (Mirror)**: Works via base_formation_id linkage
  - "Trips" (base, direction="base", base_formation_id=null)
  - "Trips" (variant, direction="left", base_formation_id=trips_base_id)
  - "Trips" (variant, direction="right", base_formation_id=trips_base_id)

- **Type 2 (Built-In)**: Stored as separate base formations
  - "Spread East" (base, direction="base", base_formation_id=null)
  - "Spread West" (base, direction="base", base_formation_id=null)
  - ⚠️ Problem: System tries to create LEFT/RIGHT variants!

- **Type 3 (Symmetric)**: Single base formation
  - "Empty" (base, direction="base", base_formation_id=null)
  - ⚠️ Problem: System might prompt for variants

## 💡 Proposed Solution

### Add Formation Directionality Type

Add a new field to track **how** the formation handles direction:

```typescript
/**
 * How a formation handles directional variations
 */
export type FormationDirectionalityType =
  | "mirror" // Has LEFT/RIGHT mirror variants (Trips, Twins, Bunch)
  | "built-in" // Direction is part of name (East/West, Rip/Liz)
  | "symmetric" // No direction needed (Empty, Spread)
  | "unspecified"; // Legacy: directionality not yet set

export interface Formation {
  // ... existing fields ...

  /**
   * How this formation handles directional variations
   * - "mirror": Has separate LEFT/RIGHT variants (Trips → Trips Left/Right)
   * - "built-in": Direction is in the name (Spread East, Spread West)
   * - "symmetric": No direction needed (Empty, Stack)
   * - "unspecified": Legacy formations without this metadata
   *
   * @default "unspecified"
   */
  directionality_type: FormationDirectionalityType;
}
```

### UI Logic

#### 1. Formation Selector (Play Creation)

```typescript
// Show formation with appropriate direction UI
function FormationSelectorItem({ formation }: Props) {
  // Only show Left/Right buttons for MIRROR formations with variants
  const showDirectionSelector =
    formation.directionality_type === "mirror" &&
    hasVariants(formation);

  return (
    <div>
      <span>{formation.name}</span>
      {showDirectionSelector && (
        <DirectionButtons
          leftId={formation.leftVariantId}
          rightId={formation.rightVariantId}
        />
      )}
    </div>
  );
}
```

**Result**:

- ✅ "Trips" → Shows [Left] [Right] buttons
- ✅ "Spread East" → Just the name (no buttons)
- ✅ "Empty" → Just the name (no buttons)

#### 2. Formation Builder (Formation Creation)

```typescript
function FormationBuilder() {
  return (
    <div>
      {/* Basic Info */}
      <Input name="name" label="Formation Name" />

      {/* Directionality Type */}
      <Select
        name="directionality_type"
        label="Directional Handling"
        options={[
          {
            value: "mirror",
            label: "Mirror Variants",
            description: "Create LEFT/RIGHT variants (Trips, Twins)"
          },
          {
            value: "built-in",
            label: "Direction Built-In",
            description: "Direction is part of name (East/West, Rip/Liz)"
          },
          {
            value: "symmetric",
            label: "Symmetric/No Direction",
            description: "Formation is same from either side (Empty, Stack)"
          }
        ]}
      />

      {/* Show variant creation UI only for MIRROR type */}
      {formData.directionality_type === "mirror" && (
        <VariantCreationPanel />
      )}

      {/* ... rest of form ... */}
    </div>
  );
}
```

**Result**:

- ✅ User selects directionality when creating formation
- ✅ System knows whether to create variants
- ✅ Clear metadata for future UI decisions

### Auto-Creation Logic

Update `FormationService.linkFormations()`:

```typescript
async linkFormations(
  baseFormationId: string,
  leftFormationId?: string,
  rightFormationId?: string
) {
  const baseFormation = await this.getFormation(baseFormationId);

  // 🔧 NEW: Only auto-create variants for MIRROR formations
  if (baseFormation.directionality_type !== "mirror") {
    console.log(
      `[FormationService] Skipping auto-create: ` +
      `${baseFormation.name} is ${baseFormation.directionality_type}, not mirror`
    );
    return;
  }

  // Existing auto-create logic (only runs for mirror formations)
  if (!leftFormationId && rightFormationId) {
    await this.createLeftVariant(baseFormationId);
  }
  if (!rightFormationId && leftFormationId) {
    await this.createRightVariant(baseFormationId);
  }
}
```

**Result**:

- ✅ "Trips" → Auto-creates missing LEFT/RIGHT ✅
- ✅ "Spread East" → No auto-creation ✅
- ✅ "Empty" → No auto-creation ✅

## 📊 Migration Strategy

### Option 1: Smart Detection (Automatic)

Infer `directionality_type` from existing data:

```typescript
function inferDirectionalityType(formation: Formation): FormationDirectionalityType {
  // Has variants? Must be mirror
  if (formation.base_formation_id !== null) {
    return "mirror";
  }

  // Is anyone's base? Must be mirror
  const hasVariants = await checkHasVariants(formation.id);
  if (hasVariants) {
    return "mirror";
  }

  // Name contains directional keywords? Built-in
  const builtInPatterns = [
    /east/i, /west/i,
    /rip/i, /liz/i,
    /strong/i, /weak/i,
    /open/i, /closed/i
  ];
  if (builtInPatterns.some(pattern => pattern.test(formation.name))) {
    return "built-in";
  }

  // Default: symmetric (safest assumption)
  return "symmetric";
}

// Migration SQL
UPDATE formations
SET directionality_type = CASE
  -- Formations with variants
  WHEN base_formation_id IS NOT NULL THEN 'mirror'

  -- Base formations that have variants
  WHEN id IN (
    SELECT DISTINCT base_formation_id
    FROM formations
    WHERE base_formation_id IS NOT NULL
  ) THEN 'mirror'

  -- Built-in directional keywords
  WHEN name ~* '(east|west|rip|liz|strong|weak|open|closed)' THEN 'built-in'

  -- Default to symmetric
  ELSE 'symmetric'
END
WHERE directionality_type IS NULL;
```

### Option 2: Manual Review UI

Create admin UI to review and set directionality:

```typescript
function FormationDirectionalityReview() {
  const formations = useFormations({ directionality_type: "unspecified" });

  return (
    <div>
      <h2>Review Formation Directionality ({formations.length} formations)</h2>
      {formations.map(formation => (
        <FormationReviewCard
          key={formation.id}
          formation={formation}
          onSetType={(type) => updateFormation(formation.id, { directionality_type: type })}
        />
      ))}
    </div>
  );
}
```

### Option 3: Hybrid Approach (Recommended)

1. **Auto-detect** obvious cases (has variants = mirror)
2. **Prompt user** for ambiguous cases on first use
3. **Default to symmetric** for legacy formations (safest)

## 🎯 Implementation Plan

### Phase 1: Database Schema ✅

- [ ] Add `directionality_type` column to formations table
- [ ] Set default: `"unspecified"`
- [ ] Add index if needed for filtering

### Phase 2: Type System ✅

- [ ] Add `FormationDirectionalityType` to types
- [ ] Update `Formation` interface
- [ ] Update `FormationCreate` interface

### Phase 3: Auto-Create Logic 🔧

- [ ] Update `linkFormations()` to check directionality_type
- [ ] Only auto-create for `"mirror"` formations
- [ ] Add logging for debugging

### Phase 4: Formation Selector UI 🎨

- [ ] Only show Left/Right buttons for mirror formations
- [ ] Show plain name for built-in/symmetric formations
- [ ] Update filtering logic

### Phase 5: Formation Builder UI 🎨

- [ ] Add directionality type selector
- [ ] Show variant creation UI conditionally
- [ ] Add helpful descriptions/examples

### Phase 6: Migration 📦

- [ ] Run smart detection migration
- [ ] Create review UI for ambiguous cases
- [ ] Test with real data

## 🧪 Testing Scenarios

### Scenario 1: Mirror Formation (Trips)

```typescript
{
  name: "Trips",
  directionality_type: "mirror",
  direction: "base"
}
```

**Expected**:

- ✅ Formation selector shows [Left] [Right] buttons
- ✅ Auto-creates missing variants when linking
- ✅ Base formation hidden when variants exist

### Scenario 2: Built-In Direction (Spread East)

```typescript
{
  name: "Spread East",
  directionality_type: "built-in",
  direction: "base"
}
```

**Expected**:

- ✅ Formation selector shows just "Spread East"
- ✅ NO Left/Right buttons
- ✅ NO auto-variant creation
- ✅ Shows in selector as-is

### Scenario 3: Symmetric (Empty)

```typescript
{
  name: "Empty",
  directionality_type: "symmetric",
  direction: "base"
}
```

**Expected**:

- ✅ Formation selector shows just "Empty"
- ✅ NO Left/Right buttons
- ✅ NO auto-variant creation
- ✅ Shows in selector as-is

### Scenario 4: Legacy Unspecified

```typescript
{
  name: "Wing T",
  directionality_type: "unspecified",
  direction: "base"
}
```

**Expected**:

- ✅ Formation selector shows name with warning icon
- ✅ Prompt user to set directionality on first use
- ✅ Default behavior: treat as symmetric (safest)

## 📝 Database Migration

```sql
-- Add directionality_type column
ALTER TABLE formations
ADD COLUMN directionality_type VARCHAR(20) DEFAULT 'unspecified'
CHECK (directionality_type IN ('mirror', 'built-in', 'symmetric', 'unspecified'));

-- Add index for filtering
CREATE INDEX idx_formations_directionality
ON formations(directionality_type);

-- Smart detection migration
UPDATE formations
SET directionality_type = CASE
  -- Formations with variants (definitely mirror)
  WHEN base_formation_id IS NOT NULL THEN 'mirror'

  -- Base formations that have variants (definitely mirror)
  WHEN id IN (
    SELECT DISTINCT base_formation_id
    FROM formations
    WHERE base_formation_id IS NOT NULL
  ) THEN 'mirror'

  -- Built-in directional keywords
  WHEN name ~* '(east|west|rip|liz|strong|weak|open|closed)' THEN 'built-in'

  -- Keep as unspecified for manual review
  ELSE 'unspecified'
END
WHERE directionality_type = 'unspecified';

-- Log results
SELECT
  directionality_type,
  COUNT(*) as count
FROM formations
GROUP BY directionality_type;
```

## 💡 Alternative: Name-Based Detection

If you don't want to add a column, detect from name patterns:

```typescript
function getFormationDirectionalityType(
  formation: Formation
): FormationDirectionalityType {
  // Has variants? Mirror type
  if (formation.base_formation_id !== null || hasVariants(formation)) {
    return "mirror";
  }

  // Name patterns for built-in
  const builtInPatterns = [
    /\b(east|west)\b/i,
    /\b(rip|liz)\b/i,
    /\b(strong|weak)\b/i,
    /\b(open|closed)\b/i,
    /\b(over|under)\b/i,
  ];

  if (builtInPatterns.some((p) => p.test(formation.name))) {
    return "built-in";
  }

  // Symmetric patterns
  const symmetricPatterns = [
    /\b(empty|spread|stack|bunch)\b/i,
    /\b4[- ]?wide\b/i,
    /\bquad\b/i,
  ];

  if (symmetricPatterns.some((p) => p.test(formation.name))) {
    return "symmetric";
  }

  // Default: unspecified (ask user)
  return "unspecified";
}
```

**Pros**: No schema change needed  
**Cons**: Less reliable, harder to override

## 🎯 Recommendation

**Use database column approach** for these reasons:

1. **Explicit is better than implicit** - User sets directionality, system doesn't guess
2. **Reliable** - No name-parsing edge cases
3. **Flexible** - Easy to change/override
4. **Performant** - Can index and filter efficiently
5. **Future-proof** - Room for new directionality types

## 🚀 Next Steps

1. **Decide**: Database column vs name-based detection
2. **Schema**: Add `directionality_type` column
3. **Migration**: Run smart detection + manual review
4. **UI**: Update Formation Selector and Builder
5. **Logic**: Update auto-create to respect directionality
6. **Test**: Verify all three formation types work correctly

---

**Status**: Ready for implementation decision

**Questions to Answer**:

- Do you want to add the database column?
- Should we default to `symmetric` or `unspecified` for legacy formations?
- Do you want a migration UI to review formations?
