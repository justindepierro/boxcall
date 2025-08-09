# ⚡ **PLAYBUILDER ENHANCEMENT ROADMAP**

> _Making play creation lightning-fast for busy coaches_

> Consolidated master product & technical roadmap now lives in `MASTER_ROADMAP.md` (this file remains a focused tactical module for PlayBuilder-specific acceleration work). Keep high-level strategic edits in the master document.

**Target**: Bus rides, between classes, quick note-taking  
**Philosophy**: 30 seconds from idea to saved play  
**Status**: Phase A in progress – core normalization + Quick Entry enhancements shipped ✅

---

## 🎯 **THE VISION**

**Coach Scenario**: Sitting on team bus, sees opposing team's formation on film

- Opens PlayBuilder on phone
- Types: `"Power O, I-Form, Run, 21"`
- Form auto-populates 80% of fields
- Adds quick note: "Use vs 6-1 front"
- Saves in under 30 seconds
- **DONE** ✅

---

## 🏈 **12 ENHANCEMENT TARGETS** (Tracking Progress)

### **⚡ SPEED & EFFICIENCY**

1. **Quick Entry Mode** - Parse `"Power O | I-Form | Run | 21 Personnel"` instantly (✅ base + normalization & flexible comma/pipe parsing)
2. **Smart Auto-Complete 2.0** - Fuzzy matching: "pwr" → "Power", "dcue" → "Deuce"
3. **Mobile-First Compact** - Swipe sections, one-handed operation

### **🔤 DATA NORMALIZATION**

4. **MonoSpace + Smart Text** - `DEUCE = Deuce = deuce = DeuCE` (✅ implemented across inputs + defensive normalization on save & Quick Entry)
5. **Dynamic Custom Fields** - Drag-drop field builder for team-specific needs

### **🧠 INTELLIGENT FEATURES**

6. **Context-Aware Suggestions** - "I-Form" → suggests "21 Personnel", "Power"
7. **Practice Script Integration** - "Add to Practice" creates instant drill entries

### **💨 WORKFLOW OPTIMIZATION**

8. **Keyboard Shortcuts** - `Ctrl+S`, `Ctrl+Enter`, `Tab` navigation
9. **Visual Density Options** - Compact view, list view, quick-scan mode

### **🔧 ADVANCED CUSTOMIZATION**

10. **Team-Specific Forms** - "Gun" instead of "Shotgun", hide irrelevant fields
11. **Template & Clone System** - "Create Similar", pre-built templates
12. **Situation Quick Actions** - "Red Zone Package" auto-fills preferences

---

## 🚀 **IMPLEMENTATION PHASES**

### **🎯 PHASE A: SPEED FOUNDATION (2-3 hours)**

- [x] Smart text normalization with MonoSpace font
- [x] Compact interface redesign (tighter spacing, more data visible) ✅ **CLEANED UP FORM**
- [x] Quick Entry mode parsing engine (pipe OR comma, flexible ordering, defaults)
- [x] Defensive normalization pass on save (PlayBuilderCore)
- [x] Quick Entry normalization (play name, formation, one-word call)
- [x] Formation fuzzy suggestion prototype (basic – shows top matches)
- [x] Duplicate name detection before save
- [x] Inline validation (replace alert popups)
- [ ] Extend fuzzy suggestions to Personnel + Play Name
- [ ] Enhanced fuzzy matching auto-complete (multi-field, recency weighting)

**Impact so far**: Meaningful speed boost; reduced duplicate/case variance. Remaining Phase A items focus on predictive assist + frictionless validation.

### **🎯 PHASE B: SMART FEATURES (2-3 hours)**

- [ ] Dynamic custom fields system
- [ ] Context-aware suggestions engine
- [ ] Keyboard shortcuts implementation
- [ ] Mobile-optimized layout

**Impact**: Coaches can create plays one-handed on mobile

### **🎯 PHASE C: POWER USER TOOLS (2-3 hours)**

- [ ] Template/clone system
- [ ] Practice script integration
- [ ] Situation-based quick actions
- [ ] Team-specific customization panel

**Impact**: Advanced coaches become 10x faster

---

## 💻 **TECHNICAL APPROACH**

### **Text Normalization Engine** (Implemented)

```typescript
// Smart normalization function
const normalizeText = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// DEUCE = Deuce = deuce = DeuCE → "Deuce"
```

### **Quick Entry Parser** (Upgraded)

Supports pipes or commas, normalization, flexible ordering, personnel detection.

```typescript
// Flexible parse: "Power O | I-Form | Run | 21" OR "Power O, I-Form, Run, 21 Personnel"
const parseQuickEntry = (input: string): Partial<Play> => {
  if (!input.trim()) return {};
  const parts = input
    .split(/[|,]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const play: Partial<Play> = {};
  parts.forEach((raw, idx) => {
    const lower = raw.toLowerCase();
    if (idx === 0 && !play.play_name) play.play_name = normalizePlayName(raw);
    else if (idx === 1 && !play.formation)
      play.formation = normalizeFormation(raw);
    else if (idx === 2 && !play.p_type) play.p_type = inferType(lower);
    // Personnel anywhere
    if (/^\d{2}/.test(raw)) play.personnel = raw.substring(0, 2);
    // Type inference if missed
    if (!play.p_type) play.p_type = inferType(lower);
  });
  return play;
};
```

Next improvement: fuzzy-assisted token recognition + real-time preview confidence scoring.

### **MonoSpace Typography**

```css
.playbuilder-input {
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-variant-numeric: tabular-nums;
}
```

---

## 🎯 **SUCCESS METRICS**

**Current State**:

- ⏱️ Play creation: ~2-3 minutes
- 📱 Mobile usability: Difficult
- 🔤 Data consistency: Manual effort

**Target State**:

- ⚡ Play creation: **30 seconds**
- 📱 Mobile usability: **One-handed operation**
- 🔤 Data consistency: **100% automatic**
- 🧠 Smart suggestions: **80% pre-filled**

---

## 🏗️ **IMMEDIATE NEXT STEPS (UPDATED)**

1. Extend fuzzy suggestions (Formation → Personnel + Play Name)
2. Add recency weighting + keyboard navigation for suggestion list
3. Build personnel + formation quick-pick chips (tap-based on mobile)
4. Add Compact Mode toggle (persist in localStorage)
5. Prep Template/Clone scaffolding (capture current play as reusable pattern)
6. Implement play name smart suggestions (recent + pattern-based)
7. Begin keyboard shortcuts (Ctrl+S, Cmd+Enter)

---

**Ready to make coaches love this thing?** 🚀  
**Let's build the fastest play creation tool in football!** ⚡

---

## 📝 **PHASE A TASK BREAKDOWN**

### Task 1: Smart Text Normalization (45 min) – COMPLETE

- [x] Create `normalizeText` utility function
- [x] Apply MonoSpace font to all form inputs
- [x] Update PlayBuilderForm with normalization
- [x] Test with various inputs: "DEUCE", "deuce", "DeuCE"

### Task 2: Compact Interface (60 min) – IN PROGRESS

- [x] Reduce padding/margins by 30% ✅ **CLEANED UP PLAYBUILDERFORM**
- [x] Increase form density (2 columns → 3 where possible) ✅ **BETTER LAYOUT**
- [x] Implement collapsible sections with memory ✅ **CLEAN WHITE SECTIONS**
- [ ] Add "Compact Mode" toggle

### Task 3: Quick Entry Parser (45 min) – COMPLETE

- [x] Build parser for `"Name | Formation | Type | Personnel"`
- [x] Add quick entry input at top of form
- [x] Implement auto-population of fields
- [x] Add helpful placeholder text

### Task 4: Enhanced Auto-Complete (30 min) – PARTIAL

- [x] Prototype fuzzy formation suggestions
- [ ] Generalize fuzzyMatch helper consumption across inputs
- [ ] Add dropdown UI + keyboard (↑/↓ + Enter)
- [ ] Recent selections prioritization
- [ ] Tests: partials ("pwr" → "Power", "dcue" → "Deuce")

---

### ✅ Completed Today (2025-08-09)

| Area         | Change                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Save Layer   | Defensive normalization in PlayBuilderCore before persistence          |
| Quick Entry  | Normalization pass (play_name, formation, one_word) + flexible parsing |
| Fuzzy Assist | Initial formation suggestion prototype implemented                     |
| Validation   | Inline required + duplicate name detection (alerts removed)            |

### 🎯 Next Coding Action

Implement fuzzy suggestion dropdown (formation + personnel) with keyboard navigation & recency weighting; then extend to play name.

**Total: Phase A = 3 hours → Massive speed improvement** ⚡
