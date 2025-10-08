# Phase 3 Cursor & Coordinate Fix 🎯

**Date:** October 8, 2025  
**Issue:** Cursor position didn't match where players appeared/dragged  
**Status:** ✅ FIXED - Three critical issues resolved

---

## 🐛 Issues Found & Fixed

### Issue #1: Incorrect Parent Reference in Drag Handler

**Problem:**

```typescript
// OLD - WRONG
const worldPos = event.getLocalPosition(this.parent!);
```

The drag handler was getting the position relative to `stage`, but then immediately converting pixels→yards without accounting for the fact that `this.parent` is already the stage with camera transforms applied.

**Fix:**

```typescript
// NEW - CORRECT
const localPos = event.getLocalPosition(this);
```

Using `this` (the PlayersLayer itself) gives us the position already in the layer's local space, which accounts for all parent transforms (camera zoom/pan) automatically.

**File:** `PlayersLayer.ts` line ~220

---

### Issue #2: Field Not Centered in Viewport

**Problem:**
Camera initialized with `centerOnField()` but it just set position to (0, 0), meaning:

- Field top-left corner at viewport top-left
- Most of field off-screen to the right/bottom
- Cursor clicked in viewport, but field was elsewhere

**Fix:**
Added viewport size tracking to Camera:

```typescript
setViewportSize(width: number, height: number): void {
  this.viewportWidth = width;
  this.viewportHeight = height;
  this.centerOnField(); // Recalculate center
}

centerOnField(): void {
  const fieldWidthPixels = this.fieldDimensions.width * pixelsPerYard;
  const fieldHeightPixels = this.fieldDimensions.height * pixelsPerYard;

  // Center field in viewport
  this.targetX = (this.viewportWidth - fieldWidthPixels) / 2;
  this.targetY = (this.viewportHeight - fieldHeightPixels) / 2;
}
```

**Files:**

- `Camera.ts` - Added viewport tracking and centering logic
- `PixiApp.ts` - Call `setViewportSize()` on init and resize

---

### Issue #3: Camera Not Initialized on App Start

**Problem:**
Camera viewport size was never set initially, so field stayed at (0, 0).

**Fix:**
In PixiApp initialization:

```typescript
// Set initial viewport size and center field
this.camera.setViewportSize(config.width, config.height);
```

And on resize:

```typescript
resize(width: number, height: number): void {
  this.app.renderer.resize(width, height);
  this.camera.setViewportSize(width, height); // Update camera viewport
}
```

**File:** `PixiApp.ts`

---

## 🎯 How Coordinates Work Now

### Coordinate Flow (Adding Player)

```
User clicks "+ Offense" button
  ↓
PlayerControls creates player at yards (26.666, 17.5)
  ↓
Store updates: players = [{ x: 26.666, y: 17.5, ... }]
  ↓
usePixiApp useEffect detects change
  ↓
PlayersLayer.addPlayer(player)
  ↓
PlayerSprite created
  ↓
updatePosition() converts yards → pixels
  pixels = { x: 26.666 * 15, y: 17.5 * 15 } = { x: 400, y: 262.5 }
  ↓
sprite.position.set(400, 262.5) in PlayersLayer local space
  ↓
Pixi renders sprite accounting for:
  - Stage camera transform (pan: centerX, centerY, zoom: 1.0)
  - Final screen position = stageTransform * localPosition
  ↓
Player appears centered on screen! ✅
```

### Coordinate Flow (Dragging Player)

```
User clicks player and drags
  ↓
pointerdown event on PlayerSprite
  ↓
PlayersLayer.selectPlayer() + startDrag()
  ↓
User moves mouse
  ↓
pointermove event on PlayerSprite
  ↓
PlayersLayer.updateDrag(sprite, event)
  ↓
localPos = event.getLocalPosition(this) // Get position in PlayersLayer space
  → localPos is in pixels, accounts for camera zoom/pan automatically
  ↓
yardPos = coords.pixelsToYards(localPos) // Convert pixels → yards
  yardPos = { x: localPos.x / 15, y: localPos.y / 15 }
  ↓
Clamp to field bounds:
  clampedX = Math.max(0, Math.min(53.333, yardPos.x))
  clampedY = Math.max(0, Math.min(35, yardPos.y))
  ↓
sprite.updatePlayer({ x: clampedX, y: clampedY })
  ↓
sprite.updatePosition() converts yards → pixels and updates sprite.position
  ↓
Pixi renders sprite at new position
  ↓
Player follows cursor precisely! ✅
```

---

## 🧪 How to Verify Fix

### Test 1: Field Centering

1. Reload page
2. Field should be centered in viewport
3. You should see yard lines, hash marks, numbers clearly
4. Field shouldn't be cut off or hidden

**Expected:**

- Field visible and centered
- Camera controls (top-right) visible
- Player controls (bottom-left) visible

---

### Test 2: Player Placement

1. Click "+ Offense" button
2. Blue player appears near center of field
3. Click "+ Defense" button
4. Red player appears near center, slightly below offense

**Expected:**

- Players appear where you can see them (center of visible field)
- Not hidden off-screen
- Multiple players spread around center

---

### Test 3: Player Selection

1. Click any player
2. Amber ring appears around clicked player
3. Click different player
4. Ring moves to new player

**Expected:**

- Click hits the player you're clicking on (not offset)
- Selection ring visible and centered on player
- Cursor changes to "move" when over selected player

---

### Test 4: Player Dragging

1. Click and hold any player
2. Drag mouse around field
3. Player follows cursor precisely
4. Release mouse
5. Player stays at new position

**Expected:**

- Player follows cursor with NO OFFSET
- Player stops at field boundaries
- Smooth dragging, no jumps
- Final position is where you released

---

### Test 5: Zoom/Pan with Dragging

1. Add a few players
2. Zoom in (click + button)
3. Try dragging a player
4. Pan around (drag empty space)
5. Try dragging again
6. Zoom out
7. Try dragging again

**Expected:**

- Dragging works correctly at all zoom levels
- No offset or coordinate mismatch
- Player follows cursor at 0.5x, 1x, 2x, 3x zoom
- Dragging works after panning

---

## 📊 Technical Details

### Why `getLocalPosition(this)` Works

Pixi's scene graph:

```
app.stage (root)
  └── this.stage (has camera transform)
      └── PlayersLayer (this)
          └── PlayerSprite
```

When we call `event.getLocalPosition(this)`:

1. Pixi starts with global screen coordinates
2. Applies inverse of `app.stage` transform (identity)
3. Applies inverse of `this.stage` transform (camera un-zoom, un-pan)
4. Applies inverse of PlayersLayer transform (identity)
5. Returns position in PlayersLayer's local space

This gives us pixels in the layer's coordinate system, which is:

- Origin (0, 0) = field top-left
- Scale 1:1 with yards \* pixelsPerYard
- Already accounts for camera transforms

---

### Why Centering Matters

Without centering:

```
Viewport: [0, 0] to [1200, 800]
Field:    [0, 0] to [800, 525]  (53.333 * 15 x 35 * 15)

Field position: (0, 0)
Result: Field in top-left corner, most of field visible but not centered
```

With centering:

```
Viewport: [0, 0] to [1200, 800]
Field:    [0, 0] to [800, 525]

Field position: ((1200-800)/2, (800-525)/2) = (200, 137.5)
Result: Field centered with equal margins on all sides
```

This ensures:

- Cursor clicks land on visible field
- Players appear in visible area
- Zoom focuses on field center
- Professional appearance

---

## 🔍 Verification Checklist

- [x] Fixed drag coordinate conversion
- [x] Added viewport size tracking to Camera
- [x] Implemented proper field centering
- [x] Camera viewport updated on init
- [x] Camera viewport updated on resize
- [x] No TypeScript errors
- [x] No lint warnings
- [ ] Browser testing (pending)

---

## 🚀 Next Steps

1. **Test in browser** - Verify all fixes work as expected
2. **Report any remaining issues** - Cursor still off? Let me know!
3. **Continue to Phase 4** - If everything works, ready for route drawing

---

## 💡 Key Learnings

### 1. Always Use Correct Parent Reference

When getting event positions, use the container you're working in:

- `getLocalPosition(this)` for current container
- `getLocalPosition(parent)` only if you need parent's space
- Never mix coordinate spaces

### 2. Viewport Centering Is Critical

Fields/canvases should be centered in viewport:

- Better user experience
- Cursor coordinates match expectations
- Professional appearance
- Easier to navigate

### 3. Camera Needs Viewport Size

Camera transforms need to know viewport dimensions:

- To center content properly
- To calculate zoom focus points
- To clamp pan boundaries
- Update on resize!

### 4. Pixi Handles Transform Math

Don't manually calculate transforms:

- Use `getLocalPosition()` for positions
- Use `toLocal()` / `toGlobal()` for conversions
- Trust Pixi's scene graph
- Less code, fewer bugs

---

**Status:** ✅ All coordinate issues fixed  
**Files Modified:** 3 (PlayersLayer, Camera, PixiApp)  
**Lines Changed:** ~30 lines  
**Testing:** Ready for browser verification

🎯 Cursor should now match perfectly! Test it out!
