# PlayGrid Refactor - Status Update

## Current Progress

### ✅ Completed (Commit dcbd94de)
- **Directory structure created**
- **3 files extracted (~150 lines)**:
  1. `utils/playDataUtils.ts` - mapDatabasePlayToFullPlay (22 lines)
  2. `hooks/usePlayPreferences.ts` - UI preferences (25 lines)
  3. `hooks/useViewMode.ts` - View mode with media query logic (93 lines)

### 🔄 Next Steps

Given the size of PlayGrid (1,121 lines), I recommend a **TIME-BOXED APPROACH**:

## Option A: Complete Full Refactor (3-4 hours)
Continue extracting all 7 hooks, 3 handlers, and 4 components as planned.
- **Pros**: Full modularization, maximum code reuse
- **Cons**: Long session, diminishing returns

## Option B: Strategic Extraction (1-2 hours) ⭐ **RECOMMENDED**
Focus on the **highest-value extractions** only:

### Priority 1: Extract Remaining Hooks (30-45 min)
1. ✅ usePlayPreferences - DONE
2. ✅ useViewMode - DONE  
3. **usePlayExpansion** - Simple state management (30 lines)
4. **usePlaySelection** - Selection handling (40 lines)

### Priority 2: Extract Largest Handler (15-20 min)
- **handlePlaySave** - 80+ lines of complex DB mapping logic
  - This is the single largest inline function
  - High reusability (could be used in other components)
  - Clear separation of concerns

### Priority 3: Stop and Integrate (30 min)
- Wire up extracted hooks to main component
- Delete inline code
- Test and verify
- Commit

**Total time**: ~1.5 hours  
**Lines reduced**: ~250-300 lines (22% reduction)  
**Impact**: Significant improvement without diminishing returns

## Option C: Pause and Move to DiagramEditor
- PlayGrid is working well
- Focus energy on DiagramEditor.tsx (likely has bigger issues)
- Return to PlayGrid if needed later

## Recommendation

I recommend **Option B** - Strategic Extraction:
- Gets the most important code out (data handling, complex logic)
- Achieves meaningful reduction (20-25%)
- Leaves component in much better state
- Doesn't require 3-4 hour session
- Can always come back for more later

**Question for you**: Which option would you prefer?
- A: Full refactor (3-4 hours)
- B: Strategic extraction (1.5 hours) ⭐
- C: Move to DiagramEditor

Let me know and I'll proceed accordingly!
