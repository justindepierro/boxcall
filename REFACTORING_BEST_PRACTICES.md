# Refactoring Best Practices & System for Large Components

## 🎯 Goal
Refactor large components systematically while maintaining:
- ✅ Zero errors at every step
- ✅ Testable intermediate states
- ✅ Clear rollback points
- ✅ Readable, maintainable code

## 📋 Proven 6-Step Strategy (Used for PlayerControls.tsx)

### Step 1: Update Imports ✅
**What**: Replace old imports with extracted module imports
**Risk**: LOW
**Verification**: Check for "unused" warnings (expected until Step 2)
**Commit**: No - wait for Step 2

### Step 2: Replace State Management ✅
**What**: Replace inline state/effects with custom hooks
**Risk**: MEDIUM
**Key**: Match exact text including whitespace
**Verification**: Line count drops ~100-150 lines, hooks return expected values
**Commit**: YES - After Steps 1 & 2 together

### Step 3: Delete Unused Handler Functions ✅
**What**: Remove large inline handlers now covered by imports
**Risk**: LOW-MEDIUM
**Method**: Use `sed` for precision on large blocks (150+ lines)
**Verification**: Functions marked as "unused" before deletion
**Commit**: YES - Critical milestone

### Step 4: Replace Function Calls ✅
**What**: Update calls to use imported handlers with correct parameters
**Risk**: MEDIUM
**Key**: Check handler signatures carefully
**Verification**: All "undefined" errors resolve
**Commit**: YES - Functionality restored

### Step 5: Delete Utility Functions ✅
**What**: Remove inline utils now in extracted modules
**Risk**: MEDIUM
**Warning**: Be surgical - don't delete active functions!
**Verification**: Only "unused" functions deleted
**Commit**: YES - After verifying no active code deleted

### Step 6: Delete Inline Formation Functions 🔄
**What**: Remove large inline formation builders
**Risk**: HIGH
**Strategy**: 
1. First update ALL calls to use imported versions
2. Then delete the now-unused inline functions
3. Verify formations still work in UI
**Verification**: Manual testing of formations
**Commit**: YES - Major milestone

## 🛠️ Tools & Techniques

### When String Replacement Fails
```bash
# Use sed for large blocks (safer for 100+ lines)
sed -i '' 'START_LINE,END_LINEd' file.tsx

# Always create backup first
cp file.tsx file.tsx.backup

# Verify line count after each operation
wc -l file.tsx
```

### Commit Strategy
```bash
# Commit after every 100-200 lines removed
git add -A
git commit -m "refactor: Describe what was removed/replaced
- Specific changes
- Line count: BEFORE → AFTER
- Status: All errors resolved"

# Tag major milestones
git tag -a "phase3b-step1c-part3-complete" -m "Handler functions removed"
```

### Error Management
```bash
# Check errors frequently
npm run type-check 2>&1 | grep "ERROR"

# Zero errors = safe to commit
# Non-zero errors = investigate before proceeding
```

## 📊 Progress Tracking Template

Create a STATUS.md file:

```markdown
# Component Refactor Status

## Target
- Start: 1,355 lines
- Target: ~500 lines (63% reduction)
- Current: 792 lines ✅ (42% reduction so far)

## Completed ✅
- [x] Part 1: Imports updated
- [x] Part 2: State management with hooks (106 lines removed)
- [x] Part 3: Handler functions deleted (164 lines removed)
- [x] Part 4: Defense formation calls updated (31 lines removed)
- [x] Part 5: Utility functions deleted (205 lines removed)

## In Progress 🔄
- [ ] Part 6: Offense formation functions (est. 240 lines)

## Next Steps
1. Update offense formation calls to use imported `executeOffenseFormation`
2. Delete inline `executeAddOffenseFormation`, `executeSpread3x1Right`, `executeSpread3x1Left`
3. Manual test all formations
4. Commit final state
```

## 🎨 Code Organization Principles

### Extract to Modules When:
- Function > 50 lines
- Logic is reused 2+ times
- Function has clear single responsibility
- Function can be tested independently

### Module Structure:
```
ComponentName/
├── hooks/
│   ├── useComponentState.ts       # State management
│   ├── useComponentEffects.ts     # Side effects
│   └── useComponentCallbacks.ts   # Memoized callbacks
├── handlers/
│   ├── dataHandlers.ts            # Data manipulation
│   ├── eventHandlers.ts           # User interactions
│   └── index.ts                   # Barrel exports
├── utils/
│   ├── calculations.ts            # Pure functions
│   └── validators.ts              # Validation logic
└── types.ts                       # Shared types
```

### Keep in Component:
- JSX rendering logic
- Component-specific state coordination
- Props destructuring
- Return statement

## 🔍 Quality Gates

### Before Committing:
- [ ] `npm run type-check` ✅ passes
- [ ] `npm run lint` ≤ baseline warnings
- [ ] Line count decreased as expected
- [ ] No "undefined" errors
- [ ] Git diff makes sense

### Before Marking Step Complete:
- [ ] Manual test in UI
- [ ] Console has no errors
- [ ] Features still work
- [ ] Performance hasn't degraded

## 🚨 Recovery Plan

### If Things Break:
```bash
# 1. Check what changed
git diff HEAD

# 2. If too messy, reset to last commit
git reset --hard HEAD

# 3. Or reset specific file
git checkout HEAD -- path/to/file.tsx

# 4. Restore from backup
cp file.tsx.backup file.tsx

# 5. Start again with smaller steps
```

### If Stuck:
1. **Commit current progress** - even if incomplete
2. **Document the issue** - what you tried, what failed
3. **Take a break** - fresh eyes help
4. **Try alternative approach** - sed instead of replace, manual edit, etc.

## 📈 Success Metrics

### Phase 3B Step 1c (PlayerControls) Results:
- **Started**: 1,355 lines
- **Current**: 792 lines  
- **Removed**: 563 lines (42% reduction)
- **Errors**: 0 ✅
- **Time**: ~2 hours
- **Commits**: 5 (every major step)

### Quality Maintained:
- ✅ All TypeScript checks pass
- ✅ Zero runtime errors
- ✅ All features still work
- ✅ More testable (extracted modules)
- ✅ Easier to read (clear separation)

## 🎯 Next Component: PlayGrid.tsx

**Current**: ~800 lines  
**Target**: ~400 lines (50% reduction)

**Strategy**:
1. Extract grid rendering → `GridView.tsx`
2. Extract list rendering → `ListView.tsx`  
3. Extract edit handlers → `playEditHandlers.ts`
4. Extract delete handlers → `playDeleteHandlers.ts`
5. Extract confirmation modal → `ConfirmationModal.tsx`

**Estimated time**: 3-4 hours
**Commits**: 6-8 (one per extraction)

## 💡 Key Takeaways

1. **Small Steps**: 100-200 lines at a time
2. **Frequent Commits**: Never lose more than 30 min of work
3. **Verify Everything**: Type check + error check after every change
4. **Use Tools**: sed for large blocks, replace for targeted changes
5. **Document Progress**: Update STATUS.md after each part
6. **Test Manually**: Compile checks aren't enough
7. **Stay Organized**: Backups, branches, tags for safety

## 🔗 Related Documents
- `PHASE3B_STEP1C_DETAILED_PLAN.md` - Detailed execution plan
- `STEP1C_REFACTOR_STRATEGY.md` - Original strategy
- `SPRING_CLEANING_PHASE3B_STATUS.md` - Overall progress
