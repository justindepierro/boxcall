# PlayerControls.tsx Refactoring Plan

## Current State
- File: 1,367 lines
- Contains: Component UI, state management, hooks, handler functions
- Target: Reduce to ~450-500 lines

## What to Replace

### 1. State Management (lines 33-85)
**CURRENT** (inline state):
```typescript
const [isFormationDropdownOpen, setIsFormationDropdownOpen] = React.useState(false);
const [isDefenseDropdownOpen, setIsDefenseDropdownOpen] = React.useState(false);
const [isCoverageDropdownOpen, setIsCoverageDropdownOpen] = React.useState(false);
const dropdownRef = React.useRef<HTMLDivElement>(null);
const defenseDropdownRef = React.useRef<HTMLDivElement>(null);
const coverageDropdownRef = React.useRef<HTMLDivElement>(null);
```

**REPLACE WITH** (`useFormationDropdowns` hook):
```typescript
const {
  isFormationDropdownOpen,
  setIsFormationDropdownOpen,
  isDefenseDropdownOpen,
  setIsDefenseDropdownOpen,
  isCoverageDropdownOpen,
  setIsCoverageDropdownOpen,
  dropdownRef,
  defenseDropdownRef,
  coverageDropdownRef,
} = useFormationDropdowns();
```

**CURRENT** (inline alignment state):
```typescript
const [internalAlignment, setInternalAlignment] = React.useState<"left" | "middle" | "right">("middle");
const selectedAlignment = externalAlignment || internalAlignment;
const prevExternalAlignment = React.useRef<"left" | "middle" | "right" | undefined>(externalAlignment);
```

**REPLACE WITH** (`useAlignmentState` hook):
```typescript
const { selectedAlignment, setInternalAlignment } = useAlignmentState(externalAlignment);
```

**CURRENT** (inline formation analysis):
```typescript
const [formationAnalysis, setFormationAnalysis] = React.useState<FormationAnalysis | null>(null);

React.useEffect(() => {
  if (players.length > 0 && app) {
    try {
      const analysis = analyzeFormation(players, selectedAlignment);
      setFormationAnalysis(analysis);
      // ... logging code ...
    } catch (error) {
      console.error("❌ Formation analysis failed:", error);
      setFormationAnalysis(null);
    }
  } else {
    setFormationAnalysis(null);
  }
}, [players, selectedAlignment, app]);
```

**REPLACE WITH** (`useFormationAnalysis` hook):
```typescript
const formationAnalysis = useFormationAnalysis(players, selectedAlignment, app);
```

### 2. Handler Functions to Remove

#### Lines 240-287: `handleAddOffenseFormation`
- Delete entire function
- Update all calls to: `handleAddOffenseFormation()` → direct inline logic

#### Lines 288-306: `executeFormation`
- Delete entire function  
- Replace calls with: `executeOffenseFormation(formationType, selectedAlignment, app, addPlayer)`

#### Lines 308-327: `getCenterXForAlignment`
- Delete entire function
- Already imported from `./PlayerControls/utils/formationUtils`

#### Lines 329-374: `getReceiverPositions`
- Delete entire function
- Already in formationUtils

#### Lines 376-459: `get3x1ReceiverPositions`
- Delete entire function
- Already in formationUtils

#### Lines 461-509: `handleAddDefenseFormation`
- Delete entire function
- Update all calls to inline logic

#### Lines 511-540: `detectOffensiveAlignment`
- Delete entire function
- Already imported from handlers

#### Lines 542-555: `executeDefenseFormation`
- Delete entire function
- Already imported from handlers

#### Lines 557-589: `executeNickel425`
- Delete entire function
- Already in defenseFormationHandlers

#### Lines 591-854: `handleAlignmentChange`
- Delete entire function (THIS IS HUGE!)
- Replace with: `handleAlignmentChange(newAlignment, app, players, setInternalAlignment)`

#### Lines 856-940: `executeSpread3x1Right`
- Delete entire function
- Already in offenseFormationHandlers

#### Lines 942-1026: `executeSpread3x1Left`
- Delete entire function
- Already in offenseFormationHandlers

### 3. Effect Hooks to Replace/Remove

#### Lines 93-104: Click outside effect
**CURRENT**:
```typescript
React.useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsFormationDropdownOpen(false);
    }
    if (defenseDropdownRef.current && !defenseDropdownRef.current.contains(event.target as Node)) {
      setIsDefenseDropdownOpen(false);
    }
    if (coverageDropdownRef.current && !coverageDropdownRef.current.contains(event.target as Node)) {
      setIsCoverageDropdownOpen(false);
    }
  };

  if (isFormationDropdownOpen || isDefenseDropdownOpen || isCoverageDropdownOpen) {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }
}, [isFormationDropdownOpen, isDefenseDropdownOpen, isCoverageDropdownOpen]);
```

**REPLACE WITH** (`useClickOutside` hook):
```typescript
useClickOutside(
  [
    { ref: dropdownRef, onClose: () => setIsFormationDropdownOpen(false) },
    { ref: defenseDropdownRef, onClose: () => setIsDefenseDropdownOpen(false) },
    { ref: coverageDropdownRef, onClose: () => setIsCoverageDropdownOpen(false) },
  ]
);
```

#### Lines 165-188: Auto-adjust alignment on external change
**CURRENT**:
```typescript
React.useEffect(() => {
  if (
    externalAlignment &&
    prevExternalAlignment.current &&
    externalAlignment !== prevExternalAlignment.current
  ) {
    if (app && players.length > 0) {
      console.log(
        `🎯 External alignment changed from ${prevExternalAlignment.current} → ${externalAlignment}, adjusting formation...`
      );
      handleAlignmentChange(externalAlignment);
    }
  }

  prevExternalAlignment.current = externalAlignment;
}, [externalAlignment, app, players, handleAlignmentChange]);
```

**REPLACE WITH**: Integrate into `useAlignmentState` hook OR keep as-is with updated function call

### 4. Helper Functions to Keep (Inline)

These are simple UI helpers that don't need extraction:

- `showConfirmModal` (lines ~218-223): Keep inline
- `offensivePlayerCount` computation: Keep inline
- `defensivePlayerCount` computation: Keep inline

## Step-by-Step Refactoring Process

### Step 1: Replace State Management
1. Replace dropdown state with `useFormationDropdowns()`
2. Replace alignment state with `useAlignmentState(externalAlignment)`
3. Replace formation analysis with `useFormationAnalysis(players, selectedAlignment, app)`
4. Replace click outside effect with `useClickOutside(...)`

### Step 2: Replace Handler Functions (One at a time)
1. Delete `getCenterXForAlignment` (lines 308-327)
2. Delete `getReceiverPositions` (lines 329-374)
3. Delete `get3x1ReceiverPositions` (lines 376-459)
4. Delete `detectOffensiveAlignment` (lines 511-540)
5. Delete `executeNickel425` (lines 557-589)
6. Delete `executeDefenseFormation` (lines 542-555)
7. Delete `executeSpread3x1Right` (lines 856-940)
8. Delete `executeSpread3x1Left` (lines 942-1026)
9. Delete `handleAlignmentChange` (lines 591-854) - **BIGGEST DELETION**
10. Delete `executeFormation` (lines 288-306)

### Step 3: Update Function Calls
1. Update `handleAddOffenseFormation` to call `executeOffenseFormation`
2. Update `handleAddDefenseFormation` to call `executeDefenseFormation` and `detectOffensiveAlignment`
3. Update alignment change button to call `handleAlignmentChange` from handlers
4. Update auto-adjust effect to call handler

### Step 4: Remove Confirmation Logic Wrappers
- Keep `showConfirmModal` helper
- Simplify `handleAddOffenseFormation` and `handleAddDefenseFormation` to just call handlers with confirmation

## Expected Line Reduction

**Before**: 1,367 lines

**After removal**:
- State hooks: -50 lines (replaced with custom hooks)
- `getCenterXForAlignment`: -20 lines
- `getReceiverPositions`: -48 lines
- `get3x1ReceiverPositions`: -84 lines
- `handleAddOffenseFormation`: -48 lines (simplified)
- `detectOffensiveAlignment`: -30 lines
- `executeDefenseFormation`: -14 lines
- `executeNickel425`: -33 lines
- `handleAlignmentChange`: -264 lines (**HUGE**)
- `executeSpread3x1Right`: -85 lines
- `executeSpread3x1Left`: -85 lines
- `executeFormation`: -19 lines
- Click outside effect: -20 lines

**Total Removed**: ~800 lines

**After**: ~550-600 lines (component UI, confirmation dialogs, JSX render)

## Risk Assessment

**MEDIUM RISK** - Large refactor with many dependencies

**Mitigation**:
1. ✅ All handlers already tested and validated (0 errors)
2. ✅ All hooks already tested and validated (0 errors)
3. Do one step at a time
4. Test after each step
5. Git commit after each successful step
6. Manual testing of all features before final push

## Testing Checklist

After refactoring:
- [ ] Type check passes (0 errors)
- [ ] ESLint passes
- [ ] Add offense formation (all 3 types)
- [ ] Add defense formation
- [ ] Change alignment (left, middle, right)
- [ ] Auto coverage adjustment
- [ ] Formation analysis display
- [ ] Click outside dropdowns
- [ ] Confirmation dialogs
- [ ] Remove players

---

**Next Action**: Execute Step 1 (Replace State Management)
