# Mobile-First Action Plan 📱⚡

**Created**: October 10, 2025  
**Priority**: HIGH  
**Timeline**: 4 weeks to MVP, 6 weeks to polish

---

## 🎯 Quick Summary

We're transforming the Play Diagram Editor from a **desktop-first tool** into a **mobile-first experience** that coaches can use on the sideline. This means:

1. **Force landscape orientation** on phones for maximum screen space
2. **Bottom sheets** instead of sidebars (save 60% of screen space)
3. **Larger touch targets** (44px+) for easy tapping
4. **Gesture-optimized** (pinch zoom, swipe tabs, drag players)
5. **Smart workflows** (auto-defense, quick formations, FAB menus)

---

## 📊 Before & After Comparison

### Desktop (Current) ✅

```
┌────────────────────────────────────────────┐
│  Header (play name, save, close)           │
├─────────────┬──────────────────────────────┤
│             │                              │
│  Sidebar    │      Canvas                  │
│  (33%)      │      (67%)                   │
│             │                              │
│  - Players  │      [Football Field]        │
│  - Forms    │                              │
│  - Defense  │                              │
│  - Align    │                              │
│  - Settings │                              │
│             │                              │
└─────────────┴──────────────────────────────┘
```

### Mobile Landscape (Target) 🎯

```
┌────────────────────────────────────────────┐
│  Header (minimized)                        │
├────────────────────────────────────────────┤
│                                            │
│                                            │
│         Canvas (90%+ of screen)            │
│                                            │
│         [Football Field - Full Width]      │
│                                            │
│                                    [FAB]   │ ← Floating Action Button
├────────────────────────────────────────────┤
│  ≡ Players | Forms | Defense | Align | ⚙  │ ← Bottom Sheet Tabs
└────────────────────────────────────────────┘
   ↑ Swipe up to expand bottom sheet
```

### Mobile Portrait (Force Landscape) 🔄

```
┌────────────────────────┐
│                        │
│      🔄 Please         │
│    Rotate Device       │
│                        │
│   [Rotation Icon]      │
│                        │
│  Works best in         │
│  landscape mode        │
│                        │
│  [Continue anyway]     │
│                        │
└────────────────────────┘
```

---

## 🚀 Phase 1: Foundation (Week 1) - START HERE ✅ IN PROGRESS

### Goal: Make it work on mobile devices

#### Tasks

1. **Create responsive hooks** (4 hours) ✅ COMPLETE
   - [x] `hooks/useBreakpoint.ts` - Detect mobile/tablet/desktop
   - [x] `hooks/useOrientation.ts` - Detect portrait/landscape
   - [x] Add window resize listeners
   - [x] Added helper hooks: `useIsMobile()`, `useIsTablet()`, `useIsDesktop()`, `useIsMobileOrTablet()`
   - [ ] Test on iPhone, iPad, Android

2. **Build landscape prompt** (3 hours) ✅ COMPLETE
   - [x] `components/LandscapePrompt.tsx` - Full-screen overlay
   - [x] Add rotation animation (CSS keyframes)
   - [x] "Continue in portrait" escape hatch
   - [x] Integrated into DiagramEditor with conditional rendering
   - [ ] Test on iOS Safari, Chrome Android

3. **Increase touch targets** (6 hours) 🔄 IN PROGRESS
   - [ ] Audit all buttons in PlayerControls (1,960 lines!)
   - [ ] Change button classes: `py-1` → `py-3`, `px-2` → `px-4`
   - [ ] Increase PlayerSprite hit area: 24px → 40px
   - [ ] Add spacing between buttons: `gap-2` → `gap-3`
   - [ ] Test tapping accuracy on real devices

4. **Responsive layout wrapper** (4 hours) ✅ COMPLETE
   - [x] Modify `DiagramEditor.tsx` to detect breakpoint
   - [x] Added `useBreakpoint()`, `useIsMobile()`, `useIsMobilePortrait()` hooks
   - [x] Landscape prompt shows on mobile portrait
   - [x] Keep all existing functionality working
   - [ ] Test on multiple screen sizes

**Deliverable**: Editor loads on mobile, prompts for landscape, buttons are tappable  
**Test Devices**: iPhone SE, iPhone 14, iPad Air, Samsung Galaxy S21

**Progress**: 3/4 tasks complete (75%) - Touch targets remain

---

## 🎨 Phase 2: Mobile UI (Week 2)

### Goal: Native mobile interaction patterns

#### Tasks

1. **Bottom Sheet component** (8 hours)
   - [ ] `components/BottomSheet.tsx` - Draggable panel
   - [ ] Implement snap points: 80px, 50%, 90%
   - [ ] Add gesture handlers (react-spring or Framer Motion)
   - [ ] Smooth spring animations
   - [ ] Backdrop with tap-to-close

2. **Split PlayerControls into tabs** (10 hours)
   - [ ] Extract "Players" section → `PlayersTab.tsx`
   - [ ] Extract "Formations" section → `FormationsTab.tsx`
   - [ ] Extract "Defense" section → `DefenseTab.tsx`
   - [ ] Extract "Align" section → `AlignTab.tsx`
   - [ ] Extract "Settings" section → `SettingsTab.tsx`
   - [ ] Build tab bar with icons + labels
   - [ ] Lazy load tab content (only mount active tab)

3. **Floating Action Button** (4 hours)
   - [ ] `components/FloatingActionButton.tsx` - Main FAB
   - [ ] Radial menu expansion (4 quick actions)
   - [ ] Spring animations on open/close
   - [ ] Position: bottom-right, 16px padding
   - [ ] Quick actions: Add Player, Formation, Clear, Undo

4. **Mobile layouts** (6 hours)
   - [ ] `layouts/MobileLayout.tsx` - Canvas + bottom sheet
   - [ ] `layouts/DesktopLayout.tsx` - Current sidebar layout
   - [ ] `layouts/TabletLayout.tsx` - Hybrid approach
   - [ ] Wire up to `DiagramEditor.tsx` breakpoint detection

**Deliverable**: Bottom sheet works, tabs switch smoothly, FAB is functional  
**Test**: Swipe gestures, tab switching, FAB radial menu

---

## ⚡ Phase 3: Smart Workflows (Week 3)

### Goal: Make common tasks faster on mobile

#### Tasks

1. **Visual formation picker** (6 hours)
   - [ ] `components/FormationPicker.tsx` - Grid of formation thumbnails
   - [ ] Create mini SVG icons for each formation (2x2, 3x1, Trips, etc.)
   - [ ] 3-column grid on mobile
   - [ ] Tap to insert formation instantly
   - [ ] Show toast notification on insert

2. **Auto-match defense** (4 hours)
   - [ ] `utils/autoDefense.ts` - Logic to match offense → defense
   - [ ] Analyze offensive formation (already have `analyzeFormation`)
   - [ ] Map formation types to recommended schemes
   - [ ] Apply scheme with one tap
   - [ ] Show toast: "4-2-5 Nickel vs 2x2"

3. **Player properties drawer** (6 hours)
   - [ ] `components/PlayerPropertiesDrawer.tsx` - Slide-up panel
   - [ ] Show when player is selected
   - [ ] Quick actions: Flip Side, Edit Position, Copy, Delete
   - [ ] Position details (X, Y coordinates)
   - [ ] Swipe down to close

4. **Contextual toolbars** (5 hours)
   - [ ] Detect selection state (none, 1 player, 2+ players)
   - [ ] Show relevant actions based on context
   - [ ] **No selection**: Add Player, Formation
   - [ ] **1 player**: Move, Copy, Delete
   - [ ] **2+ players**: Align, Distribute, Space
   - [ ] Position toolbar at bottom (above keyboard safe area)

**Deliverable**: Formation insertion is 1 tap, defense matching is 1 tap  
**Test**: Time to complete "add 11 players + formation + defense" (should be < 30 seconds)

---

## 💎 Phase 4: Polish (Week 4)

### Goal: 60fps, beautiful animations, haptic feedback

#### Tasks

1. **Performance optimization** (8 hours)
   - [ ] Profile Pixi.js rendering on low-end devices
   - [ ] Detect GPU tier (WebGL capabilities)
   - [ ] Implement field quality settings (High/Medium/Low)
   - [ ] Reduce draw calls on mobile
   - [ ] Test on iPhone 8 (oldest supported device)

2. **Haptic feedback** (3 hours)
   - [ ] `utils/haptics.ts` - Vibration API wrapper
   - [ ] Light tap on button press
   - [ ] Medium tap on player grab
   - [ ] Heavy tap on formation insert
   - [ ] Test on iOS and Android (different APIs)

3. **Touch feedback animations** (4 hours)
   - [ ] Scale down buttons on press (0.95x)
   - [ ] Ripple effect on tap
   - [ ] Loading spinners for async actions
   - [ ] Skeleton screens for lazy-loaded tabs
   - [ ] Smooth transitions (200-300ms duration)

4. **Device testing** (8 hours)
   - [ ] Test on iPhone SE (smallest screen, 667px landscape)
   - [ ] Test on iPhone 14 Pro Max (largest screen, ProMotion 120Hz)
   - [ ] Test on iPad Air (tablet size, hybrid layout)
   - [ ] Test on Samsung Galaxy S21 (Android reference device)
   - [ ] Test on budget Android (performance baseline)
   - [ ] Fix iOS Safari quirks (viewport, gestures, scrolling)
   - [ ] Fix Android Chrome quirks (touch events, back button)

**Deliverable**: Smooth 60fps on all devices, haptics feel great, no bugs  
**Test**: Frame rate profiling, user testing with 5+ people

---

## 🚀 Phase 5: Advanced Features (Weeks 5-6)

### Optional but awesome

1. **Voice commands** (Experimental)
   - [ ] Web Speech API integration
   - [ ] Commands: "Add receiver left", "2x2 formation", "Undo"
   - [ ] Visual feedback (microphone icon, transcription)

2. **Apple Pencil support**
   - [ ] Pressure-sensitive route drawing
   - [ ] Palm rejection
   - [ ] Tilt for line thickness

3. **Camera integration**
   - [ ] Scan whiteboard diagrams
   - [ ] OCR for play names
   - [ ] Photo reference overlay

4. **Multi-device collaboration**
   - [ ] Real-time sync (Supabase Realtime)
   - [ ] Cursor presence
   - [ ] Voice chat while diagramming

---

## 📐 Technical Specifications

### Breakpoints

```typescript
export type Breakpoint = "mobile" | "tablet" | "desktop";

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint("mobile");
      else if (width < 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}
```

### Touch Targets

- **Minimum**: 44px × 44px (Apple HIG)
- **Comfortable**: 48px × 48px (recommended)
- **Large**: 56px × 56px (FAB, critical actions)

### Bottom Sheet Snap Points

```typescript
const snapPoints = [
  0.08, // Peek (80px on 1000px screen)
  0.5, // Half
  0.9, // Full
];
```

### Gesture Priority

1. Bottom sheet handle (vertical drag only)
2. Canvas two-finger gestures (pan, zoom)
3. Player drag (single finger on player)
4. Canvas single-finger drag (pan when no player selected)

---

## ✅ Success Criteria

### Must Have (MVP)

- [ ] Landscape prompt shows on mobile portrait
- [ ] Bottom sheet works on mobile landscape
- [ ] All touch targets are 44px+ and tappable
- [ ] Formation picker works (1 tap to insert)
- [ ] Runs at 30fps+ on iPhone 8
- [ ] No critical iOS/Android bugs

### Nice to Have (V2)

- [ ] Haptic feedback feels natural
- [ ] Auto-match defense works perfectly
- [ ] Runs at 60fps on iPhone 11+
- [ ] Voice commands work (experimental)
- [ ] Apple Pencil support

### Delight (V3)

- [ ] Camera scanning for whiteboard diagrams
- [ ] Multi-device collaboration
- [ ] Runs at 120fps on ProMotion displays
- [ ] Offline support with background sync

---

## 🎯 Metrics to Track

1. **Performance**
   - Frame rate (target: 60fps)
   - Bundle size (target: < 500KB mobile code)
   - First render time (target: < 1 second)

2. **Usability**
   - Task completion time (add 11 players + formation + defense)
   - Error rate (accidental taps)
   - User satisfaction (survey: 1-5 stars)

3. **Adoption**
   - % of diagrams created on mobile
   - Mobile user retention (return visits per week)
   - Mobile diagram completion rate

---

## 🛠️ Development Setup

### Install Dependencies

```bash
# Gesture library
npm install @use-gesture/react

# Animation library
npm install framer-motion
# or
npm install react-spring

# Haptics (mobile vibration)
# Built-in Web API, no install needed
```

### Test Devices Needed

- **iPhone SE** (smallest screen, 667px landscape)
- **iPhone 14** (modern reference device)
- **iPad Air** (tablet layout testing)
- **Samsung Galaxy S21** (Android reference)
- **Budget Android** (performance baseline)

### Browser Testing

- iOS Safari (default iOS browser)
- Chrome Android (default Android browser)
- Chrome Desktop (dev tools device emulation)
- Firefox Mobile (secondary testing)

---

## 📚 Resources

### Design Inspiration

- **Procreate** - Gesture-based UI, radial menus
- **Concepts** - Infinite canvas, precision tools
- **Adobe Fresco** - Touch-optimized workflows

### Documentation

- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/touch)
- [Material Design - Mobile](https://m3.material.io/)
- [Pixi.js Mobile Best Practices](https://pixijs.io/guides/)
- [React Spring Gestures](https://www.react-spring.dev/docs/hooks/use-gesture)

---

## 🎉 Let's Go!

**This is going to be incredible.** A truly mobile-first diagram editor will set BoxCall apart from every competitor. Coaches will be able to:

- ✅ Draw plays on the sideline during games
- ✅ Diagram in meetings on their phone
- ✅ Review plays on their iPad while watching film
- ✅ Work seamlessly across devices

**First task**: Create `useBreakpoint` and `useOrientation` hooks. Let's start! 🚀
