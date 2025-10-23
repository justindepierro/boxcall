# 4-Week Mobile Implementation Timeline 📅

**Project**: Mobile-First Play Diagram Editor  
**Timeline**: October 10 - November 7, 2025  
**Team Size**: 1-2 developers  
**Total Effort**: ~160 hours

---

## 📊 Gantt Chart Overview

```
WEEK 1: FOUNDATION
├─ Day 1-2: Hooks & Detection     ████████░░░░░░░░░░
├─ Day 3-4: Landscape Prompt      ░░░░░░░░████████░░
└─ Day 5:   Touch Targets         ░░░░░░░░░░░░░░░░██

WEEK 2: UI PATTERNS
├─ Day 1-2: Bottom Sheet          ████████████░░░░░░
├─ Day 3-4: Tabs & Mobile Layout  ░░░░░░░░░░░░██████
└─ Day 5:   FAB Menu              ░░░░░░░░░░░░░░░░██

WEEK 3: WORKFLOWS
├─ Day 1-2: Formation Picker      ████████░░░░░░░░░░
├─ Day 3:   Auto-Defense          ░░░░░░░░████░░░░░░
├─ Day 4:   Player Drawer         ░░░░░░░░░░░░████░░
└─ Day 5:   Contextual Toolbars   ░░░░░░░░░░░░░░░░██

WEEK 4: POLISH
├─ Day 1-2: Performance           ████████░░░░░░░░░░
├─ Day 3:   Haptics & Feedback    ░░░░░░░░████░░░░░░
└─ Day 4-5: Device Testing        ░░░░░░░░░░░░██████
```

---

## 📅 Week 1: Foundation (Oct 10-16)

### Goal

Make the editor load and work on mobile devices

### Daily Breakdown

#### **Monday, Oct 10** (8 hours)

**Morning (4h)**: Device Detection Hooks

- [ ] Create `hooks/useBreakpoint.ts`
  - Detect window width: mobile (< 768px), tablet (768-1023px), desktop (≥ 1024px)
  - Add resize listener
  - Export TypeScript types
- [ ] Create `hooks/useOrientation.ts`
  - Detect portrait vs landscape
  - Use `window.matchMedia('(orientation: portrait)')`
  - Add orientation change listener
- [ ] Test both hooks in `DiagramEditor.tsx`
  - Log current breakpoint and orientation
  - Verify updates on window resize/rotation

**Afternoon (4h)**: Layout Detection Logic

- [ ] Add breakpoint detection to `DiagramEditor.tsx`
- [ ] Console log: "Mobile detected" or "Desktop detected"
- [ ] Test on actual iPhone (use local network IP)
- [ ] Fix any iOS Safari quirks

**Deliverable**: Hooks work, editor detects device type correctly

---

#### **Tuesday, Oct 11** (8 hours)

**Morning (4h)**: Landscape Prompt Component

- [ ] Create `components/LandscapePrompt.tsx`
- [ ] Full-screen overlay with rotation icon
- [ ] Message: "Please rotate your device for the best experience"
- [ ] "Continue in portrait" button (escape hatch)
- [ ] Only show when: `isMobile && isPortrait`

**Afternoon (4h)**: Styling & Animation

- [ ] Add CSS animation for rotation icon (spin or bounce)
- [ ] Test on iPhone in portrait mode
- [ ] Ensure prompt disappears when rotated to landscape
- [ ] Add fade-in/fade-out transitions
- [ ] Test "Continue in portrait" override

**Deliverable**: Landscape prompt works on all mobile devices

---

#### **Wednesday, Oct 12** (8 hours)

**Full Day**: Touch Target Audit & Updates

- [ ] **PlayerControls.tsx** (9am-12pm)
  - Change all button classes: `h-8` → `h-12` (32px → 48px)
  - Update padding: `px-2 py-1` → `px-4 py-3`
  - Add spacing: `gap-2` → `gap-3`
  - Test tapping accuracy on iPhone
- [ ] **CameraControls.tsx** (1pm-2pm)
  - Increase zoom buttons from 40px → 48px
  - Add more padding around buttons
  - Test on smallest device (iPhone SE)
- [ ] **PlayerSprite.ts** (2pm-4pm)
  - Increase hit area from 24px → 40px
  - Add larger invisible touch zone around sprite
  - Test dragging players on touchscreen
- [ ] **Testing** (4pm-5pm)
  - Try tapping all buttons on real iPhone
  - Measure error rate (accidental taps)
  - Fix any too-small targets

**Deliverable**: All touch targets meet 44px minimum

---

#### **Thursday, Oct 13** (8 hours)

**Morning (4h)**: Responsive Layout Structure

- [ ] Create `layouts/MobileLayout.tsx` stub
  - Just show canvas + placeholder text for bottom sheet
- [ ] Create `layouts/DesktopLayout.tsx`
  - Move existing sidebar layout here
- [ ] Update `DiagramEditor.tsx`
  - `{isMobile ? <MobileLayout /> : <DesktopLayout />}`

**Afternoon (4h)**: Initial Mobile Styling

- [ ] Mobile header: smaller height, icon-only buttons
- [ ] Canvas: use 100% height minus header/bottom bar
- [ ] Add placeholder bottom bar (80px height)
- [ ] Test layout on iPhone landscape

**Deliverable**: Layout switches between mobile/desktop correctly

---

#### **Friday, Oct 14** (8 hours)

**Full Day**: Testing & Bug Fixes

- [ ] Test on 3+ devices (iPhone, iPad, Android)
- [ ] Fix iOS Safari viewport issues
- [ ] Fix Android Chrome gesture conflicts
- [ ] Verify all Week 1 features work
- [ ] Document any issues for next week
- [ ] Demo to team (30min)

**Deliverable**: Week 1 features stable on all devices

---

## 📅 Week 2: UI Patterns (Oct 17-23)

### Goal

Implement native mobile interaction patterns

### Daily Breakdown

#### **Monday, Oct 17** (8 hours)

**Full Day**: Bottom Sheet Component

- [ ] Install gesture library: `npm install @use-gesture/react`
- [ ] Create `components/BottomSheet.tsx`
  - Use `useDrag` from @use-gesture/react
  - Three snap points: 80px, 50%, 90%
  - Smooth spring animations
  - Backdrop with tap-to-close
- [ ] Test dragging up/down with finger
- [ ] Snap to nearest point on release

**Deliverable**: Bottom sheet drags smoothly with snap points

---

#### **Tuesday, Oct 18** (8 hours)

**Morning (4h)**: Tab Bar Component

- [ ] Create tab bar with 5 tabs
  - 👥 Players
  - 🏈 Formations
  - 🛡️ Defense
  - 📐 Align
  - ⚙️ Settings
- [ ] Add icons from Icon component
- [ ] Active tab highlighted
- [ ] Horizontal scroll on narrow screens

**Afternoon (4h)**: Tab Content Structure

- [ ] Create `tabs/PlayersTab.tsx` stub
- [ ] Create `tabs/FormationsTab.tsx` stub
- [ ] Create `tabs/DefenseTab.tsx` stub
- [ ] Create `tabs/AlignTab.tsx` stub
- [ ] Create `tabs/SettingsTab.tsx` stub
- [ ] Wire up tab switching

**Deliverable**: Tab bar switches between 5 tabs

---

#### **Wednesday, Oct 19** (10 hours)

**Full Day**: Extract PlayerControls into Tabs

- [ ] **PlayersTab.tsx** (2h)
  - Add Offense/Defense buttons
  - Selected player info
  - Quick actions: Flip, Copy, Delete
- [ ] **FormationsTab.tsx** (2h)
  - Placeholder for formation grid (build next week)
  - For now, show list of formation names
- [ ] **DefenseTab.tsx** (2h)
  - Auto-Match Defense button
  - Manual scheme buttons
  - Clear Defense button
- [ ] **AlignTab.tsx** (2h)
  - Align buttons (left, center, right, top, middle, bottom)
  - Distribute buttons (horizontal, vertical)
  - Space buttons
- [ ] **SettingsTab.tsx** (2h)
  - Field position dropdown
  - Color mode selector
  - Quality settings (for next week)

**Deliverable**: All PlayerControls functionality moved to tabs

---

#### **Thursday, Oct 20** (8 hours)

**Morning (4h)**: Floating Action Button (FAB)

- [ ] Create `components/FloatingActionButton.tsx`
- [ ] Position in bottom-right corner (16px padding)
- [ ] Plus icon when collapsed
- [ ] X icon when expanded
- [ ] Click to toggle

**Afternoon (4h)**: Radial Menu

- [ ] Add 4 menu items at angles (0°, 45°, 90°, 135°)
  - Add Player (top)
  - Formation (left)
  - Clear All (bottom-left)
  - Undo (top-left)
- [ ] Animate items flying out on expand
- [ ] Test tapping each menu item

**Deliverable**: FAB menu works and looks great

---

#### **Friday, Oct 21** (8 hours)

**Morning (4h)**: Wire Up Mobile Layout

- [ ] Add BottomSheet to MobileLayout
- [ ] Add FAB to MobileLayout
- [ ] Connect tabs to app state
- [ ] Test all interactions

**Afternoon (4h)**: Testing & Polish

- [ ] Test on 3+ devices
- [ ] Fix gesture conflicts (bottom sheet vs canvas pan)
- [ ] Ensure 60fps animations
- [ ] Demo to team

**Deliverable**: Complete mobile UI working end-to-end

---

## 📅 Week 3: Workflows (Oct 24-30)

### Goal

Optimize common tasks for mobile speed

### Daily Breakdown

#### **Monday, Oct 24** (8 hours)

**Full Day**: Visual Formation Picker

- [ ] Create mini SVG icons for formations (2h)
  - 2x2: 4 dots in box formation
  - 3x1 Left: 3 dots left, 1 right
  - Trips Right: 3 dots right, 1 left
  - Empty: 5 dots spread wide
  - etc.
- [ ] Build `components/FormationPicker.tsx` (4h)
  - 3-column grid layout
  - Each cell: icon + name + preview
  - Tap to trigger formation insertion
  - Confirmation toast
- [ ] Wire up to FormationsTab (1h)
- [ ] Test tapping each formation (1h)

**Deliverable**: Formation picker grid works, formations insert on tap

---

#### **Tuesday, Oct 25** (6 hours)

**Morning (3h)**: Auto-Match Defense Logic

- [ ] Create `utils/autoDefense.ts`
- [ ] Implement mapping:
  - 2x2 → Nickel 4-2-5
  - 3x1 → Cover 3 Sky
  - Empty → Cover 2 Man
  - Trips → Cover 3 Cloud
- [ ] Wire up "Auto-Match Defense" button in DefenseTab

**Afternoon (3h)**: Toast Notifications

- [ ] Show toast on auto-defense: "4-2-5 Nickel vs 2x2"
- [ ] Show toast on formation insert: "2x2 formation applied"
- [ ] Test on mobile (toast positioning)

**Deliverable**: Auto-defense button works, shows helpful toasts

---

#### **Wednesday, Oct 26** (8 hours)

**Full Day**: Player Properties Drawer

- [ ] Create `components/PlayerPropertiesDrawer.tsx` (4h)
  - Slide up from bottom (above bottom sheet)
  - Show selected player info
  - Grid of quick actions (2x2):
    - Flip Side, Edit Position
    - Copy, Delete
  - Position details (X, Y, team)
  - Swipe down to close
- [ ] Wire up to player selection (2h)
  - Show when player is tapped
  - Hide when deselected
- [ ] Test interactions (2h)
  - Tap player → drawer appears
  - Tap quick action → player updated
  - Swipe down → drawer closes

**Deliverable**: Player drawer works perfectly

---

#### **Thursday, Oct 27** (8 hours)

**Morning (4h)**: Contextual Toolbars

- [ ] Create `components/ContextualToolbar.tsx`
- [ ] Detect selection state:
  - 0 selected: Show "Add Player", "Formation"
  - 1 selected: Show "Move", "Copy", "Delete"
  - 2+ selected: Show "Align", "Distribute", "Space"
- [ ] Position at bottom (above keyboard safe area)

**Afternoon (4h)**: Wire Up & Test

- [ ] Connect to player selection state
- [ ] Test switching between contexts
- [ ] Ensure doesn't block bottom sheet
- [ ] Test on narrow screens

**Deliverable**: Contextual toolbar shows right actions

---

#### **Friday, Oct 28** (8 hours)

**Full Day**: Integration & Workflow Testing

- [ ] Test complete workflow (4h):
  1. Open app on iPhone
  2. Rotate to landscape (if needed)
  3. Swipe up bottom sheet
  4. Tap "2x2" formation thumbnail
  5. Tap "Auto-Match Defense"
  6. Drag a player to adjust
  7. Tap player → properties drawer
  8. Tap "Copy" → duplicate player
  9. Save diagram
- [ ] Time the workflow: should be < 30 seconds (1h)
- [ ] Fix any UX friction (2h)
- [ ] Demo to team (1h)

**Deliverable**: Complete mobile workflow is fast and smooth

---

## 📅 Week 4: Polish (Oct 31 - Nov 6)

### Goal

60fps performance, haptics, and comprehensive testing

### Daily Breakdown

#### **Monday, Oct 31** (8 hours)

**Full Day**: Performance Optimization

- [ ] Profile Pixi.js rendering (2h)
  - Use Chrome DevTools Performance tab
  - Identify slow frames
  - Check draw call count
- [ ] Detect GPU tier (2h)
  - Read `gl.getParameter(gl.RENDERER)`
  - Categorize: high, medium, low
  - Store in localStorage
- [ ] Implement quality settings (2h)
  - High: Full detail (desktop default)
  - Medium: Reduced yard lines
  - Low: Flat field, essential lines only
- [ ] Auto-select quality on first load (1h)
- [ ] Test on low-end Android (1h)

**Deliverable**: Runs at 30fps+ on all devices

---

#### **Tuesday, Nov 1** (6 hours)

**Morning (3h)**: Haptic Feedback

- [ ] Create `utils/haptics.ts`
- [ ] Implement vibration wrapper:
  ```typescript
  export function hapticLight() {
    navigator.vibrate(10);
  }
  export function hapticMedium() {
    navigator.vibrate(20);
  }
  export function hapticHeavy() {
    navigator.vibrate(30);
  }
  ```
- [ ] Add haptics to interactions:
  - Button press → light
  - Player grab → medium
  - Formation insert → heavy

**Afternoon (3h)**: Touch Feedback Animations

- [ ] Add scale down on press: `active:scale-95`
- [ ] Add ripple effect (CSS or Framer Motion)
- [ ] Loading spinners for async actions
- [ ] Test on iPhone and Android

**Deliverable**: Haptics and animations feel great

---

#### **Wednesday, Nov 2** (8 hours)

**Full Day**: Device Testing Marathon

- [ ] **iPhone SE** (1.5h)
  - Test on smallest screen (667px landscape)
  - Ensure all buttons fit
  - Fix any overflow issues
- [ ] **iPhone 14 Pro Max** (1.5h)
  - Test on largest screen
  - Verify ProMotion 120Hz works
  - Check dynamic island doesn't block UI
- [ ] **iPad Air** (1.5h)
  - Test tablet layout
  - Verify hybrid UI works
  - Test split-screen mode
- [ ] **Samsung Galaxy S21** (1.5h)
  - Test Android Chrome
  - Check back button behavior
  - Test Android-specific gestures
- [ ] **Budget Android** (1.5h)
  - Test low-end performance
  - Verify quality settings auto-select "Low"
  - Ensure 30fps minimum

**Deliverable**: Works great on 5+ devices

---

#### **Thursday, Nov 3** (8 hours)

**Full Day**: iOS Safari Fixes

- [ ] Viewport issues (2h)
  - Add proper meta viewport tag
  - Fix safe area insets (notch, home indicator)
  - Test on multiple iOS versions (15, 16, 17)
- [ ] Gesture conflicts (2h)
  - Disable double-tap zoom: `touch-action: manipulation`
  - Fix rubber band scrolling
  - Prevent overscroll bounce
- [ ] Scrolling issues (2h)
  - Use `-webkit-overflow-scrolling: touch`
  - Fix momentum scrolling in bottom sheet
  - Test tab content scrolling
- [ ] Other quirks (2h)
  - Fix input focus zoom
  - Test landscape orientation lock
  - Verify haptics work on iOS

**Deliverable**: iOS Safari works perfectly

---

#### **Friday, Nov 4** (8 hours)

**Morning (4h)**: Final Bug Fixes

- [ ] Fix any remaining issues from testing
- [ ] Ensure all features work on mobile and desktop
- [ ] Test edge cases (no players, max players, etc.)
- [ ] Verify error handling

**Afternoon (4h)**: Documentation & Demo

- [ ] Update README with mobile instructions
- [ ] Document mobile-specific features
- [ ] Create demo video (30-60 seconds)
- [ ] Prepare presentation for team
- [ ] Demo to full team (1 hour)

**Deliverable**: Ready to ship! 🚀

---

## 📊 Effort Breakdown

### Total Hours by Phase

- **Week 1 (Foundation)**: 40 hours
- **Week 2 (UI Patterns)**: 42 hours
- **Week 3 (Workflows)**: 38 hours
- **Week 4 (Polish)**: 38 hours
- **Total**: 158 hours (~4 weeks for 1 developer)

### Hours by Task Type

- **Component Development**: 60 hours (38%)
- **Testing & QA**: 35 hours (22%)
- **Bug Fixes & Polish**: 28 hours (18%)
- **Performance Optimization**: 15 hours (9%)
- **Integration & Wiring**: 20 hours (13%)

### Critical Path

```
Foundation Hooks → Landscape Prompt → Touch Targets → Bottom Sheet →
Tabs → FAB → Formation Picker → Auto-Defense → Player Drawer →
Performance → Testing → Ship
```

---

## 🎯 Milestones

- **End of Week 1**: ✅ Loads on mobile, landscape prompt works
- **End of Week 2**: ✅ Bottom sheet, tabs, FAB all functional
- **End of Week 3**: ✅ Formation picker, auto-defense working
- **End of Week 4**: ✅ 60fps, tested on 5+ devices, ready to ship

---

## 🚨 Risks & Mitigation

### Risk 1: Gesture Conflicts

**Risk**: Bottom sheet drag conflicts with canvas pan  
**Mitigation**: Priority system - bottom sheet handle captures first, canvas responds to two-finger only when sheet is open  
**Time Buffer**: 4 extra hours in Week 2

### Risk 2: iOS Safari Quirks

**Risk**: Viewport and scrolling issues on iOS  
**Mitigation**: Dedicated full day for iOS testing (Week 4, Thursday)  
**Time Buffer**: Can extend to Friday if needed

### Risk 3: Performance on Low-End Devices

**Risk**: Pixi.js rendering too slow on budget Android  
**Mitigation**: Quality settings, GPU detection, adaptive rendering  
**Time Buffer**: Full day for performance (Week 4, Monday)

### Risk 4: Scope Creep

**Risk**: Adding features not in roadmap  
**Mitigation**: Strict scope - save advanced features (voice, Apple Pencil) for Phase 5  
**Time Buffer**: Week 4 Friday is flexible for overflow

---

## ✅ Definition of Done

### Week 1 Complete When:

- [ ] Editor detects mobile/tablet/desktop correctly
- [ ] Landscape prompt shows on mobile portrait
- [ ] All touch targets are 44px+ and tappable
- [ ] Layout switches between mobile/desktop layouts
- [ ] Works on iPhone SE, iPhone 14, iPad

### Week 2 Complete When:

- [ ] Bottom sheet drags smoothly with 3 snap points
- [ ] 5 tabs switch correctly (Players, Formations, Defense, Align, Settings)
- [ ] FAB menu shows 4 quick actions in radial layout
- [ ] All PlayerControls functionality moved to tabs
- [ ] 60fps animations on iPhone 11+

### Week 3 Complete When:

- [ ] Formation picker shows grid of 9+ formations
- [ ] Tapping formation inserts instantly (< 1 second)
- [ ] Auto-Match Defense button applies correct scheme
- [ ] Player properties drawer slides up on selection
- [ ] Complete workflow (add players → formation → defense → save) takes < 30 seconds

### Week 4 Complete When:

- [ ] Runs at 60fps on iPhone 11+, 30fps on iPhone 8
- [ ] Haptic feedback feels natural
- [ ] Tested on 5+ devices (iPhone SE, 14, iPad, Android)
- [ ] All iOS Safari issues fixed
- [ ] Documentation complete
- [ ] Demo video recorded

### Ready to Ship When:

- [ ] All 4 weeks complete
- [ ] No critical bugs
- [ ] Performance metrics hit (60fps, < 500KB bundle, < 1s load)
- [ ] Team has approved
- [ ] Coaches have tested and given feedback

---

## 🎉 Success!

**After 4 weeks, coaches will be able to:**

1. ✅ Open BoxCall on iPhone during halftime
2. ✅ Rotate to landscape (prompted if needed)
3. ✅ Tap "2x2" formation - instantly applied
4. ✅ Tap "Auto-Defense" - Nickel 4-2-5 applied
5. ✅ Drag players with finger to adjust
6. ✅ Save diagram
7. ✅ All in under 60 seconds
8. ✅ Smooth 60fps experience
9. ✅ Haptic feedback on every interaction
10. ✅ Works on any modern phone or tablet

**This will revolutionize how coaches diagram plays.** 🚀

Let's do this! 💪

---

## 📞 Weekly Check-ins

- **Monday 9am**: Week kickoff, review goals
- **Wednesday 3pm**: Mid-week progress check
- **Friday 4pm**: Demo + retrospective

## 📧 Questions or Issues?

Contact project lead immediately if:

- Behind schedule by > 4 hours
- Discovered critical blocker
- Need help with device testing
- Stuck on technical issue

**Let's ship an amazing mobile experience! 🎉**
