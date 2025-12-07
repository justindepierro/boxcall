# BoxCall Optimization Action Plan - December 7, 2025

## 🎯 Mission: Make BoxCall the Fastest, Most Professional Coaching Platform

Based on comprehensive architecture analysis, here are **actionable optimizations** prioritized by impact.

---

## 🚀 HIGH PRIORITY: Performance (Immediate Impact)

### **1. Split PDF Core Bundle** ⚡ CRITICAL

**Problem**: PDF core is 1.5MB (49% of bundle), loaded on every page  
**Impact**: Reduce initial bundle by 47% (~1.4MB savings)  
**Effort**: 2 hours  
**Status**: Not started

**Implementation:**

```typescript
// Current: pdf-core-C71dqmRu.js (1,489KB)
import { PDFDocument } from "@react-pdf/renderer";

// Optimized: Dynamic import only when exporting
const PracticeScriptPDF = lazy(() => import("./PracticeScriptPDF"));
const GamePlanPDF = lazy(() => import("./GamePlanPDF"));

// Only load when user clicks "Export PDF"
const handleExport = async () => {
  const { generatePDF } = await import("./pdf/generator");
  await generatePDF(data);
};
```

**Files to modify:**

- `src/services/PracticeScriptPDFService.ts`
- `src/services/gamePlanPdfService.tsx`
- `src/components/practice/PracticePDFExportDialog.tsx`
- `src/components/playbook/GamePlanPDF.tsx`

**Expected Result:**

- Initial bundle: 2.95MB → 1.5MB (49% reduction)
- Gzipped: 975KB → 500KB (49% reduction)
- PDF generation: Dynamic import adds ~200ms (acceptable)

---

### **2. Vendor Code Splitting** ⚡ HIGH IMPACT

**Problem**: Main vendor bundle includes all dependencies (493KB)  
**Impact**: Better caching, parallel loading, ~20% faster page load  
**Effort**: 3 hours  
**Status**: Not started

**Implementation:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "supabase-vendor": [
            "@supabase/supabase-js",
            "@supabase/auth-helpers-react",
          ],
          "charts-vendor": ["chart.js", "react-chartjs-2"],
          "calendar-vendor": [
            "@fullcalendar/core",
            "@fullcalendar/react",
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
          ],
          "ui-vendor": [
            "framer-motion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            // ... other UI libraries
          ],
          "pdf-vendor": [
            // Only loaded when needed
            "@react-pdf/renderer",
            "pdfjs-dist",
          ],
        },
      },
    },
  },
});
```

**Expected Result:**

- Main bundle: 493KB → 150KB (70% reduction)
- Better browser caching (vendor bundles rarely change)
- Parallel loading of chunks
- Faster subsequent page loads

---

### **3. Virtual Scrolling** ⚡ HIGH IMPACT

**Problem**: Team Bulletin (470KB) and Playbook render all items, causing lag with 100+ items  
**Impact**: Handle 1000+ items without performance degradation  
**Effort**: 4 hours  
**Status**: Not started

**Implementation:**

```typescript
// Install react-virtual
npm install @tanstack/react-virtual

// src/components/playbook/PlayList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const PlayList = ({ plays }: { plays: Play[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: plays.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const play = plays[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <PlayCard play={play} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

**Files to modify:**

- `src/pages/PlaybookPage.tsx` (play list)
- `src/pages/TeamBulletin.tsx` (announcements list)
- `src/components/playbook/AnnouncementsList.tsx`

**Expected Result:**

- Smooth scrolling with 1000+ items
- Constant memory usage (only renders visible items)
- 60fps scroll performance

---

### **4. Database Query Optimization** ⚡ MEDIUM IMPACT

**Problem**: Some queries fetch unnecessary data, missing indexes  
**Impact**: 50% faster query response, reduced network payload  
**Effort**: 6 hours  
**Status**: Not started

**Implementation:**

```sql
-- Add selective indexes
CREATE INDEX idx_plays_formation ON plays(formation);
CREATE INDEX idx_plays_p_type ON plays(p_type);
CREATE INDEX idx_plays_personnel ON plays(personnel);
CREATE INDEX idx_practice_scripts_team_id ON practice_scripts(team_id);
CREATE INDEX idx_game_plans_team_id ON game_plans(team_id);
CREATE INDEX idx_team_posts_team_id_created ON team_posts(team_id, created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id, status);
CREATE INDEX idx_plays_playbook_created ON plays(playbook_id, created_at DESC);
```

```typescript
// Use selective projections
// Before: Fetch all columns
const { data } = await supabase.from("plays").select("*");

// After: Only fetch needed columns
const { data } = await supabase
  .from("plays")
  .select("id, play_name, formation, p_type, created_at");

// Implement cursor-based pagination
const { data } = await supabase
  .from("plays")
  .select("*")
  .gt("created_at", lastCreatedAt)
  .order("created_at", { ascending: false })
  .limit(50);
```

**Expected Result:**

- Query response: 300ms → 150ms (50% faster)
- Network payload: 40% reduction
- Better scalability with large datasets

---

## 📱 MEDIUM PRIORITY: User Experience (Enhanced Features)

### **5. Progressive Web App (PWA) Enhancement** 🔥 HIGH VALUE

**Problem**: PWA configured but not fully enabled  
**Impact**: Native-like experience, offline mode, installable  
**Effort**: 4 hours  
**Status**: Partially implemented

**Implementation:**

```typescript
// Enable PWA in vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "BoxCall",
        short_name: "BoxCall",
        description: "Professional Football Coaching Platform",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
});
```

**Expected Result:**

- Installable on mobile/desktop
- Offline mode for cached content
- Push notifications (future)
- 20% increase in user engagement

---

### **6. Image Optimization** 📸 MEDIUM IMPACT

**Problem**: Images not optimized, no lazy loading  
**Impact**: 20-30% reduction in image payload  
**Effort**: 3 hours  
**Status**: Not started

**Implementation:**

```typescript
// Use modern image formats
// Install: npm install vite-plugin-imagemin

// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      webp: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
        ],
      },
    }),
  ],
});

// Add lazy loading to images
<img
  src={avatar}
  alt="User avatar"
  loading="lazy"
  decoding="async"
/>

// Use <picture> for responsive images
<picture>
  <source srcSet={`${avatar}.webp`} type="image/webp" />
  <source srcSet={`${avatar}.jpg`} type="image/jpeg" />
  <img src={`${avatar}.jpg`} alt="User avatar" loading="lazy" />
</picture>
```

**Expected Result:**

- Image payload: 30% reduction
- WebP format: 25-35% smaller than JPEG
- Lazy loading: Only load visible images

---

### **7. React Query Stale Time Optimization** ⚡ LOW EFFORT, HIGH IMPACT

**Problem**: Default stale time may cause unnecessary refetches  
**Impact**: Reduce API calls by 40%, better user experience  
**Effort**: 1 hour  
**Status**: Partially implemented

**Implementation:**

```typescript
// src/app/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increase stale time based on data type
      staleTime: 10 * 60 * 1000, // 10 minutes (was 5)
      cacheTime: 30 * 60 * 1000, // 30 minutes (was 10)
      refetchOnWindowFocus: false, // Disable aggressive refetch
      refetchOnMount: false, // Use cached data on mount
      retry: 2, // Retry failed queries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Retry mutations once
      retryDelay: 1000,
    },
  },
});

// Use different stale times per query type
const { data: plays } = useQuery({
  queryKey: ["plays", playbookId],
  queryFn: () => PlaysService.findAll(playbookId),
  staleTime: 15 * 60 * 1000, // Plays rarely change mid-session
});

const { data: liveSession } = useQuery({
  queryKey: ["session", sessionId],
  queryFn: () => SessionService.get(sessionId),
  staleTime: 5000, // Refetch every 5s for live sessions
  refetchInterval: 5000,
});
```

**Expected Result:**

- API calls: 40% reduction
- Better offline experience
- Faster perceived navigation

---

## 🧹 LOW PRIORITY: Code Quality (Developer Experience)

### **8. Increase Test Coverage** 🧪 ESSENTIAL

**Problem**: 70% test coverage (target: 80%+)  
**Impact**: Fewer bugs, better refactoring confidence  
**Effort**: 20 hours (ongoing)  
**Status**: In progress

**Implementation:**

```typescript
// Add tests for critical paths
// src/services/gamePlanService.test.ts
describe("GamePlanService", () => {
  describe("Optimistic UI", () => {
    it("creates game plan with temp ID", async () => {
      const tempId = `temp-${Date.now()}`;
      const plan = { id: tempId, name: "Test Plan" };

      // Mock service
      const createMock = vi
        .fn()
        .mockResolvedValue({ id: "real-id", name: "Test Plan" });
      GamePlanService.createGamePlan = createMock;

      // Test optimistic update
      const result = await handleCreatePlan(plan);
      expect(result.id).toBe("real-id");
    });

    it("rolls back on error", async () => {
      const createMock = vi.fn().mockRejectedValue(new Error("Network error"));
      GamePlanService.createGamePlan = createMock;

      // Should remove temp ID on error
      await expect(handleCreatePlan(plan)).rejects.toThrow();
    });
  });
});

// Add E2E tests for critical flows
// tests/e2e/playbook.spec.ts
test("coach creates play and adds to game plan", async ({ page }) => {
  await page.goto("/team/123/playbook");

  // Create play
  await page.click("text=New Play");
  await page.fill('[name="playName"]', "Power Right");
  await page.selectOption('[name="formation"]', "I Formation");
  await page.click("text=Save");

  // Verify play appears
  await expect(page.locator("text=Power Right")).toBeVisible();

  // Add to game plan
  await page.click("text=Add to Game Plan");
  await page.selectOption('[name="situation"]', "3rd & Short");
  await page.click("text=Add");

  // Verify in game plan
  await page.goto("/team/123/game-plans");
  await expect(page.locator("text=Power Right")).toBeVisible();
});
```

**Target Coverage:**

- Unit tests: 85% (from 70%)
- Integration tests: 75% (from 60%)
- E2E tests: 50 critical flows (from 30)

---

### **9. Storybook Component Documentation** 📚 NICE TO HAVE

**Problem**: Only some components documented in Storybook  
**Impact**: Better collaboration, visual regression testing  
**Effort**: 10 hours (ongoing)  
**Status**: Partially implemented

**Implementation:**

```typescript
// Document all 50+ design system components
// src/components/ui/Button/Button.stories.tsx
export default {
  title: "Design System/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "Primary button component with semantic token support.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost"],
      description: "Button variant using component tokens",
    },
  },
} as Meta<typeof Button>;

// Add visual regression testing
// .storybook/test-runner.ts
import { injectAxe, checkA11y } from "axe-playwright";

export default {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page) {
    await checkA11y(page, "#root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};
```

---

### **10. TypeScript Type Generation Automation** 🤖 LOW EFFORT

**Problem**: Database types manually maintained  
**Impact**: Fewer type errors, better DX  
**Effort**: 2 hours  
**Status**: Not started

**Implementation:**

```bash
# Install Supabase CLI
npm install -g supabase

# Generate types automatically
supabase gen types typescript --project-id PROJECT_ID > src/types/database.ts

# Add to package.json scripts
"db:types": "supabase gen types typescript --project-id PROJECT_ID > src/types/database.ts"

# Run after migrations
npm run db:migrate && npm run db:types
```

**Expected Result:**

- Always up-to-date types
- Catch type errors at compile time
- Better IDE autocomplete

---

## 📊 Optimization Summary

### **Impact Matrix** (Effort vs. Value)

```
High Value, Low Effort:
✅ React Query stale time (1h, 40% API reduction)
✅ PDF dynamic import (2h, 47% bundle reduction)
✅ TypeScript automation (2h, better DX)

High Value, Medium Effort:
✅ Vendor code splitting (3h, 20% faster load)
✅ Image optimization (3h, 30% image reduction)
✅ PWA enhancement (4h, installable app)
✅ Virtual scrolling (4h, 1000+ items support)

High Value, High Effort:
⚠️ Database optimization (6h, 50% faster queries)
⚠️ Test coverage (20h, 80%+ coverage)
⚠️ Storybook docs (10h, better collaboration)
```

### **Recommended Order:**

**Week 1: Quick Wins** (8 hours)

1. React Query stale time (1h)
2. PDF dynamic import (2h)
3. TypeScript automation (2h)
4. Vendor code splitting (3h)

**Week 2: High Impact** (15 hours) 5. Image optimization (3h) 6. PWA enhancement (4h) 7. Virtual scrolling (4h) 8. Database optimization (6h)

**Week 3+: Quality** (30+ hours, ongoing) 9. Test coverage increase (20h) 10. Storybook documentation (10h)

---

## 🎯 Success Metrics

**After Optimizations:**

```
Bundle Size:        2.95MB → 1.5MB (49% reduction)
Gzipped:            975KB → 500KB (49% reduction)
Page Load:          <2s → <1s (50% faster)
API Calls:          Baseline → -40% (React Query optimization)
Test Coverage:      70% → 85% (15% increase)
Memory Usage:       Constant (virtual scrolling)
Offline Support:    Partial → Full (PWA)
```

**Business Impact:**

- ⚡ 50% faster page loads → Higher user satisfaction
- 📱 PWA installable → 20% more engagement
- 🚀 Virtual scrolling → Handle 10x more data
- 🔐 Better caching → 40% fewer API calls
- 🧪 85% test coverage → Fewer production bugs

---

## 🚀 Implementation Checklist

- [ ] 1. React Query stale time optimization (1h)
- [ ] 2. PDF core dynamic import (2h)
- [ ] 3. TypeScript type automation (2h)
- [ ] 4. Vendor code splitting (3h)
- [ ] 5. Image optimization (3h)
- [ ] 6. PWA enhancement (4h)
- [ ] 7. Virtual scrolling implementation (4h)
- [ ] 8. Database query optimization (6h)
- [ ] 9. Test coverage increase (20h, ongoing)
- [ ] 10. Storybook documentation (10h, ongoing)

**Total Estimated Time**: 55 hours (2 weeks focused work)

---

**Last Updated**: December 7, 2025  
**Status**: Ready for implementation  
**Priority**: HIGH - These optimizations will make BoxCall the fastest coaching platform available
