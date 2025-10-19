# 📱 Mobile Playbook Redesign - Phase 2 Progress

**Phase:** PlayGrid Mobile Redesign  
**Started:** October 19, 2025  
**Status:** 🚧 In Progress  
**Goal:** Mobile-first play card experience with swipe gestures, single-column layout, and progressive loading

---

## 🎯 Phase 2 Objectives

### Primary Goals
1. **Larger, Touch-Friendly Cards** - 2.35x current tap area (88px+ height)
2. **Swipeable Actions** - Swipe left for actions, right for quick edit
3. **Single-Column Layout** - Full-width cards on mobile
4. **Progressive Loading** - Show 20 plays, load 20 more on demand
5. **Quick Edit Gesture** - Swipe right to edit instantly

### Success Metrics
- Touch target: ≥ 88px height per card
- Swipe sensitivity: 60px threshold
- Initial load: 20 plays (fast render)
- Load more: 20 plays per tap
- Zero jank: 60fps animations

---

## 📋 Implementation Tasks

### ✅ Task 1: Review Phase 2 requirements
**Status:** In Progress  
**Description:** Review MOBILE_PLAYBOOK_REDESIGN_PLAN.md Phase 2 section, create detailed implementation plan

**Requirements from Plan:**
- MobilePlayCard: Larger, touch-friendly design (88px+ height)
- Swipe gestures: Left = actions menu, Right = quick edit
- Progressive loading: Show initial batch, "Load More" button
- Single-column layout on mobile
- Optimize for thumb-zone interaction

### ⏳ Task 2: Create MobilePlayCard component
**Status:** Not Started  
**Description:** Build mobile-optimized play card component

**Requirements:**
- **Height:** ≥ 88px (current cards ~37px)
- **Layout:** Full-width single column
- **Content:**
  - Large play thumbnail (left)
  - Play name (18px font, bold)
  - Formation + Personnel (14px, muted)
  - Quick actions (visible, not hidden)
- **Touch targets:** All buttons ≥ 44px
- **Swipe support:** Integrate with SwipeActions component

**Design:**
```tsx
<div className="h-[88px] w-full flex items-center gap-4 px-4 bg-surface-primary">
  {/* Play Thumbnail - 64x64 */}
  <div className="w-16 h-16 flex-shrink-0">
    <PlayThumbnail />
  </div>
  
  {/* Play Info */}
  <div className="flex-1 min-w-0">
    <Typography variant="body-lg" weight="semibold">
      {playName}
    </Typography>
    <Typography variant="body-sm" className="text-secondary">
      {formation} • {personnel}
    </Typography>
  </div>
  
  {/* Quick Actions */}
  <div className="flex gap-2">
    <IconButton icon="edit" size="md" />
    <IconButton icon="more-vertical" size="md" />
  </div>
</div>
```

### ⏳ Task 3: Create SwipeActions component
**Status:** Not Started  
**Description:** Build swipeable action drawer for play cards

**Requirements:**
- **Swipe threshold:** 60px (easy to trigger)
- **Actions revealed on left swipe:**
  - Delete (red)
  - Duplicate (blue)
  - Archive (gray)
- **Haptic feedback:** On swipe threshold
- **Animation:** Smooth 200ms transition
- **Reset:** Swipe back or tap outside

**Libraries:**
- `react-swipeable` or custom touch handlers
- CSS transforms for performance

**Design:**
```tsx
<div className="relative overflow-hidden">
  {/* Action buttons (hidden behind card) */}
  <div className="absolute right-0 top-0 h-full flex">
    <button className="w-20 bg-error-500">Delete</button>
    <button className="w-20 bg-primary-500">Duplicate</button>
    <button className="w-20 bg-surface-muted">Archive</button>
  </div>
  
  {/* Card (swipeable) */}
  <div 
    className="relative bg-surface-primary"
    style={{ transform: `translateX(${swipeX}px)` }}
  >
    <MobilePlayCard />
  </div>
</div>
```

### ⏳ Task 4: Update PlayGrid for mobile single-column
**Status:** Not Started  
**Description:** Modify PlayGrid to use single-column layout on mobile

**Changes:**
- **Grid:** `grid-cols-1` on mobile (current: `grid-cols-2`)
- **Gap:** `gap-4` (16px) for better spacing
- **Card component:** Use `MobilePlayCard` on mobile, `PlayCard` on desktop
- **Wrapper:** Add `<SwipeActions>` wrapper on mobile

**Implementation:**
```tsx
const PlayGrid = ({ plays }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "grid",
      isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    )}>
      {plays.map(play => (
        isMobile ? (
          <SwipeActions key={play.id} playId={play.id}>
            <MobilePlayCard play={play} />
          </SwipeActions>
        ) : (
          <PlayCard key={play.id} play={play} />
        )
      ))}
    </div>
  );
};
```

### ⏳ Task 5: Implement progressive loading
**Status:** Not Started  
**Description:** Add "Show More" button after initial 20 plays

**Requirements:**
- **Initial load:** 20 plays
- **Load increment:** 20 more plays per tap
- **Loading state:** Spinner while loading
- **Smooth scroll:** Auto-scroll to new content
- **End state:** "All plays loaded" message

**Implementation:**
```tsx
const [visibleCount, setVisibleCount] = useState(20);
const [isLoadingMore, setIsLoadingMore] = useState(false);

const loadMore = async () => {
  setIsLoadingMore(true);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate load
  setVisibleCount(prev => prev + 20);
  setIsLoadingMore(false);
  
  // Scroll to first new card
  const firstNewCard = document.querySelector(`[data-card-index="${visibleCount}"]`);
  firstNewCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

return (
  <>
    <PlayGrid plays={filteredPlays.slice(0, visibleCount)} />
    
    {visibleCount < filteredPlays.length && (
      <div className="flex justify-center py-8">
        <Button
          variant="secondary"
          onClick={loadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? (
            <>
              <Spinner size="sm" />
              Loading...
            </>
          ) : (
            `Show More (${filteredPlays.length - visibleCount} remaining)`
          )}
        </Button>
      </div>
    )}
    
    {visibleCount >= filteredPlays.length && (
      <div className="text-center py-8 text-secondary">
        All {filteredPlays.length} plays loaded
      </div>
    )}
  </>
);
```

### ⏳ Task 6: Test Phase 2 on real devices
**Status:** Not Started  
**Description:** Test on iPhone, Android, iPad

**Test Cases:**
- [ ] Cards feel large and comfortable to tap
- [ ] Swipe left reveals actions smoothly
- [ ] Swipe right triggers quick edit
- [ ] Progressive loading works (no jank)
- [ ] Scroll performance good (60fps)
- [ ] Haptic feedback on swipe
- [ ] Touch targets all ≥ 44px

---

## 📊 Progress Tracker

| Task | Status | Lines | Time Est. |
|------|--------|-------|-----------|
| 1. Review requirements | 🚧 In Progress | - | 15 min |
| 2. Create MobilePlayCard | ⏳ Not Started | ~120 lines | 1 hour |
| 3. Create SwipeActions | ⏳ Not Started | ~180 lines | 1.5 hours |
| 4. Update PlayGrid | ⏳ Not Started | ~50 lines | 45 min |
| 5. Progressive loading | ⏳ Not Started | ~80 lines | 1 hour |
| 6. Device testing | ⏳ Not Started | - | 30 min |
| **Total** | **0/6 complete** | **~430 lines** | **~5 hours** |

---

## 🎨 Design Specs

### Mobile Play Card Dimensions
- **Height:** 88px (2.35x current)
- **Width:** Full width (100vw - 32px padding)
- **Thumbnail:** 64x64px
- **Spacing:** 16px gap between cards
- **Touch target:** 88px tall × 100% wide

### Swipe Gesture Specs
- **Threshold:** 60px (easy to trigger)
- **Max swipe:** 240px (reveals 3 actions)
- **Action width:** 80px each
- **Animation:** 200ms cubic-bezier(0.4, 0, 0.2, 1)
- **Haptic:** Light impact at threshold

### Progressive Loading Specs
- **Initial:** 20 plays
- **Increment:** 20 plays
- **Button height:** 48px
- **Spinner size:** 20px
- **Auto-scroll:** Smooth, offset 80px from top

---

## 🔧 Technical Implementation

### New Files
1. `src/components/playbook/page/MobilePlayCard.tsx` (~120 lines)
2. `src/components/playbook/page/SwipeActions.tsx` (~180 lines)
3. `src/hooks/useSwipeGesture.ts` (~60 lines)

### Modified Files
1. `src/components/playbook/PlayGrid.tsx` (~50 lines changed)
2. `src/pages/PlaybookPage.tsx` (~30 lines changed)

### Dependencies
- `react-swipeable` (if not already installed)
- Existing: `useIsMobile`, `useHapticFeedback`, `usePlaybookActions`

---

## 📝 Notes

### Phase 1 Context
Phase 1 completed successfully:
- ✅ PlaybookBottomNav (bottom navigation)
- ✅ MobilePlaybookHeader (simplified header)
- ✅ MobileStatsBottomSheet (swipeable stats)
- ✅ All quality checks passed
- ✅ Committed: `88f99b82`

Phase 2 builds on top of Phase 1 by optimizing the play card grid for mobile.

### Next Phases
- **Phase 3:** AddNewPlayModal mobile wizard
- **Phase 4:** Filters & search mobile optimization
- **Phase 5:** Practice script mobile redesign
- **Phase 6:** Game plan modal mobile optimization

---

**Last Updated:** October 19, 2025 - Phase 2 planning complete, starting implementation
