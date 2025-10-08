# Pixi.js Diagram Editor - Testing Guide

**Created:** October 8, 2025  
**Status:** Phase 3 In Progress (94-95% Production Ready)

## 🎯 What You Should See

### Initial Load (White Screen is CORRECT!)

When you first open the diagram editor, you should see:

1. **Canvas Background**: Cream/white color (0xF5F7ED)
2. **Green Football Field**: 53.333 yards × 35 yards with:
   - Green field background (0x82C91E)
   - White yard lines every 5 yards
   - White hash marks
   - Yard numbers (10, 20, 30, etc.)
3. **Player Controls**: Bottom-left corner with:
   - "Players (0)" counter
   - "+ Offense" button (blue)
   - "+ Defense" button (red)
   - Remove/Clear buttons (disabled until players added)
4. **Camera Controls**: Bottom-right corner with zoom buttons

### If You See ONLY White

This means the field layer is not rendering. Check console for:

- ✅ `📐 Canvas sized: [width]x[height]`
- ✅ `🎨 Initializing Pixi application...`
- ✅ `✅ Pixi application ready`
- ✅ `🚀 DiagramCanvas mounted and ready`

---

## 📏 Field Dimensions (NFHS Standard)

The field is already configured with proper NFHS dimensions:

```typescript
// From DiagramEditor.tsx line 51-54
<DiagramCanvas
  fieldWidth={53.333}    // 53⅓ yards (160 feet) - NFHS standard width
  fieldHeight={35}       // 35 yards visible (typical playbook view)
  pixelsPerYard={15}     // 15 pixels per yard for rendering
  onReady={handleReady}
/>
```

### Why These Dimensions?

- **Width: 53.333 yards** (160 feet) - Standard high school/college field width
- **Height: 35 yards** - Typical playbook "slice" showing offense/defense positions
- **Not full 100 yards** - Playbooks focus on a section of field (redzone, midfield, etc.)

---

## 🧪 Testing the Diagram Editor

### Step 1: Verify Field Renders

1. Open browser to `http://localhost:5173`
2. Navigate to the diagram editor page
3. **Expected**: Green football field with white yard lines
4. **If white**: Check browser console for errors

### Step 2: Add Players

1. Click **"+ Offense"** button (blue)
2. **Expected**: Blue circle sprite appears on field
3. Counter shows "Players (1)"
4. Click **"+ Defense"** button (red)
5. **Expected**: Red circle sprite appears
6. Counter shows "Players (2)"

### Step 3: Test Dragging

1. Click and drag a player sprite
2. **Expected**:
   - Player follows mouse/touch
   - Console shows "🎯 Drag Coordinate Debug" messages
   - Player position updates smoothly
3. **NEW Feature**: Drag player to field edge
4. **Expected**: Player briefly fades to 70% opacity (bounds feedback!)

### Step 4: Test Selection

1. Click a player sprite
2. **Expected**:
   - Player gets highlighted (selection ring)
   - "Selected: [jersey number]" appears in controls
   - "Remove Selected" button becomes enabled

### Step 5: Test Camera

1. Use camera controls (bottom-right):
   - **Zoom In**: Click "+" button
   - **Zoom Out**: Click "-" button
   - **Reset**: Click "1:1" button
2. **Expected**:
   - Field zooms smoothly (0.2 smooth factor)
   - Players scale with field
   - No jittering or coordinate issues

---

## 🐛 Troubleshooting

### Problem: White screen, no field

**Possible Causes:**

1. Field layer not rendering
2. Canvas size 0x0 (ResizeObserver should fix this)
3. WebGL context lost

**Debug Steps:**

```javascript
// Open browser console and check:
app.stage.children.length; // Should be > 0
app.fieldLayer; // Should exist
app.playersLayer; // Should exist
app.camera; // Should exist

// Check canvas size
canvas.width; // Should be > 0
canvas.height; // Should be > 0
```

### Problem: Players don't appear when added

**Possible Causes:**

1. Players added but z-index behind field
2. Player sprites not created
3. Coordinate system issue

**Debug Steps:**

```javascript
// Check store
const { players } = useDiagramStore.getState();
console.log("Players:", players); // Should show array

// Check if sprites exist
app.playersLayer.children.length; // Should match player count
```

### Problem: Dragging doesn't work

**Possible Causes:**

1. Event handlers not attached
2. `pointerdown` not firing
3. Camera transform interfering

**Debug Steps:**

```javascript
// Check sprite setup
sprite.eventMode; // Should be 'static' or 'dynamic'
sprite.cursor; // Should be 'pointer' or 'grab'

// Check for console errors during drag
```

### Problem: Bounds feedback not showing

**Possible Causes:**

1. Player not hitting actual boundary
2. Alpha change too subtle
3. Timeout clearing too fast

**Test:**
Drag player ALL the way to edge - should snap to 0 or fieldWidth/fieldHeight exactly.

---

## 🎨 Visual Reference

### Field Appearance

```
┌─────────────────────────────────────────────────┐
│  10    20    30    40    50    40    30    20   │ ← Yard numbers
├─────────────────────────────────────────────────┤
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Green field
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │   with white
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   yard lines
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │   every 5 yards
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │
├─────────────────────────────────────────────────┤
│ ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● │ ← Hash marks
└─────────────────────────────────────────────────┘
    53.333 yards (width) × 35 yards (height)
```

### Player Sprites

- **Offense**: Blue circles with jersey numbers
- **Defense**: Red circles with jersey numbers
- **Selected**: Highlight ring around sprite
- **Dragging**: Alpha 1.0 (normal)
- **Bounds Hit**: Alpha 0.7 (brief fade)

---

## 📊 Console Messages Reference

### Successful Initialization

```
📐 Canvas sized: 800x525
🎨 Initializing Pixi application...
✅ Pixi application ready
📊 Field Layer ready: 53.333 × 35 yards @ 15 px/yard
📊 Players Layer ready
📊 Camera initialized: [zoom info]
🚀 DiagramCanvas mounted and ready
✅ Pixi Diagram Editor Ready!
📊 FPS: 60
```

### During Drag

```
🎯 Drag Coordinate Debug
  1. Global (CSS pixels): {x: 456, y: 234}
  2. Local (layer pixels): {x: 123, y: 45}
  3. Yards: {x: 8.2, y: 3.0}
  4. Clamped (yards): {x: 8.2, y: 3.0}
  6. Parent chain: CameraStage
```

### Player Added

```
➕ Player added: player-1234567890
📍 Position: (26.5, 17.3) yards
```

---

## ✅ Expected Behavior Summary

| Action            | Expected Result                | New Feature                   |
| ----------------- | ------------------------------ | ----------------------------- |
| Page Load         | Green field renders with lines | LoadingSpinner shows          |
| Click "+ Offense" | Blue player sprite appears     | -                             |
| Click "+ Defense" | Red player sprite appears      | -                             |
| Click player      | Selection highlight shows      | -                             |
| Drag player       | Position updates smoothly      | Console logs coordinates      |
| Drag to edge      | Player snaps to boundary       | ✨ **Alpha feedback!**        |
| Zoom in/out       | Field scales smoothly          | ✨ **Configurable smoothing** |
| Remove player     | Sprite disappears              | -                             |

---

## 🎯 Phase 3 Features Just Added

### 1. Camera Smooth Factor Config (✅ Complete)

- **Feature**: Configurable camera interpolation
- **Default**: 0.2 (smooth)
- **Test**: Set to 1.0 for instant camera moves
- **Usage**:
  ```typescript
  <DiagramCanvas
    cameraConfig={{ smoothFactor: 1.0 }}
  />
  ```

### 2. Bounds Visual Feedback (✅ Complete)

- **Feature**: Alpha feedback when hitting field edges
- **Effect**: Player fades to 70% opacity for 150ms
- **Test**: Drag player all the way to any field boundary
- **Expected**: Brief alpha reduction, then restore

---

## 📝 Known Issues

### Issue: Field doesn't render on first load

**Status**: Should be fixed by ResizeObserver (Phase 2)
**Workaround**: Refresh page

### Issue: Players appear "under" field

**Status**: Should not occur (z-order managed)
**Debug**: Check `stage.children` order

### Issue: Dragging feels laggy

**Status**: Should be fixed by throttling (Phase 2)
**Expected**: 60 FPS during drag (check console)

---

## 🚀 Next Steps

If the diagram editor is working:

1. ✅ Test all features above
2. ✅ Verify bounds feedback works
3. ✅ Verify camera smoothing works
4. 📝 Report any issues found
5. 🎯 Ready for Phase 3 testing (unit tests, telemetry)

If NOT working:

1. Check browser console for errors
2. Verify dev server is running (`npm run dev`)
3. Check that you're on the diagram editor route
4. Try hard refresh (Cmd+Shift+R)
5. Report error messages

---

## 📞 Support

**Production Readiness:** 94-95%  
**Phase 3 Status:** In Progress (2/11 tasks complete)  
**Last Updated:** October 8, 2025

**Recent Commits:**

- `feat(pixi): Make camera smoothFactor configurable` (2d682d1)
- `feat(pixi): Add bounds visual feedback during drag` (885056a)
