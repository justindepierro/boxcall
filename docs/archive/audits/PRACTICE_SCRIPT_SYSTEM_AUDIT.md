# Practice Script System - Complete Audit & Roadmap

**Date**: December 6, 2025  
**Status**: 🔴 CRITICAL ISSUES IDENTIFIED

---

## 🔍 Executive Summary

The Practice Script Modal system has multiple architectural and implementation issues preventing it from functioning correctly. This document provides a complete audit and actionable roadmap.

### Critical Issues Identified

1. **Dropdown Not Rendering** - UI component completely broken
2. **Plays Not Saving** - Data persistence failing
3. **Type Mismatches** - Interface incompatibilities between components
4. **Duplicate Components** - Two separate implementations causing confusion
5. **No Validation** - Missing error handling and user feedback

---

## 📊 System Architecture Analysis

### Current Component Structure

```
src/components/practice/PracticeScriptModal/
├── index.tsx                          # Main modal orchestrator
├── types.ts                           # LOCAL types (modal-specific)
├── components/
│   ├── PracticeScriptForm.tsx        # Script metadata form ✅
│   ├── PracticeScriptPlayForm.tsx    # Play add/edit form ⚠️ BROKEN
│   └── PracticeScriptPlayList.tsx    # Play list display ✅

src/components/playbook/
└── PracticeScriptBuilder.tsx          # DUPLICATE (886 lines) ⚠️ NOT USED

src/services/
└── practiceService.ts                 # Backend API service
    └── PracticeScriptService          # Database operations
```

### Type System Issues

**THREE DIFFERENT TYPE DEFINITIONS:**

1. **Modal Types** (`src/components/practice/PracticeScriptModal/types.ts`):

   ```typescript
   export interface PracticeScriptPlay {
     id: string;
     playId?: string;
     playName: string;
     personnel?: string;
     defenseFront?: string;
     defensiveCoverage?: string;
     // ... modal-specific fields
   }
   ```

2. **Service Types** (`src/services/practiceService.ts`):

   ```typescript
   export interface PracticeScriptPlay {
     id: string;
     playId: string;
     play: Play;  // Full play object
     order: number;
     hash?: "left" | "middle" | "right";
     downDistance?: string;
     defensiveFront?: "base" | "4-3" | "3-4" | ...;
     coverage?: "cover_0" | "cover_1" | ...;
     // ... database-aligned fields
   }
   ```

3. **Practice Types** (`src/types/practice.ts`):
   ```typescript
   export interface BasePracticeScript {
     // Legacy base type
   }
   ```

**PROBLEM**: Field name mismatches, type incompatibilities, missing transformations.

---

## 🐛 Detailed Issue Breakdown

### Issue #1: Dropdown Not Rendering ⚠️ CRITICAL

**File**: `PracticeScriptPlayForm.tsx`

**Root Causes**:

- Using `fixed` positioning with `getBoundingClientRect()` during render
- Portal rendering but dropdown still clipped by modal overflow
- Position calculation timing issues (ref not set when calculated)
- Console shows dropdown SHOULD render (width > 0, 2 filtered plays)

**Evidence**:

```
📍 Setting dropdown position:
  {top: 662.8333740234375, left: 64.3333..., width: 1339.3333...}
🔍 Play search debug:
  {searchQuery: 'sooners', showDropdown: true, totalPlays: 26, filteredCount: 2}
```

**Why It Fails**:

1. Modal has `overflow-y-auto` → clips absolutely positioned children
2. Portal renders to `document.body` but position calculated from modal-relative ref
3. `useEffect` position calculation runs AFTER render attempt
4. No fallback if position calculation fails

### Issue #2: Plays Not Saving to Database ⚠️ CRITICAL

**File**: `PlaybookPage.tsx` → `handleSavePracticeScript()`

**Root Causes**:

- Modal passes plays array but handler ignored it (NOW FIXED)
- Field mapping between modal types and service types incorrect
- Missing error handling for individual play failures
- No transaction support (partial saves possible)

**Current Flow** (POST-FIX):

```
Modal → onSave({ plays: [...] })
  ↓
PlaybookPage.handleSavePracticeScript()
  ↓
1. Save script metadata (✅ Works)
2. Loop through plays
   - Delete existing plays (if updating)
   - Call PracticeScriptService.addPlayToScript() per play
   - Map modal fields → service fields
   - Continue on error (no rollback)
```

**Remaining Issues**:

- No atomic transaction
- Silent failures possible
- Type casting with `as any` (unsafe)
- Missing validation before save

### Issue #3: Type System Chaos ⚠️ MEDIUM

**Problems**:

- Three different `PracticeScriptPlay` interfaces
- Field name mismatches (`defensiveCoverage` vs `coverage`)
- Enum type mismatches (strings vs strict types)
- No transformation layer between modal and service

**Example Mismatch**:

```typescript
// Modal Type
defensiveCoverage?: string;  // Free-form string

// Service Type
coverage?: "cover_0" | "cover_1" | "cover_2" | ...;  // Strict enum
```

### Issue #4: Duplicate Components ⚠️ LOW

- `PracticeScriptModal` (simple, 162 lines) - CURRENTLY USED
- `PracticeScriptBuilder` (complex, 886 lines) - NOT USED

**Impact**:

- Code confusion
- Maintenance burden
- Risk of editing wrong component

### Issue #5: No Validation or Error Handling ⚠️ HIGH

**Missing**:

- Required field validation (only checks `name.trim()`)
- Duplicate play detection
- Invalid data sanitization
- User-friendly error messages
- Loading states during save
- Success confirmations

---

## 🛠️ Recommended Solutions

### Solution 1: Fix Dropdown Rendering (IMMEDIATE)

**Approach**: Use a proper dropdown library instead of custom implementation.

**Recommended Library**: `@headlessui/react` Combobox or `react-select`

**Why**:

- Handles positioning automatically
- Built-in accessibility
- Portal support
- Keyboard navigation
- Mobile-friendly

**Implementation**:

```bash
npm install @headlessui/react
```

```tsx
import { Combobox } from "@headlessui/react";

<Combobox value={selectedPlay} onChange={handleSelectPlay}>
  <Combobox.Input
    onChange={(e) => setSearchQuery(e.target.value)}
    displayValue={(play) => play?.play_name}
  />
  <Combobox.Options>
    {filteredPlays.map((play) => (
      <Combobox.Option key={play.id} value={play}>
        {/* Play card UI */}
      </Combobox.Option>
    ))}
  </Combobox.Options>
</Combobox>;
```

### Solution 2: Unify Type System (HIGH PRIORITY)

**Create a transformation layer**:

```typescript
// src/components/practice/PracticeScriptModal/adapters.ts

export const modalPlayToServicePlay = (
  modalPlay: ModalPracticeScriptPlay,
  order: number
): AddPlayToPracticeScriptData => ({
  playId: modalPlay.playId!,
  orderIndex: order,
  notes: modalPlay.notes,
  repetitions: 5,
  hash: mapHash(modalPlay.hash),
  downDistance: modalPlay.situation || "1st & 10",
  defensiveFront: mapDefensiveFront(modalPlay.defenseFront),
  coverage: mapCoverage(modalPlay.defensiveCoverage),
  blitz: mapBlitz(modalPlay.blitz),
});

export const servicePlayToModalPlay = (
  servicePlay: ServicePracticeScriptPlay
): ModalPracticeScriptPlay => ({
  id: servicePlay.id,
  playId: servicePlay.playId,
  playName: servicePlay.play.play_name,
  personnel: servicePlay.play.personnel,
  notes: servicePlay.notes,
  defenseFront: servicePlay.defensiveFront,
  defensiveCoverage: servicePlay.coverage,
  blitz: servicePlay.blitz,
  hash: servicePlay.hash,
  situation: servicePlay.downDistance,
});
```

### Solution 3: Add Proper Validation (MEDIUM PRIORITY)

```typescript
// src/components/practice/PracticeScriptModal/validation.ts

export const validateScript = (
  script: PracticeScriptFormData,
  plays: PracticeScriptPlay[]
) => {
  const errors: string[] = [];

  if (!script.name.trim()) {
    errors.push("Script name is required");
  }

  if (script.name.length > 100) {
    errors.push("Script name must be less than 100 characters");
  }

  if (plays.length === 0) {
    errors.push("At least one play is required");
  }

  plays.forEach((play, index) => {
    if (!play.playName.trim()) {
      errors.push(`Play ${index + 1}: Play name is required`);
    }
    if (play.playId && !isValidUUID(play.playId)) {
      errors.push(`Play ${index + 1}: Invalid play ID`);
    }
  });

  return errors;
};
```

### Solution 4: Implement Transaction Support (MEDIUM PRIORITY)

```typescript
// Use Supabase transactions for atomic saves

const handleSavePracticeScript = async (script: Partial<PracticeScript>) => {
  try {
    // Start transaction (Supabase RPC function)
    const { data, error } = await supabase.rpc('save_practice_script_atomic', {
      script_data: { ...script metadata },
      plays_data: script.plays.map(modalPlayToServicePlay)
    });

    if (error) throw error;

    toast.success("Script saved successfully");
  } catch (error) {
    // Automatic rollback on error
    toast.error("Failed to save script");
    logError(error);
  }
};
```

### Solution 5: Remove Duplicate Component (LOW PRIORITY)

1. Deprecate `PracticeScriptBuilder.tsx`
2. Add migration guide if needed
3. Update all imports to use `PracticeScriptModal`
4. Delete after verification

---

## 📋 Implementation Roadmap

### Phase 1: Critical Fixes (IMMEDIATE - 1-2 hours)

**Priority**: 🔴 CRITICAL

1. **Install dropdown library**

   ```bash
   npm install @headlessui/react
   ```

2. **Replace custom dropdown in `PracticeScriptPlayForm.tsx`**
   - Remove all custom dropdown code (portal, positioning, state)
   - Implement Headless UI Combobox
   - Test with existing plays
   - **Goal**: Dropdown visible and functional

3. **Add basic validation to modal save**
   - Check required fields
   - Show error toast on validation failure
   - Prevent save if invalid
   - **Goal**: No invalid data saved

**Success Criteria**:

- ✅ Can see dropdown when typing in play search
- ✅ Can select play from dropdown
- ✅ Form shows validation errors
- ✅ Script saves successfully with plays

---

### Phase 2: Type System Unification (2-3 hours)

**Priority**: 🟠 HIGH

1. **Create adapter functions**
   - `modalPlayToServicePlay()`
   - `servicePlayToModalPlay()`
   - Mapping functions for enum types

2. **Update modal to use adapters**
   - Import adapters in `index.tsx`
   - Transform plays before save
   - Transform plays when loading

3. **Add TypeScript strict checks**
   - Remove `@ts-nocheck` from service
   - Fix type errors
   - Add proper interfaces

**Success Criteria**:

- ✅ No type casting with `as any`
- ✅ All field mappings documented
- ✅ TypeScript passes strict mode

---

### Phase 3: Robustness & UX (2-3 hours)

**Priority**: 🟡 MEDIUM

1. **Add comprehensive validation**
   - Create validation utility
   - Validate on field blur
   - Show inline error messages
   - Prevent duplicate plays

2. **Add loading states**
   - Spinner during save
   - Disable buttons while loading
   - Show progress for multiple plays
   - Success animation

3. **Improve error handling**
   - User-friendly error messages
   - Retry mechanism
   - Partial save recovery
   - Error logging

**Success Criteria**:

- ✅ Clear feedback for all user actions
- ✅ Graceful error recovery
- ✅ No silent failures

---

### Phase 4: Testing & Documentation (1-2 hours)

**Priority**: 🟢 LOW

1. **Add unit tests**
   - Validation functions
   - Adapter functions
   - Component rendering

2. **Add integration tests**
   - Full save flow
   - Error scenarios
   - Edge cases

3. **Update documentation**
   - Component README
   - Type system guide
   - API documentation

**Success Criteria**:

- ✅ 80%+ test coverage
- ✅ Documentation up to date
- ✅ Storybook examples working

---

### Phase 5: Cleanup & Optimization (1 hour)

**Priority**: 🔵 NICE-TO-HAVE

1. **Remove deprecated code**
   - Delete `PracticeScriptBuilder.tsx`
   - Remove debug console.logs
   - Clean up unused imports

2. **Performance optimization**
   - Memoize expensive operations
   - Lazy load play data
   - Optimize re-renders

3. **Accessibility audit**
   - Keyboard navigation
   - Screen reader support
   - Focus management

**Success Criteria**:

- ✅ No deprecated code
- ✅ Lighthouse score > 90
- ✅ WCAG 2.1 AA compliant

---

## 🎯 Immediate Next Steps (Start Here)

### Step 1: Install Headless UI (5 min)

```bash
cd /Users/justindepierro/Developer/boxcall-mobile-updated
npm install @headlessui/react
```

### Step 2: Replace Dropdown (30 min)

Replace the entire dropdown implementation in `PracticeScriptPlayForm.tsx` with Headless UI Combobox.

### Step 3: Test Save Flow (15 min)

1. Type play name
2. Select from dropdown
3. Add to script
4. Save script
5. Verify in database

### Step 4: Add Validation (20 min)

Add simple validation checks before save to prevent bad data.

---

## 📈 Success Metrics

**Phase 1 Complete When**:

- Dropdown appears when typing
- Plays can be selected
- Scripts save with plays to database
- No console errors

**Full System Success When**:

- 100% of scripts save successfully
- 0 type errors in production
- < 100ms dropdown render time
- 95%+ user satisfaction

---

## 🚨 Risk Assessment

| Risk                             | Impact | Likelihood | Mitigation            |
| -------------------------------- | ------ | ---------- | --------------------- |
| Breaking existing scripts        | HIGH   | LOW        | Add migration script  |
| Type system changes cause errors | MEDIUM | MEDIUM     | Comprehensive testing |
| Performance degradation          | LOW    | LOW        | Benchmarking          |
| User confusion during transition | MEDIUM | LOW        | Clear messaging       |

---

## 📞 Questions for Product Owner

1. **Dropdown Library**: Is it OK to add `@headlessui/react` dependency?
2. **Breaking Changes**: Can we migrate existing script data?
3. **Timeline**: What's the priority level for this fix?
4. **Features**: Any additional requirements while fixing?

---

## 🔗 Related Documentation

- [Practice Script Service](../src/services/practiceService.ts)
- [Modal Component README](../src/components/practice/PracticeScriptModal/README.md)
- [Type System Docs](../docs/TYPES.md)
- [Supabase Schema](../database/schema.sql)

---

**Last Updated**: December 6, 2025  
**Next Review**: After Phase 1 completion
