# E2E Testing with Playwright

> **Status**: ✅ Active - 92/120 tests passing (76.7%)  
> **Created**: January 9, 2025  
> **Framework**: Playwright 1.x  
> **Coverage**: Smoke tests, Authentication, Critical flows, Performance, Accessibility, PWA

## 📋 Table of Contents

- [Overview](#overview)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Test Results](#test-results)
- [Known Issues](#known-issues)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Debugging](#debugging)

## 🎯 Overview

E2E (End-to-End) testing validates the application from a user's perspective by simulating real browser interactions. Our Playwright setup tests across **5 different browsers**:

- **Desktop**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)

### Test Philosophy

- **User-centric**: Tests simulate real user workflows
- **Robust**: Tests handle dynamic content and timing issues
- **Fast**: Parallel execution across browsers
- **Actionable**: Clear failure messages with screenshots/videos

## 🧪 Test Suites

### 1. Smoke Tests (`smoke.spec.ts`)

**Purpose**: Quick health checks to verify basic functionality

**Tests (4 total)**:

- ✅ Homepage loads successfully
- ✅ Navigation is accessible
- ✅ 404 pages handled gracefully
- ✅ Responsive on mobile viewports

**Pass Rate**: 100% (20/20 across all browsers)

---

### 2. Authentication Tests (`auth.spec.ts`)

**Purpose**: Validate auth flows and security

**Tests (6 total)**:

- ⚠️ Login page visibility
- ⚠️ Registration page navigation
- ✅ Empty form validation
- ✅ Invalid email validation
- ✅ XSS prevention
- ✅ Protected route redirection

**Pass Rate**: 73% (22/30 across all browsers)

**Known Issues**:

- Login/register buttons not visible on landing page (needs UI fix)
- Firefox timeout on protected routes (intermittent)

---

### 3. Critical Flows (`critical-flows.spec.ts`)

**Purpose**: Validate key user journeys and standards compliance

#### Navigation (2 tests)

- ✅ Navigate through main sections
- ✅ Browser back/forward navigation

#### Performance (3 tests)

- ✅ Page load under 5 seconds
- ✅ No console errors
- ⚠️ No failed network requests (Supabase auth issue)

#### Accessibility (6 tests)

- ✅ Proper page title
- ✅ Lang attribute on HTML
- ✅ Meta viewport for mobile
- ⚠️ Proper heading hierarchy (missing h1)
- ✅ Alt text on images
- ✅ Focus visible styles

#### PWA Features (3 tests)

- ✅ Service worker registered
- ⚠️ Web app manifest (needs adding)
- ⚠️ Theme color meta tag (needs adding)

**Pass Rate**: 79% (50/70 across all browsers)

---

## 🚀 Running Tests

### Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser window)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

### Run Specific Tests

```bash
# Run single test file
npx playwright test smoke.spec.ts

# Run tests matching pattern
npx playwright test --grep "Authentication"

# Run on specific browser
npx playwright test --project=chromium

# Run on mobile only
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
```

### Run with Options

```bash
# Run with retries
npx playwright test --retries=2

# Run with specific number of workers
npx playwright test --workers=2

# Update snapshots (for visual regression)
npx playwright test --update-snapshots
```

## 📊 Test Results

### Overall Statistics

- **Total Tests**: 120 (24 tests × 5 browsers)
- **Passing**: 92 (76.7%)
- **Failing**: 28 (23.3%)
- **Duration**: ~3.6 minutes
- **Parallel Workers**: 4

### Browser Breakdown

| Browser       | Pass | Fail | Pass Rate |
| ------------- | ---- | ---- | --------- |
| Chromium      | 18   | 6    | 75%       |
| Firefox       | 17   | 7    | 71%       |
| WebKit        | 18   | 6    | 75%       |
| Mobile Chrome | 18   | 6    | 75%       |
| Mobile Safari | 18   | 6    | 75%       |

### Test Category Breakdown

| Category       | Pass  | Fail | Pass Rate |
| -------------- | ----- | ---- | --------- |
| Smoke Tests    | 20/20 | 0    | 100%      |
| Authentication | 22/30 | 8    | 73%       |
| Navigation     | 10/10 | 0    | 100%      |
| Performance    | 13/15 | 2    | 87%       |
| Accessibility  | 25/30 | 5    | 83%       |
| PWA Features   | 5/15  | 10   | 33%       |

## 🐛 Known Issues

### High Priority

1. **Missing Login/Register Buttons** (8 failures)
   - **Issue**: Landing page doesn't show visible login/register UI
   - **Impact**: Auth test failures across all browsers
   - **Fix**: Add prominent auth buttons to landing page
   - **Files**: `src/pages/LandingPage.tsx` or similar

2. **Missing H1 Tags** (5 failures)
   - **Issue**: Pages don't have proper h1 heading elements
   - **Impact**: SEO and accessibility concerns
   - **Fix**: Add h1 to each page (Home, Login, Dashboard, etc.)
   - **Files**: Page components in `src/pages/`

3. **Missing PWA Manifest** (5 failures)
   - **Issue**: No manifest link in HTML
   - **Impact**: PWA installation not available
   - **Fix**: Ensure `vite-plugin-pwa` is configured correctly
   - **Files**: `vite.config.ts`, `index.html`

4. **Missing Theme Color** (5 failures)
   - **Issue**: No theme-color meta tag
   - **Impact**: Mobile browser chrome color not set
   - **Fix**: Add `<meta name="theme-color" content="#yourcolor">` to HTML
   - **Files**: `index.html`

### Medium Priority

5. **Failed Network Requests** (2 failures)
   - **Issue**: Supabase `/teams?select=count` fails with auth error
   - **Impact**: Tests detect failed requests
   - **Fix**: Investigate why unauthenticated count query fails
   - **Files**: Component making the teams query

6. **Firefox Protected Routes Timeout** (1 failure)
   - **Issue**: Firefox timeout waiting for networkidle on protected routes
   - **Impact**: Intermittent test failure
   - **Fix**: Increase timeout or use different wait strategy
   - **Files**: `tests/e2e/auth.spec.ts`

7. **Firefox Performance** (1 failure)
   - **Issue**: Page load time 5.3s vs 5s threshold on Firefox
   - **Impact**: Performance test fails by 300ms
   - **Fix**: Increase threshold to 6s or optimize page load
   - **Files**: `tests/e2e/critical-flows.spec.ts`

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto("/");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    const button = page.getByRole("button", { name: /click me/i });

    // Act
    await button.click();

    // Assert
    await expect(page.getByText("Success!")).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Locators**

   ```typescript
   // ✅ Good - uses accessible role
   page.getByRole("button", { name: /submit/i });

   // ❌ Bad - brittle CSS selector
   page.locator(".btn-primary");
   ```

2. **Handle Timing Issues**

   ```typescript
   // ✅ Good - wait for condition
   await expect(page.getByText("Loaded")).toBeVisible();

   // ❌ Bad - arbitrary timeout
   await page.waitForTimeout(3000);
   ```

3. **Make Tests Resilient**

   ```typescript
   // ✅ Good - handles multiple selectors
   const emailInput = page
     .getByLabel(/email/i)
     .or(page.getByPlaceholder(/email/i));

   // ❌ Bad - single selector
   const emailInput = page.getByLabel("Email");
   ```

4. **Test User Flows, Not Implementation**

   ```typescript
   // ✅ Good - tests user behavior
   test("user can create a playbook", async ({ page }) => {
     await page.getByRole("button", { name: /new playbook/i }).click();
     await page.getByLabel(/playbook name/i).fill("My Playbook");
     await page.getByRole("button", { name: /save/i }).click();
     await expect(page.getByText("Playbook created")).toBeVisible();
   });

   // ❌ Bad - tests implementation details
   test("create playbook API is called", async ({ page }) => {
     // ...
   });
   ```

### Authentication Setup

For tests that require authentication:

```typescript
// Create auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/password/i).fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect
  await page.waitForURL("/dashboard");

  // Save auth state
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

Then use in tests:

```typescript
test.use({ storageState: "playwright/.auth/user.json" });

test("authenticated user can access dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  // User is already logged in
});
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Netlify Deploy Preview Testing

```yaml
- name: Run E2E against deploy preview
  run: npm run test:e2e
  env:
    PLAYWRIGHT_BASE_URL: ${{ steps.deploy.outputs.url }}
```

## 🔍 Debugging

### Visual Debugging

1. **UI Mode** (recommended)

   ```bash
   npm run test:e2e:ui
   ```

   - Time travel through test steps
   - Inspect DOM at each step
   - Watch videos side-by-side

2. **Debug Mode**

   ```bash
   npm run test:e2e:debug
   ```

   - Step through tests with debugger
   - Pause execution
   - Inspect variables

3. **Headed Mode**
   ```bash
   npm run test:e2e:headed
   ```

   - See browser window while tests run
   - Useful for understanding timing issues

### Artifacts

After test failures, check:

1. **Screenshots**: `test-results/[test-name]/test-failed-1.png`
2. **Videos**: `test-results/[test-name]/video.webm`
3. **Traces**: Use Playwright Trace Viewer
4. **HTML Report**: `playwright-report/index.html`

### Common Debugging Commands

```bash
# Run single test with debug
npx playwright test smoke.spec.ts:10 --debug

# Show test traces
npx playwright show-trace test-results/[test-name]/trace.zip

# Generate trace for passing tests too
npx playwright test --trace on

# Run with verbose logging
DEBUG=pw:api npx playwright test
```

### Fixing Flaky Tests

1. **Increase timeouts for slow operations**

   ```typescript
   test("slow operation", async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     // ...
   });
   ```

2. **Use proper wait strategies**

   ```typescript
   // Wait for specific condition
   await page.waitForLoadState("networkidle");
   await expect(page.getByText("Ready")).toBeVisible();

   // Don't use arbitrary timeouts
   // await page.waitForTimeout(5000); // ❌
   ```

3. **Retry flaky tests automatically**
   ```typescript
   test.describe("Flaky feature", () => {
     test.describe.configure({ retries: 2 });
     // Tests here will retry up to 2 times
   });
   ```

## 📈 Next Steps

### Immediate Priorities

1. ✅ **Fix Missing UI Elements** (30 min)
   - Add login/register buttons to landing page
   - Add h1 tags to all pages
   - Add PWA manifest and theme-color meta tag

2. 🔍 **Investigate Failed Requests** (15 min)
   - Debug Supabase teams count query
   - Add error handling or fix auth

3. 🧪 **Increase Test Coverage** (2-3 hours)
   - Add playbook creation/editing tests
   - Add team management tests
   - Add roster operations tests

### Future Enhancements

- **Authentication Setup**: Create reusable auth state
- **Visual Regression**: Add Percy or Chromatic
- **Performance Budgets**: Add lighthouse CI
- **API Mocking**: Mock external services for faster tests
- **Test Data Management**: Seed database with test data

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Examples](https://playwright.dev/docs/ci)

---

**Last Updated**: January 9, 2025  
**Maintained By**: Development Team  
**Questions?**: Check Playwright docs or team Slack channel
