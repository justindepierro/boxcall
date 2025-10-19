# BoxCall Analytics & Confidence System - Complete Roadmap

**Vision:** Build a world-class analytics platform that gives coaches confidence scores and predictive insights based on clean, tight playbook data.

**Timeline:** October 2025 → February 2026 (4-5 months)  
**Current Date:** October 18, 2025  
**Status:** � **IN PROGRESS** - Stage 1 (Data Foundation)

**Progress:** Phase 1 ✅ | Phase 2 ✅ | Phase 3 ⏭️

---

## 🎯 Mission Statement

> **"Start with really clean and tight data from the playbook. Then the BoxCall page is the feature app to start getting confidence and analytics."**

### Core Principles

1. **Data Quality First** - Clean, validated, linked data in the playbook
2. **Progressive Enhancement** - Build in stages, each stage delivers value
3. **Real-World Testing** - Use actual coaching workflows to validate features
4. **AI-Ready Foundation** - Structure data for future machine learning

---

## 📊 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROADMAP TIMELINE                             │
└─────────────────────────────────────────────────────────────────┘

STAGE 1: DATA FOUNDATION (Oct 17-18) ✅ COMPLETE
├─ Phase 1: Formation-Play Linking         [✅ COMPLETE - Oct 17]
├─ Phase 2: Data Quality & Validation      [✅ COMPLETE - Oct 18]
├─ Phase 3: Multi-Select & Collections     [✅ COMPLETE - Oct 18]
└─ Phase 3.5: Export Functionality         [✅ COMPLETE - Oct 18] 🎉 QUICK WIN

STAGE 2: PLAYBOOK PLANNING FEATURES (Oct 18 - Nov 7) ⏭️ NEXT
├─ Phase 4: Practice Script Builder        [⏭️ STARTING - 2-3 days]
│   └─ Multi-select plays → Create script
├─ Phase 5: Game Plan Builder (Billick)    [2 weeks]
│   └─ Situational play organization
└─ Phase 6: Script/Plan Management         [1 week]
│   └─ Edit, duplicate, archive, export

STAGE 3: BOXCALL LIVE SESSION (Dec 5 - Jan 2)
├─ Phase 7: Session Architecture           [1 week]
│   └─ Live vs Retroactive modes
├─ Phase 8: Practice Session Tracking      [1.5 weeks]
│   └─ Load script, mark success/failure
├─ Phase 9: Game Session Tracking          [1.5 weeks]
│   └─ Load game plan, add plays live
└─ Phase 10: Execution History Database    [1 week]
│   └─ Store results, confidence updates

STAGE 4: ANALYTICS ENGINE (Jan 2 - Jan 30)
├─ Phase 11: Confidence Algorithm          [1 week]
│   └─ Calculate from execution history
├─ Phase 12: Formation & Play Analytics    [1 week]
│   └─ Success rates, trends
├─ Phase 13: Situational Intelligence      [1 week]
│   └─ Best plays for down/distance
└─ Phase 14: Game Day Predictor            [1 week]
│   └─ "From the Box" live recommendations

STAGE 5: POLISH & LAUNCH (Jan 30 - Feb 15)
├─ Phase 15: Dashboard & Reports           [1 week]
├─ Phase 16: Mobile Optimization           [0.5 weeks]
└─ Phase 17: Beta Testing & Launch         [0.5 weeks]

LAUNCH: February 15, 2026 🚀
```

---

## 🏗️ STAGE 1: DATA FOUNDATION (Oct 17 - Nov 7, 2025) 🚧 **IN PROGRESS**

**Goal:** Clean, validated, properly linked playbook data. Multi-select plays for building scripts/plans.

**Progress:** 2/3 phases complete (Phase 1 ✅ | Phase 2 ✅ | Phase 3 ⏭️)

**Why This Stage:** Before coaches can build practice scripts or game plans, they need:

1. Clean formation-play data (linked with `formation_id`) ✅ DONE
2. Data quality validation ✅ DONE
3. Ability to select multiple plays at once
4. Quality validation to ensure good data

---

### **Phase 1: Formation-Play Linking System** ✅ CODE COMPLETE + MIGRATION COMPLETE

**Duration:** 1.5 weeks (Oct 17 - Oct 28)  
**Status:** ✅ **Week 1 COMPLETE** (Oct 17, 2025)  
**Time Taken:** Code (45 min) + Migration (10 min) = 55 minutes total

**Why First:** Without formation_id links, analytics and planning are impossible. This is the foundation.

#### **✅ Week 1: Auto-Formation Creation + Legacy Migration** (Oct 17) - COMPLETE

**Code Implementation (45 minutes):**

- ✅ **DONE** Update `AddNewPlayModal` to auto-create formations
- ✅ **DONE** Add `FormationService.getOrCreateFormation()` method
- ✅ **DONE** Add `FormationService.getFormationByName()` method
- ✅ **DONE** Add `FormationService.linkOppositeFormations()` method
- ✅ **DONE** Add formation existence check before play creation
- ✅ **DONE** Update play creation flow with proper `formation_id`
- ✅ **DONE** Direction normalization (matches FormationService standards)

**Legacy Data Migration (10 minutes):**

- ✅ **DONE** Created migration script: `scripts/migrate-legacy-plays.js`
- ✅ **DONE** Migrated 7 legacy plays (100% success rate)
- ✅ **DONE** Reused existing formations (Twins L, Trips R)
- ✅ **DONE** Applied direction normalization (L → L, R → R)
- ✅ **DONE** Zero errors during migration
- ✅ **DONE** Verified all plays have formation_id

**Files Changed:**

```
src/components/playbook/AddNewPlayModal.tsx       (+31 lines)
src/services/formationService.ts                  (+123 lines)
scripts/check-phase1-state.js                     (+85 lines) NEW
scripts/migrate-legacy-plays.js                   (+344 lines) NEW
                                                  ─────────────
                                                  +583 lines total
```

**Success Criteria:**

- ✅ **DONE** `getFormationByName()` added to FormationService
- ✅ **DONE** `getOrCreateFormation()` added to FormationService
- ✅ **DONE** `linkOppositeFormations()` added to FormationService
- ✅ **DONE** `handleSubmit()` updated in AddNewPlayModal
- ✅ **DONE** TypeScript compiles with no errors
- ✅ **DONE** Migration script with dry-run capability
- ✅ **DONE** 7 legacy plays linked to formations
- ✅ **DONE** Direction normalization standardized
- ⏭️ UI Testing: Create play "Y-Sail" from "Trips" (verify auto-creation)
- ⏭️ Database check: Play saves with `formation_id` populated
- ⏭️ Unit tests for FormationService methods

**Migration Results:**

```
Cross           → Twins (L) [ea6f5ac5-a316-44e1-9843-7bf2547802a1]
Same Power Read → Twins (L) [ea6f5ac5-a316-44e1-9843-7bf2547802a1]
Smaug           → Twins (L) [ea6f5ac5-a316-44e1-9843-7bf2547802a1]
Shaq            → Twins (L) [ea6f5ac5-a316-44e1-9843-7bf2547802a1]
Iz              → Trips (R) [693964e1-8084-4ccb-985f-c42cba6686b6]
Power Read      → Trips (R) [693964e1-8084-4ccb-985f-c42cba6686b6]
Slice           → Trips (R) [693964e1-8084-4ccb-985f-c42cba6686b6]
```

**Implementation Summary:**

```typescript
// IMPLEMENTED: Formation auto-created before play
let finalFormationId = formData.formation_id;

if (!finalFormationId && formData.formation.trim() && playbookId) {
  const formation = await FormationService.getOrCreateFormation(
    formData.formation.trim(),
    playbookId
  );
  finalFormationId = formation.id;
}

const playData = {
  ...formData,
  formation_id: finalFormationId, // ✓ Linked!
};
```

#### **⏭️ Week 2: Testing & Validation** (Oct 18-24) - IN PROGRESS

**Deliverables:**

- ⏭️ Manual UI test: Create 5-10 plays with different formations
- ⏭️ Verify formations auto-created in database
- ⏭️ Test opposite formation linking ("Trips Right" ↔ "Trips Left")
- ⏭️ Unit tests for FormationService methods
- ⏭️ Integration test for AddNewPlayModal → formation creation flow
- ⏭️ Edge case testing (special characters, long names, duplicates)
- ⏭️ Deploy to beta coaches for feedback

**Note:** Week 2 simplified because database is clean slate (0 plays, 0 formations).
No migration needed - every play created from now on will auto-link!

**Success Criteria:**

- [ ] Script successfully links 90%+ of existing plays to formations
- [ ] Audit report shows data quality metrics
- [ ] Admin can manually fix remaining orphans
- [ ] All formation_id foreign keys are valid

**Implementation Steps:**

1. Create audit script to analyze current state
2. Build formation generator (dedupe by name + personnel)
3. Create linking script with dry-run mode
4. Run in production with backups
5. Verify data integrity
6. Document process for future use

---

### **Phase 2: Data Quality & Validation System** ✅ **COMPLETE**

**Duration:** ~1 hour (Oct 18, 2025)  
**Status:** ✅ **COMPLETE**

#### **Enhanced Validation & Cleanup** (Oct 18)

**Deliverables:**

- ✅ **DONE** Formation name validation (no direction keywords)
- ✅ **DONE** Play validation (required fields enforced)
- ✅ **DONE** Data completeness scoring algorithm
- ✅ **DONE** Real-time validation feedback UI component

**Files Created:**

```
src/validation/formationValidation.ts (NEW)    +293 lines
src/utils/dataQualityScoring.ts (NEW)          +437 lines
src/components/playbook/PlayQualityIndicator/
  ├── PlayQualityIndicator.tsx (NEW)           +202 lines
  └── index.ts (NEW)                           +6 lines
                                                ──────────
                                                +938 lines total
```

**Success Criteria:**

- [x] ✅ Formation names reject "Left"/"Right" keywords (unless single word)
- [x] ✅ Plays validation: name, formation, type all enforced
- [x] ✅ Data quality score algorithm (0-100 with A-F grades)
- [x] ✅ PlayQualityIndicator component (compact & expanded modes)
- [x] ✅ TypeScript compiles with no errors

**Implementation Summary:**

```typescript
// Formation validation with direction extraction
validateFormationWithSuggestions("Trips Left")
// → Error: Contains direction keyword
// → Suggestion: Use "Trips" + direction="L"

// Data quality scoring (40-30-30 split)
calculatePlayQuality(play)
// → { total: 75, breakdown: { required: 40, metadata: 25, advanced: 10 }, grade: "B" }

// Real-time UI feedback
<PlayQualityIndicator score={score} compact={true} />
// → Shows: "Data Quality: 75/100 (B) - Good"
```

**Documentation:** `docs/PHASE_2_DATA_QUALITY_COMPLETE.md`

---

### **Phase 3: Multi-Select & Play Collections** ✅ **COMPLETE**

**Duration:** ~30 minutes (Oct 18, 2025)  
**Status:** ✅ **COMPLETE**

**Deliverables:**

- ✅ **DONE** Play selection hook (usePlaySelection)
- ✅ **DONE** Bulk actions toolbar (6 actions: Tag, Duplicate, Practice, Edit, Export, Delete)
- ✅ **DONE** Play selection state management (PlaybookContext enhanced)
- ✅ **DONE** Toggle bulk operations mode ("Bulk Actions" tile)

**Files Created/Modified:**

```
src/hooks/usePlaySelection.ts (NEW)           +167 lines
src/contexts/PlaybookContext.tsx (ENHANCED)   ~30 lines
src/pages/PlaybookPage.tsx (ENHANCED)         ~80 lines
src/components/playbook/BulkActionsToolbar.tsx (EXISTING - Already built!)
                                              ──────────
                                              +277 lines total
```

**Success Criteria:**

- [x] ✅ Can select individual plays (infrastructure ready)
- [x] ✅ Selection state managed in PlaybookContext
- [x] ✅ Bulk actions toolbar appears when >0 selected
- [x] ✅ 6 bulk action buttons implemented (with placeholder toasts)
- [x] ✅ "Bulk Actions" tile toggles selection mode
- [x] ✅ TypeScript compiles with no errors

**Implementation Summary:**

```typescript
// Selection hook with 10+ operations
const { selectedPlayIds, toggleSelection, selectAll, clearSelection } =
  usePlaySelection({ selectedPlayIds, onSelectionChange });

// Context actions
dispatch({ type: "TOGGLE_BULK" }); // Enable selection mode
dispatch({ type: "TOGGLE_PLAY_SELECTION", playId }); // Toggle play
dispatch({ type: "SELECT_ALL_PLAYS", playIds }); // Select all
dispatch({ type: "CLEAR_SELECTION" }); // Clear selection

// Bulk actions (6 operations)
handleBulkAction("add-tags"); // Tag plays
handleBulkAction("add-to-practice"); // Add to script
handleBulkAction("export"); // Export plays
```

**Documentation:** `docs/PHASE_3_MULTI_SELECT_COMPLETE.md`

---

### **Phase 3.5: Export Functionality** ✅ **COMPLETE** 🎉

**Duration:** ~30 minutes (Oct 18, 2025)  
**Status:** ✅ **QUICK WIN SHIPPED!**

**Deliverables:**

- ✅ **DONE** Export service with JSON & CSV support
- ✅ **DONE** Browser file download (Blob API)
- ✅ **DONE** handleBulkAction("export") fully wired
- ✅ **DONE** Success/error toast notifications
- ✅ **DONE** All 45 play fields exported

**Files Created/Modified:**

```
src/services/exportService.ts (NEW)          +290 lines
src/pages/PlaybookPage.tsx (ENHANCED)        ~45 lines
                                             ──────────
                                             +335 lines total
```

**Success Criteria:**

- [x] ✅ Can export selected plays to JSON
- [x] ✅ Can export selected plays to CSV
- [x] ✅ File downloads automatically (boxcall-plays-YYYY-MM-DD.format)
- [x] ✅ JSON includes metadata (export date, play count, version)
- [x] ✅ CSV is RFC 4180 compliant (proper escaping)
- [x] ✅ TypeScript compiles with no errors

**Implementation Summary:**

```typescript
// Export service functions
exportPlays(plays, { format: "json", prettyPrint: true });
exportPlays(plays, { format: "csv" });
getExportSummary(plays, "json"); // Preview before export

// PlaybookPage integration
handleBulkAction("export") →
  Fetch plays by ID →
  exportPlays(selectedPlays, { format: "json" }) →
  File downloads →
  Success toast ✅
```

**Export Formats:**

1. **JSON Export:**
   - Pretty-printed for readability
   - Includes metadata (export date, play count, version, app name)
   - All 45 play fields (id, play_name, formation, tags, diagram_data, etc.)
   - Formation relationships (formation_id, formation_direction)
   - Creation tracking (creation_source, creation_context)

2. **CSV Export:**
   - Human-readable column headers
   - Proper CSV escaping (commas, quotes, newlines)
   - Array fields as semicolon-separated (e.g., `"Pass; Run; RPO"`)
   - Calculated fields (Success Rate %)
   - Boolean fields as Yes/No

**User Experience:**

```
1. Enable bulk operations (click "Bulk Actions" tile)
2. Select plays (checkboxes appear)
3. Click "Export" in BulkActionsToolbar
4. File downloads: boxcall-plays-2025-10-18.json
5. Toast: "Exported N plays to JSON" ✅
6. Selection remains active (can export again)
```

**Impact:**

- ✅ Proves multi-select infrastructure works end-to-end
- ✅ Users can backup playbooks locally
- ✅ Coaches can share plays with other coaches
- ✅ Data can be analyzed in Excel/Google Sheets
- ✅ Playbooks can be imported into other tools

**Documentation:** `docs/PHASE_3.5_EXPORT_COMPLETE.md`

---

## 🏗️ STAGE 2: PLAYBOOK PLANNING FEATURES (Nov 7 - Dec 5, 2025)

**Goal:** Build Practice Scripts and Game Plans from playbook plays. These are the containers that will be loaded into BoxCall live sessions.

**Progress:** 0/3 phases complete (Phase 4 ⏭️ | Phase 5 ⏭️ | Phase 6 ⏭️)

**Why This Stage:** Coaches need to organize plays into practice scripts and game plans BEFORE they can track execution. This is how they prepare for practice and games.

---

### **Phase 4: Practice Script Builder**

**Duration:** 2 weeks (Nov 7 - Nov 21)

#### **Week 1: Script Creation & Management** (Nov 7-14)

**Deliverables:**

- ✅ Practice Scripts page enhancement (already exists)
- ✅ Add plays from playbook to script
- ✅ Reorder plays (drag & drop)
- ✅ Set reps & time estimates per play
- ✅ Script templates (Install, Team Period, Red Zone, etc.)

**Files to Change:**

```
src/pages/PracticePlansPage.tsx (enhance existing)
src/components/playbook/PracticeScriptBuilder.tsx (enhance existing)
src/services/practiceService.ts (add play linking methods)
```

**User Flow:**

```
1. Playbook Page → Select 10 plays → Click "Add to Practice Script"
2. Modal: "Add to existing script or create new?"
3. Choose: "Create New → Team Offense Install #3"
4. Script builder opens with 10 plays pre-loaded
5. Drag to reorder, set reps (5-10 per play), set time estimates
6. Add coaching notes per play
7. Save script
8. Script appears in Practice Plans page

Result: Script with 10 plays, ~50-100 reps total, ready for BoxCall
```

**Script Builder UI:**

```
┌──────────────────────────────────────────────────────────────┐
│  Practice Script: Team Offense Install #3                    │
│  Total: 10 plays  |  85 reps  |  ~45 min                     │
├──────────────────────────────────────────────────────────────┤
│  1. [≡] Y-Sail (Trips)           8 reps  [Edit] [Remove]    │
│      └─ Note: Focus on timing                                │
│                                                              │
│  2. [≡] Mesh Cross (Spread)      6 reps  [Edit] [Remove]    │
│      └─ Note: Work vs zone                                   │
│                                                              │
│  3. [≡] Power Right (I-Form)     10 reps [Edit] [Remove]    │
│      └─ Note: Inside zone footwork                           │
│  ...                                                         │
│                                                              │
│  [+ Add Plays from Playbook] [Save] [Cancel]                │
└──────────────────────────────────────────────────────────────┘
```

**Database Schema (already exists, enhance):**

```sql
-- Practice Scripts (existing)
CREATE TABLE practice_scripts (
  id UUID,
  team_id UUID,
  title TEXT,
  description TEXT,
  duration INTEGER, -- minutes
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Practice Script Plays (join table, enhance if needed)
CREATE TABLE practice_script_plays (
  id UUID,
  practice_script_id UUID REFERENCES practice_scripts(id),
  play_id UUID REFERENCES plays(id),
  sequence_order INTEGER,
  repetitions INTEGER DEFAULT 5,
  duration_minutes INTEGER DEFAULT 10,
  coaching_points TEXT[],
  created_at TIMESTAMPTZ
);
```

**Success Criteria:**

- [ ] Can add plays from playbook to script
- [ ] Can reorder plays via drag & drop
- [ ] Can set reps & time per play
- [ ] Can add coaching notes
- [ ] Script saves and appears in Practice Plans page
- [ ] Can load script into BoxCall later

#### **Week 2: Script Templates & Duplication** (Nov 14-21)

**Deliverables:**

- ✅ Script templates (pre-built common practice structures)
- ✅ Duplicate script feature
- ✅ Script library/archive
- ✅ Export to PDF

**Templates:**

```
1. Team Offense Install (12-15 plays, 60-90 reps, 45 min)
2. Red Zone Period (8-10 plays, 40-50 reps, 20 min)
3. Two-Minute Drill (6-8 plays, 30-40 reps, 15 min)
4. Goal Line Package (5-7 plays, 25-35 reps, 15 min)
5. Third Down Situational (10-12 plays, 50-60 reps, 30 min)
```

**Success Criteria:**

- [ ] Can create script from template
- [ ] Can duplicate existing script
- [ ] Can archive old scripts
- [ ] Can export script to PDF for coaches

**Deliverables:**

- ✅ `ExecutionTrackingService` class
- ✅ Helper methods for logging executions
- ✅ Background sync for offline tracking
- ✅ Unit tests for tracking logic

**Files to Create:**

```
src/services/executionTrackingService.ts (NEW)
src/hooks/useExecutionTracking.ts (NEW)
src/utils/offlineExecutionQueue.ts (NEW)
__tests__/executionTrackingService.test.ts (NEW)
```

**Service Methods:**

```typescript
class ExecutionTrackingService {
  // Log a play execution (practice or game)
  static async logExecution(data: PlayExecutionCreate): Promise<void>;

  // Log formation usage (any context)
  static async logFormationUsage(
    formationId: string,
    context: any
  ): Promise<void>;

  // Bulk log (for importing historical data)
  static async bulkLogExecutions(
    executions: PlayExecutionCreate[]
  ): Promise<void>;

  // Get execution history for a play
  static async getPlayExecutions(
    playId: string,
    filters?: ExecutionFilters
  ): Promise<PlayExecution[]>;

  // Get formation usage stats
  static async getFormationUsageStats(formationId: string): Promise<UsageStats>;
}
```

**Success Criteria:**

- [ ] Can log play execution with full context
- [ ] Offline queue saves executions when no connection
- [ ] Sync resumes when connection returns
- [ ] All tests pass

---

---

### **Phase 5: Game Plan Builder (Billick Structure)**

**Duration:** 2 weeks (Nov 21 - Dec 5)

#### **Week 1: Situational Game Planning** (Nov 21-28)

**Brian Billick Game Plan Structure:**

```
Game Plan organized by SITUATION, not formation or play type.

Situations:
├─ First & 10 (20-25 plays)
│  ├─ Run plays (12-15)
│  └─ Pass plays (8-10)
│
├─ Second & Short (2-6 yards) (10-12 plays)
│  ├─ Run plays (6-8)
│  └─ Pass plays (4-6)
│
├─ Second & Medium (7-9 yards) (12-15 plays)
│  ├─ Run plays (4-6)
│  └─ Pass plays (8-10)
│
├─ Second & Long (10+ yards) (10-12 plays)
│  └─ Pass plays (8-10)
│  └─ Draw/Screen (2-4)
│
├─ Third & Short (1-3 yards) (8-10 plays)
│  ├─ Run plays (4-6)
│  └─ Pass plays (4-6)
│
├─ Third & Medium (4-7 yards) (10-12 plays)
│  └─ Pass plays (8-10)
│  └─ Draw/QB Draw (2-4)
│
├─ Third & Long (8+ yards) (8-10 plays)
│  └─ Pass plays (6-8)
│  └─ Screen (2-3)
│
├─ Red Zone (Inside 20) (15-20 plays)
│  ├─ Run plays (8-10)
│  └─ Pass plays (7-10)
│
├─ Goal Line (Inside 5) (10-12 plays)
│  ├─ Run plays (6-8)
│  └─ Pass plays (4-6)
│
├─ Two-Minute Offense (12-15 plays)
│  └─ Quick passes, sideline routes
│
└─ Short Yardage (3-4 plays)
    └─ Power runs, QB sneak
```

**Deliverables:**

- ✅ Game Plans page (already exists, enhance)
- ✅ Billick situation templates
- ✅ Add plays to situations from playbook
- ✅ Suggested play counts per situation
- ✅ Priority/ranking within each situation

**Files to Change:**

```
src/pages/GamePlansPage.tsx (enhance existing)
src/components/gameplans/GamePlanBuilder.tsx (NEW)
src/components/gameplans/SituationPlayList.tsx (NEW)
src/services/gamePlanService.ts (enhance)
src/utils/billickTemplate.ts (NEW)
```

**Game Plan Builder UI:**

```
┌──────────────────────────────────────────────────────────────┐
│  Game Plan: vs Lincoln High - Oct 25, 2025                   │
│  Template: Billick Situational                               │
├──────────────────────────────────────────────────────────────┤
│  Completion: 67% (8/12 situations complete)                  │
│                                                              │
│  ▼ First & 10 (18/20-25 plays) ✓                            │
│     1. Power Right (I-Form) - Run                            │
│     2. Y-Sail (Trips) - Pass                                 │
│     3. Mesh Cross (Spread) - Pass                            │
│     ... 15 more plays                                        │
│     [+ Add Plays from Playbook]                              │
│                                                              │
│  ▼ Second & Short (8/10-12 plays) ⚠️ Needs 2-4 more         │
│     1. Zone Right (Gun) - Run                                │
│     2. Slant Flat (Trips) - Pass                             │
│     ... 6 more plays                                         │
│     [+ Add Plays from Playbook]                              │
│                                                              │
│  ▶ Second & Medium (0/12-15 plays) ❌ Empty                  │
│     [+ Add Plays from Playbook]                              │
│                                                              │
│  ... (9 more situations)                                     │
│                                                              │
│  [Save Game Plan] [Export PDF] [Load in BoxCall]            │
└──────────────────────────────────────────────────────────────┘
```

**Success Criteria:**

- [ ] Game plan organizes plays by Billick situations
- [ ] Shows completion % per situation
- [ ] Suggests optimal play counts
- [ ] Can add plays from playbook to any situation
- [ ] Can reorder plays within situation (priority)

#### **Week 2: Advanced Game Planning** (Nov 28 - Dec 5)

**Deliverables:**

- ✅ Opponent scout report integration
- ✅ Defensive tendency matcher
- ✅ Hash mark preferences (left/right/middle)
- ✅ Personnel package requirements
- ✅ Game script (first 15 plays)

**Features:**

```
Opponent Profile:
- Base Defense: 4-3
- Primary Coverage: Cover 2 (65%)
- Blitz Rate: 18%
- Strengths: Run defense
- Weaknesses: Deep passes, outside runs

Auto-Suggest Plays:
- "Based on Lincoln's Cover 2 tendency, these plays work well:"
  → Trips Y-Sail (90% vs Cover 2)
  → Spread Mesh (85% vs Cover 2)
  → Gun Power Outside (80% vs 4-3)
```

**Game Script (First 15 Plays):**

```
The first 15 plays of the game, scripted in advance.
Covers: 1st down, 2nd & short, 2nd & medium situations.

Example:
1. Power Right (I-Form) - 1st & 10, set the tone
2. Y-Sail (Trips) - 1st & 10, test their coverage
3. Zone Left (Gun) - 2nd & short, keep them honest
... 12 more plays

Coach knows exactly what to call to start the game.
```

**Success Criteria:**

- [ ] Can add opponent scout report
- [ ] System suggests plays based on tendencies
- [ ] Can script first 15 plays
- [ ] Game plan exports to PDF with situational breakdown
- [ ] Can load game plan into BoxCall

---

### **Phase 6: Script/Plan Management**

**Duration:** 1 week (Dec 5-12)

**Deliverables:**

- ✅ Edit/duplicate scripts and game plans
- ✅ Archive old scripts/plans
- ✅ Search & filter scripts/plans
- ✅ Share scripts/plans with other coaches

**Success Criteria:**

- [ ] Can duplicate last week's script as template
- [ ] Can archive old game plans
- [ ] Can search scripts by name, date, opponent
- [ ] Can export/import scripts/plans

---

## 🏗️ STAGE 3: BOXCALL LIVE SESSION (Dec 5, 2025 - Jan 2, 2026)

**Goal:** Turn practice scripts and game plans into live tracking sessions where coaches mark play results in real-time or retroactively.

**Why This Stage:** This is THE KEY FEATURE. BoxCall becomes the tool coaches use during practice and games to track execution. Every mark of "success" or "failure" builds the confidence data that powers analytics later.

---

### **Phase 7: Session Architecture**

**Duration:** 1 week (Dec 5-12)

**Deliverables:**

- ✅ BoxCall page redesign (replace placeholder)
- ✅ Session types: Practice vs Game
- ✅ Session modes: Live vs Retroactive
- ✅ Session state management
- ✅ Offline support (PWA)

**Files to Change:**

```
src/pages/BoxCall.tsx (complete rebuild)
src/components/boxcall/SessionLoader.tsx (NEW)
src/components/boxcall/SessionHeader.tsx (NEW)
src/hooks/useSession.ts (NEW)
src/types/session.ts (NEW)
```

**Session Flow:**

```
1. Navigate to BoxCall page
2. Choose session type:
   - "Start Practice Session" (load practice script)
   - "Start Game Session" (load game plan)
   - "Record Past Session" (retroactive entry)

3. Load content:
   Practice → Select script → Shows 10-20 plays with reps
   Game → Select game plan → Shows all situational plays

4. Execute session:
   Mark each play/rep as Success, Failure, or Neutral
   Add quick notes
   Track time

5. End session:
   Save results
   Generate report
   Update confidence scores
```

**Session Types:**

```typescript
type SessionType = "practice" | "game";
type SessionMode = "live" | "retroactive";

interface Session {
  id: string;
  type: SessionType;
  mode: SessionMode;
  started_at: Date;
  ended_at?: Date;

  // Content
  practice_script_id?: string; // If practice session
  game_plan_id?: string; // If game session

  // Stats (calculated)
  total_plays: number;
  completed_plays: number;
  success_count: number;
  failure_count: number;
  success_rate: number;

  // Context
  team_id: string;
  recorded_by: string;
  notes?: string;
}
```

**Success Criteria:**

- [ ] Can choose practice or game session
- [ ] Can choose live or retroactive mode
- [ ] Session state persists across page reloads
- [ ] Works offline (saves to local storage, syncs when online)

---

### **Phase 8: Practice Session Tracking**

**Duration:** 1.5 weeks (Dec 12-22)

**THE PRACTICE FLOW:**

**Before Practice:**

1. Coach creates practice script in Playbook (Phase 4)
2. Script has 10 plays, 5-10 reps each = ~50-100 total reps

**During/After Practice:**

1. Coach opens BoxCall on iPad/laptop
2. Clicks "Start Practice Session"
3. Selects "Team Offense Install #3" (their script)
4. BoxCall loads all plays with rep counters

**Live Tracking UI:**

```
┌──────────────────────────────────────────────────────────────┐
│  PRACTICE SESSION: Team Offense Install #3    [⏸ Pause]      │
│  Started: 3:15 PM  |  Elapsed: 12 min  |  42/85 reps done   │
├──────────────────────────────────────────────────────────────┤
│  Current Play: Y-Sail (Trips, Pass, 11 Personnel)           │
│  Rep: 4/8  ●●●●○○○○                                          │
│                                                              │
│  [≡] Rep 4 Result:                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ✓ Success    × Failure    ~ Neutral    ⊗ Skip      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Quick Notes: _________________________________              │
│                                                              │
│  [Previous Play] [Next Rep] [Next Play]                     │
├──────────────────────────────────────────────────────────────┤
│  Session Progress:                                           │
│  ✓ Power Right (I-Form) - 10/10 reps (8 success)            │
│  ✓ Mesh Cross (Spread) - 6/6 reps (5 success)               │
│  ✓ Zone Left (Gun) - 8/8 reps (7 success)                   │
│  ▶ Y-Sail (Trips) - 4/8 reps (3 success) ← CURRENT          │
│  ○ Slant Flat (Shotgun) - 0/7 reps                          │
│  ○ ... 5 more plays                                          │
└──────────────────────────────────────────────────────────────┘
```

**Assistant Coach Flow:**

- Coach has iPad with BoxCall open
- As team runs play, assistant taps Success/Failure
- Takes 1-2 seconds per rep
- Can add quick note: "Good timing" or "Missed block #77"
- No need to stop practice to log data

**Retroactive Flow:**

- After practice, coach sits down with notes
- Opens BoxCall → "Record Past Session"
- Selects same script
- Quickly marks each play: ✓✓✓××✓✓✓ (success/failure pattern)
- Takes 5-10 minutes to log entire practice

**Deliverables:**

- ✅ Practice session UI
- ✅ Rep counter with success/failure buttons
- ✅ Quick notes input
- ✅ Session progress tracker
- ✅ Pause/resume functionality
- ✅ Auto-save every 30 seconds

**Files to Create:**

```
src/components/boxcall/PracticeSession.tsx (NEW)
src/components/boxcall/RepTracker.tsx (NEW)
src/components/boxcall/QuickResultButtons.tsx (NEW)
src/hooks/usePracticeSession.ts (NEW)
```

**Success Criteria:**

- [ ] Can load practice script into session
- [ ] Can mark each rep as success/failure/neutral
- [ ] Progress saves automatically
- [ ] Can pause and resume session
- [ ] Session generates report at end
- [ ] All results save to database

---

### **Phase 9: Game Session Tracking**

**Duration:** 1.5 weeks (Dec 22 - Jan 2)

**THE GAME FLOW:**

**Before Game:**

1. Coach creates game plan in Playbook (Phase 5)
2. Game plan has 80-120 plays organized by situation (Billick)
3. First 15 plays are scripted

**During/After Game:**

1. Coach opens BoxCall in press box or on sideline
2. Clicks "Start Game Session"
3. Selects "vs Lincoln High - Oct 25"
4. BoxCall loads game plan

**Live Tracking UI (From The Box):**

```
┌──────────────────────────────────────────────────────────────┐
│  GAME SESSION: vs Lincoln High         Q2  8:42  [⏸ Pause]  │
│  Score: Us 14 - Them 7  |  21 plays called  |  Drive: 3-12  │
├──────────────────────────────────────────────────────────────┤
│  Situation: 2nd & 7  |  Opp 35  |  Hash: Right               │
│                                                              │
│  🤖 AI RECOMMENDATIONS (from game plan):                     │
│  1. Y-Sail (Trips) - 92% confidence  [CALL]                 │
│  2. Mesh Cross (Spread) - 88% confidence  [CALL]            │
│  3. Zone Right (Gun) - 84% confidence  [CALL]               │
│  [View All 2nd & Medium Plays (12)]                          │
│                                                              │
│  Or: [+ Add Play Not in Game Plan]                          │
├──────────────────────────────────────────────────────────────┤
│  📝 CALLED: Y-Sail (Trips)                                   │
│                                                              │
│  Result:                                                     │
│  [✓ Success] [× Failure] [~ Neutral] [⊗ Penalty]            │
│                                                              │
│  Yards: [____] (optional)                                    │
│  Defense: [Cover 2 ▼] [Blitz: No ▼]                         │
│  Notes: ________________________________                     │
│                                                              │
│  [Log & Next Down]                                           │
├──────────────────────────────────────────────────────────────┤
│  Drive Summary: 3 plays, 12 yards, 2:15 elapsed             │
│  └─ Success Rate: 67% (2/3)                                  │
└──────────────────────────────────────────────────────────────┘
```

**Key Features:**

**1. Situational Awareness:**

- BoxCall knows down, distance, field position
- Filters game plan plays to show only relevant ones
- "2nd & 7 at Opp 35" → shows "Second & Medium" plays

**2. AI Recommendations:**

- Uses confidence scores from past games/practices
- "Y-Sail has 92% confidence in this situation"
- Coach can follow AI or call something else

**3. Quick Logging:**

- Mark success/failure in 5-10 seconds
- Down/distance auto-advances based on result
- No need to type much during game

**4. Add Plays Live:**

- If coach calls something NOT in game plan
- Can add it on the fly: "Trips Y-Sail" → quick search → log result
- Play gets added to history even if not pre-planned

**Retroactive Flow (After Game):**

```
Coach didn't track live? No problem.

1. Open BoxCall next day
2. "Record Past Session" → Game
3. Select "vs Lincoln High"
4. Go through play-by-play:
   - "Q1, 1st & 10: Power Right → Success, 5 yards"
   - "Q1, 2nd & 5: Y-Sail → Success, 12 yards, TD!"
   - ... continue for all plays
5. Takes 15-20 minutes to log entire game
```

**Deliverables:**

- ✅ Game session UI
- ✅ Situational play filtering
- ✅ AI recommendation engine
- ✅ Quick result logging
- ✅ Down/distance tracker
- ✅ Add plays live (not in game plan)
- ✅ Drive summary stats

**Files to Create:**

```
src/components/boxcall/GameSession.tsx (NEW)
src/components/boxcall/SituationFilter.tsx (NEW)
src/components/boxcall/AIRecommendations.tsx (NEW)
src/components/boxcall/DownDistanceTracker.tsx (NEW)
src/hooks/useGameSession.ts (NEW)
```

**Success Criteria:**

- [ ] Can load game plan into session
- [ ] Situation awareness filters plays correctly
- [ ] AI recommendations appear based on confidence
- [ ] Can log plays in <10 seconds
- [ ] Can add plays not in game plan
- [ ] Down/distance auto-advances
- [ ] Session generates detailed game report

---

### **Phase 10: Execution History Database**

**Duration:** 1 week (Dec 26 - Jan 2)

**Deliverables:**

- ✅ `play_executions` table (execution history)
- ✅ Auto-update confidence scores
- ✅ Sync service for offline sessions
- ✅ Data validation & integrity checks

**Schema:**

```sql
CREATE TABLE play_executions (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What was executed
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,

  -- Where it was executed
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('practice', 'game')),
  practice_script_id UUID REFERENCES practice_scripts(id) ON DELETE SET NULL,
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE SET NULL,

  -- When
  executed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Result
  result TEXT CHECK (result IN ('success', 'failure', 'neutral', 'penalty', 'skipped')) NOT NULL,
  yards_gained INTEGER,
  touchdown BOOLEAN DEFAULT false,
  turnover BOOLEAN DEFAULT false,

  -- Context (game only)
  quarter INTEGER,
  down INTEGER,
  distance INTEGER,
  yard_line INTEGER,
  hash TEXT CHECK (hash IN ('left', 'middle', 'right')),
  opponent_name TEXT,
  defensive_front TEXT,
  defensive_coverage TEXT,
  was_blitz BOOLEAN DEFAULT false,

  -- Notes
  coaching_notes TEXT,

  -- Confidence impact
  confidence_before INTEGER, -- Play's confidence before execution
  confidence_after INTEGER,  -- Play's confidence after execution (updated by algorithm)

  -- Metadata
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  recorded_mode TEXT CHECK (recorded_mode IN ('live', 'retroactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_play_executions_play ON play_executions(play_id);
CREATE INDEX idx_play_executions_formation ON play_executions(formation_id);
CREATE INDEX idx_play_executions_session ON play_executions(session_id);
CREATE INDEX idx_play_executions_team ON play_executions(team_id);
CREATE INDEX idx_play_executions_date ON play_executions(executed_at DESC);
CREATE INDEX idx_play_executions_result ON play_executions(result);
```

**Confidence Update Trigger:**

```sql
-- After each execution, update play confidence
CREATE OR REPLACE FUNCTION update_play_confidence()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new confidence based on recent executions
  UPDATE plays
  SET confidence_base = calculate_confidence(NEW.play_id)
  WHERE id = NEW.play_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_play_execution
AFTER INSERT ON play_executions
FOR EACH ROW
EXECUTE FUNCTION update_play_confidence();
```

**Success Criteria:**

- [ ] Every rep/play execution saves to database
- [ ] Confidence scores update automatically
- [ ] Offline sessions sync when connection returns
- [ ] No data loss
- [ ] Can query execution history by play, formation, situation

---

## 🏗️ STAGE 4: ANALYTICS ENGINE (Jan 2 - Jan 30, 2026)

**Goal:** Build the intelligence layer that calculates confidence scores, detects trends, and makes recommendations based on execution history.

**Why This Stage:** Now that you have execution data from practice and game sessions, you can analyze it to give coaches actionable insights.

---

### **Phase 11: Confidence Algorithm**

**Duration:** 1 week (Jan 2-9)

**The Core Algorithm:**

```typescript
/**
 * Calculate confidence score for a play
 * Score: 0-100 (higher = more confident to call)
 */
function calculateConfidenceScore(playId: string): number {
  const executions = getRecentExecutions(playId, limit: 50);

  if (executions.length < 5) {
    return 70; // Default for new plays
  }

  const factors = {
    // Historical Success (40% weight)
    overallSuccessRate: calculateSuccessRate(executions),

    // Recent Trend (30% weight)
    last10SuccessRate: calculateSuccessRate(executions.slice(0, 10)),
    trendDirection: detectTrend(executions), // 'hot', 'cold', 'stable'

    // Volume Confidence (15% weight)
    // More reps = more confidence in the data
    volumeScore: Math.min(executions.length / 20 * 100, 100),

    // Recency (10% weight)
    // Recently practiced = more fresh
    daysSinceLastExecution: getDaysSince(executions[0].executed_at),
    recencyScore: Math.max(100 - (daysSinceLastExecution * 2), 0),

    // Context Match (5% weight)
    // How well does play fit current situation?
    situationalFit: calculateSituationalFit(playId, currentSituation),
  };

  const weights = {
    overallSuccess: 0.40,
    recentTrend: 0.30,
    volume: 0.15,
    recency: 0.10,
    situational: 0.05,
  };

  const score = Math.round(
    (factors.overallSuccessRate * weights.overallSuccess) +
    (factors.last10SuccessRate * weights.recentTrend) +
    (factors.volumeScore * weights.volume) +
    (factors.recencyScore * weights.recency) +
    (factors.situationalFit * weights.situational)
  );

  return Math.max(0, Math.min(100, score));
}
```

**Trend Detection:**

```typescript
function detectTrend(executions: PlayExecution[]): "hot" | "cold" | "stable" {
  const recent5 = executions.slice(0, 5);
  const previous5 = executions.slice(5, 10);

  const recentSuccess = calculateSuccessRate(recent5);
  const previousSuccess = calculateSuccessRate(previous5);

  const improvement = recentSuccess - previousSuccess;

  if (improvement >= 20) return "hot"; // 🔥 20%+ improvement
  if (improvement <= -20) return "cold"; // ❄️ 20%+ decline
  return "stable"; // → Within 20%
}
```

**Deliverables:**

- ✅ Confidence calculation service
- ✅ Trend detection algorithm
- ✅ Automatic confidence updates after each execution
- ✅ Confidence history tracking (see how it changes over time)

**Success Criteria:**

- [ ] Confidence scores feel accurate to coaches
- [ ] Hot/cold trends match coach's intuition
- [ ] Scores update in real-time after sessions
- [ ] Can see confidence change over season

---

### **Phase 12: Formation & Play Analytics**

**Duration:** 1 week (Jan 9-16)

#### **Formation Analytics:**

```
┌──────────────────────────────────────────────────────────────┐
│  Formation: Trips                                            │
│  Confidence: 87/100 🔥 Hot                                   │
├──────────────────────────────────────────────────────────────┤
│  Overall: 47 executions  |  41 success (87%)                │
│  Practice: 35 reps       |  Game: 12 calls                  │
│  Last Used: 2 days ago                                       │
│                                                              │
│  Trend: 🔥 Hot (Last 10: 9/10 = 90%)                        │
│  Best Plays: Y-Sail (92%), Mesh Cross (88%)                 │
│  Best Situations: 3rd & 5-8, Red Zone                        │
└──────────────────────────────────────────────────────────────┘
```

#### **Play Analytics:**

```
┌──────────────────────────────────────────────────────────────┐
│  Play: Y-Sail (from Trips)                                   │
│  Confidence: 92/100 🔥 Hot                                   │
├──────────────────────────────────────────────────────────────┤
│  Overall: 23 executions  |  21 success (91%)                │
│  Practice: 15 reps       |  Game: 8 calls                   │
│  Avg Yards: 8.3          |  TDs: 3                          │
│                                                              │
│  Situational Success:                                        │
│  • 1st & 10:  80% (8/10)                                     │
│  • 2nd & Med: 85% (6/7)                                      │
│  • 3rd & 5-8: 100% (6/6) ⭐ Money situation!                 │
│  • Red Zone:  100% (3/3) 🏈 All TDs!                        │
│                                                              │
│  vs Defense:                                                 │
│  • Cover 2:   100% (5/5) ✅                                  │
│  • Cover 3:   75% (3/4)  ✅                                  │
│  • Man:       67% (2/3)  ⚠️                                  │
└──────────────────────────────────────────────────────────────┘
```

**Deliverables:**

- ✅ Analytics calculation service
- ✅ Formation success rates by situation
- ✅ Play success rates by situation
- ✅ Best play recommendations per formation
- ✅ Situational strength analysis

**Schema (computed views):**

```sql
CREATE MATERIALIZED VIEW formation_analytics AS
SELECT
  f.id AS formation_id,
  f.name,
  COUNT(pe.id) AS total_executions,
  SUM(CASE WHEN pe.result = 'success' THEN 1 ELSE 0 END) AS success_count,
  AVG(CASE WHEN pe.result = 'success' THEN 100 ELSE 0 END) AS success_rate,

  -- Usage Stats
  total_plays_called INTEGER DEFAULT 0,
  total_practice_reps INTEGER DEFAULT 0,

  -- Success Metrics
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN (success_count + failure_count) > 0
    THEN (success_count::NUMERIC / (success_count + failure_count)) * 100
    ELSE 0 END
  ) STORED,

  -- Situational Success
  first_down_attempts INTEGER DEFAULT 0,
  first_down_successes INTEGER DEFAULT 0,
  first_down_success_rate NUMERIC(5,2),

  second_down_attempts INTEGER DEFAULT 0,
  second_down_successes INTEGER DEFAULT 0,
  second_down_success_rate NUMERIC(5,2),

  third_down_attempts INTEGER DEFAULT 0,
  third_down_successes INTEGER DEFAULT 0,
  third_down_success_rate NUMERIC(5,2),

  red_zone_attempts INTEGER DEFAULT 0,
  red_zone_touchdowns INTEGER DEFAULT 0,
  red_zone_success_rate NUMERIC(5,2),

  -- Coverage Success (JSONB for flexibility)
  vs_coverage_stats JSONB DEFAULT '{}', -- {"Cover 2": {att: 10, succ: 8}, ...}
  vs_front_stats JSONB DEFAULT '{}',    -- {"4-3": {att: 15, succ: 12}, ...}
  vs_blitz_stats JSONB DEFAULT '{}',    -- {att: 5, succ: 3}

  -- Advanced Metrics
  avg_yards_gained NUMERIC(5,2),
  avg_execution_quality NUMERIC(4,2), -- 1-10 scale
  turnover_rate NUMERIC(5,2),

  -- Confidence Score (AI-Driven)
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  confidence_trend TEXT CHECK (confidence_trend IN ('improving', 'declining', 'stable')),

  -- Trend Data (last 5, 10, 20 executions)
  last_5_success_rate NUMERIC(5,2),
  last_10_success_rate NUMERIC(5,2),
  trend_direction TEXT, -- 'hot', 'cold', 'stable'

  -- Timestamps
  last_execution_at TIMESTAMPTZ,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(formation_id, team_id, season_year)
);

-- Materialized view for dashboard queries
CREATE MATERIALIZED VIEW formation_analytics_summary AS
SELECT
  f.id AS formation_id,
  f.name,
  f.personnel_name,
  fa.success_rate,
  fa.confidence_score,
  fa.trend_direction,
  fa.total_plays_called,
  fa.last_execution_at
FROM formations f
LEFT JOIN formation_analytics fa ON f.id = fa.formation_id
ORDER BY fa.confidence_score DESC NULLS LAST;

CREATE UNIQUE INDEX ON formation_analytics_summary(formation_id);
```

**Success Criteria:**

- [ ] Analytics table updates after each execution
- [ ] Materialized view refreshes on schedule (every 5 min)
- [ ] Queries return in <100ms
- [ ] All success rates calculate correctly

#### **Week 2: Formation Intelligence** (Dec 23-29)

**Deliverables:**

- ✅ `FormationAnalyticsService` class
- ✅ Confidence score algorithm
- ✅ Trend detection logic
- ✅ Recommendation engine

**Service Methods:**

```typescript
class FormationAnalyticsService {
  // Get full analytics for a formation
  static async getFormationAnalytics(
    formationId: string
  ): Promise<FormationAnalytics>;

  // Calculate confidence score
  static calculateConfidenceScore(analytics: FormationAnalytics): number;

  // Detect trend (hot/cold/stable)
  static detectTrend(recentExecutions: PlayExecution[]): TrendAnalysis;

  // Get recommendations for a formation
  static getRecommendations(formationId: string): Promise<Recommendation[]>;

  // Compare formations (which is better for situation?)
  static compareFormations(
    formationIds: string[],
    situation: Situation
  ): Promise<Comparison>;
}
```

**Confidence Algorithm:**

```typescript
function calculateConfidenceScore(analytics: FormationAnalytics): number {
  const factors = {
    historicalSuccess: analytics.success_rate, // 0-100
    recentTrend: analytics.last_5_success_rate, // 0-100
    volumeConfidence: Math.min((analytics.total_plays_called / 20) * 100, 100), // More data = more confidence
    situationalFit: calculateSituationalFit(analytics), // 0-100
    recency: calculateRecencyScore(analytics.last_execution_at), // 0-100
  };

  const weights = {
    historicalSuccess: 0.35, // 35% weight
    recentTrend: 0.3, // 30% weight
    volumeConfidence: 0.15, // 15% weight
    situationalFit: 0.1, // 10% weight
    recency: 0.1, // 10% weight
  };

  return Math.round(
    factors.historicalSuccess * weights.historicalSuccess +
      factors.recentTrend * weights.recentTrend +
      factors.volumeConfidence * weights.volumeConfidence +
      factors.situationalFit * weights.situationalFit +
      factors.recency * weights.recency
  );
}
```

**Success Criteria:**

- [ ] Confidence scores feel accurate to coaches
- [ ] Trend detection works (hot after 4/5 success)
- [ ] Recommendations are actionable
- [ ] Comparison tool helps decision-making

---

-- Trend data
(SELECT AVG(CASE WHEN pe2.result = 'success' THEN 100 ELSE 0 END)
FROM (SELECT \* FROM play_executions pe2
WHERE pe2.formation_id = f.id
ORDER BY executed_at DESC LIMIT 10) recent
) AS last_10_success_rate,

MAX(pe.executed_at) AS last_executed
FROM formations f
LEFT JOIN play_executions pe ON pe.formation_id = f.id
GROUP BY f.id, f.name;

-- Refresh every 5 minutes
CREATE INDEX ON formation_analytics(formation_id);

````

**Success Criteria:**
- [ ] Can query formation stats in <100ms
- [ ] Can query play stats in <100ms
- [ ] Analytics update after each session
- [ ] Trend detection works correctly

---

### **Phase 13: Situational Intelligence**
**Duration:** 1 week (Jan 16-23)

**THE KEY FEATURE: "What should I call right now?"**

**Deliverables:**
- ✅ Situational play recommender
- ✅ "Best play for this down/distance" engine
- ✅ Coverage-based recommendations
- ✅ Hash preference analysis

**The Intelligence:**
```typescript
function getBestPlaysForSituation(situation: GameSituation): PlayRecommendation[] {
  const { down, distance, yardLine, hash, opponentCoverage } = situation;

  // Filter plays by situation
  let candidates = plays.filter(p => {
    // 3rd & Short → show plays with high 3rd & short success rate
    if (down === 3 && distance <= 3) {
      return p.third_short_success_rate > 70;
    }
    // Red Zone → show red zone plays
    if (yardLine <= 20) {
      return p.red_zone_success_rate > 75;
    }
    // etc.
  });

  // Rank by confidence
  candidates = candidates
    .map(play => ({
      play,
      confidence: calculateConfidenceScore(play.id),
      matchScore: calculateSituationMatch(play, situation),
    }))
    .sort((a, b) => {
      // Weight: 70% confidence, 30% situation match
      const scoreA = (a.confidence * 0.7) + (a.matchScore * 0.3);
      const scoreB = (b.confidence * 0.7) + (b.matchScore * 0.3);
      return scoreB - scoreA;
    });

  return candidates.slice(0, 5); // Top 5 recommendations
}
````

**Example Queries:**

```
Coach: "3rd & 7 at midfield, they're in Cover 2"
BoxCall:
  1. Y-Sail (Trips) - 92% confidence
     └─ 100% vs Cover 2 (5/5), Avg 9.3 yards
  2. Mesh Cross (Spread) - 88% confidence
     └─ 90% on 3rd & medium (9/10), Avg 8.1 yards
  3. Stick Concept (Shotgun) - 85% confidence
     └─ 87% vs Cover 2 (7/8), Avg 7.8 yards
```

**Success Criteria:**

- [ ] Recommendations feel right to coaches
- [ ] Takes <200ms to generate recommendations
- [ ] Factors in multiple variables (down, distance, coverage, hash)
- [ ] Learns from coach overrides (if coach ignores AI, log it)

---

### **Phase 14: Game Day Predictor**

**Duration:** 1 week (Jan 23-30)

**"From The Box" - Live recommendations during games**

**The Vision:**

- Coach's assistant in press box has iPad with BoxCall
- BoxCall shows live recommendations based on situation
- Updates every play based on success/failure
- By 4th quarter, BoxCall knows what's working TODAY

**Live Intelligence:**

```typescript
function getLiveRecommendations(
  gameId: string,
  situation: GameSituation
): LiveRecommendation[] {
  // Get base confidence from season data
  const seasonRecommendations = getBestPlaysForSituation(situation);

  // Adjust based on THIS GAME's performance
  const gameExecutions = getExecutionsThisGame(gameId);

  return seasonRecommendations.map((rec) => {
    const thisGameStats = gameExecutions.filter(
      (e) => e.play_id === rec.play.id
    );

    if (thisGameStats.length > 0) {
      const thisGameSuccess = calculateSuccessRate(thisGameStats);

      // Weight: 70% season, 30% this game
      const adjustedConfidence = rec.confidence * 0.7 + thisGameSuccess * 0.3;

      return {
        ...rec,
        confidence: adjustedConfidence,
        note:
          thisGameStats.length > 0
            ? `${thisGameStats.length} calls today: ${thisGameSuccess}% success`
            : "Not yet called today",
      };
    }

    return rec;
  });
}
```

**Example:**

```
Q1: Y-Sail has 92% season confidence
Q2: Called 3x this game, 3/3 success (100%)
Q3: BoxCall boosts confidence to 95% "🔥 Money play today!"

Q4: Coach calls Y-Sail on crucial 3rd & 7
    → Success! → TD!
    → Confidence goes to 97%
```

**Deliverables:**

- ✅ Live recommendation engine
- ✅ In-game confidence adjustments
- ✅ Play frequency tracker ("Don't get predictable!")
- ✅ Opponent adjustment detector

**Success Criteria:**

- [ ] Recommendations update every play
- [ ] Accounts for what's working THIS GAME
- [ ] Warns if play is being overused
- [ ] Coach can override and system learns

---

## 🏗️ STAGE 5: POLISH & LAUNCH (Jan 30 - Feb 15, 2026)

### **Database Schema (Final):**

```sql
-- Core tables (already exist)
formations (id, name, personnel_id, opposite_formation_id)
plays (id, name, formation_id, playbook_id, formation_text_deprecated)
playbooks (id, name, user_id)
personnel_configurations (id, name, abbreviation)

-- Planning tables (Stage 2)
practice_scripts (id, name, user_id, playbook_id, created_at)
practice_script_plays (script_id, play_id, order_number, reps_planned)
game_plans (id, opponent, game_date, user_id, playbook_id)
game_plan_situations (id, game_plan_id, situation_type, notes)
game_plan_plays (game_plan_id, situation_id, play_id, order_number)

-- Execution tables (Stage 3)
practice_sessions (id, script_id, date, user_id, mode: 'live'|'retroactive')
game_sessions (id, game_plan_id, date, user_id, mode: 'live'|'retroactive')
play_executions (
  id, session_id, play_id, formation_id,
  down, distance, field_position, yards_gained,
  success (boolean), notes, timestamp
)

-- Analytics tables (Stage 4)
play_confidence_scores (
  play_id, confidence_score (0-100),
  total_executions, successful_executions,
  recent_trend ('hot'|'cold'|'stable'),
  last_calculated, last_executed
)
situational_stats (
  play_id, situation_type,
  success_rate, avg_yards, sample_size
)
formation_analytics (
  formation_id, success_rate, total_plays,
  best_situations[], weak_situations[]
)
opponent_profiles (
  id, team_name, season,
  coverage_tendencies, blitz_frequency,
  weak_vs_formations[], weak_vs_concepts[]
)
```

### **Key Services:**

```typescript
// Stage 1-2
FormationService.ts; // CRUD formations, link opposites
PlayService.ts; // CRUD plays, link formations
PracticeScriptService.ts; // Build scripts, manage plays
GamePlanService.ts; // Billick structure, situational org

// Stage 3
SessionTrackingService.ts; // Live/retroactive tracking
ExecutionService.ts; // Log play results, calculate stats

// Stage 4
AnalyticsEngine.ts; // Calculate confidence, trends
RecommendationService.ts; // AI suggestions, chat interface
ConfidenceCalculator.ts; // Weighted scoring algorithm
```

---

## 📅 Launch Timeline Summary

**Duration:** 1 week (Jan 30 - Feb 6)

**Deliverables:**

- ✅ Analytics dashboard (overview page)
- ✅ Formation Hub (all formation stats)
- ✅ Play Intelligence (play detail pages)
- ✅ Reports (practice reports, game reports, season summaries)
- ✅ Export to PDF

**Dashboard Overview:**

```
┌──────────────────────────────────────────────────────────────┐
│  BoxCall Analytics - Season 2025                             │
├──────────────────────────────────────────────────────────────┤
│  Season Summary:                                             │
│  • 156 plays in playbook                                     │
│  • 847 practice reps tracked                                 │
│  • 8 games logged                                            │
│  • Average confidence: 84/100                                │
│                                                              │
│  🔥 Hot Plays (Last 2 weeks):                                │
│  1. Y-Sail (Trips) - 97% confidence, 12/12 success          │
│  2. Mesh Cross (Spread) - 95% confidence, 10/11 success     │
│  3. Power Right (I-Form) - 92% confidence, 18/20 success    │
│                                                              │
│  ❄️ Cold Plays (Need work):                                 │
│  • Trey Left Smash - 45% confidence, 2/6 recent             │
│  • Empty Fade - 52% confidence, 3/8 recent                   │
│                                                              │
│  📊 Situational Leaders:                                     │
│  • Best 3rd & Short: QB Sneak (100%, 8/8)                   │
│  • Best Red Zone: Spread Fade (92%, 11/12)                  │
│  • Best vs Blitz: Slot Screen (88%, 7/8)                    │
└──────────────────────────────────────────────────────────────┘
```

**Reports:**

- Practice Report: Rep counts, success rates, coaching notes
- Game Report: Play-by-play, drive summaries, success by situation
- Season Report: Trend analysis, confidence changes, playbook health

**Success Criteria:**

- [ ] Dashboard loads in <1 second
- [ ] All reports export to PDF
- [ ] Can share reports via link
- [ ] Printable for coaches

---

### **Phase 16: Mobile Optimization**

**Duration:** 0.5 weeks (Feb 6-10)

**Deliverables:**

- ✅ Mobile-responsive layouts (iPhone, iPad, Android)
- ✅ Touch-optimized buttons (44x44px minimum)
- ✅ Swipe gestures for navigation
- ✅ Offline PWA support

**Success Criteria:**

- [ ] Works perfectly on iPhone 13+ and Android
- [ ] Can use during game on sideline (bright sun readable)
- [ ] Works offline (saves to local, syncs later)
- [ ] Thumb-friendly buttons

---

### **Phase 17: Beta Testing & Launch**

**Duration:** 0.5 weeks (Feb 10-15)

**Deliverables:**

- ✅ Beta test with 5-10 volunteer coaches
- ✅ Bug fixes from feedback
- ✅ Tutorial videos (5-7 short videos)
- ✅ Help documentation
- ✅ Launch announcement

**Beta Test Checklist:**

- [ ] Create practice script → Track reps → See confidence change ✓
- [ ] Create game plan → Log game → Get recommendations ✓
- [ ] Mobile works on sideline ✓
- [ ] Offline mode works ✓
- [ ] Reports export correctly ✓

**Launch:**

- February 15, 2026
- Email to all BoxCall users
- Tutorial: "Track Your First Practice in 5 Minutes"
- Support: Live chat available

---

## 📊 Success Metrics & Validation

### **Stage 1: Data Foundation**

- [ ] 95%+ plays linked to formations via `formation_id`
- [ ] Average playbook health score: 85/100
- [ ] Multi-select works smoothly
- [ ] <5% duplicate formations

### **Stage 2: Planning Features**

- [ ] 80%+ coaches create practice scripts
- [ ] 70%+ coaches create game plans
- [ ] Average script size: 10-15 plays
- [ ] Average game plan: 80-120 plays across all situations

### **Stage 3: BoxCall Live**

- [ ] <10 seconds to log each play/rep
- [ ] 90%+ practice reps tracked
- [ ] 70%+ game plays logged
- [ ] Zero data loss (offline queue works)
- [ ] Session completion rate: 85%+

### **Stage 4: Analytics**

- [ ] Confidence scores within 10% of actual success
- [ ] Trend detection 80%+ accurate
- [ ] <200ms recommendation query time
- [ ] 85%+ coach satisfaction with AI recommendations

### **Stage 5: Polish**

- [ ] <2 second page load
- [ ] 95%+ mobile compatibility
- [ ] 80%+ coach adoption rate (weekly active users)
- [ ] 4+ star average rating
- [ ] <5% bug report rate

**October 17, 2025:** Start Stage 1 (Data Foundation)
**November 7, 2025:** Complete Stage 1 → Start Stage 2 (Planning Features)
**December 5, 2025:** Complete Stage 2 → Start Stage 3 (BoxCall Live)
**January 2, 2026:** Complete Stage 3 → Start Stage 4 (Analytics)
**January 30, 2026:** Complete Stage 4 → Start Stage 5 (Polish)
**February 15, 2026:** 🚀 LAUNCH!

**Total Duration:** 4 months (Oct 17 - Feb 15)

---

## 🚀 Post-Launch Vision (v2.0 - Spring 2026)

### **Play Metadata Intelligence** (Phase 6 - AddNewPlayModal Enhancements)

**Background:** Phase 6 features from AddNewPlayModal project - deferred from October 2025 core implementation. These features add smart automation to play tagging and metadata management.

**Deliverables:**

- ✅ **Hashtag Parsing in Notes** - Auto-extract tags from notes field
  - Coach types "Run this #bubble #screen in red zone"
  - System automatically adds "bubble" and "screen" to tags array
  - Prevents manual tag entry duplication
  - Smart parsing avoids false positives (e.g., "#3rd down" logic)

- ✅ **@Mention Parsing for Players** - Auto-link players from notes
  - Coach types "Route designed for @JohnSmith"
  - System automatically adds John Smith to key_players array
  - Leverages existing MentionsService (already built for social features)
  - Integration with team roster data

- ✅ **Global Tag Search** - Advanced tag-based filtering
  - Search all plays by specific tags
  - Filter playbook by tag combinations
  - Tag-based play organization
  - Quick filters for common tags

- ✅ **Tag Autocomplete** - Database-driven suggestions
  - Fetch existing tags from database as you type
  - Show most popular tags first
  - Prevent duplicate spellings ("redzone" vs "red-zone")
  - Tag frequency analytics

- ✅ **Tag Analytics Dashboard** - Metadata insights
  - Most used tags across playbook
  - Trending variations (new tags this week)
  - Tag usage by formation/play type
  - Tag popularity rankings
  - Tag correlation with success rates

- ✅ **Enhanced Bulk Tag Operations** - Extend existing BulkTaggingModal
  - Currently: Add tags to multiple plays
  - Enhanced: Remove tags, replace tags, tag templates
  - Smart tag suggestions based on play characteristics
  - Batch operations for tag cleanup

**Prerequisites:**

- Core tag functionality (TagInput component) ✅ Already built
- Database tags array column ✅ Already exists
- MentionsService for @parsing ✅ Already exists (used in social features)
- BulkTaggingModal ✅ Already exists

**Implementation Notes:**

- Low complexity - builds on existing infrastructure
- Regex-based parsing with validation to prevent false positives
- Can be phased: Start with autocomplete, add parsing later
- Tag analytics fits naturally into existing AnalyticsDashboard

**Success Criteria:**

- [ ] 90%+ coaches use hashtag shortcuts vs manual tagging
- [ ] 50%+ reduction in tag entry time
- [ ] <5% false positive rate on auto-tagging
- [ ] Tag search response time <100ms
- [ ] 80%+ coach satisfaction with tag suggestions

**Estimated Effort:** 1-2 weeks

- Hashtag/mention parsing: 2-3 days
- Global tag search: 1-2 days
- Tag autocomplete: 2-3 days
- Tag analytics: 2-3 days
- Testing & polish: 1-2 days

**Priority:** Medium (nice-to-have after core analytics are stable)

---

### **Opponent Intelligence**

**Deliverables:**

- ✅ Opponent profile builder
- ✅ Defensive tendency analyzer
- ✅ Matchup predictor
- ✅ Scout report generator

**Opponent Profile UI:**

```
┌──────────────────────────────────────────────────────────────┐
│  vs Lincoln High - Defensive Profile                         │
├──────────────────────────────────────────────────────────────┤
│  Base Defense: 4-3                                           │
│  Primary Coverage: Cover 2 (65% of snaps)                    │
│  Blitz Rate: 18% (moderate)                                  │
│  Strengths: Run defense, pressure up middle                  │
│  Weaknesses: Deep passes, outside runs                       │
│                                                              │
│  Recommended Formations:                                     │
│  ────────────────────────                                    │
│  1. Trips (90% vs Cover 2)  [Add to Game Plan]              │
│  2. Spread (85% vs 4-3)     [Add to Game Plan]              │
│  3. Gun Power (80% outside run) [Add to Game Plan]          │
│                                                              │
│  Avoid:                                                      │
│  • I-Form (weak vs 4-3)                                      │
│  • Trey Left (struggles vs Cover 2)                          │
└──────────────────────────────────────────────────────────────┘
```

**Success Criteria:**

- [ ] Can input opponent tendencies
- [ ] System recommends best plays
- [ ] Game plan auto-populates with high-confidence plays
- [ ] Scout report exports to PDF

#### **Week 2: Live Game Recommendations** (Feb 12-19)

**Deliverables:**

- ✅ Live play caller (game day mode)
- ✅ Situation-aware recommendations
- ✅ Real-time confidence adjustments
- ✅ Call success tracking

**Live Play Caller UI:**

```
┌──────────────────────────────────────────────────────────────┐
│  Q3  7:42  |  2nd & 7  |  Opp 35  |  Hash: Right            │
├──────────────────────────────────────────────────────────────┤
│  AI Recommendations (Confidence)                             │
│  ────────────────────────────────                            │
│  1. Trips Y-Sail         92/100  [CALL] [Details]           │
│     └─ 90% vs Cover 2, trending hot                          │
│                                                              │
│  2. Spread Mesh Cross    88/100  [CALL] [Details]           │
│     └─ 85% on 2nd & medium, avg 7.2 yds                      │
│                                                              │
│  3. Gun Power Right      84/100  [CALL] [Details]           │
│     └─ 80% outside run, works vs their front                 │
│                                                              │
│  [Show All Plays] [Manual Entry] [Quick Call]               │
└──────────────────────────────────────────────────────────────┘
```

**Success Criteria:**

- [ ] Recommendations update based on situation
- [ ] Coach can call play with 1-2 taps
- [ ] System learns from coach's actual calls
- [ ] Post-game analysis shows AI accuracy

---

### **Phase 15: Mobile & Polish**

**Duration:** 1 week (Feb 19-26)

**Deliverables:**

- ✅ Mobile-optimized layouts
- ✅ Offline support (ServiceWorker)
- ✅ Export to PDF (reports)
- ✅ Share to team (links)
- ✅ Final bug fixes & polish

**Success Criteria:**

- [ ] Works perfectly on iPhone/Android
- [ ] Can use during game without internet
- [ ] Reports look professional
- [ ] Zero critical bugs

---

## 📊 Success Metrics

### **Stage 1 (Data Foundation)**

- [ ] 95%+ plays linked to formations
- [ ] Average data quality score: 80/100+
- [ ] <5% duplicate formations
- [ ] 100% validation coverage

### **Stage 2 (Tracking)**

- [ ] <5 seconds to log play execution
- [ ] 90%+ practice reps tracked
- [ ] 50%+ game plays logged
- [ ] Zero data loss (offline queue works)

### **Stage 3 (Analytics)**

- [ ] Confidence scores within 10% of actual
- [ ] Trend detection 80%+ accurate
- [ ] <200ms query response time
- [ ] 90%+ coach satisfaction with recommendations

### **Stage 4 (BoxCall App)**

- [ ] <3 second page load
- [ ] 95%+ mobile compatibility
- [ ] 80%+ coach adoption rate
- [ ] 4+ star average rating

---

## 🚀 Launch Plan (February 15, 2026)

### **Soft Launch** (Feb 15-22)

- Beta with 5-10 coach volunteers
- Gather feedback
- Fix critical issues
- Refine UI based on real usage

### **Public Launch** (Feb 23-29)

- Announce to all users
- Marketing push
- Tutorial videos
- Support documentation

### **Post-Launch** (Mar 1+)

- Weekly feature updates
- Community feedback loop
- Machine learning training
- Advanced features (v2)

---

## 🎯 V2 Features (Future)

### **Advanced Analytics**

- Machine learning play prediction
- Computer vision film analysis
- Automatic tendency detection
- Opponent scouting automation

### **Team Features**

- Multi-coach collaboration
- Player-facing confidence scores
- Parent engagement dashboard
- Alumni network

### **Integration**

- Hudl video sync
- MaxPreps schedule import
- Zoom/Teams practice recording
- Wearables data (GPS, heart rate)

**Once we have 3-6 months of data:**

1. **Machine Learning** 🤖
   - Train models on thousands of executions
   - Predict opponent defensive calls
   - "They're about to blitz" detector
   - Auto-generate optimal play sequences

2. **Video Integration** 📹
   - Link executions to game film
   - "Show me all Y-Sail clips"
   - AI-powered film breakdown
   - Automatic highlight reels

3. **Multi-Team Analytics** 📊
   - Compare your offense to others (anonymized)
   - "Your Red Zone efficiency: Top 15%"
   - Industry trends & best practices
   - Conference-wide statistics

4. **Recruit Scouting** 🎯
   - Track recruit visit plays
   - "This play impresses recruits"
   - Recruiting analytics dashboard
   - Visit success correlation

5. **Multiplayer Coaching** 👥
   - Position coach accounts
   - Collaborative game planning
   - Real-time play calling (headset integration)
   - Coach-to-coach chat

---

## 📝 Documentation Plan

### **Developer Docs**

- [ ] Architecture decision records (ADRs)
- [ ] API documentation (TypeScript typedocs)
- [ ] Database schema diagrams
- [ ] Testing strategy guide

### **Coach Docs**

- [ ] Quick start guide
- [ ] Video tutorials (5-10 min each)
- [ ] FAQ page
- [ ] Troubleshooting guide

### **Release Notes**

- [ ] CHANGELOG.md updates
- [ ] Migration guides
- [ ] Breaking changes log
- [ ] Feature announcements

---

## 🛠️ Development Workflow

### **Git Strategy**

- Main branch: `main` (production)
- Development: `develop` (staging)
- Features: `feature/phase-X-description`
- Hotfixes: `hotfix/description`

### **Release Cadence**

- Stage 1-3: Weekly releases (Fridays)
- Stage 4: Daily deployments
- Post-launch: 2x per week

### **Testing Requirements**

- Unit tests: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: User workflows
- Manual QA: Every release

### **Code Review**

- All PRs require review
- Automated checks (lint, type, test)
- Performance benchmarks
- Accessibility audit

---

## 📞 Support & Communication

### **Weekly Sync**

- Monday: Sprint planning
- Wednesday: Mid-week check-in
- Friday: Demo & retrospective

### **Async Communication**

- GitHub Issues: Bug tracking
- GitHub Discussions: Feature requests
- Slack/Discord: Daily updates
- Email: Coach feedback

---

## 🎉 Conclusion

This roadmap takes you from **"clean data in the playbook"** to **"world-class analytics in BoxCall"** over 4-5 months.

**Key Milestones:**

- ✅ **Nov 15:** Playbook data cleaned & linked
- ✅ **Dec 15:** Execution tracking live
- ✅ **Jan 15:** Analytics engine running
- ✅ **Feb 15:** BoxCall app launched

**Remember:**

> "Start with really clean and tight data from the playbook. Then the BoxCall page is the feature app to start getting confidence and analytics."

**Let's nail this! 🏈🚀**

---

**Document Version:** 1.0  
**Created:** October 17, 2025  
**Status:** ✅ Ready to Execute  
**Next Action:** Begin Phase 1 - Formation-Play Linking System
