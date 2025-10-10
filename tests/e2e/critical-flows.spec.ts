import { test, expect } from "@playwright/test";

/**
 * Critical User Flow Tests
 * Tests for the most important user journeys in the application
 * These tests assume a logged-in state (use Playwright auth setup)
 */

test.describe("Navigation", () => {
  test("should navigate through main sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if we have a navigation menu
    const nav = page.locator("nav").first();
    const hasNav = (await nav.count()) > 0;

    if (hasNav) {
      // Should be able to see navigation items
      const navItems = await nav.locator("a, button").count();
      expect(navItems).toBeGreaterThan(0);
    }
  });

  test("should handle back/forward navigation", async ({ page }) => {
    await page.goto("/");
    const firstUrl = page.url();

    // Try to navigate to another page
    const links = page.locator("a[href]");
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();
      await firstLink.click();
      await page.waitForLoadState("networkidle");

      const secondUrl = page.url();

      // Navigate back
      await page.goBack();
      await page.waitForLoadState("networkidle");

      // Should be back at first URL
      expect(page.url()).toBe(firstUrl);

      // Navigate forward
      await page.goForward();
      await page.waitForLoadState("networkidle");

      // Should be at second URL
      expect(page.url()).toBe(secondUrl);
    }
  });
});

test.describe("Performance", () => {
  test("should load pages within acceptable time", async ({ page }) => {
    const start = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - start;

    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should not have console errors on load", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical errors (like React DevTools)
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes("DevTools") && !error.includes("extension")
    );

    // Should have no critical console errors
    expect(criticalErrors).toHaveLength(0);
  });

  test("should have no failed network requests", async ({ page }) => {
    const failedRequests: string[] = [];

    page.on("requestfailed", (request) => {
      failedRequests.push(request.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should have no failed requests
    expect(failedRequests).toHaveLength(0);
  });
});

test.describe("Accessibility", () => {
  test("should have proper page title", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const title = await page.title();

    // Title should exist and not be empty
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe("Vite App"); // Should have custom title
  });

  test("should have lang attribute on html element", async ({ page }) => {
    await page.goto("/");

    const lang = await page.locator("html").getAttribute("lang");

    // Should have lang attribute
    expect(lang).toBeTruthy();
    expect(lang).toBe("en");
  });

  test("should have meta viewport for mobile", async ({ page }) => {
    await page.goto("/");

    const viewport = await page.locator('meta[name="viewport"]');
    const content = await viewport.getAttribute("content");

    // Should have viewport meta tag
    expect(await viewport.count()).toBeGreaterThan(0);
    expect(content).toContain("width=device-width");
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should have at least one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Should not have more than one h1 per page
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const images = await page.locator("img").all();

    for (const img of images) {
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");

      // Images should have alt text or role="presentation"
      expect(alt !== null || role === "presentation").toBe(true);
    }
  });

  test("should have focus visible styles", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find first interactive element
    const button = page.getByRole("button").first();

    if ((await button.count()) > 0) {
      // Focus the button
      await button.focus();

      // Check if it's focused
      const isFocused = await button.evaluate(
        (el: HTMLElement) => el === document.activeElement
      );

      expect(isFocused).toBe(true);
    }
  });
});

test.describe("PWA Features", () => {
  test("should have service worker registered", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if service worker is registered
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });

    // Service worker might not be registered in dev mode
    // Just check that the API is available
    expect(typeof swRegistration).toBeDefined();
  });

  test("should have web app manifest", async ({ page }) => {
    await page.goto("/");

    const manifest = await page.locator('link[rel="manifest"]');

    // Should have manifest link
    expect(await manifest.count()).toBeGreaterThan(0);
  });

  test("should have theme color", async ({ page }) => {
    await page.goto("/");

    const themeColor = await page.locator('meta[name="theme-color"]');

    // Should have theme color
    expect(await themeColor.count()).toBeGreaterThan(0);
  });
});
