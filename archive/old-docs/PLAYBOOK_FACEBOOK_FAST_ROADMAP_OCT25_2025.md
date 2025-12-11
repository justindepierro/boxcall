# Playbook Page: Facebook Fast Roadmap 🚀

**Date:** October 25, 2025  
**Goal:** Apply social features performance patterns to the Playbook page

## 🎯 Current State Analysis

### What's Already Fast ✅

Based on existing optimizations in the codebase:

- ✅ **Virtual scrolling** - Virtuoso already implemented in PlayGrid (handles 200+ plays)
- ✅ **Lazy loading** - FormationBuilderModal, DiagramEditor lazy loaded (~120KB savings)
- ✅ **Skeleton screens** - PlayGridSkeleton shows during initial load
- ✅ **Memoization** - PlayCard wrapped in React.memo, filteredPlays in useMemo
- ✅ **Optimistic updates** - Already has optimisticPlays state for instant feedback
- ✅ **Database indexes** - Plays table indexed for fast queries
- ✅ **React Query caching** - useTeamsDataQuery caches play data

### Performance Bottlenecks 🐌

Based on code analysis and docs:

1. **Canvas Rendering** - PixiJS/Fabric.js diagrams can lag on low-end devices
2. **Formation Builder Load** - Heavy bundle (~120KB) not preloaded
3. **Play Save Operations** - Still triggers full refetch in some cases
4. **Diagram Preview Generation** - Thumbnail creation blocks UI
5. **Search Lag** - 150-300ms debounce feels sluggish
6. **Bulk Operations** - Selecting multiple plays causes re-renders

### Target Metrics 🎯

| Metric                 | Current   | Target     | Strategy           |
| ---------------------- | --------- | ---------- | ------------------ |
| Create Play Response   | 200-500ms | **<50ms**  | Optimistic UI      |
| Search Response        | 150-300ms | **<50ms**  | Instant filter     |
| Formation Builder Open | 800ms+    | **<100ms** | Preload + skeleton |
| Diagram Save           | 500ms     | **<100ms** | Background sync    |
| Scroll Performance     | 60fps ✅  | 60fps      | Already optimal    |
| Initial Load           | 2-3s      | **<1s**    | Already optimized  |

---

## 📋 Roadmap: 3 Phases

### **PHASE 1: Quick Wins (2-3 hours)** ⚡

**Goal:** Apply social features patterns for instant feedback

#### 1.1 Optimistic Play Operations

**Impact:** 5-10x faster perceived response

```tsx
// In PlaybookPage.tsx - handleSavePlay
const handleSavePlay = useCallback(
  async (playId: string, updates: Partial<Play>) => {
    // OPTIMISTIC UPDATE - Instant feedback!
    const previousPlay = allPlays.find((p) => p.id === playId);
    setAllPlays((prev) =>
      prev.map((p) => (p.id === playId ? { ...p, ...updates } : p))
    );

    try {
      // Background server sync
      await PlaysService.updatePlay(playId, updates);
      // Verify with server (silent)
      const refreshed = await PlaysService.findOne(playId);
      setAllPlays((prev) => prev.map((p) => (p.id === playId ? refreshed : p)));
    } catch (error) {
      // Revert on error
      toast.error("Failed to save play");
      setAllPlays((prev) =>
        prev.map((p) => (p.id === playId ? previousPlay! : p))
      );
    }
  },
  [allPlays, toast]
);
```

**Files to Modify:**

- `src/pages/PlaybookPage.tsx` - Add optimistic save handler
- `src/components/playbook/PlayCard.tsx` - Remove loading spinner, instant feedback

**Effort:** 1 hour  
**Impact:** ⭐⭐⭐⭐⭐

---

#### 1.2 Instant Search (Remove Debounce)

**Impact:** 3x faster search response

```tsx
// In PlaybookPage.tsx
const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearch] = useDebouncedValue(searchQuery, 0); // 0ms = instant!

// Filter on every keystroke (fast enough with memoization)
const filteredPlays = useMemo(() => {
  if (!searchQuery.trim()) return allPlays;
  return allPlays.filter(
    (play) =>
      play.play_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      play.formation?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [allPlays, searchQuery]); // No debounce needed!
```

**Why It Works:**

- Array filtering is fast (<10ms for 200 plays)
- Already memoized
- Social features pattern: instant > technically perfect

**Files to Modify:**

- `src/pages/PlaybookPage.tsx` - Remove debounce from search
- `src/components/playbook/PlaybookHeader.tsx` - Instant search input

**Effort:** 30 minutes  
**Impact:** ⭐⭐⭐⭐

---

#### 1.3 Preload Formation Builder

**Impact:** 3-4x faster modal open

```tsx
// In PlaybookPage.tsx - Add prefetch on hover/mount
useEffect(() => {
  // Preload heavy modals on page load (idle time)
  const preloadModals = () => {
    import("../components/playbook/FormationBuilderModal");
    import("../components/playbook/diagram-editor/DiagramEditor");
  };

  // Wait 2s after page load, then preload
  const timer = setTimeout(preloadModals, 2000);
  return () => clearTimeout(timer);
}, []);

// Add hover prefetch to "New Play" button
<Button
  onMouseEnter={() => {
    import("../components/playbook/AddNewPlayModal");
  }}
  onClick={handleOpenQuickCreate}
>
  New Play
</Button>;
```

**Why It Works:**

- Preload during idle time (not blocking initial load)
- Hover intent = user about to click
- Modal opens instantly from cache

**Files to Modify:**

- `src/pages/PlaybookPage.tsx` - Add preload logic
- `src/components/playbook/page/PlaybookHeader.tsx` - Hover prefetch

**Effort:** 30 minutes  
**Impact:** ⭐⭐⭐⭐

---

### **PHASE 2: Canvas Performance (3-4 hours)** 🎨

**Goal:** Make diagram editing feel instant on all devices

#### 2.1 Optimistic Diagram Updates

**Impact:** Instant save feedback

```tsx
// In DiagramEditor.tsx
const handleSave = useCallback(async () => {
  // Show saved state immediately
  setIsSaving(false);
  setSavedState(currentDiagramData);
  toast.success("Diagram saved!");

  // Background sync
  try {
    await saveDiagram(playId, currentDiagramData);
  } catch (error) {
    // Silent retry or revert
    toast.error("Auto-save failed, retrying...");
    setTimeout(() => saveDiagram(playId, currentDiagramData), 3000);
  }
}, [playId, currentDiagramData]);
```

**Files to Modify:**

- `src/components/playbook/diagram-editor/DiagramEditor.tsx` - Optimistic save
- `src/services/diagramService.ts` - Background retry logic

**Effort:** 1.5 hours  
**Impact:** ⭐⭐⭐⭐

---

#### 2.2 Thumbnail Generation: Background Worker

**Impact:** Non-blocking thumbnail creation

```tsx
// New file: src/workers/thumbnailWorker.ts
import { fabric } from "fabric";

self.onmessage = async (e: MessageEvent) => {
  const { diagramData, width, height } = e.data;

  // Generate thumbnail in worker thread
  const canvas = new fabric.Canvas(null, { width, height });
  await canvas.loadFromJSON(diagramData);
  const thumbnail = canvas.toDataURL({ format: "webp", quality: 0.7 });

  self.postMessage({ thumbnail });
};

// In DiagramEditor.tsx
const generateThumbnail = useCallback(async (diagramData) => {
  const worker = new Worker(
    new URL("../workers/thumbnailWorker.ts", import.meta.url)
  );

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      resolve(e.data.thumbnail);
      worker.terminate();
    };
    worker.postMessage({ diagramData, width: 200, height: 150 });
  });
}, []);
```

**Why It Works:**

- Off main thread = no UI blocking
- Thumbnails generate in parallel
- User continues editing without lag

**Files to Modify:**

- `src/workers/thumbnailWorker.ts` - New worker file
- `src/components/playbook/diagram-editor/DiagramEditor.tsx` - Use worker
- `vite.config.ts` - Add worker plugin

**Effort:** 2 hours  
**Impact:** ⭐⭐⭐⭐⭐

---

#### 2.3 Canvas Performance: Reduce Redraws

**Impact:** Smoother interactions on low-end devices

```tsx
// In FormationBuilderCanvas.tsx
const handlePlayerDrag = useMemo(
  () =>
    throttle((playerId: string, newPosition: { x: number; y: number }) => {
      updatePlayer(playerId, newPosition);
    }, 16), // 60fps = 16ms
  [updatePlayer]
);

// Batch updates during drag
const [pendingUpdates, setPendingUpdates] = useState<Map<string, Position>>(
  new Map()
);

useEffect(() => {
  if (pendingUpdates.size === 0) return;

  // Apply all updates at once (single render)
  const updates = Array.from(pendingUpdates.entries());
  updates.forEach(([id, pos]) => updatePlayer(id, pos));
  setPendingUpdates(new Map());
}, [pendingUpdates]);
```

**Files to Modify:**

- `src/components/playbook/FormationBuilderModal/FormationBuilderCanvas.tsx` - Throttle drags
- `src/components/playbook/diagram-editor/hooks/useDiagramInteractions.ts` - Batch updates

**Effort:** 1 hour  
**Impact:** ⭐⭐⭐

---

### **PHASE 3: Advanced Optimizations (2-3 hours)** 🔥

**Goal:** Maximize performance for power users

#### 3.1 Bulk Operations: Virtual Selection

**Impact:** Handle 100+ play selections without lag

```tsx
// In PlayGrid.tsx - Use Set instead of array
const [selectedPlayIds, setSelectedPlayIds] = useState<Set<string>>(new Set());

// Optimized selection handler
const handlePlaySelection = useCallback((playId: string, selected: boolean) => {
  setSelectedPlayIds((prev) => {
    const next = new Set(prev);
    if (selected) {
      next.add(playId);
    } else {
      next.delete(playId);
    }
    return next;
  });
}, []);

// Bulk action: Optimistic updates
const handleBulkDelete = useCallback(
  async (playIds: Set<string>) => {
    // Remove from UI immediately
    setAllPlays((prev) => prev.filter((p) => !playIds.has(p.id)));
    toast.success(`Deleted ${playIds.size} plays`);

    // Background deletion
    try {
      await PlaysService.bulkDelete(Array.from(playIds));
    } catch (error) {
      toast.error("Failed to delete plays, restoring...");
      // Restore from cache
      loadAllPlays();
    }
  },
  [loadAllPlays]
);
```

**Files to Modify:**

- `src/pages/PlaybookPage.tsx` - Use Set for selections
- `src/components/playbook/PlayGrid.tsx` - Optimized selection
- `src/components/playbook/BulkActionsToolbar.tsx` - Optimistic bulk ops

**Effort:** 1.5 hours  
**Impact:** ⭐⭐⭐⭐

---

#### 3.2 Prefetch Adjacent Plays (Predictive Loading)

**Impact:** Instant play details when clicking

```tsx
// In PlayGrid.tsx - Prefetch on hover
const PrefetchingPlayCard = memo(({ play, ...props }) => {
  const [prefetched, setPrefetched] = useState(false);

  const handleHover = useCallback(() => {
    if (prefetched) return;

    // Prefetch related data
    Promise.all([
      PlaysService.getPlayAssignments(play.id),
      PlaysService.getPlayDiagram(play.id),
    ]);

    setPrefetched(true);
  }, [play.id, prefetched]);

  return (
    <div onMouseEnter={handleHover}>
      <PlayCard play={play} {...props} />
    </div>
  );
});
```

**Files to Modify:**

- `src/components/playbook/PlayGrid.tsx` - Add prefetch wrapper
- `src/services/PlaysService.ts` - Add prefetch methods

**Effort:** 1 hour  
**Impact:** ⭐⭐⭐

---

#### 3.3 Skeleton Screens for Heavy Modals

**Impact:** Better perceived load time

```tsx
// New file: src/components/ui/Skeleton/FormationBuilderSkeleton.tsx
export const FormationBuilderSkeleton = () => (
  <div className="space-y-4 p-6">
    {/* Canvas skeleton */}
    <div className="h-96 bg-surface-muted rounded-lg animate-pulse" />

    {/* Personnel selector skeleton */}
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-10 w-20 bg-surface-muted rounded animate-pulse"
        />
      ))}
    </div>

    {/* Position list skeleton */}
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-8 bg-surface-muted rounded animate-pulse" />
      ))}
    </div>
  </div>
);

// In PlaybookPage.tsx
<Suspense fallback={<FormationBuilderSkeleton />}>
  <FormationBuilderModal {...props} />
</Suspense>;
```

**Files to Modify:**

- `src/components/ui/Skeleton/FormationBuilderSkeleton.tsx` - New skeleton
- `src/components/ui/Skeleton/DiagramEditorSkeleton.tsx` - New skeleton
- `src/pages/PlaybookPage.tsx` - Add Suspense boundaries

**Effort:** 30 minutes  
**Impact:** ⭐⭐⭐

---

## 📊 Expected Performance Impact

### Phase 1 (Quick Wins)

| Action     | Before    | After      | Improvement    |
| ---------- | --------- | ---------- | -------------- |
| Save Play  | 200-500ms | **<50ms**  | **10x faster** |
| Search     | 150-300ms | **<50ms**  | **6x faster**  |
| Open Modal | 800ms     | **<100ms** | **8x faster**  |

### Phase 2 (Canvas)

| Action        | Before           | After                | Improvement      |
| ------------- | ---------------- | -------------------- | ---------------- |
| Diagram Save  | 500ms            | **<100ms**           | **5x faster**    |
| Thumbnail Gen | 300ms (blocking) | **0ms (background)** | **Non-blocking** |
| Canvas Drag   | 30fps            | **60fps**            | **2x smoother**  |

### Phase 3 (Advanced)

| Action          | Before          | After                    | Improvement           |
| --------------- | --------------- | ------------------------ | --------------------- |
| Bulk Select 100 | 1-2s lag        | **<100ms**               | **20x faster**        |
| Play Details    | 200ms           | **Instant (prefetched)** | **Perceived instant** |
| Modal Open      | Blank → content | **Skeleton → content**   | **Better UX**         |

---

## 🎯 Success Criteria

### User Perception (Most Important!)

- ✅ "Feels instant" - No noticeable lag on interactions
- ✅ "Smooth as butter" - 60fps scrolling and animations
- ✅ "Professional" - Skeleton screens, no blank states

### Technical Metrics

- ✅ Save operations: <50ms perceived response
- ✅ Search: <50ms filter time
- ✅ Modal open: <100ms (preloaded)
- ✅ Canvas: 60fps sustained during drag
- ✅ Bulk operations: <100ms for 100+ plays

### Build Impact

- ✅ No bundle size regression
- ✅ No type errors
- ✅ Lazy loading maintains initial load speed

---

## 🧪 Testing Checklist

### Phase 1

- [ ] Create play → Instant UI update, background save
- [ ] Search → No debounce lag, instant filter
- [ ] Open Formation Builder → <100ms (preloaded)
- [ ] Network failure → Graceful revert with toast

### Phase 2

- [ ] Save diagram → Instant "Saved!" feedback
- [ ] Generate thumbnail → No UI blocking
- [ ] Drag players → Smooth 60fps on mobile
- [ ] Low-end device → No jank or lag

### Phase 3

- [ ] Select 100 plays → No lag
- [ ] Bulk delete → Instant UI update
- [ ] Hover play → Prefetch triggers
- [ ] Open modal → Skeleton shows immediately

---

## 🚀 Implementation Order

### Week 1: Phase 1 (Quick Wins)

**Monday:** Optimistic play saves (1 hour)  
**Tuesday:** Instant search (30 min) + Preload modals (30 min)  
**Wednesday:** Testing + fixes

**Outcome:** Playbook feels 5-10x faster ✨

### Week 2: Phase 2 (Canvas)

**Monday:** Optimistic diagram saves (1.5 hours)  
**Tuesday:** Thumbnail worker (2 hours)  
**Wednesday:** Canvas throttling (1 hour)  
**Thursday:** Testing + mobile validation

**Outcome:** Diagram editor butter-smooth 🎨

### Week 3: Phase 3 (Advanced)

**Monday:** Bulk operations optimization (1.5 hours)  
**Tuesday:** Prefetch hover states (1 hour)  
**Wednesday:** Modal skeletons (30 min)  
**Thursday:** Testing + documentation

**Outcome:** Power-user features blazing fast 🔥

---

## 💡 Key Insights

### What Makes Playbook Feel Fast

1. **Optimistic UI** > Server confirmation
2. **Preload** > Lazy load (for frequently used features)
3. **Instant search** > Debounced search
4. **Background workers** > Main thread processing
5. **Skeleton screens** > Blank modals

### Facebook's Playbook (Applied to BoxCall)

- ✅ **Fake it**: Show success immediately, sync in background
- ✅ **Preload**: Prefetch on hover, idle time
- ✅ **Throttle**: 60fps cap on animations (16ms)
- ✅ **Workers**: Heavy processing off main thread
- ✅ **Psychology**: Skeleton > spinner, instant > perfect

### BoxCall Advantages

- ✅ Already has virtual scrolling (Virtuoso)
- ✅ Already has lazy loading (modals)
- ✅ Already has optimistic state (just need to use it more!)
- ✅ Already has memoization (well architected)

**Just need to apply social features patterns consistently!**

---

## 🎉 Expected Outcome

After all 3 phases:

**Playbook page will feel as fast as Facebook's newsfeed!**

- ⚡ Create play → **Instant**
- 🔍 Search → **Instant**
- 🎨 Diagram save → **Instant**
- 📋 Bulk operations → **Instant**
- 🖼️ Thumbnails → **Background**
- 📱 Mobile → **Butter smooth**

**User perception:** "This is the fastest coaching app I've ever used!" 🚀

---

## 📝 Documentation Updates

After completion, update:

- `.github/copilot-instructions.md` - Add Playbook performance patterns
- `docs/PERFORMANCE_OPTIMIZATION_RESULTS_OCT25_2025.md` - Add Playbook results
- `docs/playbook/PLAYBOOK_PERFORMANCE_COMPLETE.md` - New completion doc

---

**Total Effort:** 7-10 hours across 3 weeks  
**Impact:** Transform Playbook from "fast" to "Facebook fast" 🚀
