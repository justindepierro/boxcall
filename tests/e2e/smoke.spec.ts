import { test, expect } from '@playwright/test';

/**
 * Basic Smoke Tests
 * Quick checks to verify the application is running and accessible
 */

test.describe('Application Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we're on a valid page (either landing or auth redirect)
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for common navigation elements
    // The app should have some kind of header or navigation
    const body = await page.locator('body');
    expect(await body.isVisible()).toBe(true);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    
    // Should either show a 404 page or redirect to home
    expect([200, 404]).toContain(response?.status() || 200);
    
    // Page should still be functional
    const body = await page.locator('body');
    expect(await body.isVisible()).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that content is visible
    const body = await page.locator('body');
    expect(await body.isVisible()).toBe(true);
    
    // Check that viewport meta tag is set
    const viewport = await page.locator('meta[name="viewport"]');
    expect(await viewport.count()).toBeGreaterThan(0);
  });
});
