# Personnel System - Phase 1 Complete ✅

## Date: October 11, 2025

## What Changed

### PersonnelConfigurationModal.tsx

**Fixed UX to match vision:**

1. **QB Position Locked at Top** 🔒
   - First position is always QB (index === 0)
   - Shows lock icon and disabled state
   - Cannot be changed to any other position
   - Represents the player taking center-QB exchange

2. **Dropdown for Other Positions** 📋
   - Replaced cycling button with proper Select dropdown
   - Options: RB (Running Back), TE (Tight End), WR (Wide Receiver)
   - Clear labels with full position names
   - Clean UI with proper hover states

3. **Only ONE QB Per Configuration** ✅
   - QB locked at top (index 0) ensures only one QB
   - Other positions cannot become QB
   - Maintains proper football personnel structure

4. **Skill Positions Only** 🏈
   - Position options: QB, RB, TE, WR
   - No offensive line in personnel groupings
   - OL assumed to be standard 5 (LT, LG, C, RG, RT)

5. **Wildcat QB Checkbox** 🎯
   - Still available for QB position
   - For trick plays where non-QB takes snap
   - Only shows when position === "QB"

6. **Default 11 Personnel Template** 🎨
   - Auto-created when no configurations exist
   - Default setup:
     - 1 QB (Label: "Q") - LOCKED
     - 1 RB (Label: "R")
     - 1 TE (Label: "T")
     - 2 WR (Labels: "X", "Y")
   - Standard offensive line: LT, LG, C, RG, RT

## Code Changes

### Before:

```tsx
// Cycling button - could cycle through all positions including QB
<button onClick={() => cyclePosition()}>{player.position}</button>
```

### After:

```tsx
{
  /* QB Position - LOCKED */
}
{
  index === 0 ? (
    <div className="... cursor-not-allowed">
      <span>QB</span>
      <Icon name="lock" />
    </div>
  ) : (
    /* Other Positions - Dropdown */
    <Select
      value={player.position}
      options={[
        { value: "RB", label: "RB (Running Back)" },
        { value: "TE", label: "TE (Tight End)" },
        { value: "WR", label: "WR (Wide Receiver)" },
      ]}
    />
  );
}
```

## Visual Design

### QB Row (LOCKED):

```
┌─────────────────────────────────────────────┐
│  [  Q  ] — [ QB 🔒 ]                       │
│  └label┘    └locked position┘              │
│                                             │
│  ☑ Wildcat QB                              │
└─────────────────────────────────────────────┘
```

### Other Positions (DROPDOWN):

```
┌─────────────────────────────────────────────┐
│  [  R  ] — [ RB (Running Back) ▼ ]         │
│  └label┘    └dropdown selector┘            │
└─────────────────────────────────────────────┘
```

## Default Configuration

**11 Personnel (Standard):**

- **Name:** "11 Personnel"
- **Description:** 1 RB, 1 TE, 2 WR
- **Positions:**
  1. QB - "Q" (LOCKED) ← Center-QB exchange
  2. RB - "R" (Dropdown: RB/TE/WR)
  3. TE - "T" (Dropdown: RB/TE/WR)
  4. WR - "X" (Dropdown: RB/TE/WR)
  5. WR - "Y" (Dropdown: RB/TE/WR)
- **Offensive Line:**
  - LT, LG, C, RG, RT (standard)

## Type Safety

All changes maintain strict TypeScript types:

- `PlayerPosition = "QB" | "RB" | "TE" | "WR"`
- `isWildcatQB?: boolean` (optional)
- No type errors, all checks pass ✅

## Testing Checklist

### Manual Testing:

- [ ] Open Personnel modal - defaults to 11 Personnel
- [ ] QB position shows lock icon and is disabled
- [ ] Other positions show dropdown with RB/TE/WR options
- [ ] Can change RB to TE or WR via dropdown
- [ ] Can change WR to RB or TE via dropdown
- [ ] Cannot change any position to QB (not in dropdown)
- [ ] Wildcat QB checkbox only appears for QB row
- [ ] Labels can be edited (3 char max, uppercase)
- [ ] Add New button creates another config with same structure
- [ ] Save button persists changes
- [ ] Mobile: BottomSheet works correctly
- [ ] Desktop: Modal works correctly

### Integration Testing (Future):

- [ ] Personnel config saves to database
- [ ] Play creation shows personnel selector
- [ ] Diagram loads correct personnel
- [ ] Analytics show personnel distribution

## Next Steps

### Phase 2: Database Schema

Create tables to persist personnel configurations:

- `personnel_configurations` table
- `personnel_players` table
- RLS policies for team access
- Seed with default 11 Personnel

### Phase 3: Service Layer

Build API service for CRUD operations:

- `personnelService.ts`
- React hooks for data fetching
- Mutations for create/update/delete

### Phase 4: Connect to Plays

Wire personnel into play creation:

- Use existing `plays.personnel` column
- Show selector in AddNewPlayModal
- Display badge on PlayCard

### Phase 5: Diagram Integration

Make diagrams preload personnel:

- Read `play.personnel` from database
- Fetch configuration by name
- Preload player sprites (QB, RB, TE, WR)
- Auto-position on field

## Architecture Alignment

This implementation perfectly aligns with the documented architecture:

- ✅ QB locked at top (center-QB exchange)
- ✅ Only ONE QB per configuration
- ✅ Skill positions only (QB/RB/TE/WR)
- ✅ Dropdown selection for flexibility
- ✅ Wildcat QB for trick plays
- ✅ Default 11 Personnel template
- ✅ Reuses existing `plays.personnel` column
- ✅ Preparation for database integration

See: `docs/PERSONNEL_SYSTEM_ARCHITECTURE.md` for complete system design.

---

**Status:** Phase 1 Complete ✅  
**Next:** Phase 2 - Database Schema  
**Blockers:** None  
**Ready for:** Browser testing, then commit & push
