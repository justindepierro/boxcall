# Formation Linking Enhancements

## Summary
Added two requested features to the Formation Linking system:
1. **Same-name notification** - Dynamic alert under dropdowns when linking formations with matching names (case-insensitive)
2. **Personnel packages selector** - Multi-select UI to tag which personnel packages can run from the linked formations

## Changes Made

### 1. Database Schema
**File**: `database/migrations/20251012_add_personnel_packages.sql`
- Added `personnel_packages UUID[]` column to `formations` table
- Added GIN index for efficient array queries
- Default value: empty array `[]`

**⚠️ IMPORTANT**: You must run this migration in Supabase SQL Editor:
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste the SQL from `database/migrations/20251012_add_personnel_packages.sql`
3. Run the migration
4. Verify success message appears

### 2. TypeScript Types
**File**: `src/types/formation.ts`
- Added `personnel_packages: string[]` to `Formation` interface
- Added `personnel_packages?: string[]` to `FormationCreate` interface
- Added `personnel_packages?: string[]` to `FormationUpdate` interface

### 3. Service Layer
**File**: `src/services/formationService.ts`
- Updated `linkFormations()` signature to accept `personnelPackages?: string[]` parameter
- Saves `personnel_packages` to base formation
- Saves `personnel_packages` to left variant
- Saves `personnel_packages` to right variant
- Saves `personnel_packages` to newly created duplicate (when linking same formation)

### 4. UI Components
**File**: `src/components/formations/FormationLinkingPanel.tsx`

#### New State:
```typescript
const [availablePersonnel, setAvailablePersonnel] = useState<PersonnelConfiguration[]>([]);
const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
```

#### Same-Name Notification:
- Appears under **left** dropdown when both selections have matching names (case-insensitive)
- Shows message: "ℹ️ **Trips Left** and **Trips Right** variants will be created"
- Blue background with info styling
- Helper function: `isSameFormationName()` compares `leftFormation.name.toLowerCase()` with `rightFormation.name.toLowerCase()`

#### Personnel Selector:
- Appears below formation previews when either formation is selected
- Loads all personnel configurations from playbook
- Multi-select pill buttons (click to toggle)
- Selected pills: Primary color with checkmark
- Unselected pills: Gray with hover effect
- Shows count badge: "✓ 2 personnel packages selected"
- Clears selection after successful link

#### Personnel Integration:
- Loads personnel via `PersonnelService.getPersonnelConfigurations(playbookId)`
- Passes `selectedPersonnelIds` to `FormationService.linkFormations()`
- Clears selection after link completes

## User Flow

### Same Formation Name Linking (e.g., "Trips" + "Trips")
1. Select "Trips" in left dropdown
2. Select "Trips" in right dropdown
3. **Notification appears**: "ℹ️ **Trips Left** and **Trips Right** variants will be created"
4. (Optional) Select personnel packages: "11 Personnel", "12 Personnel", etc.
5. Click link button
6. Confirmation modal explains Lt/Rt creation
7. Confirm → System creates duplicate with right direction
8. Both formations tagged with selected personnel packages

### Different Formation Name Linking (e.g., "Rip" + "Liz")
1. Select "Rip" in left dropdown
2. Select "Liz" in right dropdown
3. **No notification** (names are different)
4. (Optional) Select personnel packages
5. Click link button
6. Confirmation modal explains Left/Right assignment
7. Confirm → System updates both formations' directions
8. Both formations tagged with selected personnel packages

## Data Structure

### Formation Record After Linking
```typescript
{
  id: "uuid",
  name: "Trips",
  direction: "left",  // or "right" or "base"
  base_formation_id: "uuid",  // references base formation
  personnel_packages: [
    "uuid-of-11-personnel",
    "uuid-of-12-personnel"
  ],
  // ... other fields
}
```

### Personnel Package Query Example
```sql
-- Find all formations that can run 11 Personnel
SELECT * FROM formations 
WHERE 'uuid-of-11-personnel' = ANY(personnel_packages);
```

## Testing Checklist

- [ ] Run migration in Supabase (`20251012_add_personnel_packages.sql`)
- [ ] Verify `personnel_packages` column exists in formations table
- [ ] Refresh BoxCall app
- [ ] Open Formation Manager
- [ ] Select same formation name in both dropdowns
- [ ] Verify notification appears: "Trips Left and Trips Right variants will be created"
- [ ] Verify personnel selector appears with all playbook personnel
- [ ] Select 2-3 personnel packages (pills should highlight)
- [ ] Click link button
- [ ] Verify confirmation modal shows correct message
- [ ] Confirm link
- [ ] Check database: verify both formations have `personnel_packages` array
- [ ] Test with different formation names (notification should NOT appear)

## Future Enhancements

### Potential Additions:
1. **Pre-populate personnel** - If formation already has `personnel_packages`, show them as selected
2. **Personnel badges** - Show selected personnel on formation preview cards
3. **Filter plays by personnel** - "Show me all plays with 11 Personnel"
4. **Personnel conflict warnings** - Alert if linked formations have mismatched personnel
5. **Bulk personnel update** - "Apply this personnel selection to all formations in this category"

## Files Modified

1. ✅ `database/migrations/20251012_add_personnel_packages.sql` (NEW)
2. ✅ `src/types/formation.ts`
3. ✅ `src/services/formationService.ts`
4. ✅ `src/components/formations/FormationLinkingPanel.tsx`

## Build Status
✅ **Build successful** (9.62s)
✅ **No type errors**
✅ **No lint errors**

## Next Steps
1. **Run the SQL migration** in Supabase (see "Database Schema" section above)
2. Refresh your browser
3. Test the new features
4. Provide feedback on UX and behavior
