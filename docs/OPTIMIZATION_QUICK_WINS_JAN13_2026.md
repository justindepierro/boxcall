# 🚀 Quick Wins Checklist - January 2026

**Goal**: Implement highest-impact optimizations in 1 week  
**Expected Impact**: 53% bundle reduction, production-ready quality

---

## ✅ Day 1-2: PDF Core Lazy Loading (2 hours)

### Problem
PDF core is 1.49MB (49% of total bundle), loaded on every page.

### Solution

**Step 1**: Update PDF export hook (30 min)
```typescript
// src/services/pdf/usePracticeScriptPDF.ts

// ❌ Remove these imports from top
// import { pdf } from '@react-pdf/renderer';
// import { PracticeScriptDocument } from '@/components/pdf/PracticeScriptDocument';

// ✅ Add dynamic imports inside functions
export const usePracticeScriptPDF = () => {
  const exportToPDF = async (script: PracticeScript) => {
    try {
      // Dynamic import PDF libraries
      const [{ pdf }, { PracticeScriptDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/PracticeScriptDocument'),
      ]);

      const doc = <PracticeScriptDocument script={script} />;
      const blob = await pdf(doc).toBlob();
      return blob;
    } catch (error) {
      logError('PDF export failed', error);
      throw error;
    }
  };

  // Same pattern for downloadPDF and previewPDF
  // ...
};
```

**Step 2**: Add loading state to PDF export button (15 min)
```typescript
// src/components/practice/PracticeScriptActions.tsx
const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

const handleExportPDF = async () => {
  setIsGeneratingPDF(true);
  try {
    await exportToPDF(script);
    toast.success('PDF generated successfully!');
  } catch (error) {
    toast.error('Failed to generate PDF');
  } finally {
    setIsGeneratingPDF(false);
  }
};

return (
  <Button onClick={handleExportPDF} loading={isGeneratingPDF}>
    {isGeneratingPDF ? 'Generating PDF...' : 'Export PDF'}
  </Button>
);
```

**Step 3**: Test PDF export (15 min)
```bash
npm run build
npm run preview
# Test PDF export on practice page
# Verify bundle size reduced
```

**Step 4**: Update other PDF usages (1 hour)
- [ ] Coach Card PDF export
- [ ] Game Plan PDF export
- [ ] Roster PDF export

### Verification
- [ ] Build succeeds
- [ ] PDF export works in preview
- [ ] Bundle analysis shows pdf-core is separate chunk
- [ ] Initial bundle < 1.5MB

---

## ✅ Day 3-4: PlaybookPage Code Splitting (3 hours)

### Problem
PlaybookPage is 316KB, monolithic chunk.

### Solution

**Step 1**: Add lazy loading to route (15 min)
```typescript
// src/routes/index.tsx
const PlaybookPage = lazy(() => import('@/pages/PlaybookPage'));

// Add Suspense boundary
<Route
  path="/playbook"
  element={
    <Suspense fallback={<PlaybookSkeleton />}>
      <PlaybookPage />
    </Suspense>
  }
/>
```

**Step 2**: Create loading skeleton (30 min)
```typescript
// src/components/playbook/PlaybookSkeleton.tsx
export const PlaybookSkeleton = () => (
  <div className="container mx-auto p-spacing-lg">
    <div className="h-12 w-48 bg-surface-muted animate-pulse rounded mb-spacing-lg" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-spacing-md">
          <div className="h-32 bg-surface-muted animate-pulse rounded mb-spacing-sm" />
          <div className="h-4 bg-surface-muted animate-pulse rounded mb-spacing-xs" />
          <div className="h-4 w-2/3 bg-surface-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  </div>
);
```

**Step 3**: Split heavy modals (2 hours)
```typescript
// src/pages/PlaybookPage.tsx

// ❌ Remove eager imports
// import { FormationBuilderModal } from '@/components/formations/FormationBuilderModal';
// import { CSVImportModal } from '@/components/playbook/CSVImport/CSVImportModal';

// ✅ Lazy load on open
const [showFormationBuilder, setShowFormationBuilder] = useState(false);
const [FormationBuilderModal, setFormationBuilderModal] = useState<React.ComponentType | null>(null);

useEffect(() => {
  if (showFormationBuilder && !FormationBuilderModal) {
    import('@/components/formations/FormationBuilderModal').then(module => {
      setFormationBuilderModal(() => module.FormationBuilderModal);
    });
  }
}, [showFormationBuilder, FormationBuilderModal]);

return (
  <>
    {/* ... */}
    {showFormationBuilder && FormationBuilderModal && (
      <FormationBuilderModal onClose={() => setShowFormationBuilder(false)} />
    )}
  </>
);
```

**Step 4**: Verify bundle splitting (30 min)
```bash
npm run build
# Check dist/assets/ for smaller chunks
npm run preview
# Test all playbook features work
```

### Verification
- [ ] Build creates separate chunks for modals
- [ ] PlaybookPage chunk < 200KB
- [ ] All modals load correctly
- [ ] Navigation feels instant

---

## ✅ Day 5: Cleanup & Verification (3 hours)

### Part 1: Remove Unused Dependencies (30 min)

```bash
# Remove unused runtime dependency
npm uninstall react-intersection-observer

# Move dev dependencies to devDependencies
npm uninstall @tanstack/react-query-devtools
npm install -D @tanstack/react-query-devtools

npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

npm uninstall @vitest/coverage-v8
npm install -D @vitest/coverage-v8

npm uninstall autoprefixer concurrently postcss
npm install -D autoprefixer concurrently postcss
```

**Verification**:
```bash
npm run build  # Should still work
npm run validate  # All checks pass
```

### Part 2: Fix ESLint Warning (10 min)

```typescript
// src/components/playbook/useLegacyPlayCardFeatures.tsx
// Remove unused eslint-disable directive (line 94)
// Just delete the line - it's not needed
```

### Part 3: Bundle Analysis (30 min)

```bash
# Generate bundle analysis
npm run build:analyze

# Open in browser and verify:
# - pdf-core is lazy loaded
# - PlaybookPage is smaller
# - No duplicate dependencies
# - Total bundle < 1.5MB gzipped
```

### Part 4: Performance Testing (1 hour)

**Test Checklist**:
- [ ] Dashboard loads <1s
- [ ] Playbook page navigation instant
- [ ] PDF export works (3-5s generation time)
- [ ] Formation builder modal opens <200ms
- [ ] CSV import modal opens <200ms
- [ ] Mobile performance good (test on device)
- [ ] Offline mode works (PWA)

### Part 5: Documentation Update (1 hour)

```bash
# Update CHANGELOG.md
# Update docs/OPTIMIZATION_AUDIT_JAN13_2026.md with results
# Create before/after comparison
# Document any issues found
```

---

## 📊 Success Metrics

### Before (Current)
```
Build Time:          12.08s
Bundle Size:         2.83MB (975KB gzipped)
Page Load (initial): ~2s
PDF Core:            1.49MB (49% of bundle)
PlaybookPage:        316KB (10% of bundle)
ESLint Warnings:     1
Unused Deps:         8
```

### After (Target - End of Week)
```
Build Time:          <12s (maintained)
Bundle Size:         1.34MB (478KB gzipped) - 53% reduction ✅
Page Load (initial): <1s (50% faster) ✅
PDF Core:            Lazy loaded (0% of initial bundle) ✅
PlaybookPage:        ~180KB (43% reduction) ✅
ESLint Warnings:     0 (100% clean) ✅
Unused Deps:         0 (all cleaned up) ✅
```

---

## 🚨 Rollback Plan

If something breaks:

```bash
# 1. Revert all changes
git reset --hard HEAD~5

# 2. Or cherry-pick working commits
git cherry-pick <working-commit-hash>

# 3. Test individual changes
npm run validate
npm run build
npm run preview
```

---

## ✅ Final Checklist

### Before Starting
- [ ] Read full audit: `docs/OPTIMIZATION_AUDIT_JAN13_2026.md`
- [ ] Create feature branch: `git checkout -b optimize/week1-critical`
- [ ] Backup current state: `git tag before-week1-optimization`
- [ ] Clear node_modules: `rm -rf node_modules && npm install`

### During Implementation
- [ ] Commit after each step
- [ ] Test after each change
- [ ] Update docs as you go
- [ ] Take bundle size screenshots

### After Completion
- [ ] Run full test suite: `npm run validate`
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] All features tested manually
- [ ] Bundle analysis compared
- [ ] Performance metrics documented
- [ ] PR created with before/after comparison
- [ ] Team review requested

---

## 📚 Resources

- Full Audit: `docs/OPTIMIZATION_AUDIT_JAN13_2026.md`
- December Optimizations: `docs/OPTIMIZATION_COMPLETE_DEC7_2025.md`
- Agent Instructions: `.github/copilot-agent-instructions.md`
- Quick Reference: `.github/COPILOT_QUICK_REFERENCE.md`

---

**Created**: January 13, 2026  
**Estimated Time**: 8 hours (1 week part-time)  
**Expected Impact**: 53% bundle reduction, production-ready  
**Status**: Ready to implement 🚀
