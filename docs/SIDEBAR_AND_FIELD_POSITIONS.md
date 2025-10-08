# Sidebar Layout & Field Position Presets

**Date**: October 8, 2025  
**Features**: Sidebar controls + Field position presets  
**Status**: ✅ Complete

## Overview

Restructured the diagram editor layout to use a left sidebar for controls instead of a floating bottom action bar. Added field position presets to help coaches quickly set up common scenarios (midfield, backed up, red zone, free draw).

## Layout Changes

### Before (Bottom Action Bar)
```
┌─────────────────────────────────────┐
│          Header                     │
├─────────────────────────────────────┤
│                                     │
│      Canvas (Full Width)            │
│                                     │
│  ┌──────────────┐                  │
│  │ Player Ctrl  │                  │
│  │ (Floating)   │                  │
│  └──────────────┘                  │
└─────────────────────────────────────┘
```

### After (Left Sidebar)
```
┌─────────────────────────────────────┐
│          Header                     │
├──────┬──────────────────────────────┤
│      │                              │
│ Side │       Canvas                 │
│ bar  │    (Right-aligned)           │
│      │                              │
│ Ctrl │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

## Benefits

### Better Use of Space
- **Sidebar width**: 256px (w-64) - fixed width
- **Canvas area**: Expands to fill remaining space
- **No overlap**: Controls don't obstruct field view
- **Scrollable**: Sidebar can scroll for additional controls

### Coach-Friendly Workflow
- Controls always visible on left
- Natural reading/editing flow (left to right)
- Room for more control sections
- Better organization with sections

## Field Position Presets

Added 4 preset scenarios to help coaches quickly set up plays:

### 1. 🏟️ Midfield (Default)
- **Line of Scrimmage**: 25 yards (50-yard line / center)
- **Use Case**: Normal plays, neutral field position
- **Visible Area**: Full 35-yard section centered on midfield

### 2. 🔙 Backed Up
- **Line of Scrimmage**: 5 yards (10-yard line)
- **Use Case**: Backed up against own end zone, limited space
- **Visible Area**: Shows endzone and 10-20 yard area
- **Notes**: Good for goal-line stand defense, punt situations

### 3. 🎯 Red Zone
- **Line of Scrimmage**: 30 yards (10-yard line from opponent's endzone)
- **Use Case**: Scoring position, red zone plays
- **Visible Area**: Shows opponent's endzone and scoring area
- **Notes**: Perfect for touchdown plays, 2-point conversions

### 4. ✏️ Free Draw
- **Line of Scrimmage**: Hidden (no amber line)
- **Use Case**: Generic play design, no specific field position
- **Visible Area**: Full field with all markings
- **Notes**: Best for teaching concepts, route design without context

## Implementation Details

### DiagramEditor.tsx Changes

**Added State:**
```typescript
export type FieldPosition = "midfield" | "backed-up" | "red-zone" | "free-draw";
const [fieldPosition, setFieldPosition] = useState<FieldPosition>("midfield");
```

**Field Position Handler:**
```typescript
const handleFieldPositionChange = (position: FieldPosition) => {
  setFieldPosition(position);
  
  if (app) {
    const fieldLayer = app.getFieldLayer();
    if (fieldLayer) {
      switch (position) {
        case "midfield":
          fieldLayer.setLineOfScrimmage(25, true); // Center
          break;
        case "backed-up":
          fieldLayer.setLineOfScrimmage(5, true); // Near own endzone
          break;
        case "red-zone":
          fieldLayer.setLineOfScrimmage(30, true); // Near opponent endzone
          break;
        case "free-draw":
          fieldLayer.setLineOfScrimmage(25, false); // Hide LOS
          break;
      }
    }
  }
};
```

**Layout Structure:**
```tsx
<div className="flex-1 flex overflow-hidden">
  {/* Left Sidebar */}
  <div className="w-64 bg-surface-card border-r border-border flex-shrink-0 overflow-y-auto">
    <PlayerControls />
  </div>

  {/* Canvas Area */}
  <div className="flex-1 relative overflow-hidden bg-surface-secondary">
    <DiagramCanvas {...props} />
  </div>
</div>
```

### PlayerControls.tsx Changes

**Removed:**
- Absolute positioning (`absolute bottom-4 left-4`)
- Floating card styles
- Compact horizontal layout

**Added:**
- Full-height layout (`flex flex-col h-full`)
- Sectioned organization (Header, Controls, Help)
- Better visual hierarchy
- Selection info panel
- Quick tips footer
- Multi-select status display

**New Structure:**
```tsx
<div className="flex flex-col h-full">
  {/* Header */}
  <div className="p-4 border-b">
    <h2>Players</h2>
    <p>{count} total • {selected} selected</p>
  </div>

  {/* Controls (scrollable) */}
  <div className="flex-1 p-4 overflow-y-auto">
    <section>Add Players</section>
    <section>Edit</section>
    <section>Selection Info</section>
  </div>

  {/* Help Footer */}
  <div className="p-4 border-t">
    <h3>Quick Tips</h3>
    <ul>Tips...</ul>
  </div>
</div>
```

## User Experience Improvements

### Header Controls
- **Field Position Dropdown**: Easy switching between scenarios
- **Color Mode Toggle**: Still available, right-aligned
- **Close Button**: Consistent position

### Sidebar Sections

#### 1. Header
- Shows total player count
- Shows selected player count
- Visual hierarchy with larger text

#### 2. Add Players
- Full-width buttons (easier to click)
- Color-coded (blue = offense, red = defense)
- Clear labels with "+" prefix

#### 3. Edit Section
- Remove selected (disabled when nothing selected)
- Clear all (disabled when no players)
- Tooltips hint at keyboard shortcuts

#### 4. Selection Info (when player selected)
- Jersey number display
- Team affiliation
- Hint about Shift+click multi-select

#### 5. Quick Tips Footer
- Always visible at bottom
- Keyboard shortcuts
- Interaction hints
- Beginner-friendly

## CSS/Tailwind Classes Used

### Sidebar Container
- `w-64`: Fixed 256px width
- `bg-surface-card`: Card background token
- `border-r border-border`: Right border separator
- `flex-shrink-0`: Prevent shrinking
- `overflow-y-auto`: Scroll if content exceeds height

### Section Styling
- `p-4`: Consistent padding (16px)
- `border-t` / `border-b`: Section dividers
- `space-y-2` / `space-y-4`: Vertical spacing
- `overflow-y-auto`: Scrollable content area

### Button Styling
- `w-full`: Full width of sidebar
- `px-4 py-2`: Comfortable click targets
- `rounded-lg`: Rounded corners
- `transition-all`: Smooth hover effects
- `active:scale-95`: Tactile press feedback

## Responsive Considerations

### Current Implementation
- **Desktop**: Sidebar + Canvas layout works perfectly
- **Tablet**: May need adjustment (sidebar could be narrower)
- **Mobile**: Will need drawer/overlay approach

### Future Enhancements (Not Implemented)
```typescript
// Mobile breakpoint handling
const [sidebarOpen, setSidebarOpen] = useState(false);

// On mobile: hamburger menu, drawer overlay
// On tablet: narrower sidebar (w-48 instead of w-64)
// On desktop: current layout
```

## Zoom Removal Rationale

### Why No Zoom/Pan?
1. **Rendering Complexity**: Camera transforms complicate coordinate systems
2. **Field Position Presets**: Provide better UX than manual zooming
3. **Consistent Coordinate System**: Simpler mental model for coaches
4. **Touch Interactions**: Easier without zoom gestures
5. **Print/Export**: Fixed scale ensures consistent output

### Alternative Approach
Instead of zoom/pan, we use **field position presets**:
- Coaches think in scenarios (midfield, red zone), not zoom levels
- Presets are faster than manual adjustment
- Each preset optimizes for specific use case
- No accidental zoom-out during editing

## Testing Checklist

- ✅ Sidebar renders on left side
- ✅ Canvas fills remaining space
- ✅ Field position dropdown in header
- ✅ All 4 presets work correctly
- ✅ Line of scrimmage updates on preset change
- ✅ Free draw mode hides LOS line
- ✅ Sidebar sections properly organized
- ✅ Buttons full width and clickable
- ✅ Selection info shows when player selected
- ✅ Quick tips always visible at bottom
- ✅ No overlapping UI elements
- ✅ Scrollable sidebar when content exceeds height

## Related Files

### Modified
- `DiagramEditor.tsx` - Layout structure, field position state
- `PlayerControls.tsx` - Sidebar styling, sectioned layout

### Types/Interfaces
```typescript
// DiagramEditor.tsx
export type FieldPosition = "midfield" | "backed-up" | "red-zone" | "free-draw";

export interface DiagramEditorProps {
  onClose?: () => void;
}
```

## Next Steps

### Priority 1: Smart Alignment Guides
- Pink/magenta guides like Google Slides
- Vertical/horizontal alignment detection
- Equal spacing detection (3+ players)
- Snap-to-guide visual feedback

### Priority 2: Snap-to Features
- Alt key to enable snapping
- Snap to other players
- Snap to yard lines
- Snap to hash marks

### Priority 3: Keyboard Controls
- Arrow keys to nudge (0.5 yard)
- Shift+arrows for larger moves (1 yard)
- Delete/Backspace to remove selected
- Keyboard-first workflow for power users

## Screenshots

### Before
![Bottom action bar overlapping field view]

### After
![Clean sidebar layout with organized controls]

## Conclusion

The sidebar layout provides a cleaner, more professional interface for coaches to design plays. Field position presets offer a better UX than zoom/pan, with instant switching between common scenarios. The organized control sections make the tool more discoverable and easier to learn.

**Impact**: Better space utilization, clearer organization, faster workflow for coaches setting up common play scenarios.
