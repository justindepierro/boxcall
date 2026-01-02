# Professional Optimization Plan

**Date**: January 1, 2026  
**Status**: 1,083 files → Target: <1,000 files  
**Goal**: Transform codebase into professional, maintainable, high-performance application

---

## 🎯 Priority 1: Architecture & Organization (Immediate Impact)

### 1.1 Service Layer Consolidation

**Problem**: Massive monolithic services (1,503 lines practiceService, 1,312 lines playsService)

**Action**:

```
✅ Split large services into feature-focused modules:
   - practiceService.ts (1,503 lines) →
     ├─ practice/sessionService.ts (session CRUD)
     ├─ practice/blockService.ts (block management)
     ├─ practice/analyticsService.ts (practice analytics)
     └─ practice/index.ts (barrel export)

   - playsService.ts (1,312 lines) →
     ├─ plays/crudService.ts (create/read/update/delete)
     ├─ plays/validationService.ts (validation logic)
     ├─ plays/importService.ts (CSV import logic)
     └─ plays/index.ts (barrel export)
```

**Impact**: Better testability, faster file navigation, clearer boundaries

---

### 1.2 Component Decomposition

**Problem**: Monolithic components (954 line PlaybookPage, 742 line AddNewPlayModal)

**Priority Targets**:

1. **PlaybookPage.tsx** (954 lines) → Extract state management, handlers, effects into custom hooks
2. **AddNewPlayModal.tsx** (742 lines) → Split validation, AI, similarity into separate concerns
3. **MobilePracticeSession.tsx** (1,451 lines) → Extract session state machine, UI sections
4. **MobileGameSession.tsx** (860 lines) → Extract game state logic, situation management

**Pattern**: Use composition over large components

```tsx
// ❌ BAD: 900-line monolith
export function PlaybookPage() {
  // 50 state variables
  // 30 handlers
  // 20 useEffect
  // 800 lines of JSX
}

// ✅ GOOD: Composed architecture
export function PlaybookPage() {
  const state = usePlaybookState();
  const handlers = usePlaybookHandlers(state);
  const effects = usePlaybookEffects(state);

  return (
    <PlaybookLayout>
      <PlaybookHeader {...handlers} />
      <PlaybookContent {...state} {...handlers} />
      <PlaybookModals {...state} />
    </PlaybookLayout>
  );
}
```

---

### 1.3 Type System Optimization

**Problem**: 4,226-line database types index, 729-line practiceGameTables

**Actions**:

1. ✅ Split `types/database/index.ts` into domain-specific modules
2. ✅ Use discriminated unions for complex states
3. ✅ Create branded types for IDs to prevent mixing
4. ✅ Leverage const assertions and template literals

```typescript
// Branded types for type safety
type PlayId = string & { __brand: "PlayId" };
type TeamId = string & { __brand: "TeamId" };
type UserId = string & { __brand: "UserId" };

// Discriminated unions for state machines
type SessionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "active"; data: Session }
  | { status: "error"; error: Error };
```

---

## 🚀 Priority 2: Performance Optimization

### 2.1 Memoization Strategy

**Current**: ESLint shows complexity warnings (25-61 complexity in AddNewPlayModal)

**Actions**:

1. ✅ Wrap expensive calculations in `useMemo`
2. ✅ Wrap callback props in `useCallback`
3. ✅ Use `React.memo` for pure components
4. ✅ Implement virtual scrolling for large lists (already done for PlayGrid)

**Target Components**:

- PlaybookPage content rendering
- Practice session active block rendering
- CSV import validation row rendering

---

### 2.2 Code Splitting & Lazy Loading

**Current**: 41 optimized chunks, 2.83MB bundle

**Actions**:

1. ✅ Lazy load all modals (already implemented for PracticeScriptModal)
2. ✅ Lazy load analytics dashboard components
3. ✅ Lazy load PDF generation (already split into separate chunk)
4. ✅ Route-based code splitting for all pages

```typescript
// ✅ Already implemented pattern - expand to more components
const AnalyticsDashboard = React.lazy(
  () => import("../components/analytics/AnalyticsDashboard")
);

const GamePlanModal = React.lazy(
  () => import("../components/playbook/GamePlanModal")
);
```

---

### 2.3 React Query Optimization

**Current**: 10min cache, 30min GC (good!)

**Actions**:

1. ✅ Implement optimistic updates for all mutations (already done for GamePlans)
2. ✅ Add prefetching for predictable navigation
3. ✅ Use suspense boundaries for better loading states
4. ✅ Implement infinite queries for paginated data

---

## 🏗️ Priority 3: Code Quality & Maintainability

### 3.1 Address TODOs (21+ found)

**Critical TODOs**:

- ❌ `executionTrackingService.ts`: Regenerate Supabase types for new tables
- ❌ `teamService.ts`: Create support_tickets table
- ❌ `achievementService.ts`: Implement real streak tracking, helmet stickers
- ❌ `calendarService.ts`: Implement actual Supabase integration

**Action**: Create Jira/Linear tickets for each TODO, prioritize by user impact

---

### 3.2 Consistent Error Handling

**Current**: Mix of try-catch, error states, toast notifications

**Standard Pattern**:

```typescript
// Unified error handling
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public severity: "error" | "warning" | "info"
  ) {
    super(message);
  }
}

// Centralized error handler
function handleError(error: unknown) {
  if (error instanceof AppError) {
    Sentry.captureException(error, { level: error.severity });
    toast[error.severity](error.userMessage);
  } else {
    // Unknown error - log and show generic message
    Sentry.captureException(error);
    toast.error("Something went wrong. Please try again.");
  }
}
```

---

### 3.3 Testing Strategy

**Current**: 95%+ coverage goal, Vitest + Playwright

**Actions**:

1. ✅ Unit tests for all services (focus on playsService, practiceService)
2. ✅ Integration tests for critical user flows
3. ✅ E2E tests for playbook management, practice planning, game planning
4. ✅ Visual regression tests for design system components

---

## 📦 Priority 4: File Organization Improvements

### 4.1 Feature-Based Structure

**Current**: Mix of component-based and feature-based organization

**Proposed Structure**:

```
src/
├── features/                    # Feature modules
│   ├── playbook/
│   │   ├── components/         # Playbook-specific components
│   │   ├── hooks/              # Playbook-specific hooks
│   │   ├── services/           # Playbook business logic
│   │   ├── types/              # Playbook types
│   │   └── pages/              # Playbook pages
│   ├── practice/
│   ├── gameplan/
│   └── analytics/
├── shared/                      # Shared across features
│   ├── components/ui/          # Design system components
│   ├── hooks/                  # Generic hooks
│   ├── services/               # Generic services
│   └── utils/                  # Utilities
└── core/                        # App core
    ├── auth/
    ├── routing/
    └── providers/
```

---

### 4.2 Barrel Export Optimization

**Current**: 103 index files (good practice!)

**Actions**:

1. ✅ Ensure all feature modules have barrel exports
2. ✅ Use named exports over default exports (better tree-shaking)
3. ✅ Avoid re-exporting everything (`export * from`)

---

## 🎨 Priority 5: Design System Maturity

### 5.1 Component Token Enforcement

**Current**: Custom ESLint rules enforce design tokens (excellent!)

**Actions**:

1. ✅ Audit remaining 7 ESLint warnings for design violations
2. ✅ Create Storybook stories for all UI components
3. ✅ Document component usage guidelines
4. ✅ Create component composition examples

---

### 5.2 Accessibility (A11y)

**Target**: WCAG 2.1 AA compliance

**Actions**:

1. ✅ Add aria labels to all interactive elements
2. ✅ Ensure keyboard navigation works everywhere
3. ✅ Test with screen readers
4. ✅ Add skip links for navigation
5. ✅ Ensure color contrast meets standards

---

## 📊 Success Metrics

### Code Health

- ✅ File count: <1,000 (currently 1,083)
- ✅ No files >500 lines (currently have 13 files >700 lines)
- ✅ ESLint warnings: 0 (currently 7)
- ✅ Test coverage: >95% (currently tracking)
- ✅ TypeScript strict mode: enabled ✓

### Performance

- ✅ Lighthouse score: >90 (all categories)
- ✅ First Contentful Paint: <1.5s
- ✅ Time to Interactive: <3s
- ✅ Bundle size: <1MB gzipped (currently 975KB ✓)

### Developer Experience

- ✅ Build time: <15s (currently 11.28s ✓)
- ✅ Hot reload: <1s
- ✅ Zero console errors in production
- ✅ Comprehensive Storybook documentation

---

## 🚀 Implementation Phases

### Phase 1: Quick Wins (Week 1)

1. Split practiceService & playsService
2. Extract PlaybookPage hooks
3. Add memoization to expensive components
4. Address critical TODOs

### Phase 2: Architecture (Week 2)

1. Decompose AddNewPlayModal
2. Decompose MobilePracticeSession
3. Implement feature-based structure
4. Standardize error handling

### Phase 3: Polish (Week 3)

1. Complete Storybook documentation
2. Add comprehensive tests
3. Accessibility audit
4. Performance optimization pass

### Phase 4: Excellence (Week 4)

1. Address remaining ESLint warnings
2. Complete TODO items
3. Final refactoring pass
4. Documentation update

---

## 🎯 Next Actions

**Immediate (Today)**:

1. Split practiceService.ts into modules
2. Extract PlaybookPage state hooks
3. Add memoization to PlayList rendering

**This Week**:

1. Complete service layer refactoring
2. Decompose top 5 largest components
3. Address critical TODOs

**This Month**:

1. Feature-based restructuring
2. Comprehensive testing
3. Performance optimization
4. Documentation completion

---

## 📝 Notes

- All changes should maintain backward compatibility
- Run full test suite after each refactor
- Update documentation as we go
- Use feature branches for major refactors
- Keep PRs small and focused (<500 lines changed)
