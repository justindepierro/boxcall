# Phase 5: Game Plan Builder - Progress Report

**Started:** October 19, 2025  
## 📊 Current Status

**Overall Progress**: ✅ 8/8 tasks complete (100%)

**Current Focus**: Phase 5 Complete - Ready for Testing & Refinement

---

## ✅ What We've Built

### 1. Database Schema ✅ **APPLIED**

**File:** `database/migrations/20251019_create_game_plans.sql`

**Status:** Migration successfully applied to Supabase! 🎉

Created 3 interconnected tables:

- ✅ `game_plans` - Main game plan table
- ✅ `game_plan_situations` - Billick situations (12 types)
- ✅ `game_plan_plays` - Junction table for plays in situations

**Tables Verified:**

```sql
game_plans           | 9 columns
game_plan_situations | 6 columns
game_plan_plays      | 7 columns
```

### 2. Billick Situation Constants ✅

**File:** `src/constants/gamePlanSituations.ts`

All 12 Billick situations defined with helpers.

### 3. Game Plan Service ✅ **REFACTORED**

**File:** `src/services/gamePlanService_new.ts`

Complete database integration:

- ✅ createGamePlan() - Creates plan + 12 situations
- ✅ getGamePlans() - Fetch all with nested data
- ✅ getGamePlan() - Fetch single with plays
- ✅ updateGamePlan() - Update metadata
- ✅ deleteGamePlan() - Remove (cascades)
- ✅ archiveGamePlan() - Soft delete
- ✅ addPlayToSituation() - Assign play
- ✅ removePlayFromSituation() - Remove play
- ✅ updatePlayPriority() - Reorder
- ✅ duplicateGamePlan() - Copy as template

### 4. GamePlanModal UI Component ✅ **COMPLETE**

**Directory:** `src/components/playbook/GamePlanModal/`

**Files Created:**

- ✅ `index.tsx` - Main modal component (370+ lines)
- ✅ `types.ts` - TypeScript interfaces
- ✅ `index.stories.tsx` - Storybook documentation

**Features Implemented:**

- ✅ Game plan metadata form (name, opponent, date, location)
- ✅ 12 Billick situation tabs with color coding
- ✅ Play count badges on active tabs
- ✅ Active situation display with description
- ✅ Play list with priority ordering
- ✅ Empty state messages
- ✅ Proper Typography variants (display-lg, display-md, body-sm, body-md)
- ✅ Proper Button sizes (sm)
- ✅ All TypeScript/ESLint errors resolved
- ✅ Responsive modal layout

### 5. Play Assignment & Drag-Drop ✅ **COMPLETE**

**Integration:** `GamePlanModal` + `PlaySelectorModal`

**Features Implemented:**

- ✅ **Add Play Button** - Opens PlaySelectorModal with filtering
- ✅ **Play Selection** - Excludes already-assigned plays from selector
- ✅ **Automatic Priority** - New plays get next available priority (1, 2, 3...)
- ✅ **Drag-and-Drop Reordering** - Using `@hello-pangea/dnd`
  - Drag plays to reorder within situation
  - Priorities auto-update to match new order
  - Visual drag feedback (shadow on dragging item)
- ✅ **Remove Play** - Click X to remove play
  - Automatically renumbers remaining plays' priorities
  - Smooth transition animations
- ✅ **State Management** - All situations maintain independent play lists

**Handlers:**

- `handleAddPlayToSituation()` - Adds play with next priority
- `handleRemovePlay()` - Removes and renumbers
- `handleDragEnd()` - Reorders and updates priorities

### 6. PDF Export System ✅ **COMPLETE**

**Files:** `src/services/gamePlanPdfService.tsx`, `src/components/pdf/GamePlanPDF.tsx`

**Features Implemented:**

- ✅ **GamePlanPDFService** - Lazy-loaded PDF generation service
  - `exportGamePlan()` - Downloads PDF file
  - `generateGamePlanPDF()` - Returns Blob for preview
  - 3 format options: detailed, compact, call-sheet (default)
- ✅ **GamePlanPDF Component** - React PDF renderer
  - Professional header with game plan name, opponent, date, location
  - Situational breakdown (one section per Billick situation)
  - Priority badges (1, 2, 3...) for each play
  - Wristband numbers highlighted in purple badges
  - Personnel and formation badges
  - Empty state for situations with no plays
  - Footer with generation date and Billick method credit
- ✅ **Export Button in GamePlanModal**
  - Located in footer (left side)
  - "📄 Export PDF" label with loading state
  - Disabled until name and opponent are filled
  - Generates current game plan state (unsaved changes included)

**PDF Formats:**

- **Call Sheet** (default) - Compact, game-day ready format
- **Compact** - Smaller fonts, less spacing for printing
- **Detailed** - Includes situation descriptions, larger fonts

**File Naming:**

- Pattern: `{game_plan_name}_call_sheet.pdf`
- Example: `week_7_game_plan_call_sheet.pdf`

### 7. Game Plan Management UI ✅ **COMPLETE**

**File:** `src/pages/GamePlansPage.tsx` (updated - 458 lines)

**Features Implemented:**

- ✅ **Full GamePlanService Integration**
  - `loadGamePlans()` - Fetches from database using GamePlanService
  - `handleSavePlan()` - Creates/updates via GamePlanService.createGamePlan/updateGamePlan
  - `handleDuplicatePlan()` - Uses GamePlanService.duplicateGamePlan
  - `handleDeletePlan()` - Uses GamePlanService.deleteGamePlan
  - `handleExportPDF()` - Uses GamePlanPDFService.exportGamePlan
- ✅ **GamePlanModal Integration**
  - Modal opens for create/edit operations
  - Passes editing plan or undefined for new
  - Handles save callback with proper service calls
- ✅ **Aurora Tile Dashboard**
  - "Build New Plan" tile - Opens GamePlanModal
  - "Film Script" tile - Links to Playbook
  - "Share Packet" tile - Scrolls to list
  - Real-time stats (total plans, last update)
- ✅ **Game Plan List View**
  - Card-based layout with game details
  - Opponent, date, location display
  - Play count per plan
  - Action buttons: Edit, Duplicate, Export PDF, Delete
- ✅ **Page Actions**
  - "Back to Playbook" button (top-right)
  - "New Plan" button (top-right)
- ✅ **Active Team Support**
  - Reads activeTeamId from localStorage
  - Passes to service for team-scoped queries
- ✅ **Toast Notifications**
  - Success messages for all operations
  - Error messages with proper error handling

**User Flow:**

1. Navigate to `/game-plans` (from Playbook quick action)
2. See Aurora dashboard with 3 tiles
3. Click "Build New Plan" → GamePlanModal opens
4. Fill in game plan details, assign plays
5. Save → Creates in database via service
6. See plan in list below dashboard
7. Actions: Edit, Duplicate, Export PDF, Delete

---

## 🎯 Next Steps

### 3. Apply Database Migration ⏭️ **NEXT**

**Action Required:** You need to apply the migration manually

**Instructions:** See `docs/PHASE5_SETUP_INSTRUCTIONS.md`

**Quick Steps:**

1. Go to Supabase Dashboard SQL Editor
2. Copy contents of `database/migrations/20251019_create_game_plans.sql`
3. Paste and execute
4. Verify tables were created

### 4. Refactor Game Plan Service 📋 **READY**

**File:** `src/services/gamePlanService.ts`

**Current State:** Contains mock data and old structure

**Needed Changes:**

- Remove mock data arrays
- Connect to new database tables
- Implement CRUD operations:
  - ✅ Create game plan
  - ✅ Get game plans (with situations and plays)
  - ✅ Update game plan
  - ✅ Delete game plan
  - ✅ Archive/unarchive
  - ✅ Duplicate game plan
- Add situation management:
  - Create situations
  - Add plays to situations
  - Update play priority
  - Remove plays from situations

### 5. Create GamePlanModal Component 📋 **READY**

**File:** `src/components/playbook/GamePlanModal.tsx` (new)

**Design Pattern:** Similar to `PracticeScriptModal.tsx`

**Features:**

- Game plan metadata form:
  - Name (e.g., "vs. Central High - Week 8")
  - Opponent name
  - Game date picker
  - Location (Home/Away/Neutral)
  - Notes
- Situation tabs/accordion:
  - 12 Billick situations
  - Collapsible sections
  - Play count badges
- Play assignment:
  - Drag selected plays to situations
  - Reorder within situations (priority)
  - Remove plays
  - Add notes per play
- Footer actions:
  - Save game plan
  - Cancel
  - Export to PDF (later)

### 6. Integrate with Playbook Page 📋 **READY**

**File:** `src/pages/PlaybookPage.tsx`

**Changes:**

- Add "Game Plan" button next to "Practice" button
- Show game plan modal when clicked
- Display selected plays
- Handle game plan creation
- Show success/error messages

### 7. PDF Export 📋 **READY**

**File:** `src/services/gamePlanPdfService.tsx` (new)

**Layout:** Situational call sheet format

```
==========================================
GAME PLAN: vs. Central High - Week 8
Date: Oct 25, 2025 | Location: Home
==========================================

1st & 10
--------
1. [23] 11P | Y-Sail (FLOOD) | Pass | Priority: ⭐
2. [15] 21P | Inside Zone | Run | Priority: ⭐⭐
3. [8A] 12P | Mesh Concept | Pass | Priority: ⭐⭐

3rd & Short (1-3 yards)
-----------------------
1. [23] 22P | Power | Run | Priority: ⭐
2. [Q12] 11P | Slant | Pass | Priority: ⭐⭐

... (continue for all situations)
```

### 8. Game Plan Management 📋 **READY**

**Features:**

- List all game plans on Playbook page
- Edit existing game plans
- Duplicate as template
- Archive old game plans
- Filter (active/archived)
- Sort (by date, name)

---

## 📁 Files Created/Modified

### Created ✨

```
✅ database/migrations/20251019_create_game_plans.sql
✅ src/constants/gamePlanSituations.ts
✅ docs/PHASE5_SETUP_INSTRUCTIONS.md
✅ docs/PHASE5_PROGRESS.md (this file)
```

### To Be Modified 📝

```
⏭️ src/services/gamePlanService.ts (refactor)
⏭️ src/pages/PlaybookPage.tsx (add button)
```

### To Be Created 🆕

```
⏭️ src/components/playbook/GamePlanModal.tsx
⏭️ src/services/gamePlanPdfService.tsx
```

---

## 🎨 User Flow Preview

```
1. Coach on Playbook Page
2. Select 80-120 plays (multi-select mode)
3. Click "Game Plan" button
4. GamePlanModal opens:
   - Enter: "vs. Central High - Week 8"
   - Enter: Opponent "Central High"
   - Select: Game Date (Oct 25, 2025)
   - Select: Location "Home"
5. Assign plays to situations:
   - Drag "Y-Sail" to "1st & 10"
   - Drag "Power" to "3rd & Short"
   - Drag "Inside Zone" to "Red Zone"
   - ... (continue for all plays)
6. Reorder plays within situations (priority)
7. Add notes to specific plays
8. Click "Save Game Plan"
9. Success! Game plan saved
10. Export to PDF → Print call sheet
11. Load in BoxCall (Stage 3) during game
```

---

## 🏗️ Architecture Decisions

### Why Separate Tables?

**game_plans** → **game_plan_situations** → **game_plan_plays**

This 3-table design allows:

- ✅ Flexible situation management (add/remove/reorder)
- ✅ Same play in multiple situations
- ✅ Situation-specific notes and priorities
- ✅ Easy querying (get all plays for a situation)
- ✅ Data integrity (cascading deletes)

### Why Billick Method?

Brian Billick's situational approach:

- ✅ Industry-standard methodology
- ✅ Proven in NFL/college coaching
- ✅ Intuitive for coaches
- ✅ Scalable (add more situations if needed)
- ✅ Perfect for live game calling (BoxCall Stage 3)

### Why Priority Instead of Order?

**Priority** (1 = highest) instead of **sequence_order** because:

- ✅ Semantic meaning ("call this first in 3rd & Short")
- ✅ Flexible gaps (can insert between priorities)
- ✅ Matches coaching terminology
- ✅ Works well with UI (⭐ = Priority 1, ⭐⭐ = Priority 2)

---

## 📊 Timeline

| Task                    | Status   | Time Est. | Actual |
| ----------------------- | -------- | --------- | ------ |
| 1. Database schema      | ✅ Done  | 1 hour    | 45 min |
| 2. Billick constants    | ✅ Done  | 30 min    | 30 min |
| 3. Apply migration      | ⏭️ Next  | 5 min     | -      |
| 4. Refactor service     | 📋 Ready | 2 hours   | -      |
| 5. GamePlanModal        | 📋 Ready | 3 hours   | -      |
| 6. Playbook integration | 📋 Ready | 1 hour    | -      |
| 7. PDF export           | 📋 Ready | 2 hours   | -      |
| 8. Management UI        | 📋 Ready | 2 hours   | -      |

**Total Estimated:** 11.5 hours  
**Completed:** 1.25 hours (11%)  
**Remaining:** 10.25 hours

---

## 🎯 Success Criteria

Phase 5 is complete when:

- [x] Database schema created
- [x] Billick situations defined
- [ ] Migration applied successfully
- [ ] Game plan service fully functional
- [ ] GamePlanModal UI working
- [ ] Can create game plan with 80+ plays
- [ ] Can assign plays to situations
- [ ] Can reorder plays within situations
- [ ] PDF export generates call sheet
- [ ] Can edit existing game plans
- [ ] Can duplicate game plans
- [ ] Can archive old game plans
- [ ] All TypeScript errors resolved
- [ ] Tests passing (if added)
- [ ] Documented in ROADMAP_STATUS_OCT19.md

---

## 🚀 Ready to Continue!

**Current Status:** Setup phase complete! 🎉

**Next Action:** Apply the database migration

**Instructions:** See `docs/PHASE5_SETUP_INSTRUCTIONS.md`

**When Ready:** Let me know when the migration is applied, and we'll refactor the game plan service and start building the UI!

---

**Questions? Issues? Let's tackle them together!** 💪
