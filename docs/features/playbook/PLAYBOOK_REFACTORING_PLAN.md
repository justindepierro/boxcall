# Playbook Folder Refactoring Plan

**Date**: October 12, 2025  
**Purpose**: Improve code organization, extract reusable components, and establish clear architectural patterns

## Current Structure Analysis

### ✅ Well-Organized Areas:

- `play-card/` - Good component breakdown (Details, ListHeader, TileHeader, QuickView)
- `diagram-editor/` - Self-contained feature module
- `CSVImport/` - Self-contained feature module
- `AddNewPlayModal/` - Self-contained feature module with stories

### ⚠️ Areas Needing Refactoring:

#### 1. **Root Level Clutter** (30+ files in `/playbook/`)

Too many components at the root level without clear categorization.

#### 2. **Missing Reusable Components**

Components that could be extracted and reused:

- Filter-related components scattered across multiple files
- Layout components (DesktopLayout, MobileLayout, TabletLayout) not in dedicated folder
- Modal components not grouped together
- Grid-related components not fully grouped

#### 3. **Inconsistent Naming Patterns**

- Some components have stories, others don't
- Mix of feature-based and technical-based naming

---

## Proposed New Structure

```
src/components/playbook/
├── index.ts                          # Main exports
├── PlaybookPage.tsx                  # Main page component
│
├── core/                             # Core playbook components
│   ├── PlayCard/                     # Play card module
│   │   ├── PlayCard.tsx
│   │   ├── PlayCard.stories.tsx
│   │   ├── PlayCardDetails.tsx
│   │   ├── PlayCardListHeader.tsx
│   │   ├── PlayCardTileHeader.tsx
│   │   ├── PlayQuickView.tsx
│   │   ├── constants.ts
│   │   ├── fieldDefinitions.tsx
│   │   ├── helpers.ts
│   │   └── index.ts
│   │
│   ├── PlayGrid/                     # Grid display module
│   │   ├── PlayGrid.tsx
│   │   ├── PlayGrid.stories.tsx
│   │   ├── PlayGridSkeleton.tsx
│   │   ├── PlayGridEmptyState.tsx
│   │   ├── PlayGridErrorState.tsx
│   │   └── index.ts
│   │
│   └── DiagramEditor/                # Diagram editing (already exists)
│       └── ...
│
├── features/                         # Feature-specific modules
│   ├── filtering/                    # All filter-related components
│   │   ├── AdvancedFilters.tsx
│   │   ├── AdvancedFilters.stories.tsx
│   │   ├── QuickFilterPresets.tsx
│   │   ├── filterPresets.ts
│   │   └── index.ts
│   │
│   ├── search/                       # Search-related components
│   │   ├── AdvancedSearchBar.tsx
│   │   ├── PlayRemoteSearchBar.tsx
│   │   └── index.ts
│   │
│   ├── bulk-actions/                 # Bulk operations
│   │   ├── BulkActionsToolbar.tsx
│   │   ├── BulkActionsToolbar.stories.tsx
│   │   ├── BulkTaggingModal.tsx
│   │   └── index.ts
│   │
│   ├── practice-script/              # Practice script builder
│   │   ├── PracticeScriptBuilder.tsx
│   │   ├── PracticeScriptBuilder.stories.tsx
│   │   ├── PracticeScriptList.tsx
│   │   ├── PracticeScriptPlayItem.tsx
│   │   └── index.ts
│   │
│   ├── import-export/                # Data import/export
│   │   ├── CSVImport/
│   │   └── index.ts
│   │
│   ├── personnel/                    # Personnel configuration
│   │   ├── PersonnelConfigurationModal.tsx
│   │   └── index.ts
│   │
│   └── stats/                        # Stats and analytics
│       ├── PlaybookStatsDashboard.tsx
│       ├── RecentActivityFeed.tsx
│       ├── RecentPlays.tsx
│       └── index.ts
│
├── modals/                           # All modal components
│   ├── AddNewPlayModal/
│   ├── PlayDetailModal.tsx
│   ├── PlaySelectorModal.tsx
│   ├── PlaySelectorModal.stories.tsx
│   ├── PlaybookSettingsModal.tsx
│   ├── PlaybookSettingsModal.stories.tsx
│   └── index.ts
│
├── layouts/                          # Responsive layouts
│   ├── DesktopLayout.tsx
│   ├── MobileLayout.tsx
│   ├── TabletLayout.tsx
│   └── index.ts
│
├── ui/                               # Playbook-specific UI components
│   ├── CommandPalette.tsx
│   ├── KeyboardShortcutsGuide.tsx
│   ├── QuickActionsBar.tsx
│   ├── TeamTypeToggle.tsx
│   ├── WeeklyChallengePopover.tsx
│   ├── WorkflowStatusBar.tsx
│   ├── CustomFields.tsx
│   └── index.ts
│
└── utils/                            # Shared utilities
    ├── playNameUtils.ts
    ├── playbook-categories.ts
    ├── playbook-validation.ts
    └── index.ts
```

---

## Refactoring Strategy

### Phase 1: Extract Reusable UI Components (CURRENT)

**Goal**: Create reusable components that can be used throughout the app

#### Components to Extract:

1. ✅ **ScrollingText** - Already created
2. **ConfidenceBadge** - Extracted from PlayCardTileHeader
3. **FavoriteButton** - Used in multiple card headers
4. **SelectionCheckbox** - Reusable selection control
5. **PhaseLabel** - Personnel phase indicator

### Phase 2: Reorganize by Feature

**Goal**: Group related components together

#### Steps:

1. Create new folder structure
2. Move filtering components to `features/filtering/`
3. Move search components to `features/search/`
4. Move modals to dedicated `modals/` folder
5. Move layouts to `layouts/` folder
6. Create barrel exports (`index.ts`) for each module

### Phase 3: Extract Shared Logic

**Goal**: DRY up code and create shared hooks/utilities

#### Hooks to Extract:

1. **usePlayCardState** - Manage play card optimistic state
2. **usePlayValidation** - Field validation logic
3. **usePlayFilters** - Filter and search logic
4. **usePlaySelection** - Bulk selection management

#### Utilities to Extract:

1. **playCardHelpers** - Color, badge, display logic
2. **fieldHelpers** - Field configuration and ordering
3. **playbookConstants** - Shared constants

### Phase 4: Improve Type Safety

**Goal**: Better TypeScript definitions

#### Actions:

1. Create `types/playbook.ts` for all playbook-specific types
2. Extract prop interfaces to shared file
3. Add stricter typing for field configurations
4. Document complex types with JSDoc

---

## Immediate Actions (Next Steps)

### 1. Extract ConfidenceBadge Component

```tsx
// src/components/ui/ConfidenceBadge/ConfidenceBadge.tsx
export const ConfidenceBadge: React.FC<{
  confidence: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}>;
```

### 2. Extract FavoriteButton Component

```tsx
// src/components/ui/FavoriteButton/FavoriteButton.tsx
export const FavoriteButton: React.FC<{
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
}>;
```

### 3. Extract SelectionCheckbox Component

```tsx
// src/components/ui/SelectionCheckbox/SelectionCheckbox.tsx
export const SelectionCheckbox: React.FC<{
  isSelected: boolean;
  onChange: (selected: boolean) => void;
  label?: string;
}>;
```

### 4. Create PlayCard Module Barrel Export

```tsx
// src/components/playbook/core/PlayCard/index.ts
export { PlayCard } from "./PlayCard";
export { PlayCardDetails } from "./PlayCardDetails";
export { PlayCardListHeader } from "./PlayCardListHeader";
export { PlayCardTileHeader } from "./PlayCardTileHeader";
export { PlayQuickView } from "./PlayQuickView";
export * from "./types";
```

---

## Benefits of Refactoring

### Code Quality

- ✅ Easier to find and maintain components
- ✅ Clear separation of concerns
- ✅ Reduced duplication
- ✅ Better code reuse

### Developer Experience

- ✅ Faster onboarding for new developers
- ✅ Clear import paths
- ✅ Better IDE autocomplete
- ✅ Easier to write tests

### Performance

- ✅ Better tree-shaking potential
- ✅ More efficient code splitting
- ✅ Easier to lazy load features

### Scalability

- ✅ Easy to add new features
- ✅ Clear patterns to follow
- ✅ Isolated feature modules

---

## Migration Plan

### Week 1: Extract Reusable Components

- Create UI component library
- Move to `src/components/ui/`
- Update imports throughout app

### Week 2: Reorganize Playbook Folder

- Create new folder structure
- Move components to new locations
- Update all imports
- Test thoroughly

### Week 3: Extract Shared Logic

- Create hooks and utilities
- Refactor components to use shared code
- Add tests for shared logic

### Week 4: Documentation & Polish

- Update documentation
- Add Storybook stories for new components
- Performance testing
- Final cleanup

---

## Success Metrics

- ✅ Reduce playbook folder from 30+ files to organized modules
- ✅ Extract at least 5 reusable UI components
- ✅ Reduce code duplication by 30%+
- ✅ Improve import path clarity
- ✅ Zero broken imports or functionality
- ✅ Maintain or improve performance

---

## Notes

- Keep existing functionality unchanged during refactoring
- Use feature flags for risky changes
- Maintain backward compatibility with barrel exports
- Run full test suite after each phase
- Update documentation incrementally
