# 🔧 Integration Improvements - Implementation Guide

**Priority:** HIGH  
**Estimated Time:** 4-6 hours  
**Difficulty:** Medium

Based on the comprehensive audit, here are the actionable improvements to bulletproof your system integration.

---

## 🎯 Priority 1: Add Cascade Update Triggers (30 minutes)

These triggers ensure that when you rename personnel or formations, all related plays automatically update.

### **Step 1: Add Personnel Name Sync Trigger**

**File:** Create `database/migrations/20251012_add_name_sync_triggers.sql`

```sql
-- ============================================================================
-- ADD NAME SYNCHRONIZATION TRIGGERS
-- ============================================================================
-- Purpose: Auto-update plays when personnel/formation names change
-- Impact: Prevents orphaned TEXT references in plays table
-- ============================================================================

-- ========================================
-- TRIGGER 1: Sync plays.personnel when personnel_configurations.name changes
-- ========================================

CREATE OR REPLACE FUNCTION sync_play_personnel_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all plays in the same playbook that reference the old name
    UPDATE plays
    SET
      personnel = NEW.name,
      updated_at = NOW()
    WHERE personnel = OLD.name
      AND playbook_id = NEW.playbook_id;

    RAISE NOTICE 'Synced % plays from personnel "%" to "%"',
      (SELECT COUNT(*) FROM plays WHERE personnel = NEW.name AND playbook_id = NEW.playbook_id),
      OLD.name,
      NEW.name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_play_personnel_name
  AFTER UPDATE OF name ON personnel_configurations
  FOR EACH ROW
  EXECUTE FUNCTION sync_play_personnel_name();

COMMENT ON FUNCTION sync_play_personnel_name IS
  'Automatically updates plays.personnel TEXT field when personnel configuration name changes';

-- ========================================
-- TRIGGER 2: Sync plays.formation when formations.name changes
-- ========================================

CREATE OR REPLACE FUNCTION sync_play_formation_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all plays in the same playbook that reference the old name
    UPDATE plays
    SET
      formation = NEW.name,
      updated_at = NOW()
    WHERE formation = OLD.name
      AND playbook_id = NEW.playbook_id;

    RAISE NOTICE 'Synced % plays from formation "%" to "%"',
      (SELECT COUNT(*) FROM plays WHERE formation = NEW.name AND playbook_id = NEW.playbook_id),
      OLD.name,
      NEW.name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_play_formation_name
  AFTER UPDATE OF name ON formations
  FOR EACH ROW
  EXECUTE FUNCTION sync_play_formation_name();

COMMENT ON FUNCTION sync_play_formation_name IS
  'Automatically updates plays.formation TEXT field when formation name changes';

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Name synchronization triggers installed!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Active Triggers:';
  RAISE NOTICE '  1. trigger_sync_play_personnel_name';
  RAISE NOTICE '  2. trigger_sync_play_formation_name';
  RAISE NOTICE '';
  RAISE NOTICE 'When you rename personnel or formations,';
  RAISE NOTICE 'all related plays will auto-update! 🎉';
END $$;
```

### **Step 2: Apply Migration**

```bash
# Via Supabase Dashboard SQL Editor
# 1. Copy the SQL above
# 2. Paste into SQL Editor
# 3. Run
# 4. Check logs for success message
```

### **Step 3: Test It**

```sql
-- Test personnel rename
UPDATE personnel_configurations
SET name = '11P'
WHERE name = '11 Personnel' AND playbook_id = 'your-playbook-id';

-- Check that plays updated
SELECT play_name, personnel FROM plays WHERE playbook_id = 'your-playbook-id';
-- Should now show "11P" instead of "11 Personnel"

-- Test formation rename
UPDATE formations
SET name = 'Trips R'
WHERE name = 'Trips Right' AND playbook_id = 'your-playbook-id';

-- Check that plays updated
SELECT play_name, formation FROM plays WHERE playbook_id = 'your-playbook-id';
-- Should now show "Trips R" instead of "Trips Right"
```

---

## 🎯 Priority 2: Add Personnel FK to Plays (1 hour)

Add proper foreign key relationship between plays and personnel configurations.

### **Step 1: Add Column and Index**

**File:** Create `database/migrations/20251012_add_personnel_fk_to_plays.sql`

```sql
-- ============================================================================
-- ADD PERSONNEL FOREIGN KEY TO PLAYS
-- ============================================================================
-- Purpose: Add proper FK relationship plays → personnel_configurations
-- Impact: Referential integrity, faster lookups, better analytics
-- ============================================================================

-- ========================================
-- 1. ADD COLUMN
-- ========================================

ALTER TABLE plays
  ADD COLUMN IF NOT EXISTS personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL;

COMMENT ON COLUMN plays.personnel_id IS
  'Foreign key to personnel_configurations.id. SET NULL on delete to preserve play history.';

-- ========================================
-- 2. ADD INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plays_personnel_id
  ON plays(personnel_id) WHERE personnel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_plays_playbook_personnel
  ON plays(playbook_id, personnel_id) WHERE personnel_id IS NOT NULL;

-- ========================================
-- 3. MIGRATE EXISTING DATA
-- ========================================

-- Populate personnel_id for existing plays based on personnel TEXT field
UPDATE plays p
SET personnel_id = pc.id
FROM personnel_configurations pc
WHERE p.playbook_id = pc.playbook_id
  AND p.personnel = pc.name
  AND p.personnel_id IS NULL;

-- ========================================
-- 4. VERIFICATION
-- ========================================

DO $$
DECLARE
  total_plays INTEGER;
  plays_with_fk INTEGER;
  plays_without_fk INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_plays FROM plays;
  SELECT COUNT(*) INTO plays_with_fk FROM plays WHERE personnel_id IS NOT NULL;
  SELECT COUNT(*) INTO plays_without_fk FROM plays WHERE personnel_id IS NULL;

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Personnel FK migration complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total plays: %', total_plays;
  RAISE NOTICE 'Plays with personnel_id: %', plays_with_fk;
  RAISE NOTICE 'Plays without personnel_id: %', plays_without_fk;
  RAISE NOTICE '';

  IF plays_without_fk > 0 THEN
    RAISE NOTICE '⚠️  % plays could not be linked automatically', plays_without_fk;
    RAISE NOTICE '   These may have invalid personnel names or were created before personnel system';
  END IF;
END $$;
```

### **Step 2: Update PlaysService**

**File:** `src/services/playsService.ts`

```typescript
// Add to createPlay method (around line 230)

static async createPlay(playData: Partial<Play>): Promise<Play> {
  try {
    // ... existing code ...

    // NEW: Look up personnel_id if personnel name provided
    let personnelId: string | undefined;
    if (playData.personnel && playbookId) {
      const { data: personnelConfig } = await supabase
        .from('personnel_configurations')
        .select('id')
        .eq('playbook_id', playbookId)
        .eq('name', playData.personnel)
        .single();

      personnelId = personnelConfig?.id;
    }

    const newPlay = {
      // ... existing fields ...
      personnel: playData.personnel || "",
      personnel_id: personnelId || null, // NEW!
      // ... rest of fields ...
    };

    // ... rest of method ...
  }
}

// Add to updatePlay method (around line 351)

static async updatePlay(id: string, updates: Partial<Play>): Promise<Play> {
  try {
    // NEW: Update personnel_id if personnel name changes
    let personnelId: string | undefined = updates.personnel_id;

    if (updates.personnel && updates.playbook_id) {
      const { data: personnelConfig } = await supabase
        .from('personnel_configurations')
        .select('id')
        .eq('playbook_id', updates.playbook_id)
        .eq('name', updates.personnel)
        .single();

      personnelId = personnelConfig?.id;
    }

    const validUpdates = {
      // ... existing fields ...
      personnel: updates.personnel,
      personnel_id: personnelId, // NEW!
      // ... rest of fields ...
    };

    // ... rest of method ...
  }
}
```

### **Step 3: Update Play Type**

**File:** `src/types/play.ts`

```typescript
// Add around line 70
export interface Play {
  // ... existing fields ...
  personnel?: string; // Keep for backward compatibility
  personnel_id?: string | null; // NEW! FK to personnel_configurations
  // ... rest of fields ...
}
```

### **Step 4: Test It**

```typescript
// Test creating play with personnel
const play = await PlaysService.createPlay({
  playbook_id: "your-playbook-id",
  play_name: "Test Play",
  formation: "Trips",
  p_type: "Pass",
  personnel: "11 Personnel", // Should auto-populate personnel_id
});

console.log(play.personnel_id); // Should be UUID of 11 Personnel config

// Test querying plays by personnel FK
const { data } = await supabase
  .from("plays")
  .select("*, personnel_configurations(*)")
  .eq("personnel_id", "some-uuid");

// Now you can join personnel configs directly!
```

---

## 🎯 Priority 3: Add Delete Confirmations (30 minutes)

Show warnings when deleting entities that are in use.

### **Step 1: Add Usage Check Functions**

**File:** `src/services/personnelService.ts`

```typescript
// Add new method around line 200

/**
 * Check if personnel configuration is used by any plays or formations
 * @returns Usage statistics
 */
static async checkPersonnelUsage(
  configId: string
): Promise<{
  playsCount: number;
  formationsCount: number;
  inUse: boolean;
}> {
  // Count plays using this personnel (TEXT-based)
  const { data: playsWithText, error: playsTextError } = await supabase
    .from('plays')
    .select('id', { count: 'exact', head: true })
    .eq('personnel', (await this.getPersonnelConfiguration(configId)).name);

  // Count plays using this personnel (FK-based)
  const { data: playsWithFK, error: playsFKError } = await supabase
    .from('plays')
    .select('id', { count: 'exact', head: true })
    .eq('personnel_id', configId);

  // Count formations using this personnel
  const { data: formations, error: formationsError } = await supabase
    .from('formations')
    .select('id', { count: 'exact', head: true })
    .eq('personnel_id', configId);

  const playsCount = (playsWithText?.length || 0) + (playsWithFK?.length || 0);
  const formationsCount = formations?.length || 0;

  return {
    playsCount,
    formationsCount,
    inUse: playsCount > 0 || formationsCount > 0,
  };
}
```

### **Step 2: Add Confirmation Dialog Component**

**File:** Create `src/components/common/DeleteConfirmationDialog.tsx`

```typescript
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  entityName: string;
  usage?: {
    playsCount?: number;
    formationsCount?: number;
  };
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityName,
  usage,
}: DeleteConfirmationDialogProps) {
  const hasUsage = (usage?.playsCount || 0) > 0 || (usage?.formationsCount || 0) > 0;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <Icon name="alert-triangle" className="text-warning-600" size="lg" />
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-content-secondary">
            Are you sure you want to delete <strong>{entityName}</strong>?
          </p>

          {hasUsage && (
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="font-semibold text-warning-800 mb-2">
                ⚠️ This entity is currently in use:
              </p>
              <ul className="space-y-1 text-warning-700">
                {(usage?.playsCount || 0) > 0 && (
                  <li>• {usage.playsCount} play{usage.playsCount !== 1 ? 's' : ''}</li>
                )}
                {(usage?.formationsCount || 0) > 0 && (
                  <li>• {usage.formationsCount} formation{usage.formationsCount !== 1 ? 's' : ''}</li>
                )}
              </ul>
              <p className="mt-2 text-sm text-warning-600">
                These will lose their reference to this entity.
              </p>
            </div>
          )}

          <p className="text-sm text-content-tertiary">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### **Step 3: Use in Personnel Modal**

**File:** `src/components/playbook/PersonnelConfigurationModal.tsx`

```typescript
// Add around line 150

const handleDelete = async () => {
  if (!selectedConfig) return;

  // Check usage before deleting
  const usage = await PersonnelService.checkPersonnelUsage(selectedConfig.id);

  // Show confirmation dialog
  setDeleteConfirmation({
    isOpen: true,
    entityName: selectedConfig.name,
    usage,
  });
};

const confirmDelete = async () => {
  try {
    await deletePersonnel.mutateAsync(selectedConfig.id);
    setDeleteConfirmation({ isOpen: false });
    setSelectedConfig(null);
    toast.success('Personnel deleted successfully');
  } catch (error) {
    toast.error('Failed to delete personnel');
  }
};

// In JSX
<DeleteConfirmationDialog
  isOpen={deleteConfirmation.isOpen}
  onClose={() => setDeleteConfirmation({ isOpen: false })}
  onConfirm={confirmDelete}
  title="Delete Personnel Configuration?"
  entityName={deleteConfirmation.entityName}
  usage={deleteConfirmation.usage}
/>
```

---

## 🎯 Priority 4: Add Soft Deletes (Optional - 1 hour)

Implement soft deletes for safer operations and audit trails.

### **Step 1: Add Deleted Columns**

**File:** Create `database/migrations/20251012_add_soft_deletes.sql`

```sql
-- ============================================================================
-- ADD SOFT DELETE SUPPORT
-- ============================================================================
-- Purpose: Allow "undo" of deletions, preserve audit trail
-- Impact: Safer operations, historical reporting
-- ============================================================================

-- ========================================
-- ADD deleted_at COLUMNS
-- ========================================

ALTER TABLE personnel_configurations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE formations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE plays
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ========================================
-- ADD INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_personnel_configurations_deleted
  ON personnel_configurations(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_formations_deleted
  ON formations(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_plays_deleted
  ON plays(deleted_at) WHERE deleted_at IS NULL;

-- ========================================
-- ADD COMMENTS
-- ========================================

COMMENT ON COLUMN personnel_configurations.deleted_at IS
  'Soft delete timestamp. NULL = active, NOT NULL = deleted';

COMMENT ON COLUMN formations.deleted_at IS
  'Soft delete timestamp. NULL = active, NOT NULL = deleted';

COMMENT ON COLUMN plays.deleted_at IS
  'Soft delete timestamp. NULL = active, NOT NULL = deleted';

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Soft delete columns added!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update services to filter WHERE deleted_at IS NULL';
  RAISE NOTICE '2. Change delete operations to UPDATE deleted_at = NOW()';
  RAISE NOTICE '3. Add "Restore" functionality in UI';
END $$;
```

### **Step 2: Update Service Methods**

**File:** `src/services/personnelService.ts`

```typescript
// Update getPersonnelConfigurations method
static async getPersonnelConfigurations(
  playbookId: string
): Promise<PersonnelConfiguration[]> {
  const { data, error } = await supabase
    .from('personnel_configurations')
    .select('*, personnel_players(*)')
    .eq('playbook_id', playbookId)
    .is('deleted_at', null) // NEW: Filter out soft-deleted
    .order('created_at', { ascending: true });

  // ... rest of method
}

// Update deletePersonnelConfiguration to soft delete
static async deletePersonnelConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('personnel_configurations')
    .update({ deleted_at: new Date().toISOString() }) // Soft delete
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete personnel: ${error.message}`);
  }
}

// Add restore method
static async restorePersonnelConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('personnel_configurations')
    .update({ deleted_at: null })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to restore personnel: ${error.message}`);
  }
}
```

---

## 📊 Testing Checklist

### **Trigger Tests**

- [ ] Rename personnel → plays auto-update
- [ ] Rename formation → plays auto-update
- [ ] Rename doesn't affect other playbooks

### **FK Tests**

- [ ] Create play with personnel → personnel_id populated
- [ ] Update play personnel → personnel_id updates
- [ ] Delete personnel → plays.personnel_id becomes NULL

### **Delete Confirmation Tests**

- [ ] Delete unused personnel → no warning
- [ ] Delete used personnel → shows usage count
- [ ] Cancel delete → nothing changes
- [ ] Confirm delete → entity removed

### **Soft Delete Tests**

- [ ] Soft delete personnel → hidden from list
- [ ] Soft delete doesn't break FK references
- [ ] Restore personnel → appears in list again

---

## 🚀 Deployment Steps

1. **Apply migrations** via Supabase Dashboard
2. **Update TypeScript types** to match new columns
3. **Update service methods** to use new FKs
4. **Test thoroughly** in dev environment
5. **Deploy to production** during low-traffic window
6. **Monitor logs** for any errors

---

## 📚 Additional Resources

- **Main Audit Report:** `COMPREHENSIVE_PLAYBOOK_SYSTEM_AUDIT.md`
- **Personnel System Docs:** `docs/PERSONNEL_SYSTEM_ARCHITECTURE.md`
- **Formation System Docs:** `FORMATION_SYSTEM_PHASE7_SUMMARY.md`
- **Database Schema:** `database/schema.sql`

---

**Implementation Priority:**

1. 🔴 Name Sync Triggers (30 min) - Do this first!
2. 🟡 Personnel FK (1 hour) - Do this next
3. 🟡 Delete Confirmations (30 min) - Nice UX improvement
4. 🟢 Soft Deletes (1 hour) - Optional but recommended

**Total Time:** 3-4 hours for core improvements ⏱️
