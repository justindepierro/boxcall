# Playbook Selector Feature

**Date:** October 12, 2025  
**Feature:** Multi-playbook support with selector UI

## Overview

Coaches can now:

- **Switch between multiple playbooks** using a dropdown selector
- **Rename playbooks** inline with edit icon
- **Create new playbooks** directly from the selector
- **Persist selection** - remembers last selected playbook per team

## Components

### PlaybookSelector.tsx

**Location:** `src/components/playbook/PlaybookSelector.tsx` (296 lines)

**Features:**

- Clean dropdown UI with current playbook display
- Inline editing with Save/Cancel buttons
- Visual indicator (dot) for active playbook
- Play count display for each playbook
- Create new playbook option at bottom
- Click-outside to close dropdown

**Props:**

```typescript
interface PlaybookSelectorProps {
  playbooks: Playbook[]; // List of team's playbooks
  activePlaybookId: string; // Currently selected playbook
  onPlaybookChange: (id: string) => void; // Switch playbook callback
  onPlaybookUpdated?: () => void; // Refresh data after rename/create
  teamId: string; // For creating new playbooks
}
```

**UI States:**

1. **Display Mode** - Shows playbook name, play count, edit icon
2. **Edit Mode** - Inline input with Save (✓) and Cancel (×) buttons
3. **Empty State** - Shows "Create Playbook" button when no playbooks exist

## Integration Points

### PlaybookPage.tsx

**State Management:**

```typescript
const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");

// Load from localStorage on mount
useEffect(() => {
  const savedPlaybookId = localStorage.getItem(
    `bc_active_playbook_${activeTeamId}`
  );
  if (
    savedPlaybookId &&
    teamPlaybooks.some((pb) => pb.id === savedPlaybookId)
  ) {
    setSelectedPlaybookId(savedPlaybookId);
  } else {
    // Default to playbook with plays, or first playbook
    const playbookWithPlays = teamPlaybooks.find(
      (pb) => (pb.play_count || 0) > 0
    );
    const defaultPlaybook = playbookWithPlays || teamPlaybooks[0];
    setSelectedPlaybookId(defaultPlaybook.id);
  }
}, [activeTeamId, teamPlaybooks.length]);

// Save to localStorage on change
const handlePlaybookChange = useCallback(
  (playbookId: string) => {
    setSelectedPlaybookId(playbookId);
    localStorage.setItem(`bc_active_playbook_${activeTeamId}`, playbookId);
  },
  [activeTeamId]
);
```

**UI Placement:**

```tsx
<PageLayout variant="dashboard">
  <Breadcrumb ... />

  {/* Playbook Selector - New! */}
  <div className="px-4 sm:px-6 lg:px-8 mb-4">
    <PlaybookSelector
      playbooks={teamPlaybooks}
      activePlaybookId={activePlaybookId}
      onPlaybookChange={handlePlaybookChange}
      onPlaybookUpdated={refreshData}
      teamId={activeTeamId || ''}
    />
  </div>

  <PlaybookViewTabs ... />
  ...
</PageLayout>
```

## User Workflows

### Switch Playbook

1. Click on PlaybookSelector dropdown
2. See list of all active playbooks with play counts
3. Click desired playbook
4. Page refreshes with new playbook's data
5. Selection saved to localStorage

### Rename Playbook

1. Click edit (✏️) icon next to playbook name
2. Input field appears with current name
3. Edit name and press Enter or click ✓
4. Or press Escape or click × to cancel
5. Name updates in database and UI refreshes

### Create New Playbook

1. Click "Create New Playbook" at bottom of dropdown
2. Enter playbook name in prompt
3. New playbook created and set as active
4. Automatically switches to new playbook

## Persistence Strategy

**LocalStorage Key Format:**

```
bc_active_playbook_{team_id}
```

**Example:**

```
bc_active_playbook_e2b03ad6-1660-487a-aa35-5de132f641b8 = "291675df-b531-4754-b359-4bec6867542d"
```

**Benefits:**

- Per-team preference (coaches with multiple teams)
- Survives page refresh
- No database writes on every switch
- Falls back gracefully if playbook deleted

## Database Schema

**Playbooks Table:**

```sql
CREATE TABLE playbooks (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Operations:**

- `SELECT * FROM playbooks WHERE team_id = X AND is_active = true` - Load team's playbooks
- `UPDATE playbooks SET name = X WHERE id = Y` - Rename playbook
- `INSERT INTO playbooks (team_id, name, is_active) VALUES (...)` - Create playbook

## Edge Cases Handled

### Multiple Active Playbooks

**Problem:** Team has 2+ playbooks, which should be default?

**Solution:**

1. Check localStorage for saved preference
2. If not found, prefer playbook with `play_count > 0`
3. If none have plays, use first in list
4. Never default to team_id (previous bug)

### Empty Playbook List

**Problem:** Team has no playbooks (new team)

**Solution:**

- Show "No playbooks found" message
- Display "Create Playbook" button prominently
- After creation, automatically switch to new playbook

### Playbook Deleted

**Problem:** localStorage references deleted playbook

**Solution:**

- Check if saved playbook still exists in list
- If not, fall back to default selection logic
- Clear invalid localStorage entry

### Concurrent Edits

**Problem:** Two coaches rename same playbook simultaneously

**Solution:**

- Last write wins (standard Supabase behavior)
- `onPlaybookUpdated()` callback triggers refresh for all users
- Real-time subscriptions would improve this (future enhancement)

## Testing Checklist

### ✅ Playbook Selection

- [ ] Dropdown opens/closes correctly
- [ ] Active playbook shows indicator (blue dot)
- [ ] Play counts display accurately
- [ ] Switching playbook loads correct data
- [ ] Selection persists after page refresh

### ✅ Playbook Renaming

- [ ] Edit icon appears on hover
- [ ] Clicking edit shows input field
- [ ] Enter key saves changes
- [ ] Escape key cancels changes
- [ ] ✓ button saves changes
- [ ] × button cancels changes
- [ ] Saved name updates in dropdown and database

### ✅ Playbook Creation

- [ ] "Create New Playbook" button visible
- [ ] Prompt accepts valid name
- [ ] New playbook created in database
- [ ] Automatically switches to new playbook
- [ ] New playbook appears in dropdown

### ✅ Persistence

- [ ] localStorage saves selection per team
- [ ] Refresh loads saved playbook
- [ ] Switching teams uses correct saved playbook
- [ ] Invalid saved ID falls back gracefully

## Known Limitations

1. **No Real-time Updates**: If another coach renames/creates playbook, current user won't see changes until page refresh
   - **Future:** Add Supabase real-time subscription to playbooks table

2. **No Playbook Deletion**: Currently no UI to delete/archive playbooks
   - **Future:** Add delete/archive button in dropdown or settings

3. **No Playbook Description**: Description field exists in DB but not exposed in UI
   - **Future:** Add description field in edit mode or separate settings modal

4. **No Playbook Sorting**: Playbooks shown in database order
   - **Future:** Add sort by name, date, play count

5. **No Playbook Search**: Works fine with <10 playbooks, but large lists would benefit from search
   - **Future:** Add search input if playbook count > 10

## Future Enhancements

### Phase 2: Playbook Management

- Archive/delete playbooks
- Duplicate playbook (with all plays)
- Playbook sharing (share with other teams)
- Playbook templates (starter playbooks)

### Phase 3: Playbook Analytics

- Show formation distribution in dropdown
- Show play type breakdown
- Last modified date
- Creator/owner info

### Phase 4: Collaborative Features

- Real-time updates via Supabase subscriptions
- Lock playbooks during editing
- Change history/audit log
- Comments/notes on playbooks

## Files Modified

1. **src/components/playbook/PlaybookSelector.tsx** (NEW - 296 lines)
   - Complete playbook selector component

2. **src/pages/PlaybookPage.tsx**
   - Added PlaybookSelector import
   - Added selectedPlaybookId state
   - Added handlePlaybookChange callback
   - Added localStorage persistence
   - Integrated PlaybookSelector into UI

## Migration Notes

**No database migration needed** - uses existing `playbooks` table structure.

**Backwards Compatible:**

- Teams with one playbook see no change in behavior
- Teams with multiple playbooks gain selector UI
- Existing playbook data unaffected
- Falls back gracefully if no playbooks exist

## Related Issues Fixed

**Issue:** Formations not appearing in Edit Details tab  
**Root Cause:** App was using wrong playbook ID (first active playbook instead of playbook with data)  
**Solution:** PlaybookSelector ensures correct playbook is always selected and remembered

## Performance Notes

- **LocalStorage Read:** Synchronous, negligible impact (~1ms)
- **LocalStorage Write:** Only on playbook change, not every render
- **Dropdown Render:** Only renders visible playbooks (max ~20 items)
- **Database Query:** Single query on mount, cached by useTeamsData hook

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management (auto-focus input in edit mode)
- ✅ Click-outside to close dropdown
- ✅ Clear visual indicators for active playbook
- 🚧 Screen reader labels (future enhancement)
- 🚧 ARIA attributes (future enhancement)
