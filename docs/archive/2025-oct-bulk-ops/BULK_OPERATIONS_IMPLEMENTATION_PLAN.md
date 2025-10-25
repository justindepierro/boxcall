# Bulk Operations Implementation Plan

## Overview

Enable coaches to efficiently manage multiple formations at once with bulk editing, direction assignment, and deletion capabilities.

**Estimated Time:** 3-4 hours  
**Priority:** High (major productivity win)

---

## Phase 1: Multi-Select UI (45 min)

### Components to Create:

1. **`BulkSelectionContext.tsx`** - Manage selection state
2. **`FormationCheckbox.tsx`** - Individual checkbox component
3. **Update FormationBuilderPanel** - Add checkboxes to list

### Features:

- ✅ Checkbox on each formation row
- ✅ "Select All" / "Select None" buttons
- ✅ Visual highlight for selected items
- ✅ Selection counter (e.g., "5 formations selected")
- ✅ Persist selection across tab changes
- ✅ Clear selection after bulk action

### Selection State:

```typescript
interface BulkSelectionState {
  selectedIds: Set<string>;
  selectAll: () => void;
  selectNone: () => void;
  toggleSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  selectionCount: number;
}
```

---

## Phase 2: Bulk Action Toolbar (30 min)

### Component:

**`BulkActionToolbar.tsx`** - Floating action bar

### Features:

- Shows when 1+ formations selected
- Sticky position at bottom of screen
- Actions:
  - 📝 **Edit Metadata** (category, personnel, tags)
  - ↔️ **Set Direction** (left/right/both)
  - 🗑️ **Delete Selected**
  - ❌ **Clear Selection**

### UI Design:

```
┌─────────────────────────────────────────────────┐
│ 🔲 5 formations selected                        │
│ [📝 Edit Metadata] [↔️ Set Direction] [🗑️ Delete] [❌ Clear] │
└─────────────────────────────────────────────────┘
```

---

## Phase 3: Bulk Metadata Editor (60 min)

### Component:

**`BulkMetadataModal.tsx`** - Multi-formation editor

### Features:

- **Edit Mode Selection:**
  - [ ] **Replace:** Overwrite existing values
  - [ ] **Merge:** Add to existing values (for tags)
- **Fields:**
  - Category (dropdown)
  - Personnel (dropdown with custom option)
  - Tags (multi-select chips)
  - Formation Type (dropdown)

- **Smart Defaults:**
  - Show common values across selected formations
  - Indicate if values differ ("Mixed")
  - Preview changes before applying

### Mutation:

```typescript
const useBulkUpdateMetadata = () => {
  return useMutation({
    mutationFn: async ({ formationIds, updates, mode }: BulkMetadataUpdate) => {
      // Batch update via formationService
      return await formationService.bulkUpdateMetadata(
        formationIds,
        updates,
        mode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["formations"]);
      toast.success(`Updated ${count} formations`);
    },
  });
};
```

---

## Phase 4: Bulk Direction Assignment (45 min)

### Component:

**`BulkDirectionModal.tsx`** - Direction setter

### Features:

- **Direction Options:**
  - ⬅️ Left
  - ➡️ Right
  - ↔️ Both (auto-create opposites)
- **Smart Handling:**
  - If "Both" selected:
    - Check if opposite exists
    - Auto-create opposite if missing
    - Link formations bidirectionally
- **Preview:**
  - Show what will change
  - Highlight formations that already have opposites
  - Warn about creating new formations

### Mutation:

```typescript
const useBulkSetDirection = () => {
  return useMutation({
    mutationFn: async ({
      formationIds,
      direction,
      autoCreateOpposites,
    }: BulkDirectionUpdate) => {
      return await formationService.bulkSetDirection(
        formationIds,
        direction,
        autoCreateOpposites
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["formations"]);
      toast.success(
        `Set direction for ${data.updated} formations` +
          (data.created > 0 ? `, created ${data.created} opposites` : "")
      );
    },
  });
};
```

---

## Phase 5: Bulk Delete (30 min)

### Component:

**`BulkDeleteConfirmation.tsx`** - Smart delete modal

### Features:

- **Confirmation UI:**
  - List formations to be deleted
  - Show linked opposites that will be affected
  - Warning if deleting formations with plays
- **Safety Features:**
  - Require explicit confirmation
  - Show impact count
  - Option to keep opposites vs delete them too
- **Undo Option:**
  - Store deleted formations temporarily
  - "Undo" button for 10 seconds
  - Auto-clear undo history

### Mutation:

```typescript
const useBulkDelete = () => {
  const [undoData, setUndoData] = useState<Formation[] | null>(null);

  return useMutation({
    mutationFn: async ({ formationIds, deleteOpposites }: BulkDeleteParams) => {
      // Fetch formations first for undo
      const formations =
        await formationService.getFormationsByIds(formationIds);
      setUndoData(formations);

      return await formationService.bulkDelete(formationIds, deleteOpposites);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["formations"]);
      toast.success(`Deleted ${data.count} formations`, {
        action: { label: "Undo", onClick: handleUndo },
      });
    },
  });
};
```

---

## Phase 6: Service Layer (30 min)

### Add to `formationService.ts`:

```typescript
/**
 * Bulk update metadata for multiple formations
 */
async bulkUpdateMetadata(
  formationIds: string[],
  updates: Partial<FormationMetadata>,
  mode: 'replace' | 'merge'
): Promise<{ updated: number }> {
  // For 'merge' mode with tags, fetch existing and merge
  if (mode === 'merge' && updates.tags) {
    const { data: existing } = await supabase
      .from('formations')
      .select('id, tags')
      .in('id', formationIds);

    // Merge tags for each formation
    const mergedUpdates = existing.map(f => ({
      id: f.id,
      tags: [...new Set([...(f.tags || []), ...(updates.tags || [])])]
    }));

    // Batch update
    for (const update of mergedUpdates) {
      await supabase
        .from('formations')
        .update({ tags: update.tags })
        .eq('id', update.id);
    }
  } else {
    // Replace mode - simple batch update
    const { error } = await supabase
      .from('formations')
      .update(updates)
      .in('id', formationIds);

    if (error) throw error;
  }

  return { updated: formationIds.length };
}

/**
 * Bulk set direction with auto-opposite creation
 */
async bulkSetDirection(
  formationIds: string[],
  direction: 'left' | 'right' | 'both',
  autoCreateOpposites: boolean
): Promise<{ updated: number; created: number }> {
  let created = 0;

  if (direction === 'both' && autoCreateOpposites) {
    // Fetch formations to create opposites
    const { data: formations } = await supabase
      .from('formations')
      .select('*')
      .in('id', formationIds);

    for (const formation of formations || []) {
      if (!formation.opposite_formation_id) {
        // Create opposite
        const opposite = await this.createOppositeFormation(formation.id);
        created++;
      }
    }
  } else {
    // Simple direction update
    await supabase
      .from('formations')
      .update({ direction })
      .in('id', formationIds);
  }

  return { updated: formationIds.length, created };
}

/**
 * Bulk delete formations
 */
async bulkDelete(
  formationIds: string[],
  deleteOpposites: boolean
): Promise<{ count: number }> {
  if (deleteOpposites) {
    // Fetch opposite IDs
    const { data: formations } = await supabase
      .from('formations')
      .select('opposite_formation_id')
      .in('id', formationIds);

    const oppositeIds = formations
      ?.map(f => f.opposite_formation_id)
      .filter(Boolean) as string[];

    const allIds = [...formationIds, ...oppositeIds];

    const { error } = await supabase
      .from('formations')
      .delete()
      .in('id', allIds);

    if (error) throw error;
    return { count: allIds.length };
  } else {
    const { error } = await supabase
      .from('formations')
      .delete()
      .in('id', formationIds);

    if (error) throw error;
    return { count: formationIds.length };
  }
}
```

---

## Phase 7: React Query Hooks (20 min)

### Add to `useFormations.ts`:

```typescript
/**
 * Bulk update metadata for multiple formations
 */
export function useBulkUpdateMetadata(playbookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BulkMetadataUpdate) => {
      return await formationService.bulkUpdateMetadata(
        params.formationIds,
        params.updates,
        params.mode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(cacheKeys.byPlaybook(playbookId));
      queryClient.invalidateQueries(cacheKeys.incomplete(playbookId));
    },
  });
}

/**
 * Bulk set direction with optional opposite creation
 */
export function useBulkSetDirection(playbookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BulkDirectionUpdate) => {
      return await formationService.bulkSetDirection(
        params.formationIds,
        params.direction,
        params.autoCreateOpposites
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(cacheKeys.byPlaybook(playbookId));
      queryClient.invalidateQueries(cacheKeys.directionReview(playbookId));
    },
  });
}

/**
 * Bulk delete formations
 */
export function useBulkDelete(playbookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BulkDeleteParams) => {
      return await formationService.bulkDelete(
        params.formationIds,
        params.deleteOpposites
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(cacheKeys.byPlaybook(playbookId));
    },
  });
}
```

---

## UI/UX Considerations

### Selection Persistence:

- Keep selection when switching tabs
- Clear selection after bulk action completes
- Show selection count in toolbar

### Visual Feedback:

- Highlight selected formations (blue border)
- Disable non-bulk actions when items selected
- Loading states during bulk operations
- Success/error toasts with counts

### Performance:

- Batch database updates
- Optimistic UI updates
- React Query cache invalidation
- Max selection limit (100 formations?)

---

## Testing Checklist

- [ ] Select individual formations
- [ ] Select all formations
- [ ] Clear selection
- [ ] Bulk edit metadata (replace mode)
- [ ] Bulk edit tags (merge mode)
- [ ] Bulk set direction (left/right)
- [ ] Bulk set direction "both" with auto-opposite creation
- [ ] Bulk delete (keep opposites)
- [ ] Bulk delete (delete opposites)
- [ ] Undo delete
- [ ] Selection persists across tab changes
- [ ] Cache updates correctly after bulk actions
- [ ] Loading states show properly
- [ ] Error handling for failed operations

---

## File Structure

```
src/
├── components/
│   └── formations/
│       ├── BulkSelectionContext.tsx      (NEW)
│       ├── FormationCheckbox.tsx         (NEW)
│       ├── BulkActionToolbar.tsx         (NEW)
│       ├── BulkMetadataModal.tsx         (NEW)
│       ├── BulkDirectionModal.tsx        (NEW)
│       ├── BulkDeleteConfirmation.tsx    (NEW)
│       └── FormationBuilderPanel.tsx     (UPDATE)
├── hooks/
│   └── useFormations.ts                  (UPDATE - add bulk hooks)
└── services/
    └── formationService.ts               (UPDATE - add bulk methods)
```

---

## Expected Outcomes

**Time Savings:**

- Editing 20 formations: 10 minutes → 30 seconds (95% faster)
- Setting directions for 15 formations: 5 minutes → 10 seconds (96% faster)
- Deleting 10 formations: 2 minutes → 5 seconds (97% faster)

**User Benefits:**

- Massive productivity boost
- Less repetitive clicking
- Faster playbook setup
- Professional bulk editing experience

**Code Quality:**

- React Query integration (automatic caching)
- Type-safe bulk operations
- Comprehensive error handling
- Undo functionality for safety

---

## Next Steps

1. ✅ Create BulkSelectionContext
2. ✅ Add checkboxes to FormationBuilderPanel
3. ✅ Build BulkActionToolbar
4. ✅ Implement BulkMetadataModal
5. ✅ Implement BulkDirectionModal
6. ✅ Implement BulkDeleteConfirmation
7. ✅ Add service layer methods
8. ✅ Add React Query hooks
9. ✅ Test all features
10. ✅ Update documentation

Let's build this! 🚀
