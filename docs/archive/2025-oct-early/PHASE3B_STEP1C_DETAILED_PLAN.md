# Phase 3B Step 1c - Detailed Execution Plan

## Current State

- File: `PlayerControls.tsx`
- Lines: 1,355
- Status: Clean (at commit 637c3f05)

## Target State

- Lines: ~590 (56% reduction)
- All inline logic replaced with imported hooks/handlers

## Execution Strategy

### Part 1: Update Imports (Lines 1-14)

**Action**: Replace old imports with new hook/handler imports
**Risk**: LOW
**Verification**: Check for "unused" warnings (expected until Part 2)

### Part 2: Replace State & Effects (Lines 37-200)

**Action**: Replace ~165 lines with ~70 lines using custom hooks
**Risk**: MEDIUM - Must match exact text including all effect code
**Verification**: Check line count drops by ~95 lines

### Part 3: Delete handleAlignmentChange (Lines 474-633)

**Action**: Remove 160-line inline handler function
**Risk**: LOW - Function is now imported
**Verification**: Confirm no calls to old inline version remain

### Part 4: Delete Defense Formation Functions (Lines 272-352)

**Action**: Remove `detectOffensiveAlignment`, `executeDefenseFormation`, `executeNickel425`
**Risk**: LOW - Already have imports
**Verification**: Check calls use imported versions with correct params

### Part 5: Delete Utility Functions (Lines 212-477)

**Action**: Remove `getReceiverPositions`, `get3x1ReceiverPositions`, `getCenterXForAlignment`, `executeFormation`
**Risk**: MEDIUM - Some functions still called, ensure imports work
**Verification**: No "undefined" errors

### Part 6: Delete Inline Formation Functions (Lines 760-1001)

**Action**: Remove `executeAddOffenseFormation`, `executeSpread3x1Right`, `executeSpread3x1Left`
**Risk**: HIGH - Large deletion, must get exact boundaries
**Strategy**:

1. First update all CALLS to use `executeOffenseFormation()` from imports
2. Then delete the now-unused inline functions
   **Verification**: No errors, formation creation still works

## Commit Strategy

- Commit after Parts 1-2 complete (state management refactor)
- Commit after Parts 3-4 complete (handler deletion)
- Commit after Parts 5-6 complete (final cleanup)

## Recovery Plan

If any part fails:

1. Note the exact error
2. Reset file: `git checkout src/components/playbook/diagram-editor/components/PlayerControls.tsx`
3. Fix the specific replacement text
4. Retry from that part

## Success Criteria

- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors (except maybe unused vars during transition)
- ✅ Line count: ~590 lines
- ✅ Manual test: All formations work
- ✅ Manual test: Alignment changes work
- ✅ Manual test: Coverage adjustment works
