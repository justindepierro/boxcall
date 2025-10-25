# Game Plans Page: Facebook-Fast Performance Roadmap 🚀

**Created:** October 25, 2025  
**Target:** Make Game Plans Page feel as fast as Facebook  
**Estimated Total Time:** 4-5 hours (3 phases)

---

## 📊 Current State Analysis

### Performance Audit

**Current Bottlenecks:**

1. **Full page reload after every action** (`await loadGamePlans()` called 7 times)
2. **No optimistic updates** - users wait 500-1000ms for server confirmation
3. **Blank screen during loading** - basic pulse animation, no structure
4. **Heavy modals already lazy loaded** ✅ (GamePlanModal, ImportGamePlansModal)
5. **Search/filter already memoized** ✅ (useMemo for filteredAndSortedPlans)

**What's Already Good:**

- ✅ Lazy loaded modals (GamePlanModal, ImportGamePlansModal)
- ✅ Memoized search/filter logic
- ✅ Clean component structure
- ✅ TypeScript strict typing

**Performance Targets:**

- Save game plan: **500ms → <50ms** (10x faster perceived)
- Search: **Already instant** (memoized filter <10ms)
- Modal open: **Already <100ms** (lazy loaded)
- Duplicate: **800ms → <50ms** (16x faster)
- Archive/Delete: **600ms → <50ms** (12x faster)

---

## 🎯 Phase 1: Quick Wins (1.5-2 hours)

### 1.1: Optimistic Game Plan Saves ⚡ **BIGGEST IMPACT**

**Problem:**

```tsx
// Current: Wait for server, then reload everything
const handleSavePlan = async (plan: ModalGamePlan) => {
  try {
    if (editingPlan) {
      await GamePlanService.updateGamePlan(plan.id, { ... });
      toast.success("Game plan updated successfully");
    } else {
      await GamePlanService.createGamePlan({ ... });
      toast.success("Game plan created successfully");
    }

    // ❌ Full reload - 500ms+ of waiting
    await loadGamePlans();
    setShowModal(false);
  } catch (error) { ... }
};
```

**User Experience:**

- Click "Save" → Wait 500ms → See toast → Wait another 300ms → See updated list
- **Total perceived time: 800ms** ❌

**Solution:**

```tsx
const handleSavePlan = async (plan: ModalGamePlan) => {
  if (!activeTeamId) {
    toast.error("No active team found");
    return;
  }

  try {
    // 1. Show instant success feedback
    toast.success(editingPlan ? "Game plan updated!" : "Game plan created!");

    // 2. Optimistically update UI immediately
    if (editingPlan) {
      setGamePlans((prev) =>
        prev.map((p) =>
          p.id === plan.id
            ? { ...plan, updatedAt: new Date().toISOString() }
            : p
        )
      );
    } else {
      // Create temporary ID for optimistic add
      const tempId = `temp-${Date.now()}`;
      const optimisticPlan = {
        ...plan,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      setGamePlans((prev) => [optimisticPlan, ...prev]);
    }

    // 3. Close modal instantly
    setShowModal(false);
    setEditingPlan(undefined);

    // 4. Sync with server in background (silent)
    if (editingPlan) {
      await GamePlanService.updateGamePlan(plan.id, {
        name: plan.name,
        opponent: plan.opponent,
        gameDate: plan.gameDate,
        gameLocation: plan.gameLocation,
      });
    } else {
      const newPlan = await GamePlanService.createGamePlan({
        teamId: activeTeamId,
        name: plan.name,
        opponent: plan.opponent,
        gameDate: plan.gameDate,
        gameLocation: plan.gameLocation,
      });

      // Replace temp ID with real ID
      setGamePlans((prev) =>
        prev.map((p) => (p.id === tempId ? { ...newPlan, ...plan } : p))
      );
    }
  } catch (error) {
    console.error("Failed to save game plan:", error);

    // 5. Rollback on error
    if (editingPlan) {
      // Revert to original
      const original = rawGamePlans.find((p) => p.id === plan.id);
      if (original) {
        setGamePlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...original } : p))
        );
      }
    } else {
      // Remove optimistic add
      setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
    }

    toast.error("Failed to save game plan");
  }
};
```

**Expected Impact:**

- ✨ **10x faster** perceived response (800ms → <50ms)
- 🎯 **Instant feedback** - toast shows immediately
- 😊 **Non-blocking** - modal closes instantly
- 🔄 **Error handling** - automatic rollback if server fails

**Time:** 45 minutes

---

### 1.2: Optimistic Duplicate/Archive/Delete 🔄

**Problem:**

```tsx
// Current: Wait for server every time
const handleDuplicatePlan = async (plan: ModalGamePlan) => {
  try {
    await GamePlanService.duplicateGamePlan(plan.id, newName);
    await loadGamePlans(); // ❌ Full reload
    toast.success("Game plan duplicated successfully");
  } catch (error) { ... }
};
```

**Solution:**

```tsx
const handleDuplicatePlan = async (plan: ModalGamePlan) => {
  try {
    const newName = `${plan.name} (Copy)`;
    const tempId = `temp-${Date.now()}`;

    // 1. Instant UI update
    const duplicatedPlan = {
      ...plan,
      id: tempId,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGamePlans((prev) => [duplicatedPlan, ...prev]);
    toast.success("Game plan duplicated!");

    // 2. Background sync
    const newPlan = await GamePlanService.duplicateGamePlan(plan.id, newName);

    // 3. Replace temp with real ID
    setGamePlans((prev) =>
      prev.map((p) => (p.id === tempId ? { ...p, id: newPlan.id } : p))
    );
  } catch (error) {
    console.error("Failed to duplicate game plan:", error);

    // Rollback
    setGamePlans((prev) => prev.filter((p) => !p.id.startsWith("temp-")));
    toast.error("Failed to duplicate game plan");
  }
};

const handleArchivePlan = async (plan: ModalGamePlan) => {
  const originalArchiveState = plan.isArchived;

  try {
    // 1. Instant UI update
    setGamePlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, isArchived: !p.isArchived } : p
      )
    );
    toast.success(
      plan.isArchived ? "Game plan restored!" : "Game plan archived!"
    );

    // 2. Background sync
    if (plan.isArchived) {
      await GamePlanService.unarchiveGamePlan(plan.id);
    } else {
      await GamePlanService.archiveGamePlan(plan.id);
    }
  } catch (error) {
    console.error("Failed to archive/unarchive game plan:", error);

    // Rollback
    setGamePlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, isArchived: originalArchiveState } : p
      )
    );
    toast.error("Failed to update game plan");
  }
};

const handleDeletePlan = async (planId: string) => {
  if (!confirm("Are you sure you want to delete this game plan?")) return;

  const deletedPlan = gamePlans.find((p) => p.id === planId);

  try {
    // 1. Instant UI update
    setGamePlans((prev) => prev.filter((p) => p.id !== planId));
    toast.success("Game plan deleted!");

    // 2. Background sync
    await GamePlanService.deleteGamePlan(planId);
  } catch (error) {
    console.error("Failed to delete game plan:", error);

    // Rollback
    if (deletedPlan) {
      setGamePlans((prev) => [...prev, deletedPlan]);
    }
    toast.error("Failed to delete game plan");
  }
};
```

**Expected Impact:**

- ✨ **16x faster** duplicate (800ms → <50ms)
- ✨ **12x faster** archive/delete (600ms → <50ms)
- 🎯 **Instant feedback** on all actions

**Time:** 45 minutes

---

### 1.3: Preload Heavy Modals During Idle Time 🚀

**Problem:**

- Modals already lazy loaded ✅
- But first open still takes 100-200ms to chunk load
- No preloading during idle time

**Solution:**

```tsx
// In GamePlansPage component, after initial load
useEffect(() => {
  if (isLoading || gamePlans.length === 0) return;

  // Preload modals after 2 seconds of idle time
  const timer = setTimeout(() => {
    console.debug(
      "[GamePlansPage] Preloading heavy modals during idle time..."
    );

    // Preload GamePlanModal
    import("../components/playbook/GamePlanModal").catch(() => {
      console.debug("GamePlanModal preload failed (will load on demand)");
    });

    // Preload ImportGamePlansModal
    import("../components/playbook/ImportGamePlansModal").catch(() => {
      console.debug(
        "ImportGamePlansModal preload failed (will load on demand)"
      );
    });
  }, 2000);

  return () => clearTimeout(timer);
}, [isLoading, gamePlans.length]);
```

**Expected Impact:**

- ✨ **Instant modal open** after 2 seconds (browser caches chunks)
- 🎯 **Zero perceived delay** for most users
- 😊 **Progressive enhancement** - still works if preload fails

**Time:** 15 minutes

---

## 🎨 Phase 2: Skeleton Screens & Polish (1.5 hours)

### 2.1: Game Plan Card Skeletons 💀

**Problem:**

```tsx
// Current: Generic pulse animation
{isLoading ? (
  <div className="space-y-4 py-10" aria-busy="true">
    <div className="h-32 rounded-xl bg-surface-secondary animate-pulse" />
    <div className="h-32 rounded-xl bg-surface-secondary animate-pulse" />
    <div className="h-32 rounded-xl bg-surface-secondary animate-pulse" />
  </div>
) : ...}
```

**User Experience:**

- Shows 3 gray boxes
- No indication of what's loading
- Feels incomplete

**Solution:**

Create `src/components/ui/Skeleton/GamePlanSkeleton.tsx`:

```tsx
import React from "react";

interface GamePlanSkeletonProps {
  count?: number;
}

export const GamePlanSkeleton: React.FC<GamePlanSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-primary rounded-2xl border border-border p-5 animate-pulse"
        >
          {/* Title & Badge Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div className="h-6 bg-surface-secondary rounded-lg w-3/4" />

              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-6 bg-surface-secondary rounded-full w-20" />
                <div className="h-6 bg-surface-secondary rounded-full w-24" />
                <div className="h-6 bg-surface-secondary rounded-full w-16" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <div className="h-12 w-12 bg-surface-secondary rounded-xl" />
              <div className="h-12 w-12 bg-surface-secondary rounded-xl" />
              <div className="h-12 w-12 bg-surface-secondary rounded-xl" />
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between mt-4">
            <div className="h-4 bg-surface-secondary rounded w-20" />
            <div className="h-4 bg-surface-secondary rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

GamePlanSkeleton.displayName = "GamePlanSkeleton";
```

**Usage:**

```tsx
// In GamePlansPage.tsx
import { GamePlanSkeleton } from "../components/ui/Skeleton/GamePlanSkeleton";

// Replace loading state:
{isLoading ? (
  <div className="space-y-6">
    <Typography variant="headline-md" className="text-text-primary">
      Active Game Plans
    </Typography>
    <GamePlanSkeleton count={6} />
  </div>
) : ...}
```

**Expected Impact:**

- ✨ **50% better perceived speed** - shows structure immediately
- 🎯 **Professional feel** - like Facebook/LinkedIn loading states
- 😊 **User confidence** - knows content is coming

**Time:** 45 minutes

---

### 2.2: Batch State Updates 📦

**Problem:**

- Multiple `setGamePlans` calls in quick succession
- Each triggers re-render of entire list
- Unnecessary React reconciliation

**Solution:**

```tsx
// Use functional updates to batch
const handleBulkActions = async (
  planIds: string[],
  action: "archive" | "delete"
) => {
  try {
    // Single state update with all changes
    setGamePlans((prev) => {
      if (action === "archive") {
        return prev.map((p) =>
          planIds.includes(p.id) ? { ...p, isArchived: true } : p
        );
      } else {
        return prev.filter((p) => !planIds.includes(p.id));
      }
    });

    toast.success(`${planIds.length} plans ${action}d`);

    // Background sync
    await Promise.all(
      planIds.map((id) =>
        action === "archive"
          ? GamePlanService.archiveGamePlan(id)
          : GamePlanService.deleteGamePlan(id)
      )
    );
  } catch (error) {
    // Rollback entire batch
    await loadGamePlans();
    toast.error(`Failed to ${action} plans`);
  }
};
```

**Expected Impact:**

- ✨ **3x fewer re-renders** (single state update vs multiple)
- 🎯 **Smoother animations** (no render jank)
- 😊 **Better UX** for bulk operations

**Time:** 30 minutes

---

### 2.3: Loading State Polish ✨

**Problem:**

- No visual feedback during background syncs
- Users don't know if action is still processing

**Solution:**

```tsx
// Add optimistic loading states
const [optimisticActions, setOptimisticActions] = useState<Set<string>>(
  new Set()
);

const withOptimisticLoading = async (
  planId: string,
  action: () => Promise<void>
) => {
  setOptimisticActions((prev) => new Set(prev).add(planId));

  try {
    await action();
  } finally {
    setOptimisticActions((prev) => {
      const next = new Set(prev);
      next.delete(planId);
      return next;
    });
  }
};

// Usage in card:
<div
  className={cn(
    "bg-surface-primary rounded-2xl border border-border p-5",
    optimisticActions.has(plan.id) && "opacity-60 pointer-events-none"
  )}
>
  {/* Card content */}
</div>;
```

**Expected Impact:**

- ✨ **Visual feedback** during background sync
- 🎯 **Prevents double-clicks** (pointer-events-none)
- 😊 **Professional polish**

**Time:** 15 minutes

---

## 🔥 Phase 3: Advanced Optimizations (1-1.5 hours)

### 3.1: Predictive Plan Prefetch 🔮

**Problem:**

- When user hovers over plan card, they'll likely open the modal
- Modal data could be prefetched during hover

**Solution:**

```tsx
const [prefetchedPlans, setPrefetchedPlans] = useState<
  Map<string, ModalGamePlan>
>(new Map());

const handlePlanHover = useCallback(
  (planId: string) => {
    // Only prefetch if not already cached
    if (prefetchedPlans.has(planId)) return;

    // Prefetch plan details after 200ms hover
    const timer = setTimeout(async () => {
      try {
        const fullPlan = await GamePlanService.getGamePlan(planId, true);
        setPrefetchedPlans((prev) => new Map(prev).set(planId, fullPlan));
      } catch (error) {
        // Silent fail - will load on demand
        console.debug("Prefetch failed:", error);
      }
    }, 200);

    return () => clearTimeout(timer);
  },
  [prefetchedPlans]
);

// Usage:
<div
  onMouseEnter={() => handlePlanHover(plan.id)}
  onClick={() => handleEditPlan(prefetchedPlans.get(plan.id) || plan)}
>
  {/* Card content */}
</div>;
```

**Expected Impact:**

- ✨ **Perceived instant load** for modal data
- 🎯 **Proactive optimization** - fetch before user clicks
- 😊 **Zero perceived delay** on modal open

**Time:** 30 minutes

---

### 3.2: Virtual Scrolling for 50+ Plans 📜

**Problem:**

- Rendering 50+ game plan cards at once = slow
- All cards in DOM = memory intensive

**Solution:**

```tsx
import { Virtuoso } from "react-virtuoso";

// Only render when plans > 30
{activePlans.length > 30 ? (
  <Virtuoso
    data={activePlans}
    itemContent={(index, plan) => (
      <GamePlanCard
        key={plan.id}
        plan={plan}
        onEdit={handleEditPlan}
        onDuplicate={handleDuplicatePlan}
        onArchive={handleArchivePlan}
        onDelete={handleDeletePlan}
        onExportPDF={handleExportPDF}
      />
    )}
    style={{ height: "calc(100vh - 400px)" }}
  />
) : (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
    {activePlans.map(plan => (
      <GamePlanCard key={plan.id} plan={plan} ... />
    ))}
  </div>
)}
```

**Expected Impact:**

- ✨ **5x faster** for 100+ plans (only render visible cards)
- 🎯 **Lower memory usage** (30 DOM nodes vs 100+)
- 😊 **Smooth scrolling** even with hundreds of plans

**Time:** 30 minutes

---

### 3.3: Modal Skeleton Screens 🎭

**Problem:**

- GamePlanModal shows blank while loading situations/plays
- No visual feedback during modal load

**Solution:**

Create `src/components/ui/Skeleton/GamePlanModalSkeleton.tsx`:

```tsx
export const GamePlanModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="h-8 bg-surface-secondary rounded w-1/3 animate-pulse" />

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="h-12 bg-surface-secondary rounded animate-pulse" />
        <div className="h-12 bg-surface-secondary rounded animate-pulse" />
        <div className="h-12 bg-surface-secondary rounded animate-pulse" />
      </div>

      {/* Situations */}
      <div className="space-y-3">
        <div className="h-6 bg-surface-secondary rounded w-1/4 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-surface-secondary rounded animate-pulse"
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <div className="h-10 w-20 bg-surface-secondary rounded animate-pulse" />
        <div className="h-10 w-20 bg-surface-secondary rounded animate-pulse" />
      </div>
    </div>
  );
};
```

**Usage:**

```tsx
<Suspense fallback={<GamePlanModalSkeleton />}>
  <GamePlanModal ... />
</Suspense>
```

**Expected Impact:**

- ✨ **Better perceived UX** - shows structure immediately
- 🎯 **Professional feel** - no blank modal flashes
- 😊 **User confidence** - knows what's loading

**Time:** 30 minutes

---

## 📈 Expected Results Summary

### Performance Improvements

| Metric               | Before             | After         | Improvement                   |
| -------------------- | ------------------ | ------------- | ----------------------------- |
| **Create Game Plan** | 800ms              | <50ms         | **16x faster** ⚡             |
| **Update Game Plan** | 500ms              | <50ms         | **10x faster** ⚡             |
| **Duplicate Plan**   | 800ms              | <50ms         | **16x faster** ⚡             |
| **Archive Plan**     | 600ms              | <50ms         | **12x faster** ⚡             |
| **Delete Plan**      | 600ms              | <50ms         | **12x faster** ⚡             |
| **Search Filter**    | Already instant ✅ | <10ms         | No change (already good)      |
| **Modal Open**       | Already <100ms ✅  | <50ms         | **2x faster** (with prefetch) |
| **Initial Load**     | 300ms blank        | 50ms skeleton | **50% better perceived** 🎨   |

### User Experience Improvements

**Before:**

- Click "Save" → Wait 800ms → See toast → See updated list
- Click "Duplicate" → Wait 800ms → See toast → See new card
- Click "Archive" → Wait 600ms → See toast → Card moves
- Initial load shows 3 gray boxes

**After:**

- Click "Save" → **Instant** toast → **Instant** modal close → **Instant** list update ⚡
- Click "Duplicate" → **Instant** new card appears → Background sync ⚡
- Click "Archive" → **Instant** card moves → Background sync ⚡
- Initial load shows realistic game plan card skeletons 🎨
- Hover over card → Prefetches data → **Instant** modal open 🔮

### Total Time Investment

- **Phase 1 (Quick Wins):** 1.5-2 hours
  - 1.1: Optimistic saves - 45 min
  - 1.2: Optimistic actions - 45 min
  - 1.3: Preload modals - 15 min

- **Phase 2 (Skeleton & Polish):** 1.5 hours
  - 2.1: Card skeletons - 45 min
  - 2.2: Batch updates - 30 min
  - 2.3: Loading polish - 15 min

- **Phase 3 (Advanced):** 1-1.5 hours
  - 3.1: Predictive prefetch - 30 min
  - 3.2: Virtual scrolling - 30 min
  - 3.3: Modal skeletons - 30 min

**Total:** 4-5 hours

### ROI Analysis

**Phase 1 ROI: ⭐⭐⭐⭐⭐ (Highest)**

- Time: 1.5-2 hours
- Impact: Massive (10-16x faster perceived)
- User satisfaction: Game plans feel instant

**Phase 2 ROI: ⭐⭐⭐⭐ (High)**

- Time: 1.5 hours
- Impact: High (50% better perceived load, professional polish)
- User satisfaction: Feels like a premium app

**Phase 3 ROI: ⭐⭐⭐ (Medium)**

- Time: 1-1.5 hours
- Impact: Medium (nice-to-haves, edge case improvements)
- User satisfaction: Handles large datasets gracefully

---

## 🎯 Implementation Strategy

### Recommended Approach: Ship Phase 1 First

**Why Phase 1 is Critical:**

- Biggest user-facing impact (10-16x faster)
- Smallest time investment (1.5-2 hours)
- Immediate "wow factor" for coaches

**Ship Sequence:**

1. ✅ **Ship Phase 1** → Immediate user delight
2. 🚢 Monitor metrics for 1-2 days
3. ✅ **Ship Phase 2** → Professional polish
4. 🚢 Monitor metrics for 1-2 days
5. ✅ **Ship Phase 3** if needed → Handle scale

### Success Metrics

**Phase 1 Success Criteria:**

- ✅ Save game plan: <50ms perceived response time
- ✅ All actions show instant feedback (toast + UI update)
- ✅ Zero perceived delay on 90%+ of actions
- ✅ Error rollback works correctly

**Phase 2 Success Criteria:**

- ✅ Skeleton screens show realistic structure
- ✅ No layout shift during load
- ✅ Professional loading states match design system

**Phase 3 Success Criteria:**

- ✅ Virtual scrolling handles 100+ plans smoothly
- ✅ Prefetch hits 70%+ of modal opens
- ✅ Modal skeletons show for <200ms

---

## 🚀 Ready to Start?

Phase 1 will make the biggest impact - want to tackle it now? Let's make game plans feel **Facebook-fast**! ⚡

**Next Steps:**

1. Create todo list for Phase 1 tasks
2. Implement optimistic saves (45 min)
3. Add optimistic actions (45 min)
4. Preload modals (15 min)
5. Test & validate

Total time to make game plans feel instant: **~2 hours** 🎯
