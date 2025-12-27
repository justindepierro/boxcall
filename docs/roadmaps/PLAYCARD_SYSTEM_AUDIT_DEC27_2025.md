# PlayCard System Audit & Optimization Roadmap

**Date**: December 27, 2025  
**Status**: Planning Phase  
**Scope**: Complete audit of PlayCard, PlayList, and related components

---

## Executive Summary

The PlayCard system is functional but has accumulated technical debt through incremental feature additions. This roadmap outlines a professional cleanup to improve performance, maintainability, and user experience.

### Current State

| Component | Lines | Issues |
|-----------|-------|--------|
| PlayCard.tsx | 697 | eslint-disable, complexity warning, large component |
| PlayCardTileHeader.tsx | 371 | Good after cleanup |
| PlayCardListHeader.tsx | 706 | **Massive**, duplicate badge logic |
| PlayCardDetails.tsx | 143 | Clean, well-organized |
| fieldDefinitions.tsx | 535 | Works but verbose |
| PlayCardQuickActions.tsx | 128 | Clean |
| helpers.ts | 80 | Clean |

**Total: ~4,000+ lines** across the PlayCard system

---

## 🔴 Critical Issues (Fix Immediately)

### 1. PlayCardListHeader.tsx - 706 Lines
**Problem**: The largest file with duplicate badge rendering logic (CollapsedBadges + ExpandedBadges = ~250 lines of near-identical code).

**Impact**: 
- Hard to maintain
- Bug fixes need double work
- Inconsistent badge behavior vs TileHeader

**Solution**:
```
Create unified BadgeRow component:
- src/components/playbook/play-card/badges/BadgeRow.tsx
- src/components/playbook/play-card/badges/useBadgeSchemes.ts
- Shared between Tile and List headers
```

### 2. PlayCard.tsx - 697 Lines with ESLint Disabled
**Problem**: Component has `/* eslint-disable max-lines-per-function */` and `/* eslint-disable complexity */` at the top.

**Impact**:
- Hard to reason about
- Testing is difficult
- Prop drilling 15+ props through children

**Solution**:
```
Extract into smaller hooks:
- usePlayCardState() - optimistic updates, saving state
- usePlayCardLayout() - field order, visibility
- usePlayCardHandlers() - all callbacks
```

### 3. Inconsistent Badge Systems
**Problem**: Three different badge implementations:
1. `EditableSchemeBadge` - Color picker popup
2. `PersonnelBadge` - Custom badge config
3. `Badge` - Static badge

**Impact**: 
- Confusing UX
- Color picker appears in weird places
- No unified API

**Solution**:
```
Create unified badge API:
- <SmartBadge> - Detects if editable, renders correct variant
- Single source of truth for badge color schemes
```

---

## 🟡 Medium Priority (Next Sprint)

### 4. Field Definitions Verbosity
**Problem**: `fieldDefinitions.tsx` is 535 lines of repetitive render functions.

**Current Pattern**:
```tsx
{
  label: "Formation",
  render: (optimisticPlay, handleInlineSave, savingFields) => (
    <InlineEditField
      value={optimisticPlay.formation}
      onSave={(value) => handleInlineSave("formation", value)}
      placeholder="Enter formation"
      // ... 10 more props
    />
  ),
}
```

**Better Pattern**:
```tsx
// Declarative field config
const FORMATION_FIELD = {
  key: "formation",
  label: "Base",
  type: "text",
  placeholder: "Enter formation",
  suggestions: FORMATION_OPTIONS,
  validation: validateFormationName,
};

// Single renderer
<DynamicField config={FORMATION_FIELD} play={optimisticPlay} onSave={handleInlineSave} />
```

### 5. Prop Drilling Hell
**Problem**: PlayCard passes 15+ props to children, who pass them further down.

**Current**:
```tsx
<PlayCardDetails
  play={play}
  optimisticPlay={optimisticPlay}
  handleInlineSave={handleInlineSave}
  savingFields={savingFields}
  formationFieldOrder={formationFieldOrder}
  formationFields={formationFields}
  formationFieldVisibility={formationFieldVisibility}
  toggleFieldVisibility={toggleFieldVisibility}
  handleFormationDragEnd={handleFormationDragEnd}
  playDetailsFieldOrder={playDetailsFieldOrder}
  playDetailsFields={playDetailsFields}
  playDetailsFieldVisibility={playDetailsFieldVisibility}
  handlePlayDetailsDragEnd={handlePlayDetailsDragEnd}
  // ... more
/>
```

**Solution**: Create `PlayCardContext`
```tsx
const PlayCardProvider = ({ play, children }) => {
  const state = usePlayCardState(play);
  return (
    <PlayCardContext.Provider value={state}>
      {children}
    </PlayCardContext.Provider>
  );
};

// Children just consume:
const { optimisticPlay, handleSave, savingFields } = usePlayCardContext();
```

### 6. Duplicate Display Name Logic
**Problem**: Display name calculation exists in:
- `PlayCard.tsx` - `getDisplayName()`
- `PlayCardTileHeader.tsx` - `tileTitle` logic
- `PlayCardListHeader.tsx` - (implicit)
- `utils/playNameUtils.ts` - actual implementation

**Solution**: Single source in `playNameUtils.ts`, no local overrides.

---

## 🟢 Low Priority (Future Sprints)

### 7. Animation Optimization
**Problem**: Every card has `whileHover`, `AnimatePresence`, motion divs.

**Impact**: 
- Potential jank on large lists
- Heavy re-renders

**Solution**:
- Use CSS transitions for simple hovers
- Reserve Framer Motion for expand/collapse only
- Consider `motion.div` → `motion.li` for list optimization

### 8. Mobile-First Responsive Refactor
**Problem**: Mobile detection via `useIsMobile()` scattered throughout:
- PlayCard.tsx
- PlayCardTileHeader.tsx
- PlayCardListHeader.tsx

**Solution**: 
- Use CSS `@media` queries where possible
- Centralize breakpoint logic
- Remove redundant `isMobile ? ... : ...` ternaries

### 9. Accessibility Improvements
**Current**: Basic ARIA labels present but incomplete.

**Needed**:
- Keyboard navigation in badge color picker
- Focus management on expand/collapse
- Screen reader announcements for save states
- Focus trap in tooltip/popover

### 10. Performance: Virtualization
**Problem**: Large playlists render all cards.

**Current**: React.memo on PlayCard (good).

**Improvement**:
- Virtual scrolling for 100+ plays
- Already have `react-virtuoso` in deps
- Create `VirtualizedPlayGrid` wrapper

---

## 📁 Proposed File Structure

```
src/components/playbook/
├── PlayCard.tsx                    # Main component (slimmed to ~200 lines)
├── PlayCardContext.tsx             # NEW: Context provider
├── play-card/
│   ├── index.ts                    # Barrel exports
│   ├── types.ts                    # All PlayCard types
│   │
│   ├── headers/
│   │   ├── TileHeader.tsx          # Renamed from PlayCardTileHeader
│   │   ├── ListHeader.tsx          # Renamed from PlayCardListHeader
│   │   └── HeaderActions.tsx       # Shared action buttons
│   │
│   ├── badges/
│   │   ├── BadgeRow.tsx            # NEW: Unified badge row
│   │   ├── SmartBadge.tsx          # NEW: Auto-selects badge type
│   │   ├── useBadgeSchemes.ts      # NEW: All badge scheme logic
│   │   └── badgeConfigs.ts         # Badge color definitions
│   │
│   ├── details/
│   │   ├── PlayCardDetails.tsx     # Keep current structure
│   │   ├── DynamicField.tsx        # NEW: Generic field renderer
│   │   ├── fieldConfigs.ts         # NEW: Declarative field definitions
│   │   └── components/             # Keep existing
│   │
│   ├── actions/
│   │   ├── QuickActions.tsx        # Renamed from PlayCardQuickActions
│   │   └── usePlayStatus.ts        # Move from hooks/
│   │
│   ├── hooks/
│   │   ├── usePlayCardState.ts     # NEW: Optimistic state
│   │   ├── usePlayCardLayout.ts    # Field order/visibility
│   │   └── usePlayCardHandlers.ts  # All callbacks
│   │
│   └── utils/
│       ├── helpers.ts              # Keep current
│       └── constants.ts            # Keep current
```

---

## 📊 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `PlayCardContext` and provider
- [ ] Extract `usePlayCardState` hook
- [ ] Create `BadgeRow` unified component
- [ ] Refactor `PlayCardListHeader` to use `BadgeRow`
- [ ] Remove eslint-disable from `PlayCard.tsx`

**Deliverables**: Reduced prop drilling, unified badge system

### Phase 2: DRY Refactor (Week 2)
- [ ] Create `SmartBadge` component
- [ ] Create `DynamicField` renderer
- [ ] Convert `fieldDefinitions.tsx` to declarative config
- [ ] Consolidate display name logic

**Deliverables**: 50% reduction in duplicate code

### Phase 3: Polish (Week 3)
- [ ] CSS transitions for simple animations
- [ ] Accessibility improvements
- [ ] Mobile-first CSS refactor
- [ ] Performance profiling

**Deliverables**: Snappier UX, WCAG compliance

### Phase 4: Scale (Week 4)
- [ ] Virtual scrolling for large lists
- [ ] Lazy loading for expanded details
- [ ] Bundle size optimization

**Deliverables**: Smooth 1000+ play lists

---

## 📈 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| PlayCard.tsx lines | 697 | <300 |
| PlayCardListHeader.tsx lines | 706 | <300 |
| Total system lines | ~4,000 | <2,500 |
| ESLint warnings | 2 disabled | 0 |
| Lighthouse Performance | TBD | 95+ |
| Time to expand card | ~200ms | <100ms |

---

## 🚀 Quick Wins (Can Do Today)

1. **Remove unused imports** - Found several
2. **Memoize badge scheme callbacks** - Prevent re-renders
3. **Add `loading="lazy"` to diagram images** - Already done in some places
4. **Extract constants** - Magic numbers → named constants

---

## Dependencies & Risks

### Dependencies
- Design system tokens (already in place)
- React Query for caching (already in place)
- Existing badge components

### Risks
- **Regression risk**: High - many components affected
- **Mitigation**: Comprehensive Storybook stories before refactor
- **Testing**: Add unit tests for hooks before extraction

---

## Next Steps

1. Review and approve this roadmap
2. Create tracking issues in GitHub
3. Set up Storybook stories for current state
4. Begin Phase 1

---

*Document created: December 27, 2025*  
*Author: Copilot Audit System*
