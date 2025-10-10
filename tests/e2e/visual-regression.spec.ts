import { test, expect } from "@playwright/test";

/**
 * Visual Regression Testing Suite
 *
 * Uses Playwright's built-in screenshot comparison to detect visual changes.
 *
 * To update baselines: npm run test:e2e -- --update-snapshots
 * To run only visual tests: npm run test:e2e -- visual-regression
 */

test.describe("Visual Regression - Public Pages", () => {
  test("landing page appearance", async ({ page }) => {
    await page.goto("/");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Take full page screenshot
    await expect(page).toHaveScreenshot("landing-page.png", {
      fullPage: true,
      animations: "disabled", // Disable animations for consistent screenshots
    });
  });

  test("login page appearance", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("login-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("signup page appearance", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("signup-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});

test.describe("Visual Regression - Authenticated Pages", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("dashboard appearance", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Wait for any loading spinners to disappear
    await page
      .waitForSelector('[data-testid="loading"]', {
        state: "hidden",
        timeout: 5000,
      })
      .catch(() => {});

    await expect(page).toHaveScreenshot("dashboard-page.png", {
      fullPage: true,
      animations: "disabled",
      // Mask dynamic content that changes frequently
      mask: [
        page.locator('[data-testid="timestamp"]'),
        page.locator('[data-testid="user-avatar"]'),
      ].filter(async (locator) => (await locator.count()) > 0),
    });
  });

  test("playbook page appearance", async ({ page }) => {
    await page.goto("/playbook");
    await page.waitForLoadState("networkidle");

    // Wait for activities to load
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("playbook-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("team page appearance", async ({ page }) => {
    await page.goto("/teams");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("team-page.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("profile page appearance", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("profile-page.png", {
      fullPage: true,
      animations: "disabled",
      // Mask avatar which might be dynamic
      mask: [page.locator('[data-testid="user-avatar"]')],
    });
  });
});

test.describe("Visual Regression - Component States", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("navigation menu expanded", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Find and click the menu button (adjust selector as needed)
    const menuButton = page
      .locator('[aria-label*="menu"], button:has-text("Menu")')
      .first();
    if ((await menuButton.count()) > 0) {
      await menuButton.click();
      await page.waitForTimeout(300); // Wait for animation

      await expect(page).toHaveScreenshot("navigation-expanded.png", {
        animations: "disabled",
      });
    }
  });

  test("modal appearance", async ({ page }) => {
    await page.goto("/playbook");
    await page.waitForLoadState("networkidle");

    // Try to open a modal (adjust selector based on your app)
    const createButton = page
      .locator('button:has-text("Create"), button:has-text("New")')
      .first();
    if ((await createButton.count()) > 0) {
      await createButton.click();
      await page.waitForTimeout(300);

      // Screenshot just the modal
      const modal = page
        .locator('[role="dialog"], [data-testid="modal"]')
        .first();
      if ((await modal.count()) > 0) {
        await expect(modal).toHaveScreenshot("create-modal.png", {
          animations: "disabled",
        });
      }
    }
  });
});

test.describe("Visual Regression - Responsive Design", () => {
  test("mobile viewport - landing page", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("landing-mobile.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("tablet viewport - dashboard", async ({ browser }) => {
    // Create new context with tablet viewport and auth
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }, // iPad
      storageState: "playwright/.auth/user.json",
    });
    const page = await context.newPage();

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("dashboard-tablet.png", {
      fullPage: true,
      animations: "disabled",
    });

    await context.close();
  });

  test("desktop viewport - playbook", async ({ browser }) => {
    // Create new context with desktop viewport and auth
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }, // Full HD
      storageState: "playwright/.auth/user.json",
    });
    const page = await context.newPage();

    await page.goto("/playbook");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("playbook-desktop.png", {
      fullPage: true,
      animations: "disabled",
    });

    await context.close();
  });
});

test.describe("Visual Regression - Dark Mode", () => {
  test.use({
    storageState: "playwright/.auth/user.json",
    colorScheme: "dark",
  });

  test("dashboard dark mode", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Force dark mode if not automatic
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("dashboard-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("playbook dark mode", async ({ page }) => {
    await page.goto("/playbook");
    await page.waitForLoadState("networkidle");

    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("playbook-dark.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
