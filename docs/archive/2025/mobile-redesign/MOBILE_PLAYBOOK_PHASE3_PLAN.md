# 📱 Mobile Playbook Phase 3 - AddNewPlayModal Wizard

**Phase:** AddNewPlayModal Mobile Redesign  
**Started:** October 19, 2025  
**Status:** 🚧 In Progress  
**Goal:** Transform desktop form into mobile step-by-step wizard

---

## 🎯 Phase 3 Objectives

### Current State (Desktop)

- ✅ **624 lines** - Fully functional desktop modal
- ✅ **6 sections** - All form sections componentized
- ✅ **Smart features** - Formation auto-create, fuzzy search, suggestions
- ❌ **Mobile UX** - Long vertical scroll, small inputs, overwhelming on mobile

### Target State (Mobile)

- 🎯 **Wizard flow** - Step-by-step guided experience
- 🎯 **48px inputs** - Large touch-friendly form controls
- 🎯 **Full-screen** - Bottom sheet covers entire screen
- 🎯 **Progressive** - Show only relevant fields per step
- 🎯 **Validation** - Step-by-step validation before Next

---

## 📐 Wizard Structure

### **Step 1: Basic Info** (Required)

```tsx
<WizardStep title="Basic Info" step={1} totalSteps={4}>
  <FormationSection /> {/* Formation picker */}
  <PlayNameSection /> {/* Play name input */}
</WizardStep>
```

**Fields:**

- Formation (required) - Fuzzy search with suggestions
- Play Name (required) - Fuzzy search with suggestions
- Formation Direction (optional) - L/R/C

**Validation:**

- Formation: Must be non-empty
- Play Name: Must be non-empty

---

### **Step 2: Personnel & Type** (Required)

```tsx
<WizardStep title="Personnel & Type" step={2} totalSteps={4}>
  <PersonnelSection /> {/* Personnel picker */}
  <PlayTypeSection /> {/* Play type dropdown */}
</WizardStep>
```

**Fields:**

- Personnel (required) - Dropdown or create new
- Play Type (required) - Run/Pass/Special

**Validation:**

- Personnel: Must be selected
- Play Type: Must be selected

---

### **Step 3: Game Situation** (Optional)

```tsx
<WizardStep title="Game Situation" step={3} totalSteps={4} optional>
  <PreferencesSection /> {/* Down, Distance, Hash, etc. */}
</WizardStep>
```

**Fields:**

- Down (optional) - 1st/2nd/3rd/4th/Goal Line
- Distance (optional) - Short/Medium/Long
- Hash (optional) - Left/Middle/Right
- Direction (optional) - Left/Right/Middle

**Validation:**

- None (all optional)

**Skip Button:**

- "Skip" button to jump to Step 4

---

### **Step 4: Advanced Details** (Optional)

```tsx
<WizardStep title="Advanced Details" step={4} totalSteps={4} optional>
  <AdvancedOptionsSection /> {/* Tags, notes, metadata */}
</WizardStep>
```

**Fields:**

- Formation Tags (optional)
- Play Tags (optional)
- Notes (optional)
- Formation Type, Back Align, Shift, Motion (optional)

**Validation:**

- None (all optional)

**Skip Button:**

- "Skip & Save" button

---

## 🎨 Mobile UI Components

### **1. WizardStep Component**

```tsx
interface WizardStepProps {
  title: string;
  step: number;
  totalSteps: number;
  optional?: boolean;
  children: React.ReactNode;
}

<WizardStep title="Basic Info" step={1} totalSteps={4}>
  {/* Step content */}
</WizardStep>;
```

**Layout:**

```
┌──────────────────────┐
│ Step 1 of 4          │ ← Progress indicator
│ Basic Info           │ ← Step title
├──────────────────────┤
│                      │
│  [Form Fields]       │ ← Step content (scrollable)
│                      │
│                      │
├──────────────────────┤
│ ○────○────○────○     │ ← Step dots
│ [Back]      [Next →] │ ← Navigation
└──────────────────────┘
```

### **2. WizardNavigation Component**

```tsx
<WizardNavigation
  currentStep={step}
  totalSteps={4}
  onBack={handleBack}
  onNext={handleNext}
  onSkip={step > 2 ? handleSkip : undefined}
  nextDisabled={!isStepValid()}
  nextLabel={isLastStep ? "Create Play" : "Next"}
/>
```

**Mobile Layout:**

- Full-width buttons (100%)
- 48px height (touch-friendly)
- Back: Secondary button (left)
- Next: Primary button (right)
- Skip: Text button (center) - only on optional steps

### **3. WizardProgress Component**

```tsx
<WizardProgress currentStep={2} totalSteps={4} />
```

**Visual:**

```
●────●────○────○
```

- Filled dot: Completed step
- Empty dot: Future step
- Current dot: Larger with animation

### **4. Mobile Form Controls**

All inputs enhanced for mobile:

```tsx
// Input height: 48px (was 36px)
<Input
  size="lg"
  className="h-12" // 48px
  placeholder="Enter play name..."
/>

// Dropdown: Full-width, large
<Select
  size="lg"
  className="h-12 w-full"
  options={personnelOptions}
/>

// Buttons: Full-width on mobile
<Button
  size="lg"
  className="w-full h-12"
  variant="primary"
>
  Next
</Button>
```

---

## 🔧 Implementation Plan

### **Task 1: Create Wizard Components** ✅

Create reusable wizard UI components:

1. **WizardStep.tsx** (wrapper for each step)
2. **WizardNavigation.tsx** (Back/Next/Skip buttons)
3. **WizardProgress.tsx** (step progress dots)
4. **useWizardState.ts** (hook for wizard logic)

**Files to create:**

- `src/components/playbook/AddNewPlayModal/wizard/WizardStep.tsx`
- `src/components/playbook/AddNewPlayModal/wizard/WizardNavigation.tsx`
- `src/components/playbook/AddNewPlayModal/wizard/WizardProgress.tsx`
- `src/components/playbook/AddNewPlayModal/wizard/useWizardState.ts`
- `src/components/playbook/AddNewPlayModal/wizard/index.ts`

---

### **Task 2: Create MobileAddNewPlayModal** ✅

New mobile variant of AddNewPlayModal:

**Approach:**

- Keep existing `AddNewPlayModal.tsx` for desktop
- Create new `AddNewPlayModal.mobile.tsx` for mobile wizard
- Use `useIsMobile()` hook to switch between them

**OR (preferred):**

- Modify existing `AddNewPlayModal.tsx` to conditionally render wizard on mobile
- Less code duplication
- Shared state and logic

```tsx
export const AddNewPlayModal = ({ isOpen, onClose, ... }) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileWizardView />
  ) : (
    <DesktopFormView />
  );
};
```

---

### **Task 3: Implement Wizard Logic** ✅

```tsx
const useWizardState = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState(1);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return {
    currentStep,
    goNext,
    goBack,
    goToStep,
    isFirstStep,
    isLastStep,
  };
};
```

---

### **Task 4: Step Validation** ✅

```tsx
const validateStep = (step: number, formData: PlayFormData) => {
  switch (step) {
    case 1: // Basic Info
      return formData.formation.trim() && formData.playName.trim();

    case 2: // Personnel & Type
      return formData.personnel.trim() && formData.playType;

    case 3: // Game Situation (optional)
      return true;

    case 4: // Advanced (optional)
      return true;

    default:
      return false;
  }
};
```

---

### **Task 5: Mobile Form Styling** ✅

Update all section components for mobile:

```tsx
// FormationSection mobile variant
<div
  className={cn(
    "space-y-4",
    isMobile && "space-y-6" // More spacing on mobile
  )}
>
  <Input
    size={isMobile ? "lg" : "md"}
    className={isMobile ? "h-12" : "h-10"}
    placeholder="Formation"
  />
</div>
```

---

### **Task 6: Full-Screen Bottom Sheet** ✅

On mobile, modal should be full-screen:

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size={isMobile ? "full" : "lg"}
  className={cn(
    isMobile && "h-screen rounded-none" // Full-screen on mobile
  )}
>
  {isMobile ? <MobileWizardLayout /> : <DesktopFormLayout />}
</Modal>
```

---

## 📊 Progress Tracker

| Task                    | Status     | Files   | Lines | Description                            |
| ----------------------- | ---------- | ------- | ----- | -------------------------------------- |
| 1. Wizard Components    | ⏳ Next    | 5 files | ~400  | WizardStep, Navigation, Progress, Hook |
| 2. Mobile Modal Variant | ⏳ Pending | 1 file  | ~200  | Conditional rendering                  |
| 3. Wizard State Hook    | ⏳ Pending | 1 file  | ~100  | Step navigation logic                  |
| 4. Step Validation      | ⏳ Pending | 1 file  | ~50   | Validation per step                    |
| 5. Mobile Form Styling  | ⏳ Pending | 6 files | ~100  | 48px inputs, full-width                |
| 6. Full-Screen Layout   | ⏳ Pending | 1 file  | ~50   | Bottom sheet config                    |

**Total Estimate:** ~900 lines of code

---

## ✅ Success Criteria

### Must Have (Blockers):

- [ ] Wizard navigates smoothly between steps
- [ ] Step 1 & 2 validation works (can't proceed without required fields)
- [ ] All form functionality preserved (fuzzy search, suggestions, etc.)
- [ ] Create Play button works from Step 4
- [ ] Mobile inputs are 48px height (touch-friendly)
- [ ] Full-screen on mobile, modal on desktop

### Should Have (Important):

- [ ] Progress dots show current step
- [ ] Back button works on all steps
- [ ] Skip button on optional steps (3 & 4)
- [ ] Smooth step transitions (200ms)
- [ ] Keyboard handling (Enter = Next, Escape = Close)

### Nice to Have (Post-MVP):

- [ ] Swipe between steps
- [ ] Step animations (slide left/right)
- [ ] Auto-save draft on each step
- [ ] Progress bar instead of dots

---

## 🎯 Design Mockup

### Mobile Wizard Flow:

```
Step 1: Basic Info
┌────────────────────┐
│ ✕ New Play         │
│ Step 1 of 4        │
│ Basic Info         │
├────────────────────┤
│                    │
│ Formation          │
│ ┌────────────────┐ │ ← 48px input
│ │ Gun Spread     │ │
│ └────────────────┘ │
│                    │
│ Play Name          │
│ ┌────────────────┐ │
│ │ Y Cross        │ │
│ └────────────────┘ │
│                    │
├────────────────────┤
│ ●────○────○────○   │ ← Progress
│                    │
│ [Back]    [Next →] │ ← Full-width buttons
└────────────────────┘
```

---

## 🚀 Next Steps

1. **NOW:** Create wizard components (WizardStep, Navigation, Progress)
2. **THEN:** Implement wizard state hook
3. **THEN:** Integrate wizard into AddNewPlayModal
4. **THEN:** Test on device
5. **FINALLY:** Deploy Phase 3

**Estimated Time:** 4-6 hours

---

**Ready to start?** Let's build the wizard components! 🎯
