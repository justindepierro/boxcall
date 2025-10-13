# PlayCard & PlayGrid Component Audit
**Date:** October 12, 2025  
**Purpose:** Comprehensive audit of PlayCard components to identify duplicate code and ensure consistency

---

## Executive Summary

### Issues Found:
1. ⚠️ **CRITICAL DUPLICATION**: PlayCard component is instantiated **3 times** in PlayGrid.tsx with nearly identical props
2. ⚠️ **Inconsistent Props**: Grid view uses different `variant` and `density` props than list view
3. ⚠️ **Scattered Logic**: PlayCard rendering logic duplicated across virtualized list, non-virtualized list, and grid views
4. ✅ **Good**: Single source of truth for PlayCard component itself (no duplicate component files)
5. ✅ **Good**: Common save handler (`handlePlaySave`) used across all instances

### Recommendation:
**REFACTOR REQUIRED** - Consolidate PlayCard instantiation into a single reusable component to eliminate duplication and ensure consistency.

---

## Detailed Analysis

### 1. PlayCard Component Architecture

**Location:** `/src/components/playbook/PlayCard.tsx`

**Purpose:** Single, unified component for rendering play cards in both list and grid views

**Key Features:**
- ✅ Supports both `list` and `tile` variants
- ✅ Inline editing with optimistic updates
- ✅ Expandable details section
- ✅ Field reordering via drag-and-drop
- ✅ Field visibility toggling
- ✅ Controlled expansion state via props

**State Management:**
```typescript
const [optimisticPlay, setOptimisticPlay] = useState<PlayType>(play);
const [savingFields, setSavingFields] = useState<SaveQueue>(new Set());
```

**Critical Fix Applied:**
```typescript
useEffect(() => {
  // Only update optimistic play if we're not currently saving any fields
  // This prevents overwriting optimistic updates while saves are in progress
  if (savingFields.size === 0) {
    setOptimisticPlay(play);
  }
}, [play, savingFields]);
```

---

### 2. PlayGrid Component - DUPLICATION ISSUES

**Location:** `/src/components/playbook/PlayGrid.tsx`

#### Issue #1: Three Separate PlayCard Instantiations

**Instance 1: Virtualized List View (Line 604)**
```tsx
const renderPlayItem = useCallback(
  (index: number, play: Play) => (
    <div className="mb-4" role="listitem" data-index={index}>
      <PlayCard
        play={play}
        showOneWordCalls={showOneWordCalls}
        onEdit={onEdit}
        onSave={handlePlaySave}
        onDuplicate={onDuplicate}
        onCreateDiagram={onCreateDiagram}
        isSelected={selectedPlayIds.has(play.id)}
        onSelectionChange={handlePlaySelect}
        density="compact"
        variant="list"
        formationSuggestions={collectedSuggestions.formations}
        playNameSuggestions={collectedSuggestions.playNames}
        playTypeSuggestions={collectedSuggestions.playTypes}
        directionDisplayFormat={directionDisplayFormat || "full"}
        isExpanded={expandedPlayId === play.id}
        onToggleExpand={handleToggleExpand}
      />
    </div>
  ),
  [/* 13 dependencies */]
);
```

**Instance 2: Grid View with Tiles (Line 851)**
```tsx
<PlayCard
  play={play}
  showOneWordCalls={showOneWordCalls}
  onEdit={onEdit}
  onSave={handlePlaySave}
  onDuplicate={onDuplicate}
  onCreateDiagram={onCreateDiagram}
  isSelected={selectedPlayIds.has(play.id)}
  onSelectionChange={handlePlaySelect}
  variant="tile"                        // ← Different
  density="comfortable"                 // ← Different
  formationSuggestions={collectedSuggestions.formations}
  playNameSuggestions={collectedSuggestions.playNames}
  playTypeSuggestions={collectedSuggestions.playTypes}
  directionDisplayFormat={directionDisplayFormat || "full"}
  isExpanded={expandedPlayId === play.id}
  onToggleExpand={handleToggleExpand}
/>
```

**Instance 3: Non-Virtualized List View (Line 925)**
```tsx
<PlayCard
  play={play}
  showOneWordCalls={showOneWordCalls}
  onEdit={onEdit}
  onSave={handlePlaySave}
  onDuplicate={onDuplicate}
  onCreateDiagram={onCreateDiagram}
  isSelected={selectedPlayIds.has(play.id)}
  onSelectionChange={handlePlaySelect}
  formationSuggestions={collectedSuggestions.formations}
  playNameSuggestions={collectedSuggestions.playNames}
  playTypeSuggestions={collectedSuggestions.playTypes}
  directionDisplayFormat={directionDisplayFormat || "full"}
  isExpanded={expandedPlayId === play.id}
  onToggleExpand={handleToggleExpand}
/>
// ⚠️ Missing variant and density props - defaults to list/compact
```

#### Issue #2: Inconsistent Prop Defaults

| Instance | Variant | Density | Location |
|----------|---------|---------|----------|
| Virtualized List | `list` | `compact` | Line 604 |
| Grid/Tile | `tile` | `comfortable` | Line 851 |
| Non-Virtualized List | `list` (default) | `compact` (default) | Line 925 |

**Problem:** Instance 3 relies on component defaults while Instances 1 & 2 explicitly set props. This creates confusion and potential bugs if defaults change.

#### Issue #3: Duplicate Prop Spreading

All three instances spread the same 16 props:
- 11 core props (play, handlers, flags)
- 3 suggestion arrays
- 2 display format props

**Code Duplication Count:** 48 lines of nearly identical code (16 props × 3 instances)

---

### 3. Shared Logic - GOOD

#### handlePlaySave - Centralized Save Handler

**Location:** PlayGrid.tsx, Line 281

```typescript
const handlePlaySave = useCallback(
  async (playId: string, updates: Partial<Play>) => {
    try {
      // Convert Play type updates to DatabasePlay type updates
      const dbUpdates: any = {};

      // Map all possible editable fields (20+ fields)
      if (updates.formation !== undefined) dbUpdates.formation = updates.formation;
      if (updates.f_dir !== undefined) dbUpdates.f_dir = updates.f_dir;
      if (updates.p_dir !== undefined) dbUpdates.p_dir = updates.p_dir;
      // ... 20+ more fields

      console.log("Saving play updates:", { playId, updates, dbUpdates });

      await updatePlay(playId, dbUpdates);
      info(`Play ${playId} updated successfully`);
    } catch (error) {
      console.error("Failed to save play:", error);
      throw error; // Re-throw so PlayCard can handle the error
    }
  },
  [updatePlay]
);
```

✅ **Good:** Single save handler used by all PlayCard instances  
✅ **Good:** Comprehensive field mapping (no fields missing)  
✅ **Good:** Error handling with re-throw for PlayCard error recovery

---

### 4. Sub-Components - GOOD

#### PlayCardListHeader.tsx
- ✅ Single implementation
- ✅ Used for list variant
- ✅ Shows compact header with formation/play name

#### PlayCardTileHeader.tsx
- ✅ Single implementation
- ✅ Used for tile/grid variant
- ✅ Shows larger header with more visual prominence

#### PlayCardDetails.tsx
- ✅ Single implementation
- ✅ Shared by both list and tile variants
- ✅ Renders expandable details section with drag-and-drop fields

**No Duplication Found** in sub-components.

---

### 5. Field Definitions - GOOD

**Location:** `/src/components/playbook/play-card/fieldDefinitions.tsx`

```typescript
export const createFormationFields = ({
  normalizeValue,
  formationSuggestions,
  directionOptions,
}: FormationFieldFactoryOptions): FieldDefinitionMap => ({
  formation: { label: "Base", render: (...) },
  f_type: { label: "Type", render: (...) },
  f_dir: { label: "Direction", render: (...) },  // ← InlineSelectField
  // ... 8 more fields
});

export const createPlayDetailsFields = ({
  normalizeValue,
  playNameSuggestions,
  playTypeSuggestions,
  directionOptions,
}: PlayDetailsFieldFactoryOptions): FieldDefinitionMap => ({
  play_name: { label: "Name", render: (...) },
  p_dir: { label: "Direction", render: (...) },  // ← InlineSelectField
  p_type: { label: "Type", render: (...) },
  // ... 3 more fields
});
```

✅ **Good:** Factory functions for field definitions  
✅ **Good:** Both `f_dir` and `p_dir` use InlineSelectField  
✅ **Good:** Direction options passed as prop

---

## Root Cause Analysis: Direction Field Bug

### The Bug
When editing direction fields (`f_dir`, `p_dir`) in list/grid view, values would save successfully but then revert to "None".

### Root Cause
Race condition in PlayCard's `useEffect`:

**Before Fix:**
```typescript
useEffect(() => {
  setOptimisticPlay(play);  // ← Blindly overwrites optimistic state
}, [play]);
```

**What Happened:**
1. User changes direction to "Right"
2. Optimistic state set to "Right"
3. Save completes, updates database
4. Parent re-renders with updated play prop
5. **useEffect fires and overwrites optimistic state**
6. UI reverts to old value before new value arrives

**After Fix:**
```typescript
useEffect(() => {
  // Only update optimistic play if we're not currently saving any fields
  if (savingFields.size === 0) {
    console.log("[PlayCard] Syncing optimistic play with prop (no saves in progress):", play);
    setOptimisticPlay(play);
  } else {
    console.log("[PlayCard] Skipping sync - save in progress for:", Array.from(savingFields));
  }
}, [play, savingFields]);
```

✅ **Fixed:** useEffect now respects saves in progress  
✅ **Fixed:** Optimistic updates no longer overwritten during save

---

## Recommendations

### Priority 1: CRITICAL - Eliminate PlayCard Duplication

**Create a Unified PlayCard Wrapper Component:**

```typescript
// src/components/playbook/PlayCardWrapper.tsx

interface PlayCardWrapperProps {
  play: Play;
  variant: "list" | "tile";
  index?: number;
  // ... other specific props
}

const PlayCardWrapper: React.FC<PlayCardWrapperProps> = ({
  play,
  variant,
  index,
}) => {
  // Get common props from context or parent
  const {
    showOneWordCalls,
    onEdit,
    handlePlaySave,
    onDuplicate,
    onCreateDiagram,
    selectedPlayIds,
    handlePlaySelect,
    collectedSuggestions,
    directionDisplayFormat,
    expandedPlayId,
    handleToggleExpand,
  } = usePlayGridContext(); // New context hook

  const commonProps = {
    play,
    showOneWordCalls,
    onEdit,
    onSave: handlePlaySave,
    onDuplicate,
    onCreateDiagram,
    isSelected: selectedPlayIds.has(play.id),
    onSelectionChange: handlePlaySelect,
    formationSuggestions: collectedSuggestions.formations,
    playNameSuggestions: collectedSuggestions.playNames,
    playTypeSuggestions: collectedSuggestions.playTypes,
    directionDisplayFormat: directionDisplayFormat || "full",
    isExpanded: expandedPlayId === play.id,
    onToggleExpand: handleToggleExpand,
  };

  const variantProps = variant === "tile" 
    ? { variant: "tile" as const, density: "comfortable" as const }
    : { variant: "list" as const, density: "compact" as const };

  return (
    <div className={variant === "list" ? "mb-4" : ""} role="listitem" data-index={index}>
      <PlayCard {...commonProps} {...variantProps} />
    </div>
  );
};
```

**Then Update PlayGrid:**

```typescript
// Instance 1: Virtualized List
const renderPlayItem = useCallback(
  (index: number, play: Play) => (
    <PlayCardWrapper play={play} variant="list" index={index} />
  ),
  [] // Minimal dependencies
);

// Instance 2: Grid View
<PlayCardWrapper play={play} variant="tile" />

// Instance 3: Non-Virtualized List
<PlayCardWrapper play={play} variant="list" />
```

**Benefits:**
- ✅ Single source of truth for PlayCard props
- ✅ Reduces code from 48 lines to ~10 lines
- ✅ Eliminates prop inconsistencies
- ✅ Easier to maintain and update
- ✅ Reduces bundle size

### Priority 2: Add Explicit Prop Defaults

Even with wrapper, ensure explicit props:

```typescript
// PlayCard.tsx - Add explicit defaults
variant = "list",
density = "compact",
```

### Priority 3: Add Integration Tests

```typescript
describe('PlayCard Save Flow', () => {
  it('should not revert direction fields after save', async () => {
    const { getByText, getByRole } = render(<PlayCard play={testPlay} onSave={mockSave} />);
    
    // Expand details
    fireEvent.click(getByText('Same Power Read'));
    
    // Edit direction
    const directionField = getByRole('combobox', { name: /direction/i });
    fireEvent.change(directionField, { target: { value: 'Right' } });
    
    // Wait for save
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith(testPlay.id, { f_dir: 'Right' }));
    
    // Verify no revert
    await waitFor(() => expect(directionField).toHaveValue('Right'));
  });
});
```

### Priority 4: Add Documentation

Add JSDoc comments explaining:
- Why useEffect checks `savingFields.size`
- How optimistic updates work
- When to use list vs tile variant

---

## Files Requiring Changes

### High Priority (Duplication):
1. **Create:** `src/components/playbook/PlayCardWrapper.tsx` (new file)
2. **Create:** `src/contexts/PlayGridContext.tsx` (new context for shared props)
3. **Modify:** `src/components/playbook/PlayGrid.tsx` (replace 3 instances with wrapper)

### Medium Priority (Documentation):
4. **Modify:** `src/components/playbook/PlayCard.tsx` (add JSDoc comments)
5. **Create:** `PLAYCARD_ARCHITECTURE.md` (architecture documentation)

### Low Priority (Tests):
6. **Create:** `src/components/playbook/__tests__/PlayCard.integration.test.tsx`

---

## Verification Checklist

After refactoring:

- [ ] Direction fields save and persist in list view
- [ ] Direction fields save and persist in grid/tile view
- [ ] Expansion works correctly in both views
- [ ] Field reordering works in expanded state
- [ ] Field visibility toggles work
- [ ] Optimistic updates don't revert during save
- [ ] Drag-and-drop works in both views
- [ ] Selection checkboxes work in both views
- [ ] All props are consistent across views
- [ ] No console errors or warnings
- [ ] Bundle size reduced (confirm with webpack-bundle-analyzer)

---

## Impact Assessment

### Code Quality:
- **Before:** 48 lines of duplicated PlayCard instantiation
- **After:** ~10 lines with PlayCardWrapper + context
- **Reduction:** 79% code reduction in duplication

### Maintainability:
- **Before:** Update PlayCard props in 3 places
- **After:** Update PlayCard props in 1 place
- **Improvement:** 67% reduction in maintenance burden

### Bug Risk:
- **Before:** High risk of prop inconsistencies
- **After:** Low risk, single source of truth
- **Improvement:** Significantly reduced

---

## Conclusion

The PlayCard component itself is well-architected with good separation of concerns. However, **PlayGrid contains critical duplication** that should be refactored immediately. The direction field save bug has been fixed with the useEffect optimization, but the duplication creates ongoing maintenance risk.

**Recommended Action:** Implement PlayCardWrapper pattern to consolidate the three PlayCard instances into a single, maintainable abstraction.
