# Phase 4 Performance Optimization - Baseline Metrics

**Date:** October 3, 2025  
**Branch:** `feature/phase-4-performance`  
**Commit:** Starting baseline before optimization work

---

## 📊 Current Build Metrics

### Bundle Sizes (Production Build)

| Asset | Size | Gzipped | Status |
|-------|------|---------|--------|
| **index-BF1YtWSS.js** (main) | 611.61 KB | 183.56 KB | 🔴 **TARGET: <500KB** |
| **react-pdf.browser** | 1,498.85 KB | 499.91 KB | 🔴 **CRITICAL: Lazy load** |
| **calendar-CVNkezXa.js** | 259.79 KB | 76.95 KB | 🟡 **Consider splitting** |
| **PlaybookPage** | 164.36 KB | 46.87 KB | 🟡 **Code split candidates** |
| **dnd** (drag-and-drop) | 96.20 KB | 29.91 KB | ✅ Acceptable |
| **TeamBulletin** | 61.89 KB | 16.31 KB | ✅ Good |
| **CSS (index)** | 194.95 KB | 32.20 KB | 🟡 **Optimize** |

**Total Main Bundle:** ~2.5 MB uncompressed, ~825 KB gzipped

---

## 🎯 Phase 4 Targets

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **Main Bundle** | 611 KB | <500 KB | -18% |
| **Total Gzipped** | ~825 KB | <600 KB | -27% |
| **PDF Library** | Always loaded | Lazy loaded | 🎯 |
| **Initial Load Time** | TBD | <3s (3G) | TBD |
| **Lighthouse Score** | TBD | 90+ | TBD |

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
