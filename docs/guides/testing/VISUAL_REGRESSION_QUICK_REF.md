# Visual Regression Testing - Quick Reference

## 🚀 Common Commands

### Component Testing (Storybook)

```bash
# Start Storybook (required first)
npm run storybook

# Run component visual tests
npm run test:storybook

# Update component baselines
npm run test:storybook:update

# CI mode (builds Storybook first)
npm run test:storybook:ci
```

### Page Testing

```bash
# Run page visual tests
npm run test:visual

# Update page baselines
npm run test:visual:update

# Run with UI
npm run test:visual:ui
```

### Complete Suite

```bash
# Run everything
npm run test:visual && npm run test:storybook
```

## 📸 Coverage

- **Components**: 118+ Storybook stories (automatic)
- **Pages**: 14 full page tests
- **Total**: 130+ visual regression tests

## 🛠️ First-Time Setup

1. Install dependencies (already done)
2. Generate baselines:
   ```bash
   npm run test:visual:update
   npm run storybook  # Terminal 1
   npm run test:storybook:update  # Terminal 2
   ```
3. Commit baselines: `git add . && git commit`

## 🔍 When Tests Fail

1. Check terminal output
2. Open report: `npm run test:e2e:report`
3. Review Expected vs Actual vs Diff
4. If intentional: Update baselines
5. If bug: Fix and re-run

## ✅ Best Practices

- ✅ Run before committing
- ✅ Review diffs carefully
- ✅ Update baselines intentionally
- ✅ Commit snapshot changes
- ✅ Use static data in stories

## 📚 Full Documentation

- **Comprehensive Guide**: `docs/VISUAL_REGRESSION_TESTING.md`
- **Implementation Summary**: `docs/VISUAL_REGRESSION_IMPLEMENTATION.md`
- **Storybook Coverage**: `docs/STORYBOOK_COVERAGE_UPDATE.md`

## 🎯 Skip Visual Testing

Add to specific stories:

```typescript
export const InteractiveDemo: Story = {
  tags: ["skip-visual-test"],
  // ...
};
```

## 🚨 Troubleshooting

**"Can't find Storybook"**
→ Start it first: `npm run storybook`

**"Snapshot doesn't exist"**
→ Generate baselines: `npm run test:storybook:update`

**"Flaky tests"**
→ Adjust `.storybook/test-runner.ts` thresholds

**"Too slow"**
→ Use parallel: `npm run test:storybook -- --workers=4`

---

**Status**: ✅ Ready to use  
**Maintained**: Automatically with Storybook
