import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * 
 * These tests capture screenshots of critical pages and components
 * to detect unintended visual changes.
 * 
 * To update baselines:
 *   npm run test:visual:update
 * 
 * To run visual tests:
 *   npm run test:visual
 */

test.describe('Visual Regression - Public Pages', () => {
  test('Homepage renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Register page renders correctly', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('register-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Authenticated Pages', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('Dashboard renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Teams page renders correctly', async ({ page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('teams-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Plays page renders correctly', async ({ page }) => {
    await page.goto('/plays');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('plays-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Profile page renders correctly', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('profile-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Components', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('Navigation header renders correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Screenshot just the header
    const header = page.locator('header, nav').first();
    await expect(header).toHaveScreenshot('navigation-header.png', {
      animations: 'disabled',
    });
  });

  test('Team card renders correctly', async ({ page }) => {
    await page.goto('/teams');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Screenshot first team card
    const teamCard = page.locator('[data-testid="team-card"]').first();
    if (await teamCard.count() > 0) {
      await expect(teamCard).toHaveScreenshot('team-card.png', {
        animations: 'disabled',
      });
    }
  });

  test('Play card renders correctly', async ({ page }) => {
    await page.goto('/plays');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Screenshot first play card
    const playCard = page.locator('[data-testid="play-card"]').first();
    if (await playCard.count() > 0) {
      await expect(playCard).toHaveScreenshot('play-card.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Visual Regression - Responsive', () => {
  test('Homepage mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Dashboard mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Use auth if available, otherwise skip
    try {
      await page.context().addCookies([
        // Add your auth cookies here if needed
      ]);
    } catch (e) {
      test.skip();
    }
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Homepage tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test('Homepage in dark mode', async ({ page }) => {
    // Enable dark mode via system preference
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Dashboard in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Use auth if available
    try {
      await page.context().addCookies([]);
    } catch (e) {
      test.skip();
    }
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
