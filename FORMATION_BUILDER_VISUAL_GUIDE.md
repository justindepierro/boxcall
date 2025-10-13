# Formation Builder UI - Visual Guide

## What You'll See in the Browser

### Formation Manager Modal

```
┌────────────────────────────────────────────────────────────────┐
│                      Formation Manager                    [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ ⚙️ Edit Details│ 🔗 Link      │ ✏️ Draw       │              │
│  │  (Active)    │  Formations  │  Formation   │              │
│  └──────────────┴──────────────┴──────────────┘              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Select Formation                                        │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  [Choose a formation to edit... (12 available)    ▼]   │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### After Selecting a Formation

```
┌────────────────────────────────────────────────────────────────┐
│                      Formation Manager                    [×]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ ⚙️ Edit Details│ 🔗 Link      │ ✏️ Draw       │              │
│  │  (Active)    │  Formations  │  Formation   │              │
│  └──────────────┴──────────────┴──────────────┘              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Select Formation                                        │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  [Twins (Left)                                     ▼]   │  │
│  │                                                         │  │
│  │  ┌───────────────────────────────────────────────────┐ │  │
│  │  │ Formation Badge: Twins (L)                        │ │  │
│  │  │ ☑ Apply changes to both left and right variants  │ │  │
│  │  └───────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Personnel Packages                                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Select which personnel packages can run this formation: │  │
│  │                                                         │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐         │  │
│  │  │ ✓ 11 Pers  │ │ 12 Pers    │ │ 10 Pers    │         │  │
│  │  └────────────┘ └────────────┘ └────────────┘         │  │
│  │                                                         │  │
│  │  ✓ 2 personnel packages selected                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Formation Category                                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  [Spread                                           ▼]   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Formation Type                                    ⬅️ NEW│  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Base formation structure (I Formation, Shotgun, etc.)   │  │
│  │                                                         │  │
│  │  [Shotgun                                          ▼]   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Run Strength                                      ⬅️ NEW│  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Default run strength (can be modified by back position  │  │
│  │ in plays)                                               │  │
│  │                                                         │  │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐            │  │
│  │  │     ←     │ │    ⚖️     │ │     →     │            │  │
│  │  │   Left    │ │ Balanced  │ │   Right   │            │  │
│  │  └───────────┘ └═══════════┘ └───────────┘            │  │
│  │                  (Active)                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Pass Strength                                     ⬅️ NEW│  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Default pass strength (future: can be modified by       │  │
│  │ receiver alignment)                                     │  │
│  │                                                         │  │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐            │  │
│  │  │     ←     │ │    ⚖️     │ │     →     │            │  │
│  │  │   Left    │ │ Balanced  │ │   Right   │            │  │
│  │  └───────────┘ └───────────┘ └═══════════┘            │  │
│  │                                  (Active)               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Tags                                                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Comma-separated tags for filtering                     │  │
│  │                                                         │  │
│  │  [twins, compressed, stack                        ]    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Description                                             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  ┌───────────────────────────────────────────────────┐ │  │
│  │  │ Strong passing formation with quick outside       │ │  │
│  │  │ receivers                                         │ │  │
│  │  │                                                   │ │  │
│  │  └───────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│                            ┌────────────────────┐             │
│                            │ 💾 Save Formation  │             │
│                            └────────────────────┘             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Play Card - Formation Section

### Before (Old Design)

```
┌─────────────────────────────────────────────┐
│ Formation:                                  │
│ ─────────────────────────────────────────── │
│                                             │
│  Formation:   [Twins             ▼]        │
│  Personnel:   [11 Personnel      ▼]        │
│  Direction:   [L                 ▼]        │
│  Type:        [Shotgun           ▼]  ❌    │
│  Back Align:  [Near              ▼]        │
│  Shift:       [________________    ]        │
│  Motion:      [________________    ]        │
│  Run Str:     [Balanced          ▼]  ❌    │
│  Pass Str:    [Right             ▼]  ❌    │
│                                             │
└─────────────────────────────────────────────┘
```

### After (New Design)

```
┌─────────────────────────────────────────────┐
│ Formation:                                  │
│ ─────────────────────────────────────────── │
│                                             │
│  Formation:     [Twins             ▼]      │
│  Personnel:     [11 Personnel      ▼]      │
│  Direction:     [L                 ▼]      │
│  Back Align:    [Near              ▼]      │
│  Back Position: ☑ ← Left of QB             │
│                 ☐ → Right of QB      ✨ NEW│
│  Shift:         [________________    ]      │
│  Motion:        [________________    ]      │
│                                             │
└─────────────────────────────────────────────┘
```

**Improvements:**

- ✅ Removed 3 redundant fields (Type, Run Str, Pass Str)
- ✅ Added Back Position checkboxes (cleaner, more intuitive)
- ✅ Cleaner layout with better spacing
- ✅ Values inherited from formation automatically

---

## Button States

### Run/Pass Strength Buttons

**Inactive State:**

```
┌───────────┐
│     ←     │  ← Gray border
│   Left    │  ← Gray text
└───────────┘  ← White background
  (Hover: light gray background)
```

**Active State:**

```
┌═══════════┐
║    ⚖️     ║  ← Blue border (2px)
║ Balanced  ║  ← Blue text
└═══════════┘  ← Light blue background
  (Primary-500 border, Primary-50 bg)
```

---

## Interactive Behavior

### Formation Type Dropdown

```
Click dropdown:
  ┌─────────────────────────┐
  │ No type specified       │
  ├─────────────────────────┤
  │ I Formation             │
  │ Singleback              │
  │ Pistol                  │
  │ Shotgun              ✓  │  ← Selected
  │ Empty                   │
  │ Trips                   │
  │ Bunch                   │
  │ Stack                   │
  │ Wing                    │
  │ Other                   │
  └─────────────────────────┘
```

### Strength Button Click Flow

```
1. User clicks "Left" button
   └─> Button gets blue border/background
   └─> Other buttons become inactive (gray)

2. State updates immediately
   └─> runStrength = 'left'

3. User clicks "Save Formation"
   └─> API call to FormationService.updateFormation()
   └─> Database updated
   └─> Success message shown
```

### Back Position Checkboxes

```
1. User checks "← Left of QB"
   └─> Checkbox fills with checkmark
   └─> Auto-save triggers (500ms debounce)

2. Play updates in database
   └─> back_left_of_qb = true

3. Strength calculation updates
   └─> Formation: Balanced + Back Left → Effective: LEFT
   └─> (Future: display shows modifier indicator)
```

---

## Visual Hierarchy

### Typography Sizes

```
Formation Manager (Modal Title)         → headline-lg
Section Headings (Personnel, Tags)     → headline-sm
Help Text (descriptions)                → caption
Button Labels                           → body-sm
Form Values                             → body-md
```

### Spacing

```
Between Sections:       spacing-lg (16px)
Section Padding:        spacing-md (12px)
Button Gap:            spacing-sm (8px)
Label-Input Gap:       spacing-xs (4px)
```

### Colors

**Light Mode:**

```
Active Button:
  - Border:     #3B82F6 (primary-500)
  - Background: #EFF6FF (primary-50)
  - Text:       #1E40AF (primary-700)

Inactive Button:
  - Border:     #E5E7EB (border-primary)
  - Background: #FFFFFF (surface-primary)
  - Text:       #6B7280 (text-secondary)

Hover:
  - Border:     #93C5FD (primary-300)
  - Background: #F9FAFB (surface-muted)
```

**Dark Mode:**

```
(Automatically handled by Tailwind design tokens)
```

---

## Accessibility

### Keyboard Navigation

```
Tab Order:
  1. Formation Selector (dropdown)
  2. Personnel Buttons (left-to-right)
  3. Category Dropdown
  4. Formation Type Dropdown
  5. Run Strength - Left Button
  6. Run Strength - Balanced Button
  7. Run Strength - Right Button
  8. Pass Strength - Left Button
  9. Pass Strength - Balanced Button
  10. Pass Strength - Right Button
  11. Tags Input
  12. Description Textarea
  13. Save Button
```

### Screen Readers

```
Formation Type Dropdown:
  "Formation Type, combo box, Shotgun selected"

Run Strength Buttons:
  "Run Strength, Left, button"
  "Run Strength, Balanced, button, pressed"
  "Run Strength, Right, button"

Back Position Checkboxes:
  "Back Position, Left of QB, checkbox, not checked"
  "Back Position, Right of QB, checkbox, checked"
```

### Focus States

```
All interactive elements:
  - Visible focus ring (2px blue outline)
  - focus:outline-none focus:ring-2 focus:ring-primary-500
```

---

## Responsive Behavior

### Desktop (>768px)

```
- Modal: 800px wide (xl size)
- Button groups: flex-row (side-by-side)
- Form: Single column, full width
```

### Tablet (768px - 1024px)

```
- Modal: 90% width, max 800px
- Button groups: flex-row (still fits)
- Form: Single column
```

### Mobile (<768px)

```
- Modal: Full width with padding
- Button groups: May stack if too narrow
- Form: Single column, smaller padding
```

---

## Animation & Transitions

### Button Hover

```css
transition-all
/* Smooth color/border changes over 150ms */
```

### Dropdown Open

```
Native browser dropdown animation
(instant open, no custom animation needed)
```

### Save Button Click

```
1. Text changes: "Save Formation" → "Saving..."
2. Button disabled (opacity reduced)
3. API call
4. Success alert
5. Text reverts: "Saving..." → "Save Formation"
```

### Auto-save (Play Card)

```
1. User checks checkbox
2. 500ms debounce wait
3. Silent background save
4. No UI feedback (unless error)
```

---

## Error States

### Validation Errors

```
┌─────────────────────────────────────────┐
│ ⚠️ Please select a formation first      │
└─────────────────────────────────────────┘
(Shows if user clicks Save without selection)
```

### Save Errors

```
┌─────────────────────────────────────────┐
│ ❌ Failed to save formation.            │
│    Please try again.                    │
└─────────────────────────────────────────┘
(Shows if API call fails)
```

### Success Messages

```
┌─────────────────────────────────────────┐
│ ✅ Formation updated successfully!      │
│    Changes applied to both left and     │
│    right variants.                      │
└─────────────────────────────────────────┘
```

---

## Testing in Browser

### Quick Test Flow

1. Open your app at `http://localhost:5173`
2. Navigate to Formation Manager
3. Click "Edit Details" tab
4. Select a formation from dropdown
5. Look for three NEW sections:
   - Formation Type (dropdown)
   - Run Strength (3 buttons)
   - Pass Strength (3 buttons)
6. Click buttons, change values
7. Click "Save Formation"
8. Verify success message
9. Reload page
10. Verify values persist

### Visual Checklist

- [ ] Formation Type dropdown has 10 options + "No type"
- [ ] Run Strength shows ← ⚖️ → icons
- [ ] Pass Strength shows ← ⚖️ → icons
- [ ] Active buttons have blue border/background
- [ ] Hover effect works on inactive buttons
- [ ] Help text is readable
- [ ] Spacing looks clean and consistent
- [ ] Save button works
- [ ] Success message appears
- [ ] Values persist after reload

---

## Comparison: Before vs After

### Formation Metadata Management

**Before:**
❌ Set type/strength on EVERY play (tedious)
❌ Inconsistent values across plays
❌ No centralized control
❌ Hard to bulk update

**After:**
✅ Set once on formation (efficient)
✅ Automatic inheritance (consistent)
✅ Centralized management
✅ Easy bulk updates with "Apply to both sides"

### Play Card UX

**Before:**
❌ 9 fields in formation section (cluttered)
❌ Redundant dropdowns (confusing)
❌ Manual entry for every play

**After:**
✅ 6 fields in formation section (clean)
✅ Values inherited (automatic)
✅ Simple checkboxes for modifiers

### Developer Experience

**Before:**
❌ Duplicate data everywhere
❌ No type safety for strengths
❌ Manual validation needed

**After:**
✅ Single source of truth
✅ Full TypeScript coverage
✅ Compile-time validation

---

_Visual guide created: October 13, 2025_
_Status: Ready for UI/UX testing_ 🎨
