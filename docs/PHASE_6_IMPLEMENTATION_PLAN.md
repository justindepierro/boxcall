# Phase 6: Script/Plan Management - Implementation Plan

**Date:** October 21, 2025  
**Status:** 🚧 IN PROGRESS  
**Duration:** 1 week (Oct 21-28)  
**Goal:** Complete CRUD operations for Practice Scripts and Game Plans

---

## 📋 Executive Summary

**What We're Building:**
- Edit/duplicate/archive practice scripts
- Edit/duplicate/archive game plans  
- Search and filter scripts/plans
- Share scripts/plans (export/import)

**Current State:**
- ✅ Game Plans: CREATE and DELETE exist (GamePlansPage.tsx)
- ✅ Practice Scripts: CREATE exists (PracticePlansPage.tsx)
- ⏭️ Missing: EDIT, DUPLICATE, ARCHIVE for both
- ⏭️ Missing: Search/filter UI
- ⏭️ Missing: Export/import functionality

**Why This Matters:**
Coaches need to:
1. Update scripts/plans without recreating them
2. Reuse last week's game plan as a starting point
3. Archive old plans to keep workspace clean
4. Search through historical scripts

---

## 🎯 Success Criteria

Phase 6 is complete when:

- [ ] Can edit existing practice script (name, plays, reps)
- [ ] Can edit existing game plan (name, opponent, plays)
- [ ] Can duplicate script as template for next week
- [ ] Can duplicate game plan for similar opponent
- [ ] Can archive old scripts/plans (soft delete)
- [ ] Can unarchive scripts/plans
- [ ] Can search scripts by name, date, opponent
- [ ] Can filter active vs archived
- [ ] Can export script/plan to JSON
- [ ] Can import script/plan from JSON
- [ ] All TypeScript errors resolved
- [ ] Tests passing

---

## 📐 Architecture Overview

### Current Services

#### GamePlanService_new.ts (441 lines) ✅
**Already has:**
- ✅ `createGamePlan()` - Creates plan + 12 situations
- ✅ `getGamePlans()` - Fetch all with nested data
- ✅ `getGamePlan()` - Fetch single with plays
- ✅ `updateGamePlan()` - Update metadata
- ✅ `deleteGamePlan()` - Hard delete (cascades)
- ✅ `archiveGamePlan()` - Soft delete (set isArchived=true)
- ✅ `duplicateGamePlan()` - Copy as template

**Already works!** ✅ Just needs UI integration

#### PracticeService.ts (1172 lines) 
**Currently has:**
- ✅ `createPracticeScript()` - Create new script
- ✅ `getPracticeScripts()` - Fetch all for team
- ✅ `getPracticeScript()` - Fetch single with plays
- ✅ `addPlayToPracticeScript()` - Add play with reps/notes

**Needs:**
- ⏭️ `updatePracticeScript()` - Update metadata
- ⏭️ `duplicatePracticeScript()` - Copy as template
- ⏭️ `archivePracticeScript()` - Soft delete
- ⏭️ `updateScriptPlay()` - Edit play notes/reps/order
- ⏭️ `removePlayFromScript()` - Remove play

### Current UI Components

#### GamePlansPage.tsx (481 lines) ✅
**Has:**
- ✅ List all game plans
- ✅ Create new plan (GamePlanModal)
- ✅ Delete plan
- ✅ Export PDF

**Missing:**
- ⏭️ Edit plan button (reopen GamePlanModal with existing data)
- ⏭️ Duplicate plan button
- ⏭️ Archive/unarchive toggle
- ⏭️ Search/filter controls

#### PracticePlansPage.tsx (324 lines)
**Has:**
- ✅ Create new script (PracticeScriptModal)
- ⏭️ List view (shows scripts but minimal)

**Missing:**
- ⏭️ Edit script button
- ⏭️ Duplicate script button
- ⏭️ Archive/unarchive toggle
- ⏭️ Search/filter controls
- ⏭️ Delete script button
- ⏭️ Integration with PracticeService (uses mock data)

---

## 🗺️ Implementation Roadmap

### **Week 1: Oct 21-28** (7 days)

#### **Day 1 (Oct 21): Practice Script Service Methods** ⏱️ 3-4 hours
1. Add missing CRUD methods to PracticeService
2. Update practice_scripts table schema if needed
3. Test all methods with real data

**Files:**
- `src/services/practiceService.ts` (+100 lines)
- `database/schema.sql` (verify/update)

**Methods to add:**
```typescript
// Update script metadata
updatePracticeScript(id: string, data: UpdatePracticeScriptData): Promise<PracticeScript>

// Duplicate script (copy all plays)
duplicatePracticeScript(id: string, newName: string): Promise<PracticeScript>

// Archive/unarchive
archivePracticeScript(id: string): Promise<void>
unarchivePracticeScript(id: string): Promise<void>

// Update individual play in script
updateScriptPlay(scriptPlayId: string, data: UpdateScriptPlayData): Promise<void>

// Remove play from script
removePlayFromScript(scriptPlayId: string): Promise<void>

// Reorder plays in script
reorderScriptPlays(scriptId: string, playIds: string[]): Promise<void>
```

---

#### **Day 2 (Oct 22): Practice Plans Page UI** ⏱️ 4-5 hours
1. Refactor PracticePlansPage to match GamePlansPage structure
2. Add Aurora dashboard tiles
3. Integrate with PracticeService (remove mock data)
4. Add action buttons (Edit, Duplicate, Archive, Delete)

**Files:**
- `src/pages/PracticePlansPage.tsx` (rewrite ~400 lines)

**Features:**
- Load scripts from database
- Display script cards with metadata
- Edit button → reopens PracticeScriptModal with script data
- Duplicate button → creates copy with new name
- Archive toggle → soft delete
- Delete button → hard delete with confirmation
- Toast notifications for all actions

---

#### **Day 3 (Oct 23): Practice Script Modal Edit Mode** ⏱️ 3-4 hours
1. Update PracticeScriptModal to support edit mode
2. Pre-populate form with existing script data
3. Update save handler to call update vs create
4. Add play editing (change reps, notes, order)

**Files:**
- `src/components/practice/PracticeScriptModal/index.tsx` (~50 lines)
- `src/components/practice/PracticeScriptModal/components/PracticeScriptForm.tsx` (~30 lines)
- `src/components/practice/PracticeScriptModal/components/PracticeScriptPlayList.tsx` (~50 lines)

**Features:**
- Detect edit mode via `editingScript` prop
- Load script plays into form state
- Allow reordering plays (drag-drop already exists)
- Allow removing plays
- Allow editing reps/notes per play
- Save updates to database

---

#### **Day 4 (Oct 24): Game Plans Page Enhancements** ⏱️ 3-4 hours
1. Add Edit button to GamePlansPage
2. Add Duplicate button
3. Add Archive toggle
4. Wire up to existing GamePlanService methods

**Files:**
- `src/pages/GamePlansPage.tsx` (+50 lines)

**Changes:**
```typescript
// Add edit handler
const handleEditPlan = (plan: GamePlan) => {
  setEditingPlan(plan);
  setShowModal(true);
};

// Add duplicate handler  
const handleDuplicatePlan = async (planId: string) => {
  await GamePlanService.duplicateGamePlan(planId, `${plan.name} (Copy)`);
  loadGamePlans();
};

// Add archive handler
const handleArchivePlan = async (planId: string) => {
  await GamePlanService.archiveGamePlan(planId);
  loadGamePlans();
};
```

---

#### **Day 5 (Oct 25): Search & Filter UI** ⏱️ 4-5 hours
1. Add search bar to both pages
2. Add filter chips (Active/Archived/All)
3. Add sort dropdown (Date, Name, Opponent)
4. Implement client-side filtering

**Files:**
- `src/pages/GamePlansPage.tsx` (+80 lines)
- `src/pages/PracticePlansPage.tsx` (+80 lines)
- `src/components/ui/SearchBar.tsx` (NEW - 50 lines)
- `src/components/ui/FilterChips.tsx` (NEW - 60 lines)

**Features:**
- Search by name, opponent (game plans), tags
- Filter: Active | Archived | All
- Sort: Date (newest first) | Date (oldest first) | Name (A-Z)
- Clear filters button

---

#### **Day 6 (Oct 26): Export/Import JSON** ⏱️ 3-4 hours
1. Add export to JSON functionality
2. Add import from JSON functionality
3. Validate imported data structure

**Files:**
- `src/services/exportService.ts` (+100 lines)
- `src/services/importService.ts` (NEW - 150 lines)
- `src/pages/GamePlansPage.tsx` (+30 lines)
- `src/pages/PracticePlansPage.tsx` (+30 lines)

**Methods:**
```typescript
// Export
exportScriptToJSON(scriptId: string): Promise<string>
exportGamePlanToJSON(planId: string): Promise<string>

// Import
importScriptFromJSON(json: string, teamId: string): Promise<PracticeScript>
importGamePlanFromJSON(json: string, teamId: string): Promise<GamePlan>

// Validation
validateScriptJSON(json: string): { valid: boolean; errors: string[] }
validateGamePlanJSON(json: string): { valid: boolean; errors: string[] }
```

---

#### **Day 7 (Oct 27): Testing & Polish** ⏱️ 4-5 hours
1. Manual testing of all CRUD operations
2. Fix any bugs discovered
3. Add loading states and error handling
4. Add confirmation dialogs for destructive actions
5. Update documentation

**Testing Checklist:**
- [ ] Create new practice script
- [ ] Edit script (add/remove plays, change reps)
- [ ] Duplicate script
- [ ] Archive script
- [ ] Unarchive script
- [ ] Delete script
- [ ] Search scripts
- [ ] Filter scripts (active/archived)
- [ ] Export script to JSON
- [ ] Import script from JSON
- [ ] Create new game plan
- [ ] Edit game plan (change opponent, add/remove plays)
- [ ] Duplicate game plan
- [ ] Archive game plan
- [ ] Unarchive game plan
- [ ] Delete game plan
- [ ] Search game plans
- [ ] Filter game plans (active/archived)
- [ ] Export game plan to JSON
- [ ] Import game plan from JSON

---

## 📦 Deliverables

### Service Layer
- ✅ GamePlanService fully functional (already done!)
- ⏭️ PracticeService complete CRUD operations
- ⏭️ ExportService for JSON export
- ⏭️ ImportService for JSON import

### UI Components
- ⏭️ PracticePlansPage redesign (match GamePlansPage)
- ⏭️ GamePlansPage enhancements (Edit/Duplicate/Archive)
- ⏭️ PracticeScriptModal edit mode
- ⏭️ SearchBar component
- ⏭️ FilterChips component

### Database
- ⏭️ Verify practice_scripts schema supports all operations
- ⏭️ Add indexes if needed for performance

---

## 🚀 Quick Start (Day 1)

Let's start with the Practice Script Service methods:

### Step 1: Verify Database Schema

Check if `practice_scripts` table has `is_archived` column:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'practice_scripts';
```

If missing, add it:

```sql
ALTER TABLE practice_scripts 
ADD COLUMN is_archived BOOLEAN DEFAULT false;

CREATE INDEX idx_practice_scripts_archived 
ON practice_scripts(team_id, is_archived);
```

### Step 2: Add Service Methods

Add these methods to `src/services/practiceService.ts`:

```typescript
/**
 * Update practice script metadata
 */
static async updatePracticeScript(
  id: string,
  data: Partial<CreatePracticeScriptData>
): Promise<PracticeScript> {
  const { data: script, error } = await supabase
    .from("practice_scripts")
    .update({
      name: data.name,
      description: data.description,
      tags: data.tags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return this.mapDatabaseToPracticeScript(script);
}

/**
 * Duplicate practice script
 */
static async duplicatePracticeScript(
  id: string,
  newName: string
): Promise<PracticeScript> {
  // 1. Get original script with plays
  const original = await this.getPracticeScript(id);
  
  // 2. Create new script
  const newScript = await this.createPracticeScript({
    name: newName,
    description: original.description,
    teamId: original.teamId,
    tags: original.tags,
  });
  
  // 3. Copy all plays
  for (const play of original.plays || []) {
    await this.addPlayToPracticeScript({
      scriptId: newScript.id,
      playId: play.playId,
      notes: play.notes,
      repetitions: play.repetitions,
      hash: play.hash,
      downDistance: play.downDistance,
      fieldPosition: play.fieldPosition,
      defensiveFront: play.defensiveFront,
      coverage: play.coverage,
      blitz: play.blitz,
      scenarioNotes: play.scenarioNotes,
    });
  }
  
  return this.getPracticeScript(newScript.id);
}

/**
 * Archive practice script (soft delete)
 */
static async archivePracticeScript(id: string): Promise<void> {
  const { error } = await supabase
    .from("practice_scripts")
    .update({ is_archived: true })
    .eq("id", id);
    
  if (error) throw error;
  
  // Invalidate cache
  practiceScriptCache.remove(id);
}

/**
 * Unarchive practice script
 */
static async unarchivePracticeScript(id: string): Promise<void> {
  const { error } = await supabase
    .from("practice_scripts")
    .update({ is_archived: false })
    .eq("id", id);
    
  if (error) throw error;
  
  // Invalidate cache
  practiceScriptCache.remove(id);
}

/**
 * Update individual play in script
 */
static async updateScriptPlay(
  scriptPlayId: string,
  data: Partial<AddPlayToPracticeScriptData>
): Promise<void> {
  const { error } = await supabase
    .from("practice_script_plays")
    .update({
      notes: data.notes,
      repetitions: data.repetitions,
      hash: data.hash,
      down_distance: data.downDistance,
      field_position: data.fieldPosition,
      defensive_front: data.defensiveFront,
      coverage: data.coverage,
      blitz: data.blitz,
      scenario_notes: data.scenarioNotes,
    })
    .eq("id", scriptPlayId);
    
  if (error) throw error;
}

/**
 * Remove play from script
 */
static async removePlayFromScript(scriptPlayId: string): Promise<void> {
  const { error } = await supabase
    .from("practice_script_plays")
    .delete()
    .eq("id", scriptPlayId);
    
  if (error) throw error;
}

/**
 * Reorder plays in script
 */
static async reorderScriptPlays(
  scriptId: string,
  playIds: string[]
): Promise<void> {
  // Update order for each play
  for (let i = 0; i < playIds.length; i++) {
    const { error } = await supabase
      .from("practice_script_plays")
      .update({ order: i })
      .eq("id", playIds[i])
      .eq("practice_script_id", scriptId);
      
    if (error) throw error;
  }
  
  // Invalidate cache
  practiceScriptCache.remove(scriptId);
}
```

### Step 3: Test Methods

Create test file or use console:

```typescript
// Test update
await PracticeService.updatePracticeScript('script-id', {
  name: 'Updated Script Name'
});

// Test duplicate
const copy = await PracticeService.duplicatePracticeScript(
  'script-id',
  'Week 2 Practice Script'
);

// Test archive
await PracticeService.archivePracticeScript('script-id');
```

---

## 📊 Progress Tracking

**Total Estimated Time:** 25-30 hours (1 week)

| Day | Task | Hours | Status |
|-----|------|-------|--------|
| 1 | Practice Script Service Methods | 3-4h | ⏭️ |
| 2 | Practice Plans Page UI | 4-5h | ⏭️ |
| 3 | Practice Script Modal Edit Mode | 3-4h | ⏭️ |
| 4 | Game Plans Page Enhancements | 3-4h | ⏭️ |
| 5 | Search & Filter UI | 4-5h | ⏭️ |
| 6 | Export/Import JSON | 3-4h | ⏭️ |
| 7 | Testing & Polish | 4-5h | ⏭️ |

---

## 🎯 Next Steps

**Ready to start Day 1:**

1. Check database schema for `is_archived` column
2. Add missing columns if needed
3. Implement service methods in PracticeService
4. Test methods with real data
5. Commit and push

**Command to start:**
```bash
# Check schema
npm run db:inspect

# Start dev server for testing
npm run dev
```

---

## 📚 Related Documentation

- [Phase 4: Practice Script Builder Complete](./PRACTICE_SCRIPT_PHASE4_COMPLETE.md)
- [Phase 5: Game Plan Builder Complete](./PHASE5_PROGRESS.md)
- [Comprehensive Audit](./COMPREHENSIVE_AUDIT_OCT21_2025.md)
- [BoxCall Roadmap](./BOXCALL_ANALYTICS_COMPLETE_ROADMAP.md)

---

**Let's ship Phase 6! 🚀**
