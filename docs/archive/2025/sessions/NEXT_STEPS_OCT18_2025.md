# 🚀 Next Steps - October 18, 2025

**Current Status:** ✅ Stage 1 Complete (4 phases shipped in 3h 40min!)  
**Ready For:** Stage 2 - Playbook Planning Features

---

## 🎯 **Immediate Next Step: Phase 4 - Practice Script Builder**

### **Overview**

Build the interface and workflow for coaches to create practice scripts from selected plays.

### **Time Estimate:** 2-3 days (16-24 hours)

### **User Story**

> "As a coach, after selecting 5-10 plays, I want to quickly build a practice script with rep counts and time estimates, so I can hand it to my assistant coaches and execute it during practice."

---

## 📋 **Phase 4 Breakdown**

### **Task 1: Practice Script Creation Modal** (4-6 hours)

**Goal:** Build the UI for creating a new practice script

**Components to Build:**

1. **PracticeScriptBuilderModal.tsx** (main modal component)
   - Modal header with title input
   - Script type selector (Install, Team, Red Zone, 2-Minute, Custom)
   - Selected plays list (read-only preview)
   - Form fields:
     - Script name (required)
     - Script type (required)
     - Target date (optional)
     - Total time estimate (auto-calculated)
     - Notes (textarea)

2. **ScriptTemplateSelector.tsx** (template picker)
   - Grid of template cards
   - Templates: Install, Team, Red Zone, 2-Minute, Custom
   - Each template has icon, name, description
   - Clicking template auto-fills default values

**File Structure:**

```
src/components/practice-script/
  ├── PracticeScriptBuilderModal/
  │   ├── PracticeScriptBuilderModal.tsx
  │   ├── ScriptTemplateSelector.tsx
  │   ├── PlayListPreview.tsx
  │   └── index.ts
```

**Success Criteria:**

- [ ] Modal opens when clicking "Practice" bulk action
- [ ] Shows count of selected plays
- [ ] Template selection works
- [ ] Form validation (name required)
- [ ] Cancel/Create buttons functional

---

### **Task 2: Play Configuration Interface** (4-6 hours)

**Goal:** Allow coaches to configure each play in the script

**Components to Build:**

1. **PlayConfigRow.tsx** (individual play config)
   - Play name display
   - Rep count input (number, default: 5)
   - Time per rep input (seconds, default: 30)
   - Total time display (auto-calculated)
   - Move up/down buttons
   - Remove from script button

2. **DraggablePlayList.tsx** (reorderable list)
   - Use react-beautiful-dnd (already installed?)
   - Drag handle icon
   - Visual feedback while dragging
   - Auto-save order on drop

**Features:**

- Reps input (stepper: 1-20, default: 5)
- Time input (seconds: 15-300, default: 30)
- Total time = reps × time per rep
- Script total time = sum of all plays

**Success Criteria:**

- [ ] Each play shows name, formation, type
- [ ] Can adjust reps and time
- [ ] Can reorder plays via drag-and-drop
- [ ] Can remove plays from script
- [ ] Total time updates automatically

---

### **Task 3: Script Persistence & Integration** (4-6 hours)

**Goal:** Wire up to existing PracticeScriptService and database

**Tasks:**

1. **Service Integration**
   - Review existing `PracticeScriptService.ts`
   - Add any missing methods (likely already complete)
   - Wire modal to service methods
   - Handle success/error states

2. **Data Flow**

   ```typescript
   // PlaybookPage bulk action
   handleBulkAction("practice") {
     dispatch({ type: "OPEN_PRACTICE_BUILDER", playIds: selectedPlayIds })
   }

   // PracticeScriptBuilderModal
   handleCreate(scriptData) {
     await PracticeScriptService.createScript({
       name: scriptData.name,
       type: scriptData.type,
       playIds: selectedPlayIds,
       playConfigs: playConfigMap, // { playId: { reps, time } }
       totalTime: calculatedTotal,
     })
   }
   ```

3. **Database Schema Check**
   - Verify `practice_scripts` table has needed columns
   - Check `practice_script_plays` junction table
   - Ensure rep count and time fields exist

**Success Criteria:**

- [ ] Script saves to database
- [ ] Script appears in Practice Scripts view
- [ ] Play order persisted correctly
- [ ] Rep/time config saved per play
- [ ] Success toast shown
- [ ] Selection cleared after create
- [ ] Modal closes

---

### **Task 4: Polish & Testing** (4-6 hours)

**Goal:** Make it production-ready

**Polish Items:**

1. **Loading States**
   - Show spinner while creating script
   - Disable form during save
   - Show progress if slow

2. **Error Handling**
   - Network errors
   - Validation errors
   - Duplicate script name
   - User-friendly error messages

3. **Empty States**
   - "No plays selected" state
   - "Select at least 3 plays" validation
   - Template preview images

4. **Animations**
   - Modal slide-up animation
   - Drag-and-drop smooth transitions
   - Success celebration (confetti?)

5. **Mobile Optimization**
   - Modal fits mobile screen
   - Touch-friendly drag handles
   - Keyboard accessible

**Testing Checklist:**

- [ ] Create script with 3 plays
- [ ] Create script with 20 plays
- [ ] Test all templates (Install, Team, etc.)
- [ ] Drag-and-drop reordering works
- [ ] Remove play from script works
- [ ] Adjust reps/time works
- [ ] Total time calculates correctly
- [ ] Cancel button discards changes
- [ ] Create button saves script
- [ ] Toast confirmation shows
- [ ] Script appears in Practice Scripts page
- [ ] Mobile view works
- [ ] Keyboard navigation works

---

## 🎨 **Design Mockup (Mental Model)**

```
┌─────────────────────────────────────────┐
│  Create Practice Script           [×]   │
├─────────────────────────────────────────┤
│                                         │
│  📝 Script Name: ___________________    │
│  📂 Type: [Install ▼]                   │
│  📅 Date: [Oct 25, 2025]                │
│                                         │
│  ── Template (Optional) ──              │
│  [Install] [Team] [Red Zone] [Custom]  │
│                                         │
│  ── Plays (5 selected) ──               │
│  ┌─────────────────────────────────┐   │
│  │ ☰ Trips Rt Near Power Read      │   │
│  │   Reps: [5] Time: [30s] = 2.5m  │   │
│  ├─────────────────────────────────┤   │
│  │ ☰ Twins Lt Far Cross Rt         │   │
│  │   Reps: [5] Time: [30s] = 2.5m  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Total Time: 12.5 minutes               │
│                                         │
│  [Cancel]            [Create Script]    │
└─────────────────────────────────────────┘
```

---

## 📊 **Success Metrics**

**User Flow Time:**

- Select plays: 30 seconds
- Open modal: 1 click
- Configure script: 2 minutes
- Save script: 1 click
- **Total: <3 minutes** from selection to executable script

**Technical Metrics:**

- Modal load time: <300ms
- Save operation: <500ms
- Zero console errors
- Mobile-responsive
- Accessibility score: 95+

---

## 🔄 **After Phase 4**

### **Phase 5: Game Plan Builder** (Similar pattern)

- Select plays
- Assign to situations (1st & 10, Red Zone, etc.)
- Set priorities
- Generate coach cards

### **Phase 6: Script/Plan Execution Tracking**

- Mark plays as "executed"
- Track success/failure
- Update confidence scores
- Generate reports

---

## 💡 **Questions to Answer Before Starting**

1. **Does PracticeScriptService exist?** (Check `src/services/`)
2. **Database schema ready?** (Check `database/schema.sql`)
3. **Do we have drag-and-drop library?** (Check package.json for react-beautiful-dnd)
4. **Template data source?** (Hard-coded or database table?)
5. **Default rep/time values?** (User preference or system default?)

---

## ✅ **Ready to Start!**

**Estimated Total Time:** 16-24 hours (2-3 days)  
**First Step:** Build PracticeScriptBuilderModal.tsx skeleton  
**Expected Completion:** October 21-22, 2025

---

**Let's build something coaches will love!** 🏈
