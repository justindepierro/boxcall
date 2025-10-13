# 🎯 Path to 10/10 - Implementation Roadmap

**Current Score:** 9/10 ✅  
**Target Score:** 10/10 🏆  
**Estimated Time:** 2-3 hours

---

## ✅ Step 1: Name Sync Triggers (COMPLETE!)

You just applied these! Now when you rename personnel or formations, all related plays automatically update.

**Test it:**

```sql
-- Try renaming a personnel configuration
UPDATE personnel_configurations
SET name = '11P'
WHERE name = '11 Personnel'
LIMIT 1;

-- Check that plays updated
SELECT play_name, personnel FROM plays WHERE personnel = '11P';
-- Should show the updated name!
```

---

## 🔧 Step 2: Add Personnel FK to Plays (1 hour) - **DO THIS NEXT**

This adds proper referential integrity between plays and personnel.

### **2.1: Create and Run SQL Migration**

**File:** Create `database/migrations/20251012_add_personnel_fk_to_plays.sql`

```sql
-- ============================================================================
-- ADD PERSONNEL FOREIGN KEY TO PLAYS
-- ============================================================================
-- Purpose: Add proper FK relationship plays → personnel_configurations
-- Impact: Referential integrity, faster lookups, better analytics
-- Priority: HIGH
-- ============================================================================

-- ========================================
-- 1. ADD COLUMN
-- ========================================

ALTER TABLE plays
  ADD COLUMN IF NOT EXISTS personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL;

COMMENT ON COLUMN plays.personnel_id IS
  'Foreign key to personnel_configurations.id. SET NULL on delete to preserve play history.';

-- ========================================
-- 2. ADD INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plays_personnel_id
  ON plays(personnel_id) WHERE personnel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_plays_playbook_personnel
  ON plays(playbook_id, personnel_id) WHERE personnel_id IS NOT NULL;

-- ========================================
-- 3. MIGRATE EXISTING DATA
-- ========================================

-- Populate personnel_id for existing plays based on personnel TEXT field
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH personnel_lookup AS (
    SELECT DISTINCT ON (p.playbook_id, p.personnel)
      p.id as play_id,
      pc.id as personnel_id
    FROM plays p
    INNER JOIN personnel_configurations pc
      ON p.playbook_id = pc.playbook_id
      AND p.personnel = pc.name
    WHERE p.personnel_id IS NULL
      AND p.personnel IS NOT NULL
      AND p.personnel != ''
  )
  UPDATE plays p
  SET personnel_id = pl.personnel_id
  FROM personnel_lookup pl
  WHERE p.id = pl.play_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Migrated % existing plays to use personnel_id FK', updated_count;
END $$;

-- ========================================
-- 4. ADD TRIGGER TO AUTO-POPULATE
-- ========================================

-- When a play is created or updated with personnel TEXT, auto-populate personnel_id
CREATE OR REPLACE FUNCTION auto_populate_personnel_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If personnel TEXT is set but personnel_id is null, try to populate it
  IF NEW.personnel IS NOT NULL AND NEW.personnel != '' AND NEW.personnel_id IS NULL THEN
    SELECT id INTO NEW.personnel_id
    FROM personnel_configurations
    WHERE playbook_id = NEW.playbook_id
      AND name = NEW.personnel
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_populate_personnel_id
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_personnel_id();

COMMENT ON FUNCTION auto_populate_personnel_id IS
  'Automatically populates plays.personnel_id when plays.personnel TEXT is set';

-- ========================================
-- 5. VERIFICATION
-- ========================================

DO $$
DECLARE
  total_plays INTEGER;
  plays_with_fk INTEGER;
  plays_with_text INTEGER;
  coverage_percent NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_plays FROM plays;
  SELECT COUNT(*) INTO plays_with_fk FROM plays WHERE personnel_id IS NOT NULL;
  SELECT COUNT(*) INTO plays_with_text FROM plays WHERE personnel IS NOT NULL AND personnel != '';

  IF plays_with_text > 0 THEN
    coverage_percent := ROUND((plays_with_fk::NUMERIC / plays_with_text::NUMERIC) * 100, 1);
  ELSE
    coverage_percent := 0;
  END IF;

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Personnel FK migration complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total plays: %', total_plays;
  RAISE NOTICE 'Plays with personnel TEXT: %', plays_with_text;
  RAISE NOTICE 'Plays with personnel_id FK: %', plays_with_fk;
  RAISE NOTICE 'Coverage: %%', coverage_percent;
  RAISE NOTICE '';

  IF plays_with_fk < plays_with_text THEN
    RAISE NOTICE '⚠️  % plays could not be linked automatically', (plays_with_text - plays_with_fk);
    RAISE NOTICE '   These may have invalid personnel names or were created before personnel system';
  ELSE
    RAISE NOTICE '🎉 All plays with personnel are now properly linked!';
  END IF;
END $$;
```

**Apply it:**

```bash
1. Copy the SQL above
2. Open Supabase Dashboard → SQL Editor
3. Paste and Run
4. Check logs for success message
```

---

### **2.2: Update TypeScript Types**

**File:** `src/types/play.ts`

Find the Play interface and ensure it has `personnel_id`:

```typescript
export interface Play {
  // ... existing fields ...

  // Personnel
  personnel?: string; // Legacy TEXT field
  personnel_id?: string | null; // NEW! FK to personnel_configurations

  // ... rest of fields ...
}
```

---

### **2.3: Update PlaysService**

**File:** `src/services/playsService.ts`

Update `createPlay` to auto-populate `personnel_id`:

```typescript
// Around line 230, in the newPlay object:

const newPlay = {
  id: playId,
  playbook_id: playbookId,

  // ... other fields ...

  personnel: playData.personnel || "",
  // No need to manually set personnel_id - the trigger will do it!

  // ... rest of fields ...
};
```

The database trigger will automatically populate `personnel_id` based on `personnel` TEXT! 🎉

**Optional Enhancement:** If you want to explicitly set it in code:

```typescript
static async createPlay(playData: Partial<Play>): Promise<Play> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const playId = crypto.randomUUID();
    const playbookId = playData.playbook_id || (await this.ensureUserHasPlaybook());

    // NEW: Look up personnel_id if personnel name provided
    let personnelId: string | undefined;
    if (playData.personnel && playbookId) {
      const { data: personnelConfig } = await supabase
        .from('personnel_configurations')
        .select('id')
        .eq('playbook_id', playbookId)
        .eq('name', playData.personnel)
        .single();

      if (personnelConfig) {
        personnelId = personnelConfig.id;
      }
    }

    const newPlay = {
      id: playId,
      playbook_id: playbookId,

      // ... other fields ...

      personnel: playData.personnel || "",
      personnel_id: personnelId || null, // Explicitly set if found

      // ... rest of fields ...
    };

    // ... rest of method ...
  }
}
```

---

## 🎨 Step 3: Add Delete Confirmations (30 minutes) - **DO THIS THIRD**

Make deletions safer by showing usage warnings.

### **3.1: Add Usage Check to PersonnelService**

**File:** `src/services/personnelService.ts`

Add this method at the end of the PersonnelService class:

```typescript
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
  try {
    // Get the personnel config to find its name
    const config = await this.getPersonnelConfiguration(configId);
    if (!config) {
      return { playsCount: 0, formationsCount: 0, inUse: false };
    }

    // Count plays using this personnel (TEXT-based)
    const { count: playsTextCount } = await supabase
      .from('plays')
      .select('*', { count: 'exact', head: true })
      .eq('personnel', config.name);

    // Count plays using this personnel (FK-based)
    const { count: playsFKCount } = await supabase
      .from('plays')
      .select('*', { count: 'exact', head: true })
      .eq('personnel_id', configId);

    // Count formations using this personnel
    const { count: formationsCount } = await supabase
      .from('formations')
      .select('*', { count: 'exact', head: true })
      .eq('personnel_id', configId);

    const playsCount = (playsTextCount || 0) + (playsFKCount || 0);
    const formationsTotal = formationsCount || 0;

    return {
      playsCount,
      formationsCount: formationsTotal,
      inUse: playsCount > 0 || formationsTotal > 0,
    };
  } catch (error) {
    console.error('Error checking personnel usage:', error);
    return { playsCount: 0, formationsCount: 0, inUse: false };
  }
}
```

---

### **3.2: Create Delete Confirmation Dialog**

**File:** Create `src/components/common/DeleteConfirmationDialog.tsx`

```typescript
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
  isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityName,
  usage,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const hasUsage = (usage?.playsCount || 0) > 0 || (usage?.formationsCount || 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-warning-100">
              <Icon name="alert-triangle" className="text-warning-600" size="lg" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <strong className="text-content-primary">{entityName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasUsage && (
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg space-y-2">
              <p className="font-semibold text-warning-800">
                ⚠️ This entity is currently in use:
              </p>
              <ul className="space-y-1 text-warning-700 ml-4">
                {(usage?.playsCount || 0) > 0 && (
                  <li className="flex items-center gap-2">
                    <Icon name="play" size="sm" />
                    <span>{usage.playsCount} play{usage.playsCount !== 1 ? 's' : ''}</span>
                  </li>
                )}
                {(usage?.formationsCount || 0) > 0 && (
                  <li className="flex items-center gap-2">
                    <Icon name="grid" size="sm" />
                    <span>{usage.formationsCount} formation{usage.formationsCount !== 1 ? 's' : ''}</span>
                  </li>
                )}
              </ul>
              <p className="mt-2 text-sm text-warning-600">
                These will lose their reference to this entity but will not be deleted.
              </p>
            </div>
          )}

          {!hasUsage && (
            <p className="text-content-secondary text-sm">
              This entity is not currently in use and can be safely deleted.
            </p>
          )}

          <p className="text-sm text-content-tertiary">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Icon name="loader" className="animate-spin mr-2" size="sm" />
                Deleting...
              </>
            ) : (
              'Delete Anyway'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### **3.3: Use in Personnel Modal**

**File:** `src/components/playbook/PersonnelConfigurationModal.tsx`

Find where personnel is deleted and wrap it with the confirmation dialog:

```typescript
// Add state for delete confirmation
const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
  isOpen: boolean;
  entityName?: string;
  usage?: { playsCount: number; formationsCount: number };
}>({ isOpen: false });

// Modify delete handler
const handleDeleteClick = async () => {
  if (!selectedConfig) return;

  // Check usage before showing confirmation
  const usage = await PersonnelService.checkPersonnelUsage(selectedConfig.id);

  setDeleteConfirmation({
    isOpen: true,
    entityName: selectedConfig.name,
    usage,
  });
};

const confirmDelete = async () => {
  if (!selectedConfig) return;

  try {
    await deletePersonnel.mutateAsync(selectedConfig.id);
    setDeleteConfirmation({ isOpen: false });
    setSelectedConfig(null);
    toast.success('Personnel deleted successfully');
  } catch (error) {
    toast.error('Failed to delete personnel');
  }
};

// In JSX, add the dialog:
<DeleteConfirmationDialog
  isOpen={deleteConfirmation.isOpen}
  onClose={() => setDeleteConfirmation({ isOpen: false })}
  onConfirm={confirmDelete}
  title="Delete Personnel Configuration?"
  entityName={deleteConfirmation.entityName || ''}
  usage={deleteConfirmation.usage}
  isDeleting={deletePersonnel.isPending}
/>
```

**Similarly add to FormationBuilderModal for formation deletions!**

---

## 🧪 Step 4: Add Integration Tests (1 hour) - **OPTIONAL BUT RECOMMENDED**

Create tests to verify the complete workflow.

**File:** Create `src/__tests__/integration/personnel-formation-play.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { PersonnelService } from "@/services/personnelService";
import { FormationService } from "@/services/formationService";
import { PlaysService } from "@/services/playsService";

describe("Personnel → Formation → Play Integration", () => {
  let playbookId: string;
  let personnelConfigId: string;
  let formationId: string;
  let playId: string;

  beforeEach(async () => {
    // Setup: Create test playbook
    playbookId = "test-playbook-id";
  });

  it("should create personnel configuration", async () => {
    const personnel = await PersonnelService.createPersonnelConfiguration({
      playbook_id: playbookId,
      name: "Test 11 Personnel",
      description: "1 RB, 1 TE, 3 WR",
      players: [
        {
          player_position: "QB",
          label: "Q",
          sort_order: 0,
          is_wildcat_qb: false,
        },
        {
          player_position: "RB",
          label: "R",
          sort_order: 1,
          is_wildcat_qb: false,
        },
        {
          player_position: "TE",
          label: "T",
          sort_order: 2,
          is_wildcat_qb: false,
        },
        {
          player_position: "WR",
          label: "X",
          sort_order: 3,
          is_wildcat_qb: false,
        },
        {
          player_position: "WR",
          label: "Y",
          sort_order: 4,
          is_wildcat_qb: false,
        },
      ],
    });

    expect(personnel.id).toBeDefined();
    expect(personnel.name).toBe("Test 11 Personnel");
    personnelConfigId = personnel.id;
  });

  it("should create formation linked to personnel", async () => {
    const formation = await FormationService.createFormation({
      playbook_id: playbookId,
      name: "Test Trips",
      personnel_id: personnelConfigId,
      personnel_name: "Test 11 Personnel",
      personnel_packages: [personnelConfigId],
      player_positions: [],
      direction: "base",
    });

    expect(formation.id).toBeDefined();
    expect(formation.personnel_id).toBe(personnelConfigId);
    formationId = formation.id;
  });

  it("should create play referencing formation and personnel", async () => {
    const play = await PlaysService.createPlay({
      playbook_id: playbookId,
      play_name: "Test Play",
      formation: "Test Trips",
      formation_id: formationId,
      p_type: "Pass",
      personnel: "Test 11 Personnel",
    });

    expect(play.id).toBeDefined();
    expect(play.formation_id).toBe(formationId);
    expect(play.personnel_id).toBe(personnelConfigId); // Auto-populated by trigger!
    playId = play.id;
  });

  it("should update play personnel when personnel name changes", async () => {
    // Rename personnel
    await PersonnelService.updatePersonnelConfiguration(personnelConfigId, {
      name: "Updated 11 Personnel",
    });

    // Fetch play again
    const play = await PlaysService.getPlay(playId);

    // Personnel TEXT should auto-update via trigger!
    expect(play?.personnel).toBe("Updated 11 Personnel");
  });

  it("should check usage before deleting personnel", async () => {
    const usage = await PersonnelService.checkPersonnelUsage(personnelConfigId);

    expect(usage.playsCount).toBeGreaterThan(0);
    expect(usage.formationsCount).toBeGreaterThan(0);
    expect(usage.inUse).toBe(true);
  });
});
```

Run tests:

```bash
npm run test
```

---

## 🎉 Step 5: Verify Everything Works (15 minutes)

### **5.1: Test Name Sync**

```sql
-- Test personnel rename
UPDATE personnel_configurations
SET name = '11P Test'
WHERE name LIKE '%11%'
LIMIT 1;

-- Verify plays updated
SELECT play_name, personnel FROM plays WHERE personnel = '11P Test';
```

### **5.2: Test FK Population**

Create a new play in UI and check database:

```sql
-- Should have both personnel TEXT and personnel_id
SELECT
  play_name,
  personnel,
  personnel_id,
  formation,
  formation_id
FROM plays
ORDER BY created_at DESC
LIMIT 5;
```

### **5.3: Test Delete Warning**

Try to delete a personnel configuration that's in use. You should see:

- ✅ Warning dialog
- ✅ Usage count (X plays, Y formations)
- ✅ Confirmation required

---

## 🏆 Congratulations - You're at 10/10!

Once you complete these steps, your system will have:

✅ **Perfect Database Design**

- Foreign keys everywhere
- Auto-syncing name changes
- Referential integrity enforced
- Proper indexes

✅ **Safe Operations**

- Delete confirmations with usage warnings
- No accidental data loss
- Clear user feedback

✅ **Comprehensive Integration**

- Personnel → Formations → Plays all linked
- Everything updates automatically
- Type-safe throughout

✅ **Production-Ready**

- Tested workflows
- Error handling
- Performance optimized

---

## 📊 Final Checklist

- [x] Name sync triggers applied (Step 1) ✅ YOU JUST DID THIS!
- [ ] Personnel FK to plays (Step 2) - 1 hour
- [ ] Delete confirmations (Step 3) - 30 minutes
- [ ] Integration tests (Step 4) - 1 hour (optional)
- [ ] Verification (Step 5) - 15 minutes

**Total Time: 2-3 hours to 10/10!** ⏱️

---

## 🚀 Quick Implementation Order

1. **Right Now:** Apply personnel FK migration (5 minutes)
2. **Next:** Update TypeScript types (5 minutes)
3. **Then:** Add delete confirmation component (20 minutes)
4. **Then:** Wire up delete confirmations (10 minutes)
5. **Finally:** Test everything (15 minutes)

**You can reach 10/10 in under 1 hour if you skip the optional integration tests!**

Let me know when you're ready for the next step and I'll guide you through it! 🎯
