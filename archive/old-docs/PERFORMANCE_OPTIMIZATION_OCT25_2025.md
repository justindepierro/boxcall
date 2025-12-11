# Performance Optimization Sprint - October 25, 2025

## 🎯 Goal: Make BoxCall Fast AF

**Target Metrics:**

- **Page Load**: <2s (currently ~4s)
- **API Response**: <100ms
- **Bundle Size**: <1.5MB gzipped (currently 975KB but PDF is killing us)
- **Lighthouse Score**: 90+ (Performance)

---

## 📊 Current State Analysis

### Bundle Breakdown (2.83MB total, 975KB gzipped)

```
🔴 CRITICAL ISSUES:
├── pdf-DYZ7RS7f.js          1.5MB (498KB gzipped) - @react-pdf/renderer
├── index-DHD-cXzd.js        483KB (140KB gzipped) - Core Supabase client
├── pixi-D3laanu0.js         463KB (137KB gzipped) - Diagram editor
├── notificationsService     459KB (139KB gzipped) - TipTap + notifications
├── charts-qcMe1GLG.js       355KB (101KB gzipped) - Chart libraries
└── calendar-oDAhXBRu.js     259KB (75KB gzipped)  - FullCalendar

🟡 MEDIUM PRIORITY:
├── PlaybookPage             272KB (71KB gzipped)
├── animations               150KB (48KB gzipped)
├── data-vendor              182KB (47KB gzipped)
└── ui-vendor                183KB (56KB gzipped)
```

### Key Findings

1. **PDF library is a monster** (1.5MB!) - Only needed when user exports
2. **Excellent lazy loading setup** - Most routes already use React.lazy()
3. **PixiJS only for diagram editor** - Can defer completely
4. **Charts library heavy** - Consider lighter alternatives or tree-shake
5. **TipTap in notifications** - Rich text editor adds bulk

---

## 🚀 Optimization Strategy (Priority Order)

### Phase 1: Quick Wins (Today - 2-4 hours)

#### 1.1 Dynamic Import PDF Library ✅ ALREADY DONE

- **Impact**: Deferred 1.5MB until user clicks "Export"
- **Status**: Already implemented in `gamePlanPdfService.tsx` and `pdfExportService.tsx`
- **Evidence**: Using `loadPDFDependencies()` pattern

#### 1.2 Lazy Load PixiJS Diagram Editor (HIGH IMPACT)

**Target**: `pixi-D3laanu0.js` (463KB → lazy)

- Only load when user opens Diagram Editor
- Expected savings: 137KB gzipped from initial bundle
- Files to modify:
  - `src/components/playbook/diagram-editor/*`
  - Wrap DiagramCanvas/DiagramEditor in Suspense

#### 1.3 Code Split Massive Chunks

**Target**: `index-DHD-cXzd.js` (483KB)

- Investigate what's in this chunk (likely Supabase + deps)
- Use `vite.config.ts` manualChunks to split vendor libraries
- Separate: Supabase, React, UI libraries

#### 1.4 Optimize Charts Library

**Target**: `charts-qcMe1GLG.js` (355KB)

- Lazy load chart components (only on Analytics page)
- Consider switching to lightweight alternative (recharts → nivo → chart.js)
- Tree-shake unused chart types

#### 1.5 Defer FullCalendar

**Target**: `calendar-oDAhXBRu.js` (259KB)

- Already has LazyCalendarShellPage
- Verify not imported eagerly anywhere
- Double-check calendar integration in DashboardPage

---

### Phase 2: Component Optimizations (Today - 2-3 hours)

#### 2.1 Add React.memo to Heavy Components

**Targets**:

- `PlayCard` - Rendered 50-200x in grid
- `AnnouncementItem` - Real-time updates cause re-renders
- `RosterPlayerRow` - Large lists
- `FormationCard` - Many in selection modal
- `PracticeBlock` - Drag-drop causes frequent updates

Pattern:

```tsx
export const PlayCard = React.memo(
  ({ play, onEdit, onDelete }) => {
    // ... component
  },
  (prevProps, nextProps) => {
    // Custom comparison for performance
    return (
      prevProps.play.id === nextProps.play.id &&
      prevProps.play.updated_at === nextProps.play.updated_at
    );
  }
);
```

#### 2.2 Optimize Real-time Subscriptions

**Targets**:

- `useAnnouncementsRealtime` - Team Bulletin
- `useTeamActivity` - Live stats polling

**Issues**:

- No debouncing on rapid updates
- Batch state updates to prevent cascade re-renders
- Clean up subscriptions properly

Pattern:

```tsx
const [announcements, setAnnouncements] = useState([]);
const updateQueueRef = useRef<Announcement[]>([]);

const flushUpdates = useCallback(() => {
  if (updateQueueRef.current.length > 0) {
    setAnnouncements((prev) => [...prev, ...updateQueueRef.current]);
    updateQueueRef.current = [];
  }
}, []);

// Debounce updates (300ms)
useEffect(() => {
  const timer = setInterval(flushUpdates, 300);
  return () => clearInterval(timer);
}, [flushUpdates]);
```

#### 2.3 Implement Virtual Scrolling

**Targets**:

- PlaybookPage grid (200+ plays)
- RosterPage list (50+ players)
- Team Bulletin feed (infinite scroll)

**Library**: react-window (14KB) or react-virtualized (larger but more features)

Expected impact: 60-80% reduction in DOM nodes for large lists

---

### Phase 3: Database & API Optimization (Today - 1-2 hours)

#### 3.1 Audit Supabase Queries

**Check for**:

- `.select('*')` → Specify only needed columns
- Missing indexes on frequently queried columns
- N+1 query patterns (use joins or batch requests)
- Inefficient RLS policies

**Priority tables**:

- `plays` (most queried)
- `team_announcements` (real-time)
- `team_members` (every auth check)
- `practice_scripts`

#### 3.2 Add Response Caching

Use React Query or SWR for smart caching:

```tsx
const { data: plays } = useQuery({
  queryKey: ["plays", teamId, playbookId],
  queryFn: () => PlayService.getPlays(teamId, playbookId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

#### 3.3 Implement Request Batching

Group multiple small requests into single API calls where possible.

---

### Phase 4: Image & Asset Optimization (Today - 1 hour)

#### 4.1 Convert Images to WebP

- Audit `public/assets/` folder
- Convert PNGs/JPGs to WebP (60-80% size reduction)
- Add fallback formats for older browsers

#### 4.2 Implement Lazy Loading for Images

```tsx
<img src={thumbnailUrl} loading="lazy" decoding="async" alt={play.name} />
```

#### 4.3 Add Responsive Images

```tsx
<img
  srcSet={`
    ${smallUrl} 320w,
    ${mediumUrl} 640w,
    ${largeUrl} 1280w
  `}
  sizes="(max-width: 640px) 100vw, 640px"
/>
```

---

### Phase 5: Build Configuration (Today - 30 min)

#### 5.1 Optimize Vite Config

**Target**: `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["@headlessui/react", "@heroicons/react"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "pdf-vendor": ["@react-pdf/renderer"], // Separate chunk
          "calendar-vendor": ["@fullcalendar/react", "@fullcalendar/core"],
          "chart-vendor": ["recharts", "victory"], // If using
        },
      },
    },
    chunkSizeWarningLimit: 500, // Keep chunks under 500KB
  },
});
```

#### 5.2 Enable Build Optimizations

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // Remove console.logs in production
      drop_debugger: true,
    },
  },
  sourcemap: false, // Disable in production
}
```

---

### Phase 6: Performance Monitoring (Today - 30 min)

#### 6.1 Add Web Vitals Tracking

```typescript
// src/lib/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export function initPerformanceMonitoring() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

#### 6.2 Add Custom Metrics

- Supabase query duration
- Component render times
- Route transition times

#### 6.3 Set Performance Budgets

Add to CI/CD:

```json
{
  "budgets": [
    {
      "path": "/",
      "maxSize": "1.5MB",
      "maxGzip": "500KB"
    }
  ]
}
```

---

## 📈 Expected Results

### Bundle Size Reduction

```
Current:  2.83MB (975KB gzipped)
Target:   1.8MB (600KB gzipped)
Savings:  1MB (375KB gzipped) - 38% reduction
```

### Load Time Improvement

```
Current FCP: ~2.8s
Target FCP:  <1.5s
Improvement: 46% faster

Current LCP: ~4.2s
Target LCP:  <2.5s
Improvement: 40% faster
```

### Component Performance

```
PlaybookPage:     -60% render time (virtual scrolling)
Team Bulletin:    -40% update latency (debounced updates)
Diagram Editor:   Deferred (no initial impact)
```

---

## ✅ Success Criteria

1. **Lighthouse Performance Score**: 90+
2. **Initial Bundle**: <600KB gzipped
3. **Page Load**: <2s on slow 3G
4. **API Response**: <100ms average
5. **No console errors or warnings**
6. **All features still work** (regression testing critical)

---

## 🔧 Implementation Order (TODAY)

**Morning Session (9am-12pm)**:

1. ✅ Audit current build (DONE)
2. Lazy load PixiJS (1 hour)
3. Split vendor chunks (1 hour)
4. Add React.memo to 5 key components (1 hour)

**Afternoon Session (1pm-4pm)**:

1. Optimize real-time subscriptions (1 hour)
2. Implement virtual scrolling for PlaybookPage (1.5 hours)
3. Database query optimization (30 min)

**Evening Session (4pm-6pm)**:

1. Image optimization (1 hour)
2. Add performance monitoring (30 min)
3. Build optimizations (30 min)

**Testing & Validation (6pm-7pm)**:

1. Run Lighthouse audits
2. Test on slow 3G connection
3. Verify all features work
4. Measure improvements

---

## 📝 Notes

- All optimizations must be tested - don't break existing features
- Keep an eye on real-time subscriptions - they're performance-critical
- Use Chrome DevTools Performance tab to profile before/after
- Consider user experience - loading states matter

**Let's make this app FAST! 🚀**
