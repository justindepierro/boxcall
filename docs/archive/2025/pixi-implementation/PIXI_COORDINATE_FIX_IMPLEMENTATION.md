# Pixi.js Coordinate System Fix Implementation

**Date:** October 8, 2025  
**Status:** ✅ Implemented - Ready for Testing  
**Related:** PIXI_COORDINATE_DIAGNOSIS.md

## Overview

This document describes the implementation of fixes for the coordinate mismatch bug in the Pixi.js diagram editor. The bug prevented accurate player placement and dragging due to incorrect coordinate transformations.

## Problem Summary

**User Report:** "cursor doesnt reflect where the mouse is. i cannot place or draw a player"

**Root Causes Identified:**

1. Double Container nesting (empty wrappers + actual layers)
2. Camera not centered immediately on initialization
3. Unclear coordinate conversion in drag handlers
4. Need for comprehensive debugging

## Fixes Implemented

### Fix #1: Simplified Container Hierarchy ✅

**Problem:** Empty Container wrappers (`pixiApp.fieldLayer`, `pixiApp.playersLayer`) were created and layers were added as children, creating unnecessary nesting levels.

**Solution:** Layers are now added DIRECTLY to the stage Container.

**Files Modified:**

- `core/PixiApp.ts`
- `hooks/usePixiApp.ts`

**Changes:**

#### PixiApp.ts

```typescript
// BEFORE:
public fieldLayer: Container;
public playersLayer: Container;
// ... in constructor:
this.fieldLayer = new Container();
this.playersLayer = new Container();
this.stage.addChild(this.fieldLayer);
this.stage.addChild(this.playersLayer);

// AFTER:
public fieldLayer: FieldLayer | null = null;
public playersLayer: PlayersLayer | null = null;
// No empty containers created - actual layers stored directly
```

#### usePixiApp.ts

```typescript
// BEFORE:
const fieldLayer = new FieldLayer(...);
pixiApp.fieldLayer.addChild(fieldLayer); // Added to empty wrapper

// AFTER:
const fieldLayer = new FieldLayer(...);
fieldLayer.label = 'FieldLayer';
pixiApp.stage.addChild(fieldLayer); // Added DIRECTLY to stage!
pixiApp.fieldLayer = fieldLayer; // Store reference
```

**Benefit:** Clearer hierarchy, fewer transform levels, easier to debug.

**New Hierarchy:**

```
app.stage (Pixi root)
  └── stage (Camera transforms this Container)
      ├── FieldLayer (actual field graphics)
      └── PlayersLayer (actual player sprites)
```

---

### Fix #2: Immediate Camera Centering ✅

**Problem:** Camera constructor didn't call `centerOnField()` immediately - waited for async `setViewportSize()` which could cause initial offset.

**Solution:** Call `centerOnField()` immediately in Camera constructor.

**Files Modified:**

- `core/Camera.ts`

**Changes:**

```typescript
// BEFORE:
constructor(stage: Container, fieldDimensions: FieldDimensions) {
  this.stage = stage;
  this.fieldDimensions = fieldDimensions;
  // Initial center will be set when viewport size is known
}

// AFTER:
constructor(stage: Container, fieldDimensions: FieldDimensions) {
  this.stage = stage;
  this.fieldDimensions = fieldDimensions;
  // Center field immediately at (0,0) - will adjust when viewport size is known
  this.centerOnField();
}
```

**Benefit:** Field is always centered from the start, no initial offset issues.

---

### Fix #3: Comprehensive Debug Logging ✅

**Problem:** No visibility into coordinate transformations made debugging impossible.

**Solution:** Added detailed logging at every stage of coordinate conversion.

**Files Modified:**

- `layers/PlayersLayer.ts` - Drag handler logging
- `core/PixiApp.ts` - System state debugging
- `components/DiagramCanvas.tsx` - Auto-log on mount
- `hooks/usePixiApp.ts` - Expose debug method

**Changes:**

#### PlayersLayer.ts - updateDrag()

```typescript
private updateDrag(sprite: PlayerSprite, event: FederatedPointerEvent): void {
  if (!this.dragState) return;

  // DEBUG: Log all coordinate transformations
  console.group('🎯 Drag Coordinate Debug');

  // 1. Global position (CSS pixels from browser)
  console.log('1. Global (CSS pixels):', { x: event.global.x, y: event.global.y });

  // 2. Local position (pixels in this layer's space, accounting for camera)
  const localPos = event.getLocalPosition(this);
  console.log('2. Local (layer pixels):', { x: localPos.x, y: localPos.y });

  // 3. Convert to yards
  const yardPos = this.coords.pixelsToYards(localPos);
  console.log('3. Yards:', { x: yardPos.x, y: yardPos.y });

  // 4. Clamp to field bounds
  const clampedX = Math.max(0, Math.min(this.coords.fieldWidth, yardPos.x));
  const clampedY = Math.max(0, Math.min(this.coords.fieldHeight, yardPos.y));
  console.log('4. Clamped (yards):', { x: clampedX, y: clampedY });

  // 5. Log parent hierarchy for verification
  console.log('5. Parent chain:', this.parent?.label || this.parent?.constructor.name);

  console.groupEnd();

  sprite.updatePlayer({ x: clampedX, y: clampedY });
}
```

#### PixiApp.ts - debugCoordinates()

```typescript
debugCoordinates(testX: number = 400, testY: number = 300): void {
  console.group('🔍 Pixi Coordinate System Debug');

  // Canvas info
  const canvas = this.app.canvas as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  console.log('Canvas:', {
    cssSize: { width: rect.width, height: rect.height },
    bufferSize: { width: canvas.width, height: canvas.height },
    devicePixelRatio: window.devicePixelRatio,
    resolution: this.app.renderer.resolution,
  });

  // Camera state
  const cameraState = this.camera.getState();
  console.log('Camera:', cameraState);

  // Stage transform
  console.log('Stage:', {
    position: { x: this.stage.x, y: this.stage.y },
    scale: { x: this.stage.scale.x, y: this.stage.scale.y },
    pivot: { x: this.stage.pivot.x, y: this.stage.pivot.y },
    label: this.stage.label,
  });

  // Layer hierarchy
  console.log('Layers:', {
    fieldLayer: this.fieldLayer?.label || 'not added',
    playersLayer: this.playersLayer?.label || 'not added',
  });

  // Test coordinate conversion
  const worldCoords = this.screenToWorld(testX, testY);
  const backToScreen = this.worldToScreen(worldCoords.x, worldCoords.y);
  console.log('Test Conversion:', {
    screen: { x: testX, y: testY },
    world: worldCoords,
    backToScreen: backToScreen,
    error: {
      x: Math.abs(backToScreen.x - testX),
      y: Math.abs(backToScreen.y - testY),
    },
  });

  console.groupEnd();
}
```

#### DiagramCanvas.tsx - Auto-debug on mount

```typescript
// Debug: Log coordinate system on mount
useEffect(() => {
  if (isReady && debugCoordinates) {
    console.log("🚀 DiagramCanvas mounted and ready");
    debugCoordinates();
  }
}, [isReady, debugCoordinates]);
```

**Benefit:** Complete visibility into coordinate transformations at every step. Can identify exactly where conversions fail.

---

### Fix #4: Resolution Handling ✅

**Already Correct:** PixiApp.ts already uses `autoDensity: true` which properly handles `devicePixelRatio`.

```typescript
await this.app.init({
  resolution: config.resolution || window.devicePixelRatio || 1,
  autoDensity: true, // ✅ Already correct
  // ...
});
```

**No changes needed.**

---

## Testing Protocol

### Test 1: Verify Canvas Size

```typescript
// Open browser console after page loads
// Should see: "🚀 DiagramCanvas mounted and ready"
// Check Canvas output:
// cssSize should match visible canvas dimensions
// bufferSize = cssSize * devicePixelRatio
// resolution should equal devicePixelRatio
```

### Test 2: Verify Field Centered

```typescript
// Check Camera output in console:
// Camera.x and Camera.y should position field in center of viewport
// Field should be visually centered in canvas
```

### Test 3: Click and Log Coordinates

```typescript
// Click "Add Offense Player" button
// Drag the player sprite
// Should see "🎯 Drag Coordinate Debug" logs in console
// Verify:
// - Global (CSS pixels) matches cursor position
// - Local (layer pixels) accounts for camera transform
// - Yards conversion is within 0-53.333 x 0-35 range
// - Parent chain shows: "CameraStage"
```

### Test 4: Add Player at Known Position

```typescript
// Add player at center: (26.666, 17.5) yards
// Should appear at visual center of field
// Cursor should accurately target player when hovering/clicking
```

---

## Architecture After Fixes

### Hierarchy

```
DOM
  └── <canvas> element (CSS sized, 800x600 example)
      └── Pixi Application
          └── app.stage (Pixi root Container)
              └── stage (Custom Container - Camera transforms this)
                  ├── FieldLayer (Container with field graphics)
                  └── PlayersLayer (Container with PlayerSprites)
                      └── PlayerSprite 1
                      └── PlayerSprite 2
                      └── ...
```

### Coordinate Spaces

1. **CSS Pixels** - Browser/DOM coordinates (cursor position)
2. **Physical Pixels** - Canvas buffer (CSS \* devicePixelRatio)
3. **Global Pixi** - Before any Container transforms
4. **Stage Local** - After Camera transform (zoom/pan applied)
5. **Yards** - Football field coordinates (53.333 × 35)

### Event Flow

```
User clicks canvas
  → Browser event with CSS coordinates (event.clientX/Y)
  → Pixi FederatedPointerEvent (event.global = global pixels)
  → event.getLocalPosition(this) = stage local pixels
  → coords.pixelsToYards() = yards
  → Clamp to field bounds
  → Update sprite position
```

---

## Files Modified Summary

| File                           | Change                                    | Lines |
| ------------------------------ | ----------------------------------------- | ----- |
| `core/PixiApp.ts`              | Remove empty containers, add debug method | ~50   |
| `core/Camera.ts`               | Immediate centering                       | ~5    |
| `hooks/usePixiApp.ts`          | Direct layer adding, expose debug         | ~20   |
| `layers/PlayersLayer.ts`       | Add drag debug logging                    | ~20   |
| `components/DiagramCanvas.tsx` | Auto-debug on mount                       | ~10   |

**Total:** ~105 lines changed across 5 files

---

## Expected Results

After implementing these fixes:

✅ **Hierarchy Clarity** - No more empty Container wrappers, cleaner tree  
✅ **Immediate Centering** - Field centered from first render  
✅ **Debug Visibility** - Complete coordinate logging at every stage  
✅ **Accurate Placement** - Players appear where cursor clicks  
✅ **Accurate Dragging** - Players follow cursor during drag

---

## Next Steps

1. **Test in Browser**
   - Navigate to diagram editor v2
   - Open browser console
   - Verify "🚀 DiagramCanvas mounted and ready" message
   - Check debug output for correct values

2. **Test Player Interactions**
   - Click "Add Offense Player"
   - Observe drag debug logs
   - Verify cursor matches player position
   - Test at different zoom levels

3. **Verify Coordinate Conversions**
   - Check that Global → Local → Yards conversions are logical
   - Verify field bounds clamping works (0-53.333, 0-35)
   - Test at viewport edges

4. **If Issues Persist**
   - Analyze debug logs for anomalies
   - Check Camera state (zoom, pan values)
   - Verify Stage transform (scale, position)
   - Look for additional Container nesting

---

## Debug Commands

To manually trigger debug output in browser console:

```typescript
// Get app instance (if exposed via window or React DevTools)
app.debugCoordinates(); // Logs complete system state

// Or trigger during drag - logs automatically appear
// when dragging a player sprite
```

---

## Rollback Plan

If fixes cause issues:

```bash
# Revert all changes
git checkout HEAD -- \
  src/components/playbook/diagram-editor-v2/core/PixiApp.ts \
  src/components/playbook/diagram-editor-v2/core/Camera.ts \
  src/components/playbook/diagram-editor-v2/hooks/usePixiApp.ts \
  src/components/playbook/diagram-editor-v2/layers/PlayersLayer.ts \
  src/components/playbook/diagram-editor-v2/components/DiagramCanvas.tsx
```

---

## Success Criteria

The coordinate bug is considered FIXED when:

1. ✅ Players can be added by clicking on field
2. ✅ Cursor position matches visual player position
3. ✅ Players can be dragged accurately
4. ✅ Cursor follows player during drag
5. ✅ Coordinate conversions are logical (verified in console)
6. ✅ Works at all zoom levels (0.5x - 3.0x)
7. ✅ Works on different screen sizes/resolutions

---

## Related Documents

- `PIXI_COORDINATE_DIAGNOSIS.md` - Original diagnostic analysis
- `PIXI_V2_IMPLEMENTATION_SUMMARY.md` - Phase 1-3 implementation
- `PIXI_V2_ARCHITECTURE_AUDIT.md` - Original architecture analysis

---

## Notes

- Debug logging can be removed or made conditional (via flag) after testing
- Consider adding visual coordinate indicators (crosshair at cursor)
- May want to add coordinate grid overlay for testing
- Performance impact of console.group/log is minimal during development
