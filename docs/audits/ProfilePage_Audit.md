# ProfilePage Audit - October 5, 2025

## File: `src/pages/ProfilePage.tsx`

**Lines**: 1,382
**Status**: ⚠️ Needs Refactoring
**Priority**: High

---

## Executive Summary

**Overall Health**: 🟡 **C+ (72/100)**

ProfilePage is functional but has significant technical debt. At 1,382 lines, it's one of the largest files in the codebase and would greatly benefit from extraction into smaller, focused components.

---

## Metrics

| Metric                  | Score  | Notes                               |
| ----------------------- | ------ | ----------------------------------- |
| **Size**                | 40/100 | 1,382 lines - way too large         |
| **Token Usage**         | 85/100 | Generally good token usage          |
| **Component Structure** | 60/100 | Monolithic, needs extraction        |
| **Type Safety**         | 90/100 | Good TypeScript usage               |
| **Accessibility**       | 75/100 | Basic patterns present, needs audit |
| **Dark Mode**           | 80/100 | Uses semantic tokens                |

---

## Findings

### ✅ Strengths

1. **Comprehensive Feature Set**
   - Personal information management
   - Athletic information (for players)
   - Coaching information (for coaches)
   - Emergency contacts
   - Social media links
   - Avatar upload
   - Multi-badge display

2. **Good Component Usage**
   - Uses `Aurora` background
   - Uses `PageLayout` wrapper
   - Uses `Card` components
   - Uses `MultiBadgeDisplay`
   - Uses semantic tokens (text-error, etc.)

3. **Validation System**
   - Has `ValidationError` component
   - Form validation logic
   - Error message display

4. **Loading States**
   - Uses `LoadingScreen` component
   - Shows loading during save
   - Upload progress feedback

### ⚠️ Issues & Recommendations

#### 1. File Size (CRITICAL)

**Problem**: 1,382 lines in a single file
**Impact**: Hard to maintain, test, and understand

**Recommended Refactoring**:

```
src/pages/ProfilePage/
├── ProfilePage.tsx (main orchestrator, ~100 lines)
├── components/
│   ├── ProfileHeader.tsx (avatar, display name)
│   ├── PersonalInfoSection.tsx
│   ├── AthleticInfoSection.tsx
│   ├── CoachingInfoSection.tsx
│   ├── EmergencyContactSection.tsx
│   ├── SocialLinksSection.tsx
│   └── ValidationError.tsx
├── hooks/
│   ├── useProfileForm.ts (form state & validation)
│   └── useAvatarUpload.ts (avatar upload logic)
└── types/
    └── profile.types.ts
```

#### 2. Form State Management

**Problem**: Large `formData` object with 30+ fields in useState
**Recommendation**: Extract to custom hook

```tsx
// src/pages/ProfilePage/hooks/useProfileForm.ts
export function useProfileForm(initialProfile?: AuthProfile) {
  const [formData, setFormData] = useState(/* ... */);
  const [validationErrors, setValidationErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    // Validation logic
  };

  const save = async () => {
    // Save logic
  };

  return { formData, validationErrors, saving, updateField, validate, save };
}
```

#### 3. Section Extraction

Each profile section should be its own component:

```tsx
// src/pages/ProfilePage/components/PersonalInfoSection.tsx
export function PersonalInfoSection({
  formData,
  onChange,
  errors,
}: PersonalInfoSectionProps) {
  return (
    <Card className="p-card-padding">
      <Typography variant="headline-sm" className="mb-4">
        Personal Information
      </Typography>
      {/* Form fields */}
    </Card>
  );
}
```

#### 4. Avatar Upload Logic

**Problem**: Avatar upload mixed with main component
**Recommendation**: Extract to custom hook

```tsx
// src/pages/ProfilePage/hooks/useAvatarUpload.ts
export function useAvatarUpload(userId: string) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const upload = async () => {
    // Upload logic
  };

  return { file, uploading, preview, setFile, upload };
}
```

#### 5. Missing Features

**Breadcrumbs**: Add navigation context

```tsx
<Breadcrumb
  items={[
    {
      id: "dashboard",
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    { id: "profile", label: "Profile", current: true },
  ]}
/>
```

**Toast Notifications**: Replace inline messages

```tsx
const { toast } = useToast();

// On save success:
toast.success("Profile updated successfully");

// On save error:
toast.error("Failed to update profile");
```

**Unsaved Changes Warning**: Warn before navigation

```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [hasUnsavedChanges]);
```

#### 6. Accessibility Improvements

**Form Labels**: Ensure all inputs have labels

```tsx
<Input
  label="Display Name"
  id="display-name"
  aria-describedby={
    validationErrors.display_name ? "display-name-error" : undefined
  }
  // ...
/>;
{
  validationErrors.display_name && (
    <ValidationError
      id="display-name-error"
      error={validationErrors.display_name}
    />
  );
}
```

**Focus Management**: Focus first error on validation

```tsx
const firstErrorField = Object.keys(validationErrors)[0];
if (firstErrorField) {
  document.getElementById(firstErrorField)?.focus();
}
```

#### 7. Token Usage

**Current**: Mostly good, but some inconsistencies

Check for:

- ✅ Uses `text-error` for error messages
- ✅ Uses `Card` components
- ✅ Uses `Typography` component
- ⚠️ Check for any hardcoded spacing values
- ⚠️ Check for any hardcoded colors

---

## Action Plan

### Phase 1: Quick Improvements (1-2 hours)

1. ✅ Add breadcrumb navigation
2. ✅ Replace inline messages with Toast notifications
3. ✅ Add loading skeleton for initial load
4. ✅ Add empty state if no profile exists

### Phase 2: Extract Hooks (2-3 hours)

1. Create `useProfileForm` hook
2. Create `useAvatarUpload` hook
3. Update ProfilePage to use hooks

### Phase 3: Extract Sections (4-6 hours)

1. Create section components (6 components)
2. Update ProfilePage to use sections
3. Add prop types and documentation

### Phase 4: Polish (2 hours)

1. Add unsaved changes warning
2. Improve accessibility
3. Add keyboard shortcuts
4. Add visual tests

---

## Estimated Refactoring Time

- **Quick Wins**: 1-2 hours
- **Full Refactor**: 8-11 hours
- **Testing & Polish**: 2-3 hours
- **Total**: 11-16 hours

---

## Files to Create

```
src/pages/ProfilePage/
├── index.ts (barrel export)
├── ProfilePage.tsx (~150 lines)
├── components/
│   ├── index.ts
│   ├── ProfileHeader.tsx
│   ├── PersonalInfoSection.tsx
│   ├── AthleticInfoSection.tsx
│   ├── CoachingInfoSection.tsx
│   ├── EmergencyContactSection.tsx
│   ├── SocialLinksSection.tsx
│   └── ValidationError.tsx
├── hooks/
│   ├── index.ts
│   ├── useProfileForm.ts
│   └── useAvatarUpload.ts
├── types/
│   └── profile.types.ts
└── __tests__/
    ├── ProfilePage.test.tsx
    ├── useProfileForm.test.ts
    └── useAvatarUpload.test.ts
```

---

## Priority Recommendations

### Do Now (This Week)

1. Add breadcrumb navigation (5 min)
2. Add toast notifications (15 min)
3. Add loading states (10 min)

### Do Next (Next 2 Weeks)

1. Extract `useProfileForm` hook
2. Extract `useAvatarUpload` hook
3. Create section components

### Do Later (Month 2)

1. Add unsaved changes warning
2. Full accessibility audit
3. Add visual regression tests

---

## Code Quality Gates

Before marking this page as "complete":

- [ ] File size < 300 lines
- [ ] All sections extracted to components
- [ ] Form logic in custom hooks
- [ ] Breadcrumb navigation added
- [ ] Toast notifications for feedback
- [ ] Loading states for async operations
- [ ] Empty states handled
- [ ] Accessibility score > 90
- [ ] Dark mode tested
- [ ] Mobile responsive tested
- [ ] Type check passes
- [ ] Lint passes
- [ ] Unit tests added
- [ ] Visual snapshot tests added

---

## Similar Pages to Review

These pages may have similar patterns and could benefit from the same refactoring approach:

- TeamSettings (similar form-heavy page)
- CoachManagementPage (similar profile editing)
- CreateCoachAccount (similar multi-section form)

---

## Notes

- This is the most complex page in terms of form handling
- Good candidate for a "profile editing" pattern library
- Consider creating a `FormSection` wrapper component
- Consider creating a `FormField` wrapper component for consistent styling
