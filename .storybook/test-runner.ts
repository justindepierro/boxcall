import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext } from "@storybook/test-runner";

/**
 * Storybook Test Runner Configuration
 *
 * Enables visual regression testing for all Storybook stories using Playwright.
 * Each story is automatically screenshotted and compared against baselines.
 *
 * Usage:
 *   npm run test:storybook              - Run all story tests
 *   npm run test:storybook:visual       - Run visual regression only
 *   npm run test:storybook:update       - Update visual baselines
 */

const config: TestRunnerConfig = {
  // Run before each story test
  async preVisit(page) {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  },

  // Run after each story renders
  async postVisit(page, context) {
    // Wait for story to be fully rendered
    await page.waitForLoadState("networkidle");

    // Small delay to ensure all content is painted
    await page.waitForTimeout(200);

    // Get story context to check for skip tags
    const storyContext = await getStoryContext(page, context);

    // Skip visual testing if story has skip-visual-test tag
    if (storyContext.tags?.includes("skip-visual-test")) {
      return;
    }

    // Take screenshot of just the story canvas
    const element = await page.locator("#storybook-root, #root").first();

    // Use Playwright's toHaveScreenshot for visual comparison
    await expect(element).toHaveScreenshot(`${context.id}.png`, {
      animations: "disabled",
      // Allow slight differences due to font rendering, anti-aliasing
      threshold: 0.2,
      maxDiffPixels: 100,
    });
  },

  // Tags configuration
  tags: {
    include: [], // Empty = include all
    exclude: ["skip-visual-test"], // Stories with this tag skip visual testing
  },
};

export default config;
