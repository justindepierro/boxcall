# Dead Code Detection & Cleanup Guide

**Date**: October 6, 2025  
**Status**: Active Maintenance Tool

## Overview

This guide documents how to find and safely remove dead code from the BoxCall codebase.

## Quick Start

```bash
# Scan for dead code
npm run deadcode:scan

# Generate report file
npm run deadcode:report
```

## What Gets Detected

### 1. **Orphaned CSS Files** ✅

- CSS files with zero imports
- Not referenced in any component or page
- Not included via @import in other CSS files

**Example Found**: `BoxCallCalendar.css` (211 lines)

- ❌ Never imported anywhere
- ❌ Component used className but styles were never loaded
- ✅ **Action**: Deleted, saved 211 lines

### 2. **Orphaned Components** ⚠️

- Components that are never imported
- May include:
  - Old deprecated components
  - Experimental/test components
  - Superseded implementations

**Candidates Found**:

- `src/components/accessibility/AccessibleInput.tsx`
- `src/components/accessibility/AccessibleModal.tsx`
- `src/components/accessibility/LoadingAnnouncer.tsx`
- `src/components/accessibility/SkipLinks.tsx`
- `src/components/auth/AuthProvider.tsx`
- `src/components/auth/LoginForm.stories.tsx`
- `src/components/calendar/BoxCallCalendar.stories.tsx`

### 3. **Orphaned Pages** ⚠️

- Page components never referenced in routing
- Test pages left in production code
- Old experimental pages

**Candidates Found**:

- `src/pages/CSSTestPage.tsx` (test page)
- `src/pages/DiagnosticsPage.tsx` (dev tool)
- `src/pages/Logout.tsx`
- `src/pages/MinimalTooltipTest.tsx` (test page)
- `src/pages/PracticePlannerOld.tsx` (superseded)
- `src/pages/TooltipTest.tsx` (test page)

## Detection Script

### Location

`scripts/find-dead-code.mjs`

### How It Works

1. **CSS File Detection**

   ```javascript
   // Searches for:
   import "./filename.css"
   import "path/to/filename.css"
   @import "filename.css"
   ```

2. **Component Detection**

   ```javascript
   // Searches for:
   import ComponentName from "./path";
   import { ComponentName } from "./path";
   export { ComponentName };
   ```

3. **Page Detection**
   ```javascript
   // Searches for:
   - React Router path references
   - Lazy loading imports
   - Route configuration files
   ```

### Limitations

⚠️ **False Positives Possible**:

- Dynamic imports not detected: `import(variablePath)`
- String-based requires: `require(${dynamicPath})`
- Storybook-only components flagged as orphaned
- Components used only in tests

⚠️ **Sampling**:

- Only checks 20 components (out of 382) for performance
- Full scan available with `--full` flag (to be implemented)

## Manual Verification Steps

Before deleting any file, verify:

### ✅ CSS Files

1. Search codebase for className usage
2. Check if styles are applied via CSS modules
3. Verify no global CSS rules are being used
4. Test the UI to ensure no visual regressions

### ✅ Components

1. Check if component is used in:
   - Storybook stories (.stories.tsx)
   - Tests (.test.tsx, .spec.tsx)
   - Documentation files
2. Search for component name in all files
3. Check if component is exported from index files
4. Verify no dynamic imports

### ✅ Pages

1. Check routing configuration:
   - `src/App.tsx`
   - `src/components/lazy/LazyRoutes.tsx`
2. Search for page name in navigation menus
3. Check if page is linked from other pages
4. Verify no protected routes use it

## Safe Deletion Process

### Step 1: Create Backup Branch

```bash
git checkout -b cleanup/dead-code-removal
```

### Step 2: Move to Archive (Don't Delete Immediately)

```bash
mkdir -p archive/dead-code/$(date +%Y-%m-%d)
mv src/pages/CSSTestPage.tsx archive/dead-code/$(date +%Y-%m-%d)/
```

### Step 3: Run Full Test Suite

```bash
npm run validate  # type-check + lint + test
npm run build     # ensure build succeeds
```

### Step 4: Visual QA

```bash
npm run dev
# Manually test affected areas
```

### Step 5: Monitor for 1-2 Weeks

- Keep archived files
- Watch for bug reports
- Check analytics for 404s

### Step 6: Permanent Deletion

After 1-2 weeks with no issues:

```bash
rm -rf archive/dead-code/$(date +%Y-%m-%d)
git commit -m "chore: remove verified dead code"
```

## Current Cleanup Recommendations

### 🔴 High Priority (Confirmed Dead)

**Test Pages** - Safe to delete:

- `src/pages/CSSTestPage.tsx`
- `src/pages/MinimalTooltipTest.tsx`
- `src/pages/TooltipTest.tsx`

**Old Implementations** - Verify first:

- `src/pages/PracticePlannerOld.tsx` (superseded by new version?)

### 🟡 Medium Priority (Needs Investigation)

**Accessibility Components** - May be unused but valuable:

- Check if accessibility features are implemented elsewhere
- Consider if these are future enhancements

**Story Files** - Not dead code:

- `.stories.tsx` files are for Storybook
- Should NOT be deleted
- May need to be moved to `/stories` directory

### 🟢 Low Priority (Keep)

**Diagnostic Tools**:

- `src/pages/DiagnosticsPage.tsx` - Useful for debugging
- Should be dev-only, not in production build

## Advanced Detection Techniques

### 1. Unused Exports Detection

```bash
# Use ts-prune (if installed)
npx ts-prune

# Or use depcheck
npx depcheck
```

### 2. Bundle Analysis

```bash
# Check what's actually in production bundle
npm run build
npx vite-bundle-visualizer

# Look for:
- Duplicate dependencies
- Large unused libraries
- Dead code in bundle
```

### 3. Import Graph Analysis

```bash
# Use madge to visualize imports
npx madge --image graph.png src/

# Find circular dependencies
npx madge --circular src/
```

### 4. Coverage-Based Detection

```bash
# Run tests with coverage
npm run test:coverage

# Check coverage report for:
- 0% covered files (never tested = likely unused?)
- Uncovered branches
- Dead code paths
```

## Integration with CI/CD

### Pre-commit Hook

```json
// .husky/pre-commit
"scripts": {
  "pre-commit": "npm run deadcode:scan"
}
```

### Monthly Cleanup Job

```yaml
# .github/workflows/dead-code-scan.yml
name: Monthly Dead Code Scan
on:
  schedule:
    - cron: "0 0 1 * *" # First day of month
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run deadcode:report
      - uses: actions/upload-artifact@v3
        with:
          name: dead-code-report
          path: reports/dead-code-report.txt
```

## Statistics (Current Session)

**October 6, 2025 Cleanup**:

- ✅ CSS Files Checked: 22
- ✅ Orphaned CSS Found: 1 (`BoxCallCalendar.css`)
- ✅ CSS Lines Saved: 211
- ⏳ Components Checked: 20 (of 382)
- ⏳ Potentially Orphaned Components: 7
- ⏳ Pages Checked: 40
- ⏳ Potentially Orphaned Pages: 6

**Total Potential Savings**: ~500-1000 lines of code

## Best Practices

### ✅ DO:

1. Run detection regularly (monthly)
2. Create backups before deletion
3. Test thoroughly after removal
4. Document why code was removed
5. Keep script updated

### ❌ DON'T:

1. Delete without verification
2. Remove test files if tests still run
3. Delete story files (Storybook needs them)
4. Rush the process
5. Delete without team review

## Future Enhancements

### Planned Improvements:

1. ✅ Add full component scan (not just sampling)
2. ✅ Detect unused utility functions
3. ✅ Find unused type definitions
4. ✅ Identify unused constants/enums
5. ✅ Check for unused dependencies in package.json
6. ✅ Generate cleanup PRs automatically
7. ✅ Integration with TypeScript compiler API
8. ✅ Smart detection of dynamic imports

### Tool Integrations:

- [ ] `ts-unused-exports` for TypeScript
- [ ] `depcheck` for dependencies
- [ ] `unimported` for unused files
- [ ] `knip` for comprehensive analysis

## Related Documentation

- [LEGACY_CODE_AUDIT_REPORT.md](./LEGACY_CODE_AUDIT_REPORT.md)
- [CLEANUP_SESSION_SUMMARY.md](./CLEANUP_SESSION_SUMMARY.md)
- [DESIGN_TOKEN_STANDARDIZATION_PROJECT.md](./DESIGN_TOKEN_STANDARDIZATION_PROJECT.md)

## Support

For questions or issues with dead code detection:

1. Run: `npm run deadcode:scan`
2. Review this guide
3. Consult with team before major deletions
4. Create issue for false positives

---

**Last Updated**: October 6, 2025  
**Next Scheduled Scan**: November 1, 2025
