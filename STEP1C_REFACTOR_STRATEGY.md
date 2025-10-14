# PlayerControls.tsx Refactoring Strategy - Clean Approach

## Starting Point
- File: 1,355 lines
- All handlers and hooks already extracted and tested
- Need to update imports and replace inline code

## Strategy: Do This in Order

### Part 1: Update Imports (SAFE - No deletions)
1. Update imports at top of file to include extracted hooks and handlers
2. Remove old defense imports that are now in handlers

### Part 2: Replace State Management (lines 45-85)
Replace inline state with custom hooks:
- `useFormationDropdowns()` - returns dropdown state + refs
- `useClickOutside()` - handles click outside logic + returns refs  
- `useAlignmentState()` - manages alignment with external sync
- `useFormationAnalysis()` - analyzes formation
- `useCoverageAdjustment()` - returns coverage adjustment handler

### Part 3: Delete Inline Utility Functions (BULK DELETE ~200 lines)
Delete these exact functions (find by searching):
- `getCenterXForAlignment` (lines ~308-327)
- `getReceiverPositions` (lines ~329-374)  
- `get3x1ReceiverPositions` (lines ~376-459)

### Part 4: Delete Inline Handler Functions (BULK DELETE ~650 lines)
Delete these exact functions:
- `detectOffensiveAlignment` (lines ~511-540)
- `executeDefenseFormation` (lines ~542-555)
- `executeNickel425` (lines ~557-589)
- `handleAlignmentChange` (lines ~591-854) - **HUGE 264 lines**
- `executeSpread2x2` / `executeAddOffenseFormation` (lines ~856-940)
- `executeSpread3x1Right` (lines ~942-1026)
- `executeSpread3x1Left` (lines ~1028-1112)

### Part 5: Update Remaining Functions
Update these to call imported handlers:
- `handleAddOffenseFormation` - call `executeOffenseFormation()`
- `handleAddDefenseFormation` - call `executeDefenseFormation()` and `detectOffensiveAlignment()`
- Remove `executeFormation` wrapper function

### Part 6: Clean Up Effects
- Remove old click outside effect (already in hook)
- Remove prevExternalAlignment effect (already in `useAlignmentState`)
- Update coverage adjustment to use hook

## Expected Result
- From: 1,355 lines
- To: ~450-500 lines
- Reduction: ~855 lines (63%)

## Key Files Already Created
✅ hooks/useClickOutside.ts
✅ hooks/useFormationDropdowns.ts  
✅ hooks/useAlignmentState.ts
✅ hooks/useFormationAnalysis.ts
✅ hooks/useCoverageAdjustment.ts
✅ handlers/formationUtils.ts
✅ handlers/offenseFormationHandlers.ts
✅ handlers/defenseFormationHandlers.ts
✅ handlers/alignmentHandlers.ts
✅ handlers/index.ts

All exported and ready to import!
