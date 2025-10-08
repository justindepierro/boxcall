# Quick Test Guide: Phase 2 Interactive Controls

## 🚀 How to Test Right Now

### 1. Start the Dev Server (if not running)

```bash
npm run dev
```

### 2. Open the Diagram Editor

Navigate to: `http://localhost:5173`

### 3. Find the Test Page

Look for DiagramEditorV2 or create a test route:

- Option A: Import `DiagramEditorV2` into an existing page
- Option B: Create a route to `DiagramV2TestPage`

### 4. Desktop Testing (2 minutes)

**Test Zoom Buttons:**

1. Look for buttons in top-right corner
2. Click zoom in (+) button → field should zoom smoothly
3. Click zoom out (-) button → field should zoom back
4. Click reset (⊞) button → field returns to center

**Test Mouse Wheel:**

1. Hover mouse over field
2. Scroll wheel up → zoom in (point under cursor stays in place)
3. Scroll wheel down → zoom out (point under cursor stays in place)
4. Try scrolling while hovering different parts of field

**Expected Behavior:**

- All zoom levels: 0.5x, 0.75x, 1x, 1.5x, 2x, 3x
- Smooth transitions (no jarring jumps)
- Cursor point stays stationary during wheel zoom
- Buttons have hover effects

---

## 📱 Mobile Testing (Requires Device)

### Deploy to Mobile

```bash
# Option 1: Use local network
# Find your local IP
ifconfig | grep "inet "

# Access from mobile on same network
# http://YOUR_IP:5173

# Option 2: Use ngrok
npx ngrok http 5173
```

### Test Gestures (3 minutes)

**Test Pinch-to-Zoom:**

1. Place two fingers on screen
2. Pinch outward → zoom in
3. Pinch inward → zoom out
4. Verify pinch center stays stationary

**Test Drag-to-Pan:**

1. Single finger drag → field moves
2. Try all directions
3. Should feel smooth and responsive

**Test Double-Tap:**

1. Tap twice quickly (within 300ms)
2. Field should reset to default view

**Test Button Taps:**

1. Tap zoom buttons with thumb
2. Should be easy to hit (48px targets)
3. Visual feedback on tap

---

## ✅ Success Checklist

### Desktop

- [ ] Zoom in button works
- [ ] Zoom out button works
- [ ] Reset button works
- [ ] Mouse wheel zoom works
- [ ] Cursor point stays stationary during wheel zoom
- [ ] Transitions are smooth (no jumps)
- [ ] Buttons have hover effects

### Mobile

- [ ] Pinch-to-zoom works
- [ ] Pinch center stays stationary
- [ ] Drag-to-pan works
- [ ] Double-tap resets view
- [ ] Buttons easy to tap
- [ ] No browser zoom/scroll interference
- [ ] Smooth 60fps performance

---

## 🐛 If Something Doesn't Work

### Zoom buttons don't work

- Check console for errors
- Verify `app` state is set in DiagramEditorV2
- Make sure PixiApp initialized (look for "✅ Pixi Diagram Editor V2 Ready!")

### Mouse wheel doesn't work

- Try clicking canvas first to focus
- Check if browser zoom is interfering
- Verify `passive: false` is set on wheel event

### Touch gestures don't work

- Verify `touchAction: 'none'` is set on canvas
- Check if browser gestures are overriding
- Try different browser (Safari vs Chrome)
- Make sure device isn't in "desktop mode"

### Performance issues

- Check FPS in console log
- Verify WebGL is enabled (check Pixi.js warnings)
- Try reducing pixelsPerYard if needed
- Check for other heavy processes

---

## 📊 What to Look For

### Good Signs ✅

- Smooth 60fps during all gestures
- No coordinate system bugs
- Point under cursor stays stationary during zoom
- Transitions feel natural and responsive
- No jarring jumps or sudden movements

### Bad Signs ❌

- Stuttering or lag during gestures
- Cursor point moves during wheel zoom
- Pinch center moves during pinch-zoom
- Sudden jumps instead of smooth transitions
- Touch gestures trigger browser zoom/scroll

---

## 💬 Feedback Template

After testing, please report:

**Desktop:**

- Zoom buttons: ✅ / ❌
- Mouse wheel: ✅ / ❌
- Smooth transitions: ✅ / ❌
- Notes: **\_**

**Mobile (if tested):**

- Pinch-to-zoom: ✅ / ❌
- Drag-to-pan: ✅ / ❌
- Double-tap: ✅ / ❌
- Button taps: ✅ / ❌
- Notes: **\_**

**Performance:**

- FPS: \_\_\_
- Device: \_\_\_
- Browser: \_\_\_

---

## 🎯 Next Steps After Testing

If all tests pass → Ready for Phase 3 (Player Sprites)  
If issues found → Fix and re-test

**Phase 3 Preview:**

- Add player sprites to field
- Click to select players
- Drag to move players
- Add new players with tool
- Delete players

**Estimated Time:** 2-3 hours
