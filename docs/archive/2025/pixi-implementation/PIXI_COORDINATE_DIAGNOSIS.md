# Pixi Diagram Editor - Complete System Trace & Diagnosis

**Date:** October 8, 2025  
**Issue:** Cursor doesn't reflect mouse position, cannot place/drag players correctly

---

## 🔍 Complete Hierarchy Analysis

### DOM / Canvas Layer

```
<div className="flex-1 relative overflow-hidden">  ← Full height container
  <canvas ref={canvasRef}                           ← Canvas element
          style="w-full h-full"                     ← CSS: 100% of parent
          touchAction="none" />
</div>
```

**CSS Sizing:**

- Canvas gets CSS size from parent container (e.g., 1200px × 800px)
- Resolution multiplier applied: `devicePixelRatio` (typically 2 on retina)
- Actual canvas buffer: 2400px × 1600px (physical pixels)
- Pixi renders to physical pixels, events come in as CSS pixels

### Pixi Application Layer

```
Application {
  renderer: WebGLRenderer
  stage: Container (ROOT - no transforms)     ← app.stage
  ticker: Ticker
  canvas: HTMLCanvasElement
}
```

### Custom Stage Hierarchy

```
app.stage (Pixi root)
  └── stage (DiagramPixiApp.stage)            ← Camera transforms THIS
      ├── fieldLayer (Container)              ← Empty container
      │   └── FieldLayer (Graphics)           ← Actual field graphics
      ├── routesLayer (Container)             ← Empty (Phase 4)
      ├── playersLayer (Container)            ← Empty container
      │   └── PlayersLayer (Container)        ← Has event listeners
      │       ├── PlayerSprite #1 (Container)
      │       │   ├── SelectionRing (Graphics)
      │       │   ├── Circle (Graphics)
      │       │   └── Text
      │       └── PlayerSprite #2...
      ├── annotationsLayer (Container)        ← Empty (Future)
      └── uiLayer (Container)                 ← Empty (Future)
```

---

## 🎯 Coordinate System Analysis

### Units & Spaces

| Space           | Unit          | Origin                           | Example                                 |
| --------------- | ------------- | -------------------------------- | --------------------------------------- |
| **CSS**         | CSS pixels    | Top-left of canvas               | Mouse at (600, 400)                     |
| **Physical**    | Device pixels | Top-left of canvas               | 2x CSS = (1200, 800)                    |
| **Global**      | Pixi pixels   | Top-left of app.stage            | Same as CSS after Pixi event processing |
| **Stage Local** | Pixi pixels   | Top-left of stage (after Camera) | Depends on camera pan/zoom              |
| **Yards**       | Yards         | Top-left of field (0,0)          | Field is 53.333 × 35 yards              |

### Critical Transform Chain

**Click Event Flow:**

1. Browser: Mouse at CSS position (600px, 400px)
2. Pixi EventSystem: Converts to global space accounting for devicePixelRatio
3. `event.getLocalPosition(container)`: Converts global → container's local space
4. Container's local space: Applies parent transforms (Camera zoom/pan)

**Example with Camera at zoom=1.0, pan=(100, 50):**

```
CSS Click: (600, 400)
  ↓ Pixi processes event
Global: (600, 400) in app.stage space
  ↓ stage.toLocal() or getLocalPosition(stage)
Stage Local: (500, 350) ← subtracts pan offset
  ↓ If stage.scale = 2.0
Stage Local: (250, 175) ← accounts for zoom
  ↓ PlayersLayer.getLocalPosition(this)
PlayersLayer Local: (250, 175) ← no additional transform
  ↓ CoordinateSystem.pixelsToYards()
Yards: (16.67, 11.67) ← divides by pixelsPerYard (15)
```

---

## 🐛 Identified Issues

### Issue #1: Double Container Nesting

**Problem:** `playersLayer` (Container) contains `PlayersLayer` (Container)

**Code:**

```typescript
// In PixiApp constructor
this.playersLayer = new Container();  // Empty wrapper
this.stage.addChild(this.playersLayer);

// In usePixiApp
const playersLayer = new PlayersLayer(...);  // Actual layer with logic
pixiApp.playersLayer.addChild(playersLayer);  // Nested!
```

**Impact:**

- Extra transform level (usually identity, but adds complexity)
- Event target confusion (`this` in PlayersLayer vs parent Container)

**Solution:** Remove wrapper, use PlayersLayer directly

### Issue #2: Camera Centering

**Problem:** Camera centers field, but only after `setViewportSize()` is called

**Code in Camera:**

```typescript
constructor(...) {
  // NO initial centering - waits for setViewportSize
}

setViewportSize(width, height) {
  if (this.targetX === 0 && this.targetY === 0) {
    this.centerOnField();  // Only centers if at origin
  }
}
```

**Impact:**

- Field might not be centered initially
- Depends on timing of `setViewportSize()` call

**Current Flow:**

```
PixiApp constructor → Camera created
  ↓
PixiApp.initializeApp (async) → calls setViewportSize
  ↓ (some delay)
Camera.setViewportSize → calls centerOnField
```

**Issue:** If user clicks before async init completes, field isn't centered

### Issue #3: Event Coordinate Conversion

**Problem:** `getLocalPosition(this)` in PlayersLayer

**Code:**

```typescript
updateDrag(sprite, event) {
  const localPos = event.getLocalPosition(this);  // 'this' = PlayersLayer
  const yardPos = this.coords.pixelsToYards(localPos);
  ...
}
```

**Analysis:**

- `this` = PlayersLayer Container
- PlayersLayer is child of `playersLayer` (wrapper)
- `playersLayer` is child of `stage` (has Camera transform)
- So `getLocalPosition(this)` SHOULD account for Camera

**Verification Needed:** Is Camera transform applied correctly?

### Issue #4: Potential Resolution Mismatch

**Problem:** `autoDensity: true` might not be handling everything

**Code:**

```typescript
await this.app.init({
  resolution: config.resolution || window.devicePixelRatio || 1,
  autoDensity: true,
  ...
});
```

**Potential Issue:**

- Canvas CSS size: 1200px × 800px
- Canvas buffer size: 2400px × 1600px (with devicePixelRatio=2)
- Pixi thinks canvas is 1200×800 logical pixels
- Events come in as CSS pixels
- But rendering happens at 2400×1600

**Pixi should handle this automatically with `autoDensity`, but worth verifying**

---

## 🔧 Proposed Fixes

### Fix #1: Simplify Container Hierarchy

**Before:**

```typescript
// PixiApp
this.playersLayer = new Container();
this.stage.addChild(this.playersLayer);

// usePixiApp
const playersLayer = new PlayersLayer(...);
pixiApp.playersLayer.addChild(playersLayer);
```

**After:**

```typescript
// PixiApp - DON'T create empty containers
// Remove:
// this.playersLayer = new Container();

// usePixiApp
const playersLayer = new PlayersLayer(...);
pixiApp.stage.addChild(playersLayer);  // Add directly to stage
pixiApp.playersLayer = playersLayer;   // Store reference
```

### Fix #2: Immediate Camera Centering

**Before:**

```typescript
constructor(stage, fieldDimensions) {
  this.stage = stage;
  this.fieldDimensions = fieldDimensions;
  // Waits for setViewportSize
}
```

**After:**

```typescript
constructor(stage, fieldDimensions) {
  this.stage = stage;
  this.fieldDimensions = fieldDimensions;
  // Center immediately at origin (will adjust when viewport known)
  this.centerOnField();
}
```

### Fix #3: Add Debug Logging

Add comprehensive logging to trace coordinate conversions:

```typescript
updateDrag(sprite, event) {
  const globalPos = event.global;
  const localPos = event.getLocalPosition(this);
  const yardPos = this.coords.pixelsToYards(localPos);

  console.log('🔍 Drag Debug:', {
    'Global (screen px)': { x: globalPos.x.toFixed(1), y: globalPos.y.toFixed(1) },
    'Local (stage px)': { x: localPos.x.toFixed(1), y: localPos.y.toFixed(1) },
    'Yards': { x: yardPos.x.toFixed(2), y: yardPos.y.toFixed(2) },
    'Camera': { zoom: this.stage.scale.x, pan: { x: this.stage.x, y: this.stage.y } }
  });

  // ... rest of function
}
```

### Fix #4: Verify Stage Transform

Add method to verify Camera is transforming correctly:

```typescript
// In DiagramPixiApp
debugCoordinates(screenX: number, screenY: number): void {
  console.log('📐 Coordinate Debug:', {
    'Screen (CSS px)': { x: screenX, y: screenY },
    'Stage transform': {
      x: this.stage.x,
      y: this.stage.y,
      scaleX: this.stage.scale.x,
      scaleY: this.stage.scale.y
    },
    'Stage.toLocal': this.stage.toLocal({ x: screenX, y: screenY }),
    'World (yards)': this.screenToWorld(screenX, screenY)
  });
}
```

---

## 🧪 Testing Protocol

### Test 1: Verify Canvas Size

```javascript
// In browser console
const canvas = document.querySelector("canvas");
console.log({
  "CSS Size": { width: canvas.clientWidth, height: canvas.clientHeight },
  "Buffer Size": { width: canvas.width, height: canvas.height },
  Ratio: canvas.width / canvas.clientWidth,
});
```

**Expected:** Ratio = devicePixelRatio (usually 2)

### Test 2: Verify Field Position

```javascript
// After field loads
console.log({
  "Stage position": { x: app.stage.x, y: app.stage.y },
  "Stage scale": { x: app.stage.scale.x, y: app.stage.scale.y },
  "Field visible": "Should see green field centered",
});
```

**Expected:** Stage at (centerX, centerY), scale = 1.0, field centered

### Test 3: Click Coordinate Test

```javascript
// Click on field, log coordinates
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const cssX = e.clientX - rect.left;
  const cssY = e.clientY - rect.top;
  console.log("Click at CSS:", cssX, cssY);
  // Should match where you clicked visually
});
```

### Test 4: Player Placement Test

```javascript
// Add player at specific yard coordinate
useDiagramStore.getState().addPlayer({
  id: "test-1",
  x: 26.666, // Center of field width
  y: 17.5, // Center of field height
  jerseyNumber: "X",
  team: "offense",
});
```

**Expected:** Blue circle appears at visual center of field

---

## 📋 Implementation Checklist

- [ ] Remove empty Container wrappers (PixiApp)
- [ ] Add layers directly to stage
- [ ] Fix Camera to center immediately
- [ ] Add debug logging to drag handler
- [ ] Add coordinate debug method to PixiApp
- [ ] Test canvas size matches expectations
- [ ] Test field centering
- [ ] Test click coordinates
- [ ] Test player placement
- [ ] Test player dragging

---

## 🎯 Expected Behavior After Fixes

1. **Field Centering:**
   - Field centered in viewport on load
   - Green field clearly visible
   - Equal padding on all sides (at zoom 1.0)

2. **Cursor Accuracy:**
   - Click coordinates match visual position
   - No offset between cursor and sprites
   - Accurate at all zoom levels

3. **Player Placement:**
   - Players appear where added (e.g., center = center)
   - Jersey numbers visible and correct
   - Team colors correct

4. **Player Dragging:**
   - Player follows cursor exactly
   - No lag or offset
   - Smooth at all zoom levels
   - Stays within field bounds

---

**Next Step:** Implement fixes and test systematically
