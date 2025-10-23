# Quick Actions Status Indicators - Complete ✅

## Overview

Added visual status indicators to Quick Actions buttons on play cards to show:

- ✓ **Checkmarks** for completed items (Diagram, Assignments)
- **Number badges** showing usage counts (Practice Scripts, Game Plans)

## Implementation Summary

### 1. New Hook: `usePlayStatus.ts`

**Location:** `/src/hooks/usePlayStatus.ts`

**Purpose:** Fetch real-time status data for each play from the database

**Returns:**

```typescript
interface PlayStatus {
  hasDiagram: boolean; // From play.diagram_url
  hasAssignments: boolean; // Count from play_assignments table
  practiceCount: number; // Count from practice_script_plays table
  gamePlanCount: number; // Count from game_plan_plays table
}
```

**Database Queries:**

- `play_assignments` - Checks if play has any assignments
- `practice_script_plays` - Counts practice scripts containing this play
- `game_plan_plays` - Counts game plans containing this play

### 2. Updated Component: `PlayCardQuickActions.tsx`

**Location:** `/src/components/playbook/play-card/PlayCardQuickActions.tsx`

**Changes:**

- Imported and used `usePlayStatus` hook
- Wrapped each button in a `<div className="relative">` for positioning badges
- Added status indicators with absolute positioning

## Visual Design

### Checkmark Indicators (Diagram & Assignments)

- **Position:** Top-right corner of button
- **Design:** Small circle badge with check icon
- **Color:** Green (`bg-success-500` / `dark:bg-success-400`)
- **Size:** `w-4 h-4` with white check icon
- **Tooltip:** Descriptive text on hover

### Count Badges (Practice & Game Plan)

- **Position:** Top-right corner of button
- **Design:** Rounded pill badge with number
- **Colors:**
  - Practice: Blue (`bg-info-500` / `dark:bg-info-400`)
  - Game Plan: Green (`bg-success-500` / `dark:bg-success-400`)
- **Size:** `min-w-5 h-5` with `text-xs` font
- **Tooltip:** Shows full count with pluralization

## Status Indicator Logic

### 1. Diagram ✓

- **Shows when:** `play.diagram_url` exists
- **Indicator:** Green checkmark
- **Tooltip:** "Diagram created"

### 2. Practice Count

- **Shows when:** `status.practiceCount > 0`
- **Indicator:** Blue number badge
- **Tooltip:** "Used in X practice script(s)"

### 3. Game Plan Count

- **Shows when:** `status.gamePlanCount > 0`
- **Indicator:** Green number badge
- **Tooltip:** "Used in X game plan(s)"

### 4. Assignments ✓

- **Shows when:** `status.hasAssignments` is true
- **Indicator:** Green checkmark
- **Tooltip:** "Assignments created"

## User Experience

### Before

- No visual indication of completion status
- Users had to click buttons to check if data existed
- No way to see usage across practice/game plans

### After

- **At-a-glance status** - Immediate visual feedback
- **Usage visibility** - See how often plays are used
- **Completion tracking** - Green checks show completed tasks
- **Hover details** - Tooltips provide exact counts

## Performance Considerations

### Optimization Strategy

- **Per-play queries:** Each play card makes 3 database queries
- **Lightweight:** Only fetches counts, not full data
- **Cached:** React hook with dependency array prevents unnecessary re-fetches
- **Future enhancement:** Could batch queries at page level for better performance with many plays

### Database Impact

- Uses `SELECT count(*) FROM table WHERE play_id = ?`
- Leverages existing indexes on foreign keys
- Head-only queries (`{ count: "exact", head: true }`)

## Testing Checklist

### Visual Tests

- [ ] Checkmark appears on Diagram button when `diagram_url` exists
- [ ] Checkmark appears on Assignments when assignments exist
- [ ] Blue count badge shows on Practice button when used in scripts
- [ ] Green count badge shows on Game Plan button when used in plans
- [ ] Badges positioned correctly in both tile and list views
- [ ] Badges visible in both light and dark modes

### Functional Tests

- [ ] Tooltips show correct text on hover
- [ ] Counts update when play is added to practice/game plan
- [ ] Checkmarks appear after creating diagram/assignments
- [ ] No console errors in browser
- [ ] Performance acceptable with 50+ plays on page

### Edge Cases

- [ ] Count badges display correctly for double-digit numbers (10+)
- [ ] No visual overlap between button text and badges
- [ ] Badges don't interfere with button click areas
- [ ] Handles plays with no status indicators gracefully

## Files Modified

1. **Created:** `src/hooks/usePlayStatus.ts` (81 lines)
   - Custom React hook for fetching play status
   - Supabase queries for counts
   - TypeScript interface for PlayStatus

2. **Modified:** `src/components/playbook/play-card/PlayCardQuickActions.tsx` (~140 lines)
   - Added hook usage
   - Wrapped buttons in relative containers
   - Added 4 conditional status indicators
   - Added tooltips with dynamic text

## Next Steps (Optional Enhancements)

### Performance Optimization

- Batch all status queries at PlaybookPage level
- Pass status data down as props instead of per-card queries
- Reduce from N\*3 queries to 3 queries total

### Feature Additions

- Click badge to view list of practice scripts/game plans using this play
- Different badge colors for primary vs. secondary usage
- Animation when count changes
- Warning indicator if play hasn't been practiced recently

### Analytics Integration

- Track which plays are most/least used
- Dashboard showing completion percentages
- Recommendations for plays needing diagrams/assignments

## Design Tokens Used

- **Colors:**
  - `success-500`, `success-400` (green)
  - `info-500`, `info-400` (blue)
  - `text-white`

- **Spacing:**
  - `-top-1`, `-right-1` (badge positioning)
  - `min-w-5`, `h-5` (badge size)
  - `px-1` (badge padding)

- **Typography:**
  - `text-xs` (count text)
  - `font-semibold`
  - `leading-none`

## Summary

This feature provides immediate visual feedback for play completion and usage, helping coaches:

- See which plays need diagrams or assignments
- Identify most/least practiced plays
- Track game plan utilization
- Make data-driven decisions about playbook organization

All status data is pulled from the database in real-time, ensuring accuracy across the app.
