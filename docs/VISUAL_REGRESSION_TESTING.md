# Visual Regression Testing Guide

**Status**: ✅ Active & Enhanced  
**Created**: January 9, 2025  
**Updated**: October 5, 2025 - Added Storybook Component Testing  
**Tools**: Playwright + Storybook Test Runner

## 📋 Overview

Visual regression testing automatically detects unintended visual changes in your UI by comparing screenshots before and after code changes.

BoxCall now has **two-tier visual testing**:

### Page-Level Testing (Playwright)

- ✅ Critical pages (homepage, login, dashboard, etc.)
- ✅ Responsive layouts (mobile, tablet, desktop)
- ✅ Dark mode variations
- ✅ Cross-browser rendering
- ✅ Interactive states (modals, menus)

### Component-Level Testing (Storybook) - NEW ✨

- ✅ Isolated UI components (118+ stories)
- ✅ All component variants and states
- ✅ Design system consistency
- ✅ Fast, focused testing
- ✅ Automatic for all Storybook stories

---

## 🚀 Quick Start

### Page-Level Tests (Existing)

```bash
# Run all page visual regression tests
npm run test:visual

# Run with UI mode (recommended for development)
npm run test:visual:ui

# Update page baselines
npm run test:visual:update
```

### Component-Level Tests (NEW)

```bash
# Run all component visual tests
npm run test:storybook

# Run in CI mode (builds Storybook first)
npm run test:storybook:ci

# Update component baselines
npm run test:storybook:update

# Test while developing
npm run storybook  # Terminal 1
npm run test:storybook  # Terminal 2
```

### Run All Visual Tests

```bash
# Complete visual regression suite
npm run test:visual && npm run test:storybook
```

### Review Visual Differences

When a test fails:

```bash
# Open HTML report to see visual diffs
npm run test:e2e:report
```

---

## 📸 How It Works

### Page-Level Testing

#### 1. Baseline Screenshots

First run creates baseline screenshots stored in:

```
tests/e2e/visual-regression.spec.ts-snapshots/
├── chromium/
│   ├── homepage.png
│   ├── login-page.png
│   ├── dashboard.png
│   └── ...
├── firefox/
└── webkit/
```

#### 2. Comparison

Subsequent runs compare current screenshots against baselines:

- ✅ **Pass**: Visual differences below threshold (1%)
- ❌ **Fail**: Visual differences exceed threshold
- 📊 **Diff images** generated showing differences

#### 3. Review & Update

When intentional changes are made:

1. Review diff images in test report
2. Update baselines if changes are correct:
   ```bash
   npm run test:visual:update
   ```
3. Commit new baselines to Git

### Component-Level Testing (Storybook) - NEW ✨

#### How Storybook Test Runner Works

1. **Starts Storybook**: Launches Storybook server on port 6006
2. **Discovers Stories**: Finds all `*.stories.tsx` files (118+ stories)
3. **Renders Each Story**: Opens each story in headless browser
4. **Disables Animations**: Automatically via injected CSS
5. **Captures Screenshot**: Takes snapshot of `#storybook-root`
6. **Compares**: Checks against baseline with 0.2% threshold
7. **Reports**: Generates diffs for any failures

#### Configuration

Located in `.storybook/test-runner.ts`:

```typescript
const config: TestRunnerConfig = {
  async preVisit(page) {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  },
  async postVisit(page, context) {
    // Wait for rendering
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(200);

    // Screenshot the story
    const element = await page.locator("#storybook-root").first();
    await expect(element).toHaveScreenshot(`${context.id}.png`, {
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  },
};
```

#### Skipping Stories

To skip visual testing for interactive/dynamic stories:

```typescript
export const InteractiveDemo: Story = {
  args: {
    /* ... */
  },
  tags: ["skip-visual-test"], // Skip visual regression
};
```

#### Coverage

**Automatic testing for**:

- ✅ Button (all variants: primary, secondary, ghost, danger)
- ✅ Aurora (shell, field, minimal, none)
- ✅ Card (standard and glass variants)
- ✅ Form components (Input, Select, TextArea, etc.)
- ✅ Modal (all sizes and states)
- ✅ Badge (role badges, multi-badge display)
- ✅ EmptyState, Skeleton, LoadingScreen
- ✅ Table, Icon, Tooltip
- ✅ **All 118+ Storybook stories**

---

## 📝 Writing Visual Tests

### Basic Page Test

```typescript
test("Homepage renders correctly", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("homepage.png", {
    fullPage: true,
    animations: "disabled",
  });
});
```

### Component Test

```typescript
test("Navigation header renders correctly", async ({ page }) => {
  await page.goto("/dashboard");

  const header = page.locator("header").first();
  await expect(header).toHaveScreenshot("nav-header.png", {
    animations: "disabled",
  });
});
```

### Responsive Test

```typescript
test("Homepage mobile view", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  await expect(page).toHaveScreenshot("homepage-mobile.png", {
    fullPage: true,
  });
});
```

### Dark Mode Test

```typescript
test("Dashboard in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/dashboard");

  await expect(page).toHaveScreenshot("dashboard-dark.png");
});
```

---

## 🎯 Configuration

### Playwright Config

Located in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,  // 1% difference threshold
    animations: 'disabled',    // Disable animations
    threshold: 0.2,            // Pixel comparison threshold
  },
}
```

### Adjust Thresholds

For pages with dynamic content:

```typescript
await expect(page).toHaveScreenshot("dynamic-page.png", {
  maxDiffPixelRatio: 0.05, // Allow 5% difference
  threshold: 0.3, // More lenient pixel comparison
});
```

### Mask Dynamic Content

For timestamps, user data, etc.:

```typescript
await expect(page).toHaveScreenshot("page.png", {
  mask: [page.locator(".timestamp"), page.locator(".user-avatar")],
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions

Visual tests run automatically in CI:

```yaml
- name: Run visual regression tests
  run: npm run test:visual

- name: Upload visual diff artifacts
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: visual-diffs
    path: test-results/
```

### Baseline Management

**Committing baselines:**

```bash
# After generating baselines
git add tests/e2e/visual-regression.spec.ts-snapshots/
git commit -m "chore: Update visual regression baselines"
git push
```

**When baselines diverge:**

- Different OS/browsers may generate slightly different screenshots
- Use consistent CI environment (Linux in GitHub Actions)
- Store separate baselines per platform if needed

---

## 📊 Best Practices

### 1. Wait for Stability

Always wait for content to load:

```typescript
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000); // For animations
```

### 2. Disable Animations

Prevents flaky tests due to mid-animation captures:

```typescript
await expect(page).toHaveScreenshot("page.png", {
  animations: "disabled",
});
```

### 3. Test Critical Paths Only

Don't screenshot everything - focus on:

- User-facing pages (home, login, dashboard)
- Critical components (nav, cards, forms)
- Mobile/responsive layouts
- Dark mode (if supported)

### 4. Keep Screenshots Small

Avoid full-page screenshots when testing specific components:

```typescript
// ❌ Bad: Full page for small component
await expect(page).toHaveScreenshot("button.png", { fullPage: true });

// ✅ Good: Just the component
const button = page.locator("button.primary").first();
await expect(button).toHaveScreenshot("button.png");
```

### 5. Use Descriptive Names

```typescript
// ❌ Bad
await expect(page).toHaveScreenshot("test1.png");

// ✅ Good
await expect(page).toHaveScreenshot("homepage-logged-out.png");
```

---

## 🐛 Troubleshooting

### Issue: Tests Fail on CI but Pass Locally

**Cause**: Different rendering between macOS/Windows/Linux

**Solution**:

```bash
# Generate baselines in Docker (matches CI)
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:latest npx playwright test visual-regression.spec.ts --update-snapshots
```

### Issue: Flaky Visual Tests

**Symptoms**: Tests randomly fail/pass

**Solutions**:

1. Increase wait times:

   ```typescript
   await page.waitForTimeout(2000);
   ```

2. Mask dynamic content:

   ```typescript
   mask: [page.locator(".timestamp")];
   ```

3. Increase threshold:
   ```typescript
   maxDiffPixelRatio: 0.02; // 2% instead of 1%
   ```

### Issue: Large Screenshot Diffs

**When to update baselines:**

- ✅ Intentional design changes
- ✅ Updated dependencies (fonts, icons)
- ✅ Improved layouts

**When NOT to update:**

- ❌ Unexpected visual regressions
- ❌ Broken layouts
- ❌ Missing content

Always review diffs before updating!

---

## 📈 Test Coverage

### Current Coverage

| Category     | Tests  | Viewports     | Total Scenarios |
| ------------ | ------ | ------------- | --------------- |
| Public Pages | 3      | Desktop       | 3               |
| Auth Pages   | 4      | Desktop       | 4               |
| Components   | 3      | Desktop       | 3               |
| Responsive   | 3      | Mobile/Tablet | 3               |
| Dark Mode    | 2      | Desktop       | 2               |
| **Total**    | **15** | **Various**   | **15**          |

### Adding New Tests

When adding new pages/components:

1. Add test to `visual-regression.spec.ts`:

   ```typescript
   test("New feature renders correctly", async ({ page }) => {
     await page.goto("/new-feature");
     await expect(page).toHaveScreenshot("new-feature.png");
   });
   ```

2. Generate baseline:

   ```bash
   npm run test:visual:update
   ```

3. Commit baseline:
   ```bash
   git add tests/e2e/visual-regression.spec.ts-snapshots/
   git commit -m "test: Add visual regression for new feature"
   ```

---

## 🔗 Resources

- [Playwright Screenshots Documentation](https://playwright.dev/docs/screenshots)
- [Visual Comparisons Guide](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

## 📝 npm Scripts Reference

```bash
# Run all visual regression tests
npm run test:visual

# Update baseline screenshots
npm run test:visual:update

# Run with UI mode
npm run test:visual:ui

# Run all E2E tests (including visual)
npm run test:e2e

# View test report
npm run test:e2e:report
```

---

## ✅ Checklist

### Initial Setup

- [x] Playwright configured for visual testing
- [x] Test suite created (`visual-regression.spec.ts`)
- [x] npm scripts added
- [x] Documentation created

### Before Committing Changes

- [ ] Run visual tests: `npm run test:visual`
- [ ] Review any failures in HTML report
- [ ] Update baselines if changes are intentional
- [ ] Commit baseline screenshots with code changes
- [ ] Verify tests pass in CI

### Adding New Features

- [ ] Add visual tests for new pages/components
- [ ] Generate baselines
- [ ] Test responsive layouts
- [ ] Test dark mode (if applicable)
- [ ] Document any special configuration

---

**Last Updated**: January 9, 2025  
**Maintained By**: Development Team  
**Questions?**: Check Playwright docs or ask the team
