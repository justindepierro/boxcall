# Personnel Badge Implementation Summary

## What Changed

### 1. Created PersonnelBadge Component

**File**: `src/components/playbook/PersonnelBadge.tsx`

A new badge component that displays personnel configurations (e.g., "11 Personnel", "12 Personnel") with:

- Clean, compact design
- Blue/electric color scheme (matches system aesthetic)
- Users icon for visual identification
- Two sizes: `sm` and `md`
- Graceful handling of empty/null personnel

### 2. Replaced FormationBadge with PersonnelBadge

**Files Updated**:

- `src/components/playbook/play-card/PlayCardListHeader.tsx`
- `src/components/playbook/play-card/PlayCardTileHeader.tsx`

**Why**: Formation badges were redundant since formation names already appear in the play display name (e.g., "Twins Left Same Power Read Right"). Personnel information is more valuable and not duplicated elsewhere.

**Changes**:

- Removed `FormationBadge` import and usage
- Added `PersonnelBadge` import and usage
- Simplified badge display logic
- Now shows: **Play Type** → **Personnel** → **Phase** (if applicable)

### 3. Direction Display Format Enhancement

**File**: `src/utils/playNameUtils.ts`

Enhanced the `getDisplayName` function to respect the direction format preference:

- **Full**: "Left" / "Right"
- **Abbrev**: "Lt" / "Rt"
- **Letter**: "L" / "R"

This ensures consistency between:

- Play card display names
- Inline edit field labels
- Quick filter toggle preferences

## How to Use Personnel Badges

### Setting Personnel on Plays

Personnel can be set through:

1. **Inline editing** in the play card (if personnel field is visible)
2. **Bulk actions** (if implemented)
3. **Direct database updates** (personnel column in plays table)

### Custom Personnel Options

The system supports custom personnel configurations through the `personnel_configurations` table. Common formats include:

- "11 Personnel" (1 RB, 1 TE, 3 WR)
- "12 Personnel" (1 RB, 2 TE, 2 WR)
- "10 Personnel" (1 RB, 0 TE, 4 WR)
- "21 Personnel" (2 RB, 1 TE, 2 WR)
- "22 Personnel" (2 RB, 2 TE, 1 WR)
- Custom configurations (any text)

### Badge Display Behavior

**Shows Badge When**:

- Play has `personnel` field populated
- Value is not null or empty string

**Hidden When**:

- Play has no personnel assigned
- Personnel field is null/undefined/empty

## Visual Changes

### Before

```
[Run] [Twins Badge with Formation Icon] [Phase Badge]
```

### After

```
[Run] [11 Personnel Badge with Users Icon] [Phase Badge]
```

## Benefits

1. **Reduced Redundancy**: Formation name already in play title
2. **More Useful Info**: Personnel groupings are critical for play organization
3. **Custom Support**: Works with your custom personnel system
4. **Cleaner UI**: Less visual clutter, more relevant information
5. **Consistent Formatting**: Direction display respects user preferences

## Next Steps

To populate personnel data:

1. **Add personnel field to play edit UI** (if not already present)
2. **Set default personnel** for existing plays via migration/script
3. **Configure personnel templates** in database using PersonnelService
4. **Link plays to personnel configurations** through inline editing or bulk actions

## Files Modified

1. ✅ `src/components/playbook/PersonnelBadge.tsx` (NEW)
2. ✅ `src/components/playbook/play-card/PlayCardListHeader.tsx`
3. ✅ `src/components/playbook/play-card/PlayCardTileHeader.tsx`
4. ✅ `src/utils/playNameUtils.ts`
5. ✅ `src/components/playbook/PlayCard.tsx`

## Testing

All TypeScript type checks pass ✅

To test:

1. Refresh browser at `localhost:5173/playbook`
2. View plays in list or grid view
3. Personnel badges will appear when plays have personnel data
4. Formation badges are removed (formation still shows in play name)
