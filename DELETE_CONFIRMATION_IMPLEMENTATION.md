# Delete Confirmation System Implementation

## ✅ Status: Core Components Complete

**Date**: January 2025  
**Implementation Phase**: Step 3 of Path to 10/10  
**Purpose**: Add delete confirmation dialogs with usage warnings to prevent accidental data loss

---

## 📦 Files Created/Modified

### 1. ✅ DeleteConfirmationDialog Component

**File**: `src/components/common/DeleteConfirmationDialog.tsx`

**Status**: ✅ Complete - No TypeScript or lint errors

**Features**:

- Modal-based confirmation dialog using your existing `Modal` component
- Visual warning indicators with semantic color tokens
- Usage count display (plays, formations)
- Different states: "in use" warning vs "safe to delete" message
- Loading state with spinner during deletion
- Fully typed with TypeScript
- Accessibility-compliant

**Example Usage**:

```tsx
<DeleteConfirmationDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleDelete}
  title="Delete Personnel Configuration?"
  entityName="11 Personnel"
  entityType="personnel"
  usage={{ playsCount: 45, formationsCount: 8 }}
  isDeleting={isLoading}
/>
```

---

### 2. ✅ PersonnelService.checkPersonnelUsage()

**File**: `src/services/personnelService.ts`

**Status**: ✅ Complete - Method added with no errors

**Method Signature**:

```typescript
static async checkPersonnelUsage(
  id: string
): Promise<{ playsCount: number; formationsCount: number }>
```

**What It Does**:

- Queries `plays` table for records with `personnel_id = id`
- Queries `formations` table for records with `personnel_id = id`
- Returns exact counts using Supabase `count: "exact"`
- Used before deleting personnel to show usage warnings

**Example Call**:

```typescript
const usage = await PersonnelService.checkPersonnelUsage(personnelId);
// usage = { playsCount: 45, formationsCount: 8 }
```

---

### 3. ✅ FormationService.checkFormationUsage()

**File**: `src/services/formationService.ts`

**Status**: ✅ Complete - Method added with no errors

**Method Signature**:

```typescript
static async checkFormationUsage(
  id: string
): Promise<{ playsCount: number }>
```

**What It Does**:

- Queries `plays` table for records with `formation_id = id`
- Returns exact count using Supabase `count: "exact"`
- Used before deleting formations to show usage warnings

**Example Call**:

```typescript
const usage = await FormationService.checkFormationUsage(formationId);
// usage = { playsCount: 23 }
```

---

## 🎯 Next Steps (Integration)

### Step 3.1: Wire Up in PersonnelConfigurationModal

**File to Edit**: `src/components/playbook/PersonnelConfigurationModal/index.tsx` (or similar)

**Implementation**:

```tsx
import { useState } from "react";
import { DeleteConfirmationDialog } from "../../common/DeleteConfirmationDialog";
import { PersonnelService } from "@services";

// Inside component:
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [deleteUsage, setDeleteUsage] = useState<
  | {
      playsCount: number;
      formationsCount: number;
    }
  | undefined
>(undefined);

// Replace direct delete with confirmation flow:
const handleDeleteClick = async () => {
  // Check usage first
  const usage = await PersonnelService.checkPersonnelUsage(personnelId);
  setDeleteUsage(usage);
  setShowDeleteDialog(true);
};

const handleConfirmDelete = async () => {
  setIsDeleting(true);
  try {
    await PersonnelService.deletePersonnelConfiguration(personnelId);
    toast.success("Personnel configuration deleted");
    onClose();
  } catch (error) {
    toast.error("Failed to delete personnel configuration");
  } finally {
    setIsDeleting(false);
    setShowDeleteDialog(false);
  }
};

// In JSX:
<DeleteConfirmationDialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleConfirmDelete}
  title="Delete Personnel Configuration?"
  entityName={personnelConfig.name}
  entityType="personnel"
  usage={deleteUsage}
  isDeleting={isDeleting}
/>;
```

---

### Step 3.2: Wire Up in FormationBuilderModal

**File to Edit**: `src/components/playbook/FormationBuilderModal/FormationBuilderModal.canvas.tsx`

**Implementation**:

```tsx
import { useState } from "react";
import { DeleteConfirmationDialog } from "../../common/DeleteConfirmationDialog";
import { FormationService } from "@services";

// Inside component:
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [deleteUsage, setDeleteUsage] = useState<
  | {
      playsCount: number;
    }
  | undefined
>(undefined);

// Replace direct delete with confirmation flow:
const handleDeleteClick = async () => {
  // Check usage first
  const usage = await FormationService.checkFormationUsage(formationId);
  setDeleteUsage(usage);
  setShowDeleteDialog(true);
};

const handleConfirmDelete = async () => {
  setIsDeleting(true);
  try {
    await FormationService.deleteFormation(formationId);
    toast.success("Formation deleted");
    onClose();
  } catch (error) {
    toast.error("Failed to delete formation");
  } finally {
    setIsDeleting(false);
    setShowDeleteDialog(false);
  }
};

// In JSX:
<DeleteConfirmationDialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleConfirmDelete}
  title="Delete Formation?"
  entityName={formation.name}
  entityType="formation"
  usage={deleteUsage}
  isDeleting={isDeleting}
/>;
```

---

## 🎨 UI/UX Features

### Visual States

1. **Warning State** (Entity in use):
   - Yellow warning background (`bg-warning-bg`)
   - Alert triangle icon
   - Lists specific usage counts:
     - "45 plays"
     - "8 formations"
   - Info message: "These will lose their reference but will not be deleted"

2. **Safe State** (Not in use):
   - Green success background (`bg-success-bg`)
   - Check circle icon
   - Message: "This personnel is not currently in use and can be safely deleted"

3. **Permanent Warning** (Always shown):
   - Red error background (`bg-error-bg`)
   - Alert triangle icon
   - Bold text: "This action cannot be undone"

### Dialog Actions

- **Cancel Button**: Gray outline, closes dialog
- **Delete Button**: Red danger variant
  - Shows "Delete personnel" normally
  - Shows spinner + "Deleting..." when loading
  - Disabled during deletion

---

## 🔧 Technical Details

### Dependencies

- ✅ Uses existing `Modal` component from `src/components/ui/Modal`
- ✅ Uses existing `Button` component from `src/components/ui/Button/Button`
- ✅ Uses existing `Icon` component from `src/components/ui/Icon/Icon`
- ✅ Uses existing `Typography` from `src/components/design-system/Typography`
- ✅ All imports verified and working

### Semantic Design Tokens Used

- `bg-warning-bg` / `text-warning` / `border-warning`
- `bg-success-bg` / `text-success` / `border-success`
- `bg-error-bg` / `text-error` / `border-error`

### Database Queries

Both usage check methods use:

```typescript
.select("*", { count: "exact", head: true })
```

This approach:

- ✅ Returns only the count (no data transfer)
- ✅ Exact count (not estimated)
- ✅ Fast performance
- ✅ Type-safe with TypeScript

---

## 🧪 Testing Checklist

### Unit Testing

- [ ] Test `checkPersonnelUsage()` with personnel in use
- [ ] Test `checkPersonnelUsage()` with personnel not in use
- [ ] Test `checkFormationUsage()` with formation in use
- [ ] Test `checkFormationUsage()` with formation not in use

### Integration Testing

- [ ] Delete personnel with no usage (should show green "safe" message)
- [ ] Delete personnel with plays only (should show "X plays" warning)
- [ ] Delete personnel with formations only (should show "X formations" warning)
- [ ] Delete personnel with both (should show both counts)
- [ ] Cancel deletion (dialog should close, nothing deleted)
- [ ] Confirm deletion (should delete and show success toast)
- [ ] Delete formation with plays (should show "X plays" warning)
- [ ] Delete formation with no plays (should show green "safe" message)

### UI/UX Testing

- [ ] Dialog is modal (backdrop prevents clicks outside)
- [ ] Escape key closes dialog
- [ ] Loading state shows spinner
- [ ] Buttons disabled during deletion
- [ ] Icons display correctly
- [ ] Colors match design system
- [ ] Responsive on mobile

---

## 📊 System Impact

### Before This Implementation

❌ Coaches could accidentally delete personnel/formations without warning  
❌ No visibility into where entities are being used  
❌ Risk of broken references (plays losing personnel/formation data)

### After This Implementation

✅ Clear warnings before deletion  
✅ Exact usage counts displayed  
✅ Informed decision-making  
✅ Bulletproof UX (Goal: 10/10 integration score)

---

## 🚀 Related Files

### Documentation

- `PATH_TO_10_IMPLEMENTATION.md` - Overall roadmap (this is Step 3)
- `COMPREHENSIVE_PLAYBOOK_SYSTEM_AUDIT.md` - Full system analysis
- `INTEGRATION_IMPROVEMENTS_IMPLEMENTATION_GUIDE.md` - Implementation details

### Database

- `database/migrations/20251012_add_name_sync_triggers.sql` - ✅ Applied
- `database/migrations/20251012_add_personnel_fk_to_plays.sql` - ✅ Applied

### Services

- `src/services/personnelService.ts` - ✅ Updated with checkPersonnelUsage()
- `src/services/formationService.ts` - ✅ Updated with checkFormationUsage()

### Components (To Wire Up)

- `src/components/playbook/PersonnelConfigurationModal/` - 🟡 Needs integration
- `src/components/playbook/FormationBuilderModal/` - 🟡 Needs integration

---

## 💡 Future Enhancements

### Potential Improvements

1. **Bulk Delete Confirmation**: Show combined usage when deleting multiple items
2. **Delete Impact Preview**: Show which specific plays/formations will be affected
3. **Soft Delete**: Add "trash" system for undo functionality
4. **Archive Instead**: Option to archive instead of delete
5. **Cascade Options**: Let user choose to delete dependent entities

### Performance Optimizations

1. Cache usage counts if checked recently
2. Batch check multiple entities at once
3. Real-time usage tracking (WebSocket updates)

---

## ✅ Completion Criteria

Step 3 will be **100% complete** when:

- [x] DeleteConfirmationDialog component created
- [x] PersonnelService.checkPersonnelUsage() implemented
- [x] FormationService.checkFormationUsage() implemented
- [ ] Dialog wired up in PersonnelConfigurationModal
- [ ] Dialog wired up in FormationBuilderModal
- [ ] All tests passing
- [ ] User can delete with warnings in production

**Current Status**: Core infrastructure complete (3/5 ✅). Integration pending (2/5 🟡).

---

## 📝 Notes

- All new code follows existing project patterns
- TypeScript strict mode compliant
- ESLint rules satisfied
- Design system tokens used correctly
- No breaking changes to existing functionality
- Backward compatible (old delete flows still work until replaced)
