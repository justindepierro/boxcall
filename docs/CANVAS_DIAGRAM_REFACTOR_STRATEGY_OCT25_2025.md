# Canvas & Diagram Service: Strategic Refactor Plan 🎯

**Created:** October 25, 2025  
**Context:** Major refactor needed to protect core business logic and improve maintainability  
**Priority:** High - Foundation for future canvas features

---

## 🔍 Current Situation Analysis

### Critical Files to Review

**Canvas/Diagram Core:**

- `src/components/playbook/DiagramEditor/` - Main diagram editing interface
- `src/services/diagramService.ts` - Diagram CRUD operations
- `src/components/playbook/FormationBuilderModal/` - Formation canvas
- `src/components/playbook/FormationBuilderCanvas/` - Canvas drawing logic
- `src/hooks/useDiagramInteractions.ts` - Canvas interaction logic

**What We Know:**

- ✅ Already using Fabric.js for canvas rendering
- ✅ Supports drag-drop, routes, formations
- ✅ Exports to CSV, PDF
- ❓ **Unknown:** Current performance bottlenecks
- ❓ **Unknown:** Business logic separation (view vs data)
- ❓ **Unknown:** State management patterns

---

## 🚨 Critical Questions to Answer (Before Refactor)

### 1. Business Logic Protection

**Question:** What core logic must be preserved?

**Need to identify:**

- [ ] Formation validation rules (11 players, position constraints)
- [ ] Route drawing algorithms (snap-to-grid, collision detection)
- [ ] Play diagram generation (formations → diagrams)
- [ ] Export formats (CSV structure, PDF layout)
- [ ] Personnel grouping logic (11, 12, 21, 22 personnel)
- [ ] Play naming conventions
- [ ] Wristband number assignment logic

**Action:** Read through these files and document the **"business rules"** that must never break.

---

### 2. Performance Bottlenecks

**Question:** Where is the canvas slow?

**Potential issues to check:**

- [ ] **Diagram save time** - How long to save a complex diagram?
- [ ] **Thumbnail generation** - Blocking main thread?
- [ ] **Canvas drag performance** - Frame rate during drag?
- [ ] **Route drawing** - Laggy when drawing complex routes?
- [ ] **Re-render frequency** - Too many React re-renders?
- [ ] **Data serialization** - Converting canvas → database format slow?

**Action:** Profile canvas operations with Chrome DevTools Performance tab.

---

### 3. State Management Patterns

**Question:** How is canvas state currently managed?

**Need to understand:**

- [ ] Is state in React (useState) or canvas library (Fabric.js)?
- [ ] How do changes sync between React state and canvas?
- [ ] Are there race conditions (async updates)?
- [ ] Is undo/redo implemented? How?
- [ ] How are unsaved changes tracked?

**Action:** Trace data flow from user interaction → canvas → server.

---

### 4. Code Architecture

**Question:** Is logic separated properly?

**Check for:**

- [ ] **View logic mixed with business logic?** (Bad: `if (player.position === 'QB') renderCircle()`)
- [ ] **Hard-coded values?** (Bad: `const FIELD_WIDTH = 1600`)
- [ ] **Tight coupling?** (Bad: DiagramEditor directly calls Supabase)
- [ ] **Missing abstractions?** (Bad: Raw Fabric.js calls everywhere)
- [ ] **Inconsistent patterns?** (Mix of class/functional components)

**Action:** Map out current architecture with dependency diagram.

---

## 🎯 Recommended Refactor Strategy

### Phase 1: Discovery & Documentation (2-3 hours) 🔍

**Goal:** Understand what we have before changing anything.

**Tasks:**

1. **Read all canvas files** - Understand current implementation
2. **Document business rules** - List all validation/calculation logic
3. **Profile performance** - Measure actual bottlenecks (not guesses)
4. **Map data flow** - Diagram how data moves through system
5. **Identify pain points** - What's hardest to maintain/extend?

**Deliverables:**

- `CANVAS_BUSINESS_RULES.md` - All logic that must be preserved
- `CANVAS_ARCHITECTURE.md` - Current structure diagram
- `CANVAS_PERFORMANCE_AUDIT.md` - Actual measurements
- `CANVAS_REFACTOR_PLAN.md` - Detailed refactor roadmap

---

### Phase 2: Smart Extraction (3-4 hours) 🏗️

**Goal:** Separate concerns without breaking functionality.

**Pattern: Extract business logic first**

```tsx
// ❌ Before (mixed concerns)
const DiagramEditor = () => {
  const handlePlayerMove = (player: Player, x: number, y: number) => {
    // Business logic mixed with view logic
    if (player.position === "QB" && x < 100) {
      showError("QB must be behind line");
      return;
    }

    // Fabric.js view update
    const canvasObject = canvas.getObjects().find((o) => o.id === player.id);
    canvasObject.set({ left: x, top: y });
    canvas.renderAll();

    // State update
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, x, y } : p))
    );
  };
};
```

```tsx
// ✅ After (separated concerns)

// 1. Pure business logic (no UI, no canvas, no React)
export class FormationValidator {
  static validatePlayerPosition(
    player: Player,
    x: number,
    y: number
  ): ValidationResult {
    if (player.position === "QB" && x < FORMATION_RULES.QB_MIN_X) {
      return { valid: false, error: "QB must be behind line of scrimmage" };
    }
    return { valid: true };
  }

  static validateFormationCompleteness(players: Player[]): ValidationResult {
    if (players.length !== 11) {
      return {
        valid: false,
        error: `Formation must have 11 players (has ${players.length})`,
      };
    }
    // ... more rules ...
    return { valid: true };
  }
}

// 2. Canvas abstraction (hides Fabric.js complexity)
export class DiagramCanvas {
  private canvas: fabric.Canvas;

  updatePlayerPosition(playerId: string, x: number, y: number): void {
    const obj = this.canvas.getObjects().find((o) => o.id === playerId);
    if (!obj) return;

    obj.set({ left: x, top: y });
    this.canvas.renderAll();
  }

  getPlayerPosition(playerId: string): { x: number; y: number } | null {
    const obj = this.canvas.getObjects().find((o) => o.id === playerId);
    return obj ? { x: obj.left, y: obj.top } : null;
  }
}

// 3. React component (orchestrates, no business logic)
const DiagramEditor = () => {
  const canvasRef = useRef<DiagramCanvas>(null);

  const handlePlayerMove = (player: Player, x: number, y: number) => {
    // 1. Validate (pure function)
    const validation = FormationValidator.validatePlayerPosition(player, x, y);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // 2. Update view (canvas abstraction)
    canvasRef.current?.updatePlayerPosition(player.id, x, y);

    // 3. Update React state
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, x, y } : p))
    );

    // 4. Sync with server (background)
    debouncedSave();
  };
};
```

**Benefits:**

- ✅ Business rules testable in isolation (no React, no canvas needed)
- ✅ Canvas logic reusable (can swap Fabric.js for different library)
- ✅ React component simple (orchestration only)
- ✅ Easy to add features (modify one layer at a time)

---

### Phase 3: Performance Optimization (2-3 hours) ⚡

**Goal:** Apply Facebook-fast patterns to canvas operations.

**Optimizations to implement:**

1. **Optimistic Diagram Saves** (Like we just did for Game Plans)

   ```tsx
   const handleSaveDiagram = async (diagram: Diagram) => {
     // 1. Instant feedback
     toast.success("Diagram saved!");

     // 2. Optimistic UI update
     setDiagrams((prev) =>
       prev.map((d) => (d.id === diagram.id ? diagram : d))
     );

     // 3. Background sync
     await DiagramService.saveDiagram(diagram);
   };
   ```

2. **Throttle Canvas Updates** (60fps max)

   ```tsx
   const throttledUpdate = useThrottle((x, y) => {
     canvas.updatePlayerPosition(playerId, x, y);
   }, 16); // 16ms = 60fps
   ```

3. **Batch Position Updates**

   ```tsx
   // Instead of updating canvas on every pixel move:
   const handleDragEnd = (positions: PlayerPosition[]) => {
     // Single batch update after drag completes
     canvas.batchUpdatePositions(positions);
   };
   ```

4. **Background Thumbnail Worker**
   ```tsx
   // Offload thumbnail generation to Web Worker
   const worker = new Worker("./thumbnailWorker.ts");
   worker.postMessage({ canvas: canvasData });
   worker.onmessage = (e) => {
     setThumbnail(e.data.thumbnail);
   };
   ```

---

## 🛡️ Business Logic Protection Checklist

**Before touching ANY code, document these:**

### Formation Rules

- [ ] What makes a formation "valid"? (11 players, positions, etc.)
- [ ] What are the position constraints? (QB behind line, WR split out, etc.)
- [ ] How are formations mirrored? (Left → Right conversion logic)
- [ ] What are personnel groupings? (11, 12, 21, 22 definitions)

### Route Drawing Rules

- [ ] How are routes validated? (Must start from player, end in bounds, etc.)
- [ ] What route types exist? (Slant, Post, Go, etc.)
- [ ] How are routes saved? (Data structure, database schema)
- [ ] How are routes rendered? (Line style, arrow heads, etc.)

### Play Diagram Rules

- [ ] How are plays linked to formations?
- [ ] How are plays linked to personnel?
- [ ] How are plays organized? (Categories, tags, etc.)
- [ ] What metadata is required? (Name, description, wristband, etc.)

### Export Rules

- [ ] What must CSV format contain? (Field order, required columns)
- [ ] What must PDF format look like? (Layout, spacing, fonts)
- [ ] How are thumbnails generated? (Size, format, quality)
- [ ] What data is included in exports? (All fields or subset?)

---

## 🧪 Testing Strategy

**Critical:** Canvas changes can break plays. Need robust testing.

### Unit Tests (Pure Functions)

```tsx
describe("FormationValidator", () => {
  it("rejects formations with < 11 players", () => {
    const result = FormationValidator.validateFormationCompleteness(
      Array(10).fill({ position: "WR" })
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("11 players");
  });

  it("rejects QB in front of line of scrimmage", () => {
    const result = FormationValidator.validatePlayerPosition(
      { position: "QB" },
      50, // x < 100 (invalid)
      100 // y
    );
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests (Canvas Operations)

```tsx
describe("DiagramCanvas", () => {
  let canvas: DiagramCanvas;

  beforeEach(() => {
    canvas = new DiagramCanvas(document.createElement("canvas"));
  });

  it("updates player position", () => {
    canvas.addPlayer({ id: "p1", position: "QB", x: 100, y: 100 });
    canvas.updatePlayerPosition("p1", 150, 150);

    const pos = canvas.getPlayerPosition("p1");
    expect(pos).toEqual({ x: 150, y: 150 });
  });
});
```

### E2E Tests (User Workflows)

```tsx
test("user can create and save a formation", async () => {
  // 1. Navigate to formation builder
  await page.goto("/playbook/formations/new");

  // 2. Add 11 players
  for (let i = 0; i < 11; i++) {
    await page.click('[data-testid="add-player"]');
  }

  // 3. Drag players into formation
  await page.dragAndDrop('[data-player="QB"]', { x: 100, y: 100 });

  // 4. Save formation
  await page.click('[data-testid="save-formation"]');

  // 5. Verify success
  await expect(page.locator(".toast")).toContainText("Formation saved");
});
```

---

## 🚀 Implementation Timeline

### Today's Session Plan

**Morning (Now): Discovery Phase (2-3 hours)**

1. Read through all canvas files
2. Document business rules
3. Profile performance with DevTools
4. Create architecture diagram

**Afternoon: Smart Extraction (3-4 hours)**

1. Extract FormationValidator class
2. Extract DiagramCanvas abstraction
3. Refactor DiagramEditor to use new abstractions
4. Write unit tests for validators

**Evening (Optional): Performance Optimization**

1. Add optimistic diagram saves
2. Throttle canvas updates
3. Batch position updates

**Total Time:** 6-8 hours for complete refactor

---

## 📋 Pre-Refactor Checklist

Before writing ANY new code:

- [ ] Read all canvas/diagram files
- [ ] Document every business rule
- [ ] List all validation logic
- [ ] Profile actual performance (not guesses)
- [ ] Map data flow diagram
- [ ] Identify tight coupling points
- [ ] Check for hard-coded values
- [ ] Review error handling patterns
- [ ] List all export formats
- [ ] Document current state management
- [ ] Create backup branch (`git checkout -b canvas-refactor-backup`)
- [ ] Write failing tests for existing behavior (regression protection)

---

## 🎯 Success Criteria

**Refactor is successful when:**

- ✅ All existing features still work (no regressions)
- ✅ Business logic is testable in isolation
- ✅ Canvas operations are 2x smoother (60fps)
- ✅ Diagram saves are 5x faster perceived (<100ms)
- ✅ Code is easier to understand and modify
- ✅ New features can be added without touching core logic
- ✅ Unit test coverage > 80%

---

## 💡 Key Principles

### 1. Separation of Concerns

**Business Logic** (pure functions)

- No React
- No canvas
- No database
- Just rules and calculations
- 100% testable

**Canvas Abstraction** (thin wrapper)

- Hides Fabric.js complexity
- Exposes simple API
- No business logic
- Easy to swap libraries

**React Component** (orchestration)

- Calls validators
- Updates canvas
- Manages state
- Handles errors

### 2. Test-Driven Refactor

1. Write test for existing behavior
2. Verify test fails (proves it's testing something)
3. Refactor code
4. Verify test passes (proves refactor preserved behavior)
5. Repeat

### 3. Incremental Changes

- Change one file at a time
- Test after each change
- Commit frequently
- Easy to rollback if needed

---

## 🚨 Red Flags to Watch For

**Stop and reconsider if you see:**

- ❌ **"Let's rewrite everything from scratch"** - Dangerous, lose business knowledge
- ❌ **"We don't need tests"** - Recipe for disaster
- ❌ **"Just make it work, we'll clean up later"** - Later never comes
- ❌ **"This is too complicated to understand"** - Need more discovery time
- ❌ **Changing multiple files simultaneously** - Too risky
- ❌ **No backup/rollback plan** - Always have escape hatch

---

## 📚 Resources to Review Before Starting

**Files to read (in order):**

1. `src/services/diagramService.ts` - Understand data layer
2. `src/components/playbook/DiagramEditor/` - Main UI component
3. `src/components/playbook/FormationBuilderCanvas/` - Canvas rendering
4. `src/hooks/useDiagramInteractions.ts` - Interaction logic
5. Database schema for `plays`, `formations`, `diagrams` tables

**Questions to answer:**

- How is canvas state synchronized with React state?
- Where are validation rules currently implemented?
- How are diagrams saved to database?
- What's the slowest operation? (Profile it!)
- Are there any race conditions?

---

## 🎓 Next Steps

**Ready to start?**

1. **First:** Run discovery phase (2-3 hours)
   - Read all files
   - Document business rules
   - Profile performance
   - Create architecture diagram

2. **Then:** Review findings together
   - Share what you learned
   - Identify biggest risks
   - Decide on refactor approach
   - Create detailed plan

3. **Finally:** Execute refactor (one file at a time)
   - Write tests first
   - Refactor incrementally
   - Test continuously
   - Commit frequently

**Want me to help with the discovery phase?** I can:

- Read through canvas files with you
- Help identify business rules
- Review performance profiles
- Create architecture diagrams
- Write initial test cases

Let me know when you're ready to dig in! 🚀
