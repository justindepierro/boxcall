# Resize Handling Comprehensive Audit

## Date: October 10, 2025
## Status: 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

**Problem**: Field rendering breaks on window resize with multiple duplicate resize handlers and race conditions.

**Root Causes**:
1. **Triple Resize Observation**: Three different ResizeObservers watching the same element
2. **Debounce Mismatch**: pixelsPerYard updates debounced (100ms) but app.resize() is immediate
3. **Missing Coordination**: No single source of truth for resize events
4. **Camera Re-centering**: Camera re-centers on EVERY resize, disrupting user view
5. **Race Conditions**: Coordinate system updates and renderer resizes happen independently

---

## Current Architecture (PROBLEMATIC)

### Resize Event Flow Chain:

```
Window Resize Event
  ↓
1. useResponsivePixelsPerYard (debounced 100ms)
   - ResizeObserver on containerRef
   - window.resize listener
   - Updates pixelsPerYard state
  ↓
2. usePixiApp (immediate)
   - ResizeObserver on canvasRef  
   - window.resize listener
   - Calls app.resize()
  ↓
3. PixiApp.resize()
   - app.renderer.resize()
   - camera.setViewportSize()
  ↓
4. Camera.setViewportSize()
   - centerOnField() ← ALWAYS RE-CENTERS!
  ↓
5. CoordinateSystem observer notification
   - PlayerSprite.updateGraphics()
   - FieldLayer updates
   - All other layers update
```

### Issues Identified:

#### 1. **Duplicate ResizeObservers** 🔴
**Location**: 
- `useResponsivePixelsPerYard.ts:99` - observes `containerRef`
- `usePixiApp.ts:360` - observes `canvasRef`  
- `usePixiApp.ts:95` (initialization) - observes `canvasRef` again

**Problem**: Same resize event triggers 3 separate handlers with different timing.

#### 2. **Debounce Timing Mismatch** 🔴
**Location**:
- `useResponsivePixelsPerYard`: Debounced 100ms
- `usePixiApp handleResize`: Immediate

**Problem**: 
- Renderer resizes immediately → Field renders at old pixelsPerYard
- 100ms later pixelsPerYard updates → Field re-renders at new scale
- Result: Visible "jump" or layout shift

#### 3. **Camera Force Re-center** 🟡
**Location**: `Camera.ts:201-210`

```typescript
setViewportSize(width: number, height: number): void {
  this.viewportWidth = width;
  this.viewportHeight = height;
  
  // Always re-center when viewport size changes ← PROBLEM!
  this.centerOnField();
}
```

**Problem**: 
- User zooms in on specific play detail
- Resizes window slightly
- Camera snaps back to center view
- User loses their place

#### 4. **Missing Resize Throttling** 🟡
**Location**: `usePixiApp.ts:341-350`

**Problem**:
- No throttling/debouncing on immediate resize handler
- Rapid resize (e.g., dragging window edge) causes excessive redraws
- Performance degradation on lower-end devices

#### 5. **Coordinate System Race Condition** 🟠
**Location**: 
- `usePixiApp.ts:330-335` - updatePixelsPerYard effect
- `usePixiApp.ts:337-367` - handleResize effect

**Problem**:
- Two separate useEffect hooks with no ordering guarantee
- pixelsPerYard might update AFTER renderer resize
- Sprites drawn at wrong scale temporarily

---

## Proposed Solution Architecture

### Single Coordinated Resize Handler

```typescript
// NEW: useResizeCoordinator.ts
export function useResizeCoordinator({
  containerRef,
  canvasRef,
  app,
  fieldDimensions,
}) {
  const rafRef = useRef<number | null>(null);
  const lastSizeRef = useRef({ width: 0, height: 0, ppy: 0 });

  const handleResize = useCallback(() => {
    // Cancel any pending update
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update on next frame
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas || !app) return;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Calculate new pixelsPerYard
      const padding = 20;
      const availableWidth = width - padding * 2;
      const availableHeight = height - padding * 2;
      const widthScale = availableWidth / fieldDimensions.width;
      const heightScale = availableHeight / fieldDimensions.height;
      const optimalScale = Math.min(widthScale, heightScale);
      const pixelsPerYard = Math.max(10, Math.min(25, optimalScale));

      // Check if anything actually changed (avoid redundant updates)
      const last = lastSizeRef.current;
      if (
        Math.abs(last.width - width) < 1 &&
        Math.abs(last.height - height) < 1 &&
        Math.abs(last.ppy - pixelsPerYard) < 0.1
      ) {
        return; // No significant change
      }

      // Save current state
      lastSizeRef.current = { width, height, ppy: pixelsPerYard };

      // ATOMIC UPDATE: Do everything in order
      // 1. Update coordinate system FIRST
      app.coordinates.updatePixelsPerYard(pixelsPerYard);

      // 2. Then resize renderer
      app.resize(width, height);

      // 3. Camera viewport update WITHOUT re-centering
      app.camera.setViewportSizeOnly(width, height);
    });
  }, [containerRef, canvasRef, app, fieldDimensions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial resize
    handleResize();

    // Single ResizeObserver
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      observer.disconnect();
    };
  }, [handleResize]);
}
```

### Camera Fix: Preserve User View

```typescript
// Camera.ts - NEW METHOD
setViewportSizeOnly(width: number, height: number): void {
  validateDimension(width, 'Viewport width', { min: 100, max: 10000 });
  validateDimension(height, 'Viewport height', { min: 100, max: 10000 });
  
  const oldWidth = this.viewportWidth;
  const oldHeight = this.viewportHeight;
  
  this.viewportWidth = width;
  this.viewportHeight = height;
  
  // DON'T re-center - preserve user's current view
  // Only adjust position to keep same content in view
  if (oldWidth > 0 && oldHeight > 0) {
    // Maintain center point of current view
    const centerX = (oldWidth / 2 - this.stage.x) / this.stage.scale.x;
    const centerY = (oldHeight / 2 - this.stage.y) / this.stage.scale.x;
    
    // Recalculate position for new viewport
    this.targetX = (width / 2) - (centerX * this.stage.scale.x);
    this.targetY = (height / 2) - (centerY * this.stage.scale.x);
    this.stage.x = this.targetX;
    this.stage.y = this.targetY;
  } else {
    // First time - center on field
    this.centerOnField();
  }
}

// Keep existing method for explicit centering
setViewportSize(width: number, height: number): void {
  this.setViewportSizeOnly(width, height);
  this.centerOnField(); // Explicit re-center
}
```

---

## Implementation Plan

### Phase 1: Immediate Fixes (1-2 hours)

1. **Remove duplicate ResizeObservers**
   - Delete ResizeObserver in `usePixiApp.ts:95-105` (initialization duplicate)
   - Keep only ONE in new `useResizeCoordinator`

2. **Add Camera.setViewportSizeOnly()**
   - Implement method that preserves user view
   - Update PixiApp.resize() to use it

3. **Atomic resize updates**
   - Update pixelsPerYard BEFORE renderer resize
   - Single requestAnimationFrame handler

### Phase 2: Architecture Improvements (2-3 hours)

1. **Create useResizeCoordinator hook**
   - Single source of truth for all resize logic
   - Replaces useResponsivePixelsPerYard
   - Integrated into usePixiApp

2. **Remove debouncing**
   - Use requestAnimationFrame instead
   - Browser automatically batches frames

3. **Add resize change threshold**
   - Only update if change > 1px
   - Prevent micro-adjustments

### Phase 3: Performance Optimization (1-2 hours)

1. **Add resize start/end detection**
   - Disable smooth camera during resize
   - Re-enable after resize settles

2. **Conditional layer updates**
   - Only update layers that need scaling
   - Skip field texture regeneration if possible

3. **Add performance monitoring**
   - Log resize duration
   - Warn if > 16ms (60fps budget)

---

## Testing Checklist

- [ ] Window resize (drag window edge)
- [ ] Browser zoom (Cmd +/-)
- [ ] Rotate device (mobile/tablet)
- [ ] Sidebar toggle (changes canvas width)
- [ ] Fullscreen mode toggle
- [ ] Split screen on iPad
- [ ] Rapid resize (drag window quickly)
- [ ] Resize while zoomed in
- [ ] Resize while panning
- [ ] Resize with many players on field

---

## Metrics to Monitor

**Before Fix**:
- Resize event count: ~6-9 per window resize
- Layout shifts: 1-2 visible "jumps"
- Resize duration: ~80-150ms
- Camera disruption: 100% (always re-centers)

**After Fix (Target)**:
- Resize event count: 1 per window resize
- Layout shifts: 0
- Resize duration: < 16ms (60fps)
- Camera disruption: 0% (preserves view)

---

## Additional Findings

### Code Duplication

**useResponsivePixelsPerYard vs. DiagramCanvas logic**:
- Both calculate pixelsPerYard from container size
- Same algorithm, different locations
- Should be consolidated

**Window resize listeners**:
- `useResponsivePixelsPerYard:108` - window.resize
- `usePixiApp:357` - window.resize  
- Should be single listener or use ResizeObserver only

### Potential Future Issues

1. **Browser zoom vs. app zoom confusion**
   - Browser zoom changes devicePixelRatio
   - Could conflict with app.camera.zoom
   - Need to handle separately

2. **Mobile orientation change**
   - Not explicitly handled
   - May cause layout issues
   - Should add orientation change listener

3. **Container size = 0 edge case**
   - When tab is hidden or minimized
   - Could cause division by zero
   - Need guards

---

## References

- Pixi.js Resize: https://pixijs.download/dev/docs/PIXI.Application.html#resize
- ResizeObserver: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

---

## Next Steps

1. **IMMEDIATE**: Implement Phase 1 fixes (stabilize current behavior)
2. **SHORT TERM**: Implement Phase 2 (proper architecture)
3. **MEDIUM TERM**: Phase 3 optimizations
4. **LONG TERM**: Consider canvas-based resize (avoid DOM measurement)
