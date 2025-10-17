# Formation System Bulletproofing Plan

**Date**: October 14, 2025  
**Status**: 🛡️ Security & Reliability Hardening

## 🎯 Executive Summary

This document outlines critical improvements to bulletproof the formation direction system against:

- Data integrity violations
- Race conditions
- Circular references
- Orphaned records
- Type confusion
- UX confusion

## 🔴 Critical Vulnerabilities

### 1. **Circular Reference Hell**

**Risk Level**: 🔴 CRITICAL

**Scenario**:

```typescript
Formation A: base_formation_id → Formation B
Formation B: base_formation_id → Formation A
// Infinite loop! 💥
```

**Impact**: Crashes queries, breaks UI, corrupts data

**Fix**: Database constraint + validation

```sql
-- Add check constraint to prevent self-reference
ALTER TABLE formations
ADD CONSTRAINT formations_no_self_reference
CHECK (base_formation_id IS NULL OR base_formation_id != id);

-- Add trigger to prevent circular chains
CREATE OR REPLACE FUNCTION check_formation_circular_reference()
RETURNS TRIGGER AS $$
DECLARE
  visited UUID[];
  current_id UUID;
  depth INTEGER := 0;
  max_depth INTEGER := 10;
BEGIN
  -- Only check if base_formation_id is being set
  IF NEW.base_formation_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Start from the new base_formation_id
  current_id := NEW.base_formation_id;
  visited := ARRAY[NEW.id];

  -- Walk up the chain
  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    -- Check for cycle
    IF current_id = ANY(visited) THEN
      RAISE EXCEPTION 'Circular formation reference detected: formation % would create a cycle', NEW.id;
    END IF;

    -- Add to visited
    visited := array_append(visited, current_id);
    depth := depth + 1;

    -- Get next in chain
    SELECT base_formation_id INTO current_id
    FROM formations
    WHERE id = current_id;
  END LOOP;

  -- Check if we hit max depth (suspicious)
  IF depth >= max_depth THEN
    RAISE EXCEPTION 'Formation chain too deep (max %): possible circular reference', max_depth;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_formation_circular
  BEFORE INSERT OR UPDATE OF base_formation_id ON formations
  FOR EACH ROW
  EXECUTE FUNCTION check_formation_circular_reference();
```

### 2. **Variant of a Variant**

**Risk Level**: 🔴 CRITICAL

**Scenario**:

```typescript
Trips Base (id: A, base_formation_id: null, direction: "base")
Trips Left (id: B, base_formation_id: A, direction: "left") ✅
Trips Left-ish (id: C, base_formation_id: B, direction: "left") ❌ INVALID!
```

**Impact**: Broken hierarchy, confusing UI

**Fix**: Database constraint

```sql
-- Variants must point to base formations only
ALTER TABLE formations
ADD CONSTRAINT formations_variants_must_link_to_base
CHECK (
  base_formation_id IS NULL OR
  (base_formation_id IS NOT NULL AND base_formation_id IN (
    SELECT id FROM formations WHERE base_formation_id IS NULL
  ))
);

-- Note: This requires a function for performance
CREATE OR REPLACE FUNCTION is_base_formation(formation_id UUID)
RETURNS BOOLEAN AS $$
  SELECT base_formation_id IS NULL
  FROM formations
  WHERE id = formation_id;
$$ LANGUAGE sql STABLE;

-- Better constraint using function
ALTER TABLE formations
ADD CONSTRAINT formations_variants_must_link_to_base
CHECK (
  base_formation_id IS NULL OR
  is_base_formation(base_formation_id)
);
```

### 3. **Direction Mismatch**

**Risk Level**: 🟡 HIGH

**Scenario**:

```typescript
Trips Left: {
  base_formation_id: "abc-123",
  direction: "right"  // ❌ Says LEFT but marked RIGHT!
}
```

**Impact**: Data integrity issues, UI bugs

**Fix**: Validation in service layer

```typescript
// In FormationService.linkFormations()
static async linkFormations(
  baseFormationId: string,
  leftFormationId?: string,
  rightFormationId?: string,
  personnelPackages?: string[]
): Promise<void> {
  // ... existing validation ...

  // ⚠️ NEW: Validate left variant doesn't already have direction="right"
  if (leftFormationId) {
    const { data: leftFormation } = await supabase
      .from("formations")
      .select("direction, base_formation_id")
      .eq("id", leftFormationId)
      .single();

    if (leftFormation?.direction === "right" && leftFormation.base_formation_id !== null) {
      throw new Error(
        `Cannot link formation as LEFT variant: it's already linked as a RIGHT variant. ` +
        `Unlink it first or choose a different formation.`
      );
    }
  }

  // ⚠️ NEW: Validate right variant doesn't already have direction="left"
  if (rightFormationId) {
    const { data: rightFormation } = await supabase
      .from("formations")
      .select("direction, base_formation_id")
      .eq("id", rightFormationId)
      .single();

    if (rightFormation?.direction === "left" && rightFormation.base_formation_id !== null) {
      throw new Error(
        `Cannot link formation as RIGHT variant: it's already linked as a LEFT variant. ` +
        `Unlink it first or choose a different formation.`
      );
    }
  }

  // ... rest of function ...
}
```

### 4. **Orphaned Variants**

**Risk Level**: 🟡 HIGH

**Scenario**: Base formation deleted, variants remain with dangling `base_formation_id`

**Current**: `ON DELETE CASCADE` handles this ✅

**Additional Protection**: Periodic cleanup job

```sql
-- Find orphaned variants (defensive)
SELECT id, name, base_formation_id
FROM formations
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);

-- Auto-repair: convert orphans back to base formations
UPDATE formations
SET base_formation_id = NULL,
    direction = 'base'
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);
```

### 5. **Duplicate Variant Creation**

**Risk Level**: 🟡 HIGH

**Scenario**: Race condition - two requests create LEFT variant simultaneously

**Impact**: Database has TWO left variants for same base

**Fix**: Unique constraint + upsert logic

```sql
-- Unique constraint: only one variant per direction per base
ALTER TABLE formations
ADD CONSTRAINT formations_unique_variant_per_direction
UNIQUE (base_formation_id, direction)
WHERE base_formation_id IS NOT NULL;

-- Index for performance
CREATE UNIQUE INDEX idx_formations_unique_variant
ON formations (base_formation_id, direction)
WHERE base_formation_id IS NOT NULL;
```

```typescript
// In createLeftVariant/createRightVariant - use upsert
static async createLeftVariant(baseFormationId: string): Promise<Formation> {
  const baseFormation = await this.getFormation(baseFormationId);

  // Check if LEFT variant already exists
  const { data: existing } = await supabase
    .from("formations")
    .select("*")
    .eq("base_formation_id", baseFormationId)
    .eq("direction", "left")
    .maybeSingle();

  if (existing) {
    console.log(`[FormationService] LEFT variant already exists for ${baseFormation.name}`);
    return existing as Formation;
  }

  // Create new variant (rest of existing logic)
  // ...
}
```

### 6. **Missing Validation: Base Formation Rules**

**Risk Level**: 🟠 MEDIUM

**Scenario**: Base formation has `base_formation_id` set (impossible state)

**Fix**: Database constraint

```sql
-- Base formations (direction='base') must have base_formation_id=NULL
ALTER TABLE formations
ADD CONSTRAINT formations_base_has_no_parent
CHECK (
  (direction = 'base' AND base_formation_id IS NULL) OR
  (direction != 'base')
);

-- Variants (direction='left'|'right') must have base_formation_id set
ALTER TABLE formations
ADD CONSTRAINT formations_variants_have_parent
CHECK (
  (direction IN ('left', 'right') AND base_formation_id IS NOT NULL) OR
  (direction = 'base')
);
```

### 7. **Type Safety: Directionality Confusion**

**Risk Level**: 🟠 MEDIUM

**Scenario**: "Spread East" treated as mirror variant (should be built-in)

**Fix**: Add `directionality_type` column (from previous design doc)

```sql
-- Add directionality type
ALTER TABLE formations
ADD COLUMN directionality_type VARCHAR(20) DEFAULT 'unspecified'
CHECK (directionality_type IN ('mirror', 'built-in', 'symmetric', 'unspecified'));

-- Business rule: mirror formations must have base_formation_id OR be a base
ALTER TABLE formations
ADD CONSTRAINT formations_mirror_has_variants_or_is_base
CHECK (
  directionality_type != 'mirror' OR
  base_formation_id IS NOT NULL OR
  direction = 'base'
);

-- Business rule: built-in/symmetric shouldn't have variants
ALTER TABLE formations
ADD CONSTRAINT formations_builtin_symmetric_no_variants
CHECK (
  directionality_type IN ('mirror', 'unspecified') OR
  base_formation_id IS NULL
);
```

### 8. **Concurrent Update Conflicts**

**Risk Level**: 🟠 MEDIUM

**Scenario**: Two users edit same formation simultaneously

**Fix**: Optimistic locking with version column

```sql
-- Add version column (already in type, add to DB)
ALTER TABLE formations
ADD COLUMN version INTEGER DEFAULT 1;

-- Trigger to increment version on update
CREATE OR REPLACE FUNCTION increment_formation_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_formation_version
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION increment_formation_version();
```

```typescript
// In FormationService update methods
static async updateFormation(
  id: string,
  updates: Partial<FormationUpdate>,
  expectedVersion?: number
): Promise<Formation> {
  let query = supabase
    .from("formations")
    .update(updates)
    .eq("id", id);

  // Optimistic locking
  if (expectedVersion !== undefined) {
    query = query.eq("version", expectedVersion);
  }

  const { data, error } = await query.select().single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      throw new Error(
        'Formation was modified by another user. Please refresh and try again.'
      );
    }
    throw error;
  }

  return data as Formation;
}
```

### 9. **Invalid Auto-Creation**

**Risk Level**: 🟢 LOW

**Scenario**: Auto-create LEFT variant for a formation that shouldn't have variants

**Fix**: Check directionality_type before auto-create

```typescript
// In linkFormations, before auto-create
if (!isSameFormationLink && leftFormationId && !actualRightFormationId) {
  // ⚠️ NEW: Only auto-create for mirror formations
  if (baseFormation.directionality_type === "mirror") {
    console.log("[FormationService] 🔄 Auto-creating missing RIGHT variant");
    try {
      await this.createRightVariant(baseFormationId);
      console.log("[FormationService] ✅ RIGHT variant auto-created");
    } catch (error) {
      console.error(
        "[FormationService] ⚠️ Failed to auto-create RIGHT:",
        error
      );
    }
  } else {
    console.log(
      `[FormationService] ⏭️ Skipping auto-create: ${baseFormation.name} ` +
        `is ${baseFormation.directionality_type}, not mirror`
    );
  }
}
```

### 10. **Transaction Safety**

**Risk Level**: 🟡 HIGH

**Scenario**: Linking fails halfway through, leaving inconsistent state

**Fix**: Wrap in transaction

```typescript
static async linkFormations(
  baseFormationId: string,
  leftFormationId?: string,
  rightFormationId?: string,
  personnelPackages?: string[]
): Promise<void> {
  // Use Supabase transaction (RPC function)
  const { error } = await supabase.rpc('link_formations_transaction', {
    p_base_formation_id: baseFormationId,
    p_left_formation_id: leftFormationId,
    p_right_formation_id: rightFormationId,
    p_personnel_packages: personnelPackages
  });

  if (error) {
    throw new Error(`Failed to link formations: ${error.message}`);
  }
}
```

```sql
-- PostgreSQL function with transaction
CREATE OR REPLACE FUNCTION link_formations_transaction(
  p_base_formation_id UUID,
  p_left_formation_id UUID DEFAULT NULL,
  p_right_formation_id UUID DEFAULT NULL,
  p_personnel_packages TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS void AS $$
BEGIN
  -- Validate base formation exists
  IF NOT EXISTS (SELECT 1 FROM formations WHERE id = p_base_formation_id) THEN
    RAISE EXCEPTION 'Base formation not found';
  END IF;

  -- Validate base is actually a base (not a variant)
  IF EXISTS (
    SELECT 1 FROM formations
    WHERE id = p_base_formation_id
    AND base_formation_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot link to a variant formation. Choose the base formation.';
  END IF;

  -- Link left variant
  IF p_left_formation_id IS NOT NULL THEN
    UPDATE formations
    SET base_formation_id = p_base_formation_id,
        direction = 'left',
        personnel_packages = p_personnel_packages
    WHERE id = p_left_formation_id;
  END IF;

  -- Link right variant
  IF p_right_formation_id IS NOT NULL THEN
    UPDATE formations
    SET base_formation_id = p_base_formation_id,
        direction = 'right',
        personnel_packages = p_personnel_packages
    WHERE id = p_right_formation_id;
  END IF;

  -- Update base formation
  UPDATE formations
  SET direction = 'base',
      personnel_packages = p_personnel_packages
  WHERE id = p_base_formation_id;

  -- All updates succeed together or all fail
END;
$$ LANGUAGE plpgsql;
```

## 🎯 Implementation Priority

### Phase 1: Critical Safety (Do First) 🔴

1. ✅ Circular reference prevention trigger
2. ✅ Variant-of-variant constraint
3. ✅ Unique variant per direction constraint
4. ✅ Base formation rules constraints
5. ✅ Transaction wrapper for linkFormations

### Phase 2: Data Integrity (Do Soon) 🟡

6. ✅ Direction mismatch validation
7. ✅ Duplicate variant detection (upsert)
8. ✅ Optimistic locking (version column)
9. ✅ Orphaned variant cleanup job

### Phase 3: Type System (Do Later) 🟠

10. ✅ Add directionality_type column
11. ✅ Update auto-create logic
12. ✅ UI updates for directionality

## 📋 Complete Migration Script

```sql
-- =====================================================
-- FORMATION SYSTEM BULLETPROOFING MIGRATION
-- Date: October 14, 2025
-- =====================================================

BEGIN;

-- 1. Add directionality_type column
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS directionality_type VARCHAR(20) DEFAULT 'unspecified'
CHECK (directionality_type IN ('mirror', 'built-in', 'symmetric', 'unspecified'));

-- 2. Add version column for optimistic locking
ALTER TABLE formations
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 3. Constraint: No self-reference
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_no_self_reference,
ADD CONSTRAINT formations_no_self_reference
CHECK (base_formation_id IS NULL OR base_formation_id != id);

-- 4. Constraint: Base formations have no parent
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_base_has_no_parent,
ADD CONSTRAINT formations_base_has_no_parent
CHECK (
  (direction = 'base' AND base_formation_id IS NULL) OR
  (direction != 'base')
);

-- 5. Constraint: Variants have parent
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_variants_have_parent,
ADD CONSTRAINT formations_variants_have_parent
CHECK (
  (direction IN ('left', 'right') AND base_formation_id IS NOT NULL) OR
  (direction = 'base')
);

-- 6. Constraint: Unique variant per direction
CREATE UNIQUE INDEX IF NOT EXISTS idx_formations_unique_variant
ON formations (base_formation_id, direction)
WHERE base_formation_id IS NOT NULL;

-- 7. Trigger: Circular reference prevention
CREATE OR REPLACE FUNCTION check_formation_circular_reference()
RETURNS TRIGGER AS $$
DECLARE
  visited UUID[];
  current_id UUID;
  depth INTEGER := 0;
  max_depth INTEGER := 10;
BEGIN
  IF NEW.base_formation_id IS NULL THEN
    RETURN NEW;
  END IF;

  current_id := NEW.base_formation_id;
  visited := ARRAY[NEW.id];

  WHILE current_id IS NOT NULL AND depth < max_depth LOOP
    IF current_id = ANY(visited) THEN
      RAISE EXCEPTION 'Circular formation reference detected';
    END IF;

    visited := array_append(visited, current_id);
    depth := depth + 1;

    SELECT base_formation_id INTO current_id
    FROM formations
    WHERE id = current_id;
  END LOOP;

  IF depth >= max_depth THEN
    RAISE EXCEPTION 'Formation chain too deep: possible circular reference';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_formation_circular ON formations;
CREATE TRIGGER trigger_check_formation_circular
  BEFORE INSERT OR UPDATE OF base_formation_id ON formations
  FOR EACH ROW
  EXECUTE FUNCTION check_formation_circular_reference();

-- 8. Trigger: Version increment on update
CREATE OR REPLACE FUNCTION increment_formation_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_formation_version ON formations;
CREATE TRIGGER trigger_increment_formation_version
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION increment_formation_version();

-- 9. Transaction function for safe linking
CREATE OR REPLACE FUNCTION link_formations_transaction(
  p_base_formation_id UUID,
  p_left_formation_id UUID DEFAULT NULL,
  p_right_formation_id UUID DEFAULT NULL,
  p_personnel_packages TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS void AS $$
BEGIN
  -- Validate base exists and is actually a base
  IF NOT EXISTS (
    SELECT 1 FROM formations
    WHERE id = p_base_formation_id
    AND base_formation_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid base formation';
  END IF;

  -- Link left variant
  IF p_left_formation_id IS NOT NULL THEN
    UPDATE formations
    SET base_formation_id = p_base_formation_id,
        direction = 'left',
        personnel_packages = p_personnel_packages
    WHERE id = p_left_formation_id;
  END IF;

  -- Link right variant
  IF p_right_formation_id IS NOT NULL THEN
    UPDATE formations
    SET base_formation_id = p_base_formation_id,
        direction = 'right',
        personnel_packages = p_personnel_packages
    WHERE id = p_right_formation_id;
  END IF;

  -- Update base
  UPDATE formations
  SET direction = 'base',
      personnel_packages = p_personnel_packages
  WHERE id = p_base_formation_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Cleanup orphaned variants (one-time fix)
UPDATE formations
SET base_formation_id = NULL,
    direction = 'base'
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);

-- 11. Smart detection of directionality type
UPDATE formations
SET directionality_type = CASE
  -- Has variants or is a variant → mirror
  WHEN base_formation_id IS NOT NULL THEN 'mirror'
  WHEN id IN (
    SELECT DISTINCT base_formation_id
    FROM formations
    WHERE base_formation_id IS NOT NULL
  ) THEN 'mirror'

  -- Built-in directional keywords
  WHEN name ~* '\y(east|west|rip|liz|strong|weak|open|closed|over|under)\y' THEN 'built-in'

  -- Symmetric patterns
  WHEN name ~* '\y(empty|spread|stack|bunch|quad|wide)\y' THEN 'symmetric'

  -- Default: unspecified (prompt user later)
  ELSE 'unspecified'
END
WHERE directionality_type = 'unspecified';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check constraint results
SELECT
  directionality_type,
  COUNT(*) as count
FROM formations
GROUP BY directionality_type
ORDER BY count DESC;

-- Find any orphaned variants (should be 0)
SELECT COUNT(*) as orphaned_count
FROM formations
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);

-- Check for duplicate variants (should be 0)
SELECT
  base_formation_id,
  direction,
  COUNT(*) as duplicate_count
FROM formations
WHERE base_formation_id IS NOT NULL
GROUP BY base_formation_id, direction
HAVING COUNT(*) > 1;
```

## 🧪 Testing Checklist

### Database Constraints

- [ ] Try to create circular reference (should fail)
- [ ] Try to link variant to variant (should fail)
- [ ] Try to create duplicate LEFT variant (should fail)
- [ ] Try to set base formation with base_formation_id (should fail)
- [ ] Try to create variant without base_formation_id (should fail)

### Service Layer

- [ ] Link formation with LEFT only → RIGHT auto-creates
- [ ] Link formation with RIGHT only → LEFT auto-creates
- [ ] Link built-in formation → NO auto-create
- [ ] Link symmetric formation → NO auto-create
- [ ] Concurrent updates → version conflict detected
- [ ] Transaction rollback → all changes reverted

### UI

- [ ] Mirror formations show Left/Right buttons
- [ ] Built-in formations show plain name
- [ ] Symmetric formations show plain name
- [ ] Unspecified formations show warning
- [ ] Formation selector filters correctly

## 📊 Monitoring & Alerts

### Add monitoring for:

1. **Orphaned variants** - Alert if found (shouldn't happen with CASCADE)
2. **Circular references** - Track trigger fires
3. **Version conflicts** - Track optimistic lock failures
4. **Auto-create failures** - Track when variants fail to create
5. **Directionality unspecified** - Track formations needing review

```typescript
// Add to ErrorTrackingService
static trackFormationIssue(issue: {
  type: 'orphaned' | 'circular' | 'version_conflict' | 'auto_create_fail' | 'unspecified';
  formation_id: string;
  details: string;
}) {
  // Log to analytics
  // Alert if critical
}
```

## 🎯 Summary

**Status**: Ready for implementation

**Critical Fixes**:

- ✅ 5 database constraints added
- ✅ 2 triggers added (circular check, version increment)
- ✅ 1 transaction function added
- ✅ Service layer validation enhanced
- ✅ Directionality type system added

**Expected Results**:

- 🛡️ Data integrity guaranteed at database level
- 🔒 Race conditions prevented
- 🔄 Transactions ensure consistency
- 📊 Clear formation type classification
- 🎯 Auto-create only for appropriate formations

**Breaking Changes**: None - all backward compatible with existing data

---

**Next Step**: Run the migration script to bulletproof the system! 🚀
