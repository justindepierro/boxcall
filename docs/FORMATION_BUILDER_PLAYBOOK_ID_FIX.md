# Formation Builder Playbook ID Fix

**Date:** October 12, 2025  
**Issue:** Edit Details tab showed "No formations found" despite having 6 formations in database

## Root Cause Analysis

### The Problem

The FormationBuilderModal was receiving **`team_id`** instead of **`playbook_id`**:

```typescript
// ❌ BEFORE - PlaybookPage.tsx line 1244
<FormationBuilderModal
  playbookId={activeTeamId || ""}  // e2b03ad6-1660-487a-aa35-5de132f641b8 (team_id)
/>
```

### Why It Failed

- **Formations Table Schema:** `formations.playbook_id` → UUID foreign key to `playbooks.id`
- **Database State:** 6 formations stored with `playbook_id = 291675df-b531-4754-b359-4bec6867542d`
- **Query:** `FormationService.getFormationsByPlaybook(team_id)` returned 0 results
- **Result:** Edit Details tab showed empty state

### Console Logs That Revealed the Issue

```
FormationBuilderPanel.tsx:41 🏗️ FormationBuilderPanel MOUNTED with playbookId: e2b03ad6-1660-487a-aa35-5de132f641b8
formationService.ts:187 📊 FormationService query result: {dataLength: 0, error: undefined, data: Array(0)}
FormationBuilderPanel.tsx:64 ✅ FormationBuilderPanel loaded: 0 formations []
```

Meanwhile, FormationLinkingPanel worked because it called `importFormationsFromPlays()` which correctly used the formations' playbook_id.

## The Solution

### 1. Import `useTeamsData` Hook

Get access to playbooks array:

```typescript
// PlaybookPage.tsx
import { useTeamsData } from "../hooks/useTeamsData";

export default function PlaybookPage() {
  const { activeTeamId } = useActiveTeamStore();

  // Get playbooks to find the active playbook_id
  const { playbooks } = useTeamsData();
  const activePlaybook = playbooks.find(pb => pb.team_id === activeTeamId && pb.is_active);
  const activePlaybookId = activePlaybook?.id || activeTeamId || ""; // Fallback to team_id
```

### 2. Update Modal Props

Pass correct `activePlaybookId` to both modals:

```typescript
// ✅ AFTER - PlaybookPage.tsx line 1250
<FormationBuilderModal
  playbookId={activePlaybookId}  // 291675df-b531-4754-b359-4bec6867542d (playbook_id)
/>

// ✅ AFTER - PlaybookPage.tsx line 1097
<AddNewPlayModal
  playbookId={activePlaybookId}  // Also fixed for consistency
/>
```

## Database Architecture Context

### Table Relationships

```
teams (team_id: e2b03ad6...)
  └── playbooks (playbook_id: 291675df..., team_id: e2b03ad6...)
      ├── formations (playbook_id: 291675df...)
      ├── plays (playbook_id: 291675df...)
      └── personnel_configurations (playbook_id: 291675df...)
```

### Current State

```bash
# Team: e2b03ad6-1660-487a-aa35-5de132f641b8
Playbook: Test Playbook 2
  ID: 291675df-b531-4754-b359-4bec6867542d  ← Correct playbook_id
  Team ID: e2b03ad6-1660-487a-aa35-5de132f641b8
  Active: true
  Formations: 6 (Twins/Trips × base/left/right)
```

## Bonus Fix: Hide Base Formations with Variants

### User Request

> "we should hide those base formations IF there is a left and right variant of them made from linking"

### Implementation

Added filtering logic in `FormationLinkingPanel.tsx`:

```typescript
// Filter out base formations if they have left/right variants
const visibleFormations = allFormations.filter((formation) => {
  // If direction is 'base', check if variants exist
  if (formation.direction === "base") {
    const hasVariants = allFormations.some(
      (f) =>
        f.name === formation.name &&
        f.direction !== "base" &&
        (f.direction === "left" || f.direction === "right")
    );
    // Only show base formation if no variants exist
    return !hasVariants;
  }
  // Show all non-base formations
  return true;
});

// Use visibleFormations in both dropdowns
{
  visibleFormations.map(renderFormationOption);
}
```

### Behavior

- **Twins (base)**: Hidden because Twins (left) and Twins (right) exist
- **Trips (base)**: Hidden because Trips (left) and Trips (right) exist
- **New Formation (base)**: Would be shown until left/right variants are linked
- **All left/right formations**: Always visible

## Testing Checklist

### ✅ Edit Details Tab

- [ ] Refresh browser (Cmd+R)
- [ ] Click "Formation Manager" button
- [ ] Click "Edit Details" tab
- [ ] **Expected:** Dropdown should show 6 formations
- [ ] Select a formation → Fields populate
- [ ] Edit values and save

### ✅ Link Formations Tab

- [ ] Refresh browser (Cmd+R)
- [ ] Click "Formation Manager" button
- [ ] Click "Link Formations" tab
- [ ] **Expected:** Dropdowns should show only left/right variants (4 formations)
- [ ] **Expected:** Base formations (Twins base, Trips base) hidden

### ✅ Formation Import

- [ ] Create a new play with formation name "Bunch"
- [ ] Open Formation Manager → Link Formations
- [ ] **Expected:** "✨ Imported 1 formation from your plays" message
- [ ] **Expected:** "Bunch (base)" appears in dropdowns (no variants yet)

## Files Modified

1. **src/pages/PlaybookPage.tsx**
   - Added `useTeamsData()` import and usage
   - Computed `activePlaybookId` from playbooks array
   - Updated FormationBuilderModal prop: `playbookId={activePlaybookId}`
   - Updated AddNewPlayModal prop: `playbookId={activePlaybookId}`

2. **src/components/formations/FormationLinkingPanel.tsx**
   - Added `visibleFormations` computed array
   - Filters out base formations that have left/right variants
   - Updated both dropdowns to use `visibleFormations`

3. **scripts/check-database-schema.js**
   - Enhanced to show playbook details (ID, team_id, name, active status)

## Verification Commands

```bash
# Check database state
node scripts/check-database-schema.js

# Expected output:
# Playbook: Test Playbook 2
#   ID: 291675df-b531-4754-b359-4bec6867542d
#   Team ID: e2b03ad6-1660-487a-aa35-5de132f641b8
#   Active: true

# Build and deploy
npm run build
# ✓ built in 10.64s
```

## Next Steps

1. **Test Formation Editing:**
   - Select formation from dropdown
   - Change personnel packages
   - Update category, tags, description
   - Verify save persists

2. **Test Formation Linking:**
   - Link "Twins (left)" ↔ "Twins (right)"
   - Verify base formations remain hidden
   - Create new formation → Verify base shows until linked

3. **Monitor Console:**
   - Check for playbook_id in logs
   - Verify query returns formations
   - Confirm no RLS errors

## Lessons Learned

1. **Team vs Playbook Distinction:**
   - Teams can have multiple playbooks
   - Always pass `playbook_id`, not `team_id` to formation/play services
   - Use `useTeamsData()` to get active playbook

2. **Debug Logging Strategy:**
   - Three-layer logging (component → service → query) was essential
   - Console logs revealed the UUID mismatch immediately
   - Kept logs minimal but informative with emoji markers

3. **UI/UX Considerations:**
   - Base formations clutter dropdowns once variants exist
   - Hide them in Link Formations tab (user-facing workflow)
   - Keep visible in Edit Details (admin/editing workflow)
   - Auto-import from plays improves onboarding experience
