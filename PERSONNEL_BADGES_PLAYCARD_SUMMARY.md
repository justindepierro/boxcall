# Personnel Badge Integration - Play Cards

## Summary

Added personnel configuration badges to both tile and list view play cards, completing the visual integration of the personnel system across the application.

## Changes Made

### 1. PlayCardTileHeader.tsx

- **Location**: After formation type (f_type) badge, before phase badge
- **Badge Style**: Jade/green theme matching the personnel system (`bg-jade-100 text-jade-700 border-jade-300`)
- **Conditional Rendering**: Only shows if `optimisticPlay.personnel` has a value
- **Lines Modified**: ~187-200 (in the badge container section)

### 2. PlayCardListHeader.tsx

- **Location**: After formation type (f_type) badge, before phase badge
- **Badge Style**: Same jade/green theme for visual consistency
- **Conditional Rendering**: Only shows if `optimisticPlay.personnel` has a value
- **Lines Modified**: ~75-90 (in the badge container section)

## Visual Design

### Badge Appearance

```tsx
{
  optimisticPlay.personnel && (
    <span className="px-2 py-0.5 bg-jade-100 text-jade-700 border border-jade-300 rounded-full text-xs font-medium">
      {optimisticPlay.personnel}
    </span>
  );
}
```

### Badge Order (Both Views)

1. **Play Type Badge** - Color-coded by play type (Pass/Run/RPO/etc.)
2. **Formation Type Badge** - Gray, shows formation type
3. **Personnel Badge** ✨ NEW - Jade/green, shows personnel config (e.g., "11 Personnel")
4. **Phase Badge** - Warning yellow, shows game phase

## Color Theme Rationale

- Used jade/green (`bg-jade-100 text-jade-700 border-jade-300`) to:
  - Match the personnel system's existing color scheme
  - Create visual consistency with the DiagramEditor personnel badge
  - Differentiate from formation (gray) and phase (yellow) badges
  - Align with the personnel theme established in Phase 5

## Data Flow

- Personnel value comes from `play.personnel` field (optional string)
- Populated when users select a personnel configuration in the diagram editor
- Falls back to graceful hiding if not set (conditional rendering)
- No default value to avoid cluttering cards for plays without personnel

## Testing Checklist

- [ ] Tile view shows personnel badge when personnel is set
- [ ] List view shows personnel badge when personnel is set
- [ ] Badge does not appear if personnel is null/undefined
- [ ] Badge displays correctly in both light and dark modes
- [ ] Badge wraps properly with other badges in narrow containers
- [ ] Text is readable and properly sized
- [ ] Border and background colors meet accessibility standards

## Future Enhancements (Optional)

- Add personnel icon next to text (e.g., user group icon)
- Make badge clickable to filter by personnel
- Add tooltip showing full personnel configuration details
- Consider adding personnel filter to playbook filter bar

## Related Files

- `/src/components/playbook/play-card/PlayCardTileHeader.tsx` - Tile view badges
- `/src/components/playbook/play-card/PlayCardListHeader.tsx` - List view badges
- `/src/types/play.ts` - Play type with personnel field
- `/src/components/diagram/DiagramEditor.tsx` - Source of personnel data

## Phase 5 Integration Complete

This change completes the visual integration of the personnel system:

1. ✅ Personnel configurations in database
2. ✅ Personnel modal for creating/editing configurations
3. ✅ Personnel in diagram editor (auto-load, position, labels)
4. ✅ Personnel badge in diagram header
5. ✅ **Personnel badges on play cards** (NEW)

The personnel system is now fully visible and integrated throughout the application!
