# Play Diagram Editor - Mobile-First Roadmap 📱⚡

**Last Updated**: October 10, 2025  
**Status**: Planning Phase - Ready for Implementation  
**Priority**: HIGH - Mobile experience is critical for coaches on the field

---

## 🎯 Vision Statement

Transform the Play Diagram Editor into a **mobile-first, coach-friendly** tool that works seamlessly on smartphones and tablets. Coaches should be able to diagram plays on the sideline, during practice, or while watching film - all with an optimized mobile workflow that's faster and more intuitive than desktop.

---

## 📊 Current State Analysis

### ✅ What's Working (Desktop)

- ✅ Elite Pixi.js WebGL rendering
- ✅ Smart Defense System with formation analysis
- ✅ PlayerControls with 20+ preset formations
- ✅ Alignment tools (distribute, space, align)
- ✅ Copy/paste, undo/redo functionality
- ✅ Drag-to-select box selection
- ✅ Keyboard shortcuts (arrows, delete, etc.)
- ✅ CameraControls (zoom/pan)

### ⚠️ Mobile Challenges

- ❌ **Sidebar takes 33% of screen width** (too much on mobile)
- ❌ **PlayerControls has 1,960+ lines** with dense desktop UI
- ❌ **No landscape orientation locking**
- ❌ **Small touch targets** (buttons designed for mouse)
- ❌ **Toolbar buttons overflow** on narrow screens
- ❌ **No gesture controls** (pinch-to-zoom implemented but not optimized)
- ❌ **Desktop keyboard shortcuts** don't work on mobile
- ❌ **No mobile-specific workflows** (collapsible panels, bottom sheets, etc.)

### 🔍 Key Insight

> **The current UI assumes 1200px+ screens with mouse/keyboard.** Mobile needs:
>
> - Landscape-first orientation
> - Collapsible/slideable panels
> - Bottom action sheets instead of sidebars
> - Larger touch targets (44px minimum)
> - Gesture-based interactions
> - Progressive disclosure of controls

---

## 🗺️ Implementation Roadmap

### **PHASE 1: Mobile Foundation** 🏗️

_Goal: Make the editor usable on mobile devices_

#### 1.1 Responsive Layout System

- [ ] **Implement breakpoint detection hook** (`useBreakpoint`)
  ```typescript
  // hooks/useBreakpoint.ts
  export type Breakpoint = "mobile" | "tablet" | "desktop";
  export function useBreakpoint(): Breakpoint;
  ```
- [ ] **Add landscape orientation detection** (`useOrientation`)
  ```typescript
  // hooks/useOrientation.ts
  export type Orientation = "portrait" | "landscape";
  export function useOrientation(): Orientation;
  ```
- [ ] **Create mobile-specific layout component**
  - Desktop: Sidebar (33%) + Canvas (67%)
  - Mobile Portrait: Show orientation prompt → force landscape
  - Mobile Landscape: Bottom sheet (collapsible) + Canvas (90%+)

**Files to modify:**

- `src/components/playbook/diagram-editor/DiagramEditor.tsx` (line 21-599)
- Create `src/components/playbook/diagram-editor/hooks/useBreakpoint.ts`
- Create `src/components/playbook/diagram-editor/hooks/useOrientation.ts`

#### 1.2 Landscape Orientation Lock

- [ ] **Detect mobile devices** (iOS, Android, tablets)
- [ ] **Show landscape prompt on portrait load**
  - Full-screen overlay with rotation icon
  - "Please rotate your device for the best experience"
  - Allow override with "Continue in portrait" button
- [ ] **Use CSS `orientation: landscape` media queries**
- [ ] **Add meta viewport tag optimization** for mobile

**Implementation:**

```typescript
// components/LandscapePrompt.tsx
export const LandscapePrompt: React.FC = () => {
  const orientation = useOrientation();
  const isMobile = useBreakpoint() === 'mobile';

  if (!isMobile || orientation === 'landscape') return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-surface flex items-center justify-center">
      <div className="text-center p-8">
        <Icon name="rotate-cw" size="3xl" className="animate-spin-slow" />
        <h2 className="text-2xl font-bold mt-4">Rotate Your Device</h2>
        <p className="text-content-secondary mt-2">
          This editor works best in landscape mode
        </p>
        <button className="mt-6 text-sm underline">
          Continue in portrait (not recommended)
        </button>
      </div>
    </div>
  );
};
```

#### 1.3 Touch Target Optimization

- [ ] **Audit all interactive elements** for touch target size
- [ ] **Increase button sizes to 44px minimum** (Apple HIG)
- [ ] **Add padding/spacing between buttons** (8px minimum)
- [ ] **Increase PlayerSprite hit area** (currently ~24px → 40px)

**Files to modify:**

- `src/components/playbook/diagram-editor/sprites/PlayerSprite.ts`
- `src/components/playbook/diagram-editor/components/PlayerControls.tsx` (button classes)
- `src/components/playbook/diagram-editor/components/CameraControls.tsx`

---

### **PHASE 2: Mobile UI Patterns** 📱

_Goal: Implement mobile-native interaction patterns_

#### 2.1 Bottom Sheet Panel System

- [ ] **Replace sidebar with bottom sheet on mobile**
  - **Default state**: Collapsed (40px peek with handle)
  - **Expanded states**: Half (50% screen), Full (90% screen)
  - **Gesture**: Swipe up/down to expand/collapse
  - **Close button**: Tap outside or swipe down fully

**Implementation:**

```typescript
// components/BottomSheet.tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[]; // [0.4, 0.5, 0.9] = 40%, 50%, 90%
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  snapPoints = [0.4, 0.5, 0.9],
  children,
}) => {
  // Use react-spring for smooth animations
  // Add gesture handlers for drag
  // Snap to nearest point on release
};
```

#### 2.2 Tabbed Bottom Sheet Content

- [ ] **Split PlayerControls into logical tabs**
  - Tab 1: **Players** (add offense/defense, remove, select)
  - Tab 2: **Formations** (presets: 2x2, 3x1, Empty, etc.)
  - Tab 3: **Defense** (Nickel 4-2-5, Cover 2, Cover 3, etc.)
  - Tab 4: **Align** (distribute, space, align tools)
  - Tab 5: **Settings** (field position, color mode, grid)

**Implementation:**

```typescript
// components/MobilePlayerControls.tsx
export const MobilePlayerControls: React.FC<PlayerControlsProps> = ({ app }) => {
  const [activeTab, setActiveTab] = useState<'players' | 'formations' | 'defense' | 'align' | 'settings'>('players');

  return (
    <BottomSheet>
      {/* Tab Bar */}
      <div className="flex border-b border-border">
        <TabButton active={activeTab === 'players'} onClick={() => setActiveTab('players')}>
          <Icon name="users" /> Players
        </TabButton>
        {/* ... other tabs */}
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto">
        {activeTab === 'players' && <PlayersTab app={app} />}
        {activeTab === 'formations' && <FormationsTab app={app} />}
        {activeTab === 'defense' && <DefenseTab app={app} />}
        {activeTab === 'align' && <AlignTab app={app} />}
        {activeTab === 'settings' && <SettingsTab app={app} />}
      </div>
    </BottomSheet>
  );
};
```

#### 2.3 Floating Action Button (FAB) Menu

- [ ] **Add primary FAB** in bottom-right corner
  - Icon: Plus (+) or menu (☰)
  - Opens radial menu with common actions
  - Actions: Add Player, Add Formation, Clear All, Undo

**Mobile-specific quick actions:**

```typescript
// components/FloatingActionButton.tsx
export const FloatingActionButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Radial menu items (when expanded) */}
      {isExpanded && (
        <>
          <FABItem icon="user" label="Add Player" onClick={handleAddPlayer} angle={0} />
          <FABItem icon="grid" label="Formation" onClick={handleFormation} angle={45} />
          <FABItem icon="trash" label="Clear" onClick={handleClear} angle={90} />
          <FABItem icon="undo" label="Undo" onClick={handleUndo} angle={135} />
        </>
      )}

      {/* Main FAB */}
      <button
        className="w-14 h-14 rounded-full bg-blue-600 shadow-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon name={isExpanded ? 'x' : 'plus'} size="xl" className="text-white" />
      </button>
    </div>
  );
};
```

#### 2.4 Gesture Enhancements

- [ ] **Two-finger pan** (already working via useGestures)
- [ ] **Pinch-to-zoom** (already working via useGestures)
- [ ] **Long-press player** → context menu (copy, delete, properties)
- [ ] **Swipe left/right on bottom sheet** → switch tabs
- [ ] **Double-tap canvas** → reset zoom/center view

**Files to enhance:**

- `src/components/playbook/diagram-editor/hooks/useGestures.ts` (lines 1-165)

---

### **PHASE 3: Mobile Workflows** 🔄

_Goal: Optimize common tasks for mobile_

#### 3.1 Quick Formation Insertion

**Problem**: Desktop flow requires opening dropdown → select formation → confirm. Too many steps on mobile.

**Solution**: Visual formation picker with thumbnails

```typescript
// components/FormationPicker.tsx
export const FormationPicker: React.FC = () => {
  const formations = [
    { id: '2x2', name: '2x2', icon: '🏈', preview: <Mini2x2Icon /> },
    { id: '3x1-left', name: '3x1 Left', icon: '⚡', preview: <Mini3x1LeftIcon /> },
    { id: 'trips-right', name: 'Trips Right', icon: '🔥', preview: <MiniTripsRightIcon /> },
    // ... more formations
  ];

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {formations.map((formation) => (
        <button
          key={formation.id}
          className="aspect-square p-3 rounded-xl bg-surface-secondary hover:bg-surface-tertiary border border-border"
          onClick={() => insertFormation(formation.id)}
        >
          <div className="text-2xl mb-1">{formation.icon}</div>
          <div className="text-xs text-center">{formation.name}</div>
          <div className="mt-2 opacity-60">{formation.preview}</div>
        </button>
      ))}
    </div>
  );
};
```

#### 3.2 One-Tap Defense Matching

**Problem**: Desktop requires formation analysis → open defense dropdown → select scheme. 3 steps.

**Solution**: "Auto-Match Defense" button

- Analyzes current offensive formation
- Automatically applies recommended defensive scheme
- Shows toast notification: "4-2-5 Nickel applied vs 2x2"

```typescript
// utils/autoDefense.ts
export function autoMatchDefense(app: DiagramPixiApp): void {
  const offensePlayers = getOffensePlayers();
  const formation = analyzeFormation(offensePlayers);

  let scheme: DefensiveScheme;
  switch (formation.type) {
    case '2x2':
      scheme = createNickel425Formation({ ... });
      break;
    case '3x1':
      scheme = createCover3Sky({ ... });
      break;
    case 'empty':
      scheme = createCover2Man({ ... });
      break;
    // ... more cases
  }

  applyDefensiveScheme(app, scheme);
  showToast(`${scheme.name} applied vs ${formation.displayName}`);
}
```

#### 3.3 Player Properties Drawer

**Problem**: Desktop uses sidebar for player properties. On mobile, no room.

**Solution**: Slide-up drawer when player is selected

- Shows jersey number, position, alignment
- Quick actions: Flip side, Change position, Remove
- Close with swipe down or tap outside

```typescript
// components/PlayerPropertiesDrawer.tsx
export const PlayerPropertiesDrawer: React.FC = () => {
  const { selectedPlayerId, players, updatePlayer, removePlayer } = useDiagramStore();
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  if (!selectedPlayer) return null;

  return (
    <Drawer isOpen={!!selectedPlayer} onClose={deselectPlayer}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">
          {selectedPlayer.jerseyNumber} - {selectedPlayer.position}
        </h3>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <QuickActionButton
            icon="arrow-left-right"
            label="Flip Side"
            onClick={() => flipPlayerSide(selectedPlayer)}
          />
          <QuickActionButton
            icon="edit"
            label="Edit Position"
            onClick={() => showPositionPicker(selectedPlayer)}
          />
          <QuickActionButton
            icon="copy"
            label="Duplicate"
            onClick={() => duplicatePlayer(selectedPlayer)}
          />
          <QuickActionButton
            icon="trash"
            label="Remove"
            onClick={() => removePlayer(selectedPlayer.id)}
            danger
          />
        </div>

        {/* Position/Alignment Details */}
        <div className="space-y-3">
          <PropertyRow label="X Position" value={`${selectedPlayer.x.toFixed(1)} yd`} />
          <PropertyRow label="Y Position" value={`${selectedPlayer.y.toFixed(1)} yd`} />
          <PropertyRow label="Team" value={selectedPlayer.team} />
        </div>
      </div>
    </Drawer>
  );
};
```

#### 3.4 Contextual Toolbars

**Problem**: Desktop has permanent toolbar. Mobile has limited space.

**Solution**: Show context-sensitive toolbar based on selection

- **No selection**: Show "Add Player" and "Formation" buttons
- **1 player selected**: Show "Move", "Copy", "Delete" buttons
- **2+ players selected**: Show "Align", "Distribute", "Space" buttons

---

### **PHASE 4: Performance & Polish** ⚡

_Goal: Ensure 60fps on all mobile devices_

#### 4.1 Mobile Performance Optimization

- [ ] **Reduce Pixi.js draw calls** on low-end devices
  - Detect GPU capabilities (WebGL 1 vs 2)
  - Use sprite batching more aggressively
  - Reduce field detail on mobile (fewer yard lines, simpler grass texture)
- [ ] **Implement lazy loading for PlayerControls tabs**
  - Only mount active tab component
  - Preload adjacent tabs in background
- [ ] **Optimize bundle size**
  - Code-split mobile-specific components
  - Use dynamic imports for rare features

#### 4.2 Touch Feedback

- [ ] **Add haptic feedback** (iOS/Android vibration API)
  - Light tap on button press
  - Medium tap on player grab
  - Heavy tap on formation insert
- [ ] **Visual press states** for all touch targets
  - Scale down slightly on touch (0.95x)
  - Show ripple effect on tap
  - Loading state for async actions

#### 4.3 Mobile-Specific Settings

- [ ] **Field quality toggle** (High/Medium/Low)
  - High: Full detail (desktop default)
  - Medium: Reduced yard lines, simpler textures
  - Low: Flat green field, essential lines only
- [ ] **Auto-save frequency** (mobile battery consideration)
  - Desktop: Save every 30s
  - Mobile: Save every 60s or on backgrounding
- [ ] **Gesture sensitivity** slider
  - Some users prefer more/less sensitive pan/zoom

---

### **PHASE 5: Advanced Mobile Features** 🚀

_Goal: Mobile-exclusive capabilities_

#### 5.1 Voice Commands (Experimental)

- [ ] **"Add receiver left"** → Adds WR on left side
- [ ] **"2x2 formation"** → Inserts 2x2 preset
- [ ] **"Move player left"** → Nudges selected player left
- [ ] **"Undo"** → Undo last action

**Use Cases:**

- Coaches with gloves/cold hands
- Accessibility for motor impairments
- Hands-free diagramming while watching film

#### 5.2 Camera Integration

- [ ] **Scan whiteboard diagrams** → convert to digital
- [ ] **OCR for play names** written on board
- [ ] **Photo reference** → overlay on canvas for tracing

#### 5.3 Apple Pencil / Stylus Support

- [ ] **Pressure-sensitive route drawing**
- [ ] **Tilt for line thickness**
- [ ] **Palm rejection** when using stylus

#### 5.4 Multi-Device Collaboration (Future)

- [ ] **Real-time sync** between coach's iPad and assistant's phone
- [ ] **Cursor presence** showing what others are editing
- [ ] **Voice chat** while diagramming together

---

## 📐 Design Specifications

### Mobile Breakpoints

```css
/* Mobile Portrait (avoid if possible) */
@media (max-width: 767px) and (orientation: portrait) {
  /* Show landscape prompt */
}

/* Mobile Landscape (primary target) */
@media (max-width: 926px) and (orientation: landscape) {
  /* Bottom sheet layout, larger touch targets */
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  /* Hybrid layout - sidebar but with mobile patterns */
}

/* Tablet Landscape / Desktop */
@media (min-width: 1024px) {
  /* Current desktop layout */
}
```

### Touch Target Sizes

- **Minimum**: 44px × 44px (Apple HIG, Material Design)
- **Comfortable**: 48px × 48px (recommended for primary actions)
- **Large**: 56px × 56px (FAB, critical actions)

### Bottom Sheet Snap Points

- **Peek**: 80px (show handle + tab bar)
- **Half**: 50% of viewport height (quick actions)
- **Full**: 90% of viewport height (detailed editing)

### Animation Guidelines

- **Duration**: 200-300ms (feels instant but smooth)
- **Easing**: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design)
- **Frame rate**: 60fps minimum, 120fps on ProMotion displays

---

## 🏗️ Architecture Changes

### File Structure (New/Modified)

```
src/components/playbook/diagram-editor/
├── hooks/
│   ├── useBreakpoint.ts          [NEW] Device size detection
│   ├── useOrientation.ts         [NEW] Portrait/landscape detection
│   └── useGestures.ts            [MODIFY] Enhanced mobile gestures
├── components/
│   ├── DiagramEditor.tsx         [MODIFY] Responsive layout wrapper
│   ├── LandscapePrompt.tsx       [NEW] Force landscape on mobile
│   ├── BottomSheet.tsx           [NEW] Mobile bottom sheet component
│   ├── MobilePlayerControls.tsx  [NEW] Mobile-optimized controls
│   ├── FloatingActionButton.tsx  [NEW] Mobile FAB menu
│   ├── FormationPicker.tsx       [NEW] Visual formation grid
│   ├── PlayerPropertiesDrawer.tsx [NEW] Slide-up player details
│   └── PlayerControls.tsx        [MODIFY] Desktop-only version
├── layouts/
│   ├── DesktopLayout.tsx         [NEW] Sidebar + canvas
│   ├── MobileLayout.tsx          [NEW] Bottom sheet + canvas
│   └── TabletLayout.tsx          [NEW] Hybrid layout
└── utils/
    ├── autoDefense.ts            [NEW] Auto-match defense logic
    └── haptics.ts                [NEW] Vibration/haptic feedback
```

### Component Hierarchy (Mobile)

```
DiagramEditor
├── LandscapePrompt (mobile portrait only)
├── MobileLayout (mobile)
│   ├── DiagramCanvas (90% height)
│   ├── BottomSheet
│   │   ├── TabBar
│   │   └── TabContent
│   │       ├── PlayersTab
│   │       ├── FormationsTab
│   │       ├── DefenseTab
│   │       ├── AlignTab
│   │       └── SettingsTab
│   ├── FloatingActionButton
│   └── PlayerPropertiesDrawer
└── DesktopLayout (desktop)
    ├── DiagramCanvas (67% width)
    └── PlayerControls (33% width, sidebar)
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Create `useBreakpoint` hook
- [ ] Create `useOrientation` hook
- [ ] Build `LandscapePrompt` component
- [ ] Audit all touch targets, increase to 44px minimum
- [ ] Test on iPhone SE (smallest modern screen)

### Phase 2: UI Patterns (Week 2)

- [ ] Build `BottomSheet` component with gestures
- [ ] Split `PlayerControls` into tabs
- [ ] Create `FloatingActionButton` component
- [ ] Build `MobilePlayerControls` with tabs
- [ ] Test swipe gestures on Android/iOS

### Phase 3: Workflows (Week 3)

- [ ] Build `FormationPicker` with thumbnails
- [ ] Implement `autoMatchDefense` utility
- [ ] Create `PlayerPropertiesDrawer`
- [ ] Add contextual toolbars
- [ ] Test full mobile workflows (add players → formation → defense)

### Phase 4: Polish (Week 4)

- [ ] Mobile performance profiling
- [ ] Add haptic feedback
- [ ] Implement quality settings
- [ ] Test on 5+ different devices
- [ ] Fix any iOS/Android-specific bugs

### Phase 5: Advanced (Future)

- [ ] Experiment with voice commands
- [ ] Camera integration for whiteboard scanning
- [ ] Apple Pencil support
- [ ] Multi-device collaboration

---

## 🎯 Success Metrics

### Performance

- [ ] **60fps** on iPhone 11 and newer
- [ ] **30fps** on iPhone 8 (acceptable minimum)
- [ ] **Bundle size**: < 500KB for mobile code
- [ ] **First render**: < 1 second on 4G connection

### Usability

- [ ] **Task completion**: Add 11 players + formation in < 30 seconds
- [ ] **Error rate**: < 5% accidental taps on wrong elements
- [ ] **User satisfaction**: 4+ stars on mobile usability survey

### Adoption

- [ ] **Mobile usage**: 40%+ of diagram edits happen on mobile
- [ ] **Retention**: Mobile users return 2x/week minimum
- [ ] **Completion rate**: 80%+ of mobile-started diagrams are saved

---

## 🚧 Technical Challenges

### Challenge 1: Bottom Sheet Gestures

**Problem**: Need smooth drag gestures with snap points while still allowing canvas pan/zoom.

**Solution**: Use touch event priority system:

1. Bottom sheet handle always captures vertical drags
2. Canvas only responds to two-finger gestures when sheet is open
3. Sheet collapses automatically when canvas is interacted with

### Challenge 2: Small Screen Real Estate

**Problem**: iPhone SE has only 667px width in landscape.

**Solution**: Progressive disclosure

- Show only essential controls by default
- Use tabs and drawers for advanced features
- Allow users to temporarily hide bottom sheet (swipe down fully)

### Challenge 3: Performance on Low-End Devices

**Problem**: Budget Android phones may struggle with Pixi.js rendering.

**Solution**: Adaptive quality

- Detect GPU tier on load (via WebGL vendor strings)
- Auto-select field quality (High/Medium/Low)
- Reduce particle effects and animations on low tier

### Challenge 4: iOS Safari Quirks

**Problem**: iOS Safari has viewport issues, touch event differences, gesture conflicts.

**Solution**: iOS-specific handling

- Use `-webkit-overflow-scrolling: touch` for smooth scrolling
- Add `touch-action: none` to prevent double-tap zoom
- Test thoroughly on iOS 15, 16, 17

---

## 📚 References

### Mobile Design Guidelines

- [Apple Human Interface Guidelines - Touch](https://developer.apple.com/design/human-interface-guidelines/touch)
- [Material Design - Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics#28032e45-c598-450c-b355-f9fe737b1cd8)
- [Microsoft Fluent 2 - Mobile](https://fluent2.microsoft.design/mobile)

### Technical Resources

- [Pixi.js Mobile Optimization](https://pixijs.io/guides/basics/render-loop.html)
- [React Spring - Gesture Animations](https://www.react-spring.dev/docs/hooks/use-gesture)
- [iOS Safari Viewport Meta Tags](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag)

### Inspiration (Mobile Drawing Apps)

- **Procreate** (iPad) - Gesture-based UI, radial menus
- **Concepts** (iOS/Android) - Infinite canvas, precision tools
- **Adobe Fresco** (iPad) - Touch-optimized drawing workflows

---

## 🎉 Next Steps

1. **Review with team** - Get feedback on roadmap priorities
2. **Create design mockups** - High-fidelity screens for mobile layout
3. **Set up test devices** - iPhone SE, iPhone 14, iPad Air, Samsung Galaxy S21
4. **Start Phase 1** - Build foundation hooks and landscape prompt
5. **Iterate quickly** - Test on real devices every 2-3 days

---

**This is going to be amazing!** 🚀 A mobile-first diagram editor will set BoxCall apart from every other playbook tool on the market. Coaches will be able to draw plays anywhere, anytime, with the same power as desktop.

Let's build it! 💪
