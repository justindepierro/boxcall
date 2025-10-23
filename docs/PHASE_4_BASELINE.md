# Phase 4 Performance Optimization - Baseline Metrics

**Date:** October 22, 2025
**Branch:** `feature/phase-4-optimization`
**Commit:** [current commit hash]

---

## 📊 Current Build Metrics (Updated)

### Bundle Sizes (Production Build)

| Asset                         | Size        | Gzipped   | Status                      |
| ----------------------------- | ----------- | --------- | --------------------------- |
| **DiagramCanvas-DD9pmqbp.js** | 517.18 KB   | 156.15 KB | 🔴 **CRITICAL: >500KB**     |
| **react-pdf.browser**         | 1,489.53 KB | 498.82 KB | 🔴 **CRITICAL: Lazy load**  |
| **index-DWy6US1c.js** (main)  | 442.38 KB   | 133.36 KB | 🟡 **Main bundle**          |
| **PlaybookPage-7F4yK7Sw.js**  | 304.33 KB   | 83.08 KB  | 🟡 **Code split candidate** |
| **calendar-D3izHlEt.js**      | 259.79 KB   | 76.95 KB  | 🟡 **Consider splitting**   |
| **supabase-9V1RGTaI.js**      | 146.82 KB   | 49.76 KB  | 🟡 **Large vendor**         |
| **ui-DT2F8WmS.js**            | 146.28 KB   | 37.13 KB  | 🟡 **UI components**        |
| **CSS (index)**               | 260.42 KB   | 40.68 KB  | 🟡 **Optimize**             |

**Total Build Time:** 21.70s (target: <10s = -53% improvement needed)
**Total Assets:** 218+ chunks

---

## 🎯 Phase 4 Targets

| Metric                | Current       | Target      | Improvement |
| --------------------- | ------------- | ----------- | ----------- |
| **Main Bundle**       | 611 KB        | <500 KB     | -18%        |
| **Total Gzipped**     | ~825 KB       | <600 KB     | -27%        |
| **PDF Library**       | Always loaded | Lazy loaded | 🎯          |
| **Initial Load Time** | TBD           | <3s (3G)    | TBD         |
| **Lighthouse Score**  | TBD           | 90+         | TBD         |

---

## 🧪 Test Coverage

```
Test Files: 60 passed (60)
Tests: 316 passed (316)
Pass Rate: 100%
```

**Status:** ✅ All tests passing before optimization

---

## ⚠️ Known Issues (From Build)

### 1. CSS Template Literals (6 warnings)

```
Expected identifier but found whitespace [css-syntax-error]
--tw-scale-x: ${scale};
--tw-scale-y: ${scale};
```

**Location:** Likely in animations or styled components  
**Priority:** Medium - doesn't block, but needs cleanup

### 2. Web Vitals Dynamic Import

```
web-vitals/dist/web-vitals.js is dynamically imported by performanceMonitor.ts
but also statically imported by initWebVitals.ts
```

**Priority:** Low - performance monitoring overhead

### 3. PDF Worker Warning

```
new URL("../workers/pdfWorker.ts", import.meta.url) doesn't exist at build time
```

**Priority:** Low - runtime resolution works

---

## 🚀 Phase 4A: Immediate Quick Wins

### 1. **Lazy Load react-pdf** (Highest Priority)

- **Current:** 1.5 MB always loaded
- **Target:** Load only when PDF features accessed
- **Expected Gain:** ~500 KB off initial bundle
- **Files to modify:**
  - `src/components/pdf/PracticeScriptPDF.tsx`
  - `src/components/practice/PracticePDFExportDialog.tsx`

### 2. **Code Split Calendar**

- **Current:** 260 KB in calendar chunk
- **Target:** Split by calendar type (practice/game/event)
- **Expected Gain:** ~100 KB lazy loaded

### 3. **Optimize PlaybookPage**

- **Current:** 164 KB
- **Target:** Split diagram editor, bulk actions, advanced filters
- **Expected Gain:** ~60 KB lazy loaded

### 4. **Fix CSS Template Literals**

- **Location:** `src/components/ui/animations.ts` or similar
- **Action:** Convert template literals to proper CSS vars
- **Expected Gain:** Cleaner build, no functional change

---

## 📈 Optimization Strategy

### Phase 4A: Bundle Analysis (Week 1)

- [x] Capture baseline metrics ✅
- [ ] Analyze bundle with rollup-plugin-visualizer
- [ ] Identify top 10 largest dependencies
- [ ] Create optimization roadmap

### Phase 4B: Lazy Loading (Week 1-2)

- [ ] Lazy load react-pdf (priority 1)
- [ ] Lazy load diagram editor
- [ ] Lazy load analytics pages
- [ ] Add loading states

### Phase 4C: Tree-shaking (Week 2)

- [ ] Audit unused exports
- [ ] Optimize lucide-react imports (currently ~120 icons)
- [ ] Remove dead code
- [ ] Fix barrel exports

### Phase 4D: Asset Optimization (Week 2-3)

- [ ] Compress SVGs
- [ ] Optimize images
- [ ] Implement WebP with fallbacks
- [ ] Add progressive image loading

---

## 🔍 Next Steps

1. **Install bundle analyzer:**

   ```bash
   npm i -D rollup-plugin-visualizer
   ```

2. **Generate bundle visualization:**

   ```bash
   npm run build -- --mode production --analyze
   ```

3. **Measure Lighthouse scores:**

   ```bash
   npm run build && npm run preview
   # Then run Lighthouse in DevTools
   ```

4. **Start with Phase 4A tasks** (see roadmap)

---

## 📝 Notes

- Current codebase is **functional and well-tested** (316/316 passing)
- Phase 3 consolidation (17→8 services) already improved maintainability
- Focus on **user-facing performance** without breaking functionality
- All optimizations should maintain **backward compatibility**

---

**Next Update:** After Phase 4A completion (bundle analysis)
