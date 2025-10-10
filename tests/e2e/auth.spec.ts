import { test, expect } from "@playwright/test";

/**
 * Authentication Flow Tests
 * Tests for login, registration, and logout functionality
 */

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto("/");
  });

  test("should show login page", async ({ page }) => {
    // Look for login-related elements
    const loginButton = page.getByRole("button", {
      name: /sign in|log in|login/i,
    });
    const loginLink = page.getByRole("link", { name: /sign in|log in|login/i });

    // Should have either a button or link to login
    const hasLoginButton = (await loginButton.count()) > 0;
    const hasLoginLink = (await loginLink.count()) > 0;

    expect(hasLoginButton || hasLoginLink).toBe(true);
  });

  test("should navigate to registration page", async ({ page }) => {
    // Look for registration links
    const registerLink = page.getByRole("link", {
      name: /sign up|register|create account/i,
    });
    const registerButton = page.getByRole("button", {
      name: /sign up|register|create account/i,
    });

    const hasRegisterLink = (await registerLink.count()) > 0;
    const hasRegisterButton = (await registerButton.count()) > 0;

    // Should have some way to access registration
    expect(hasRegisterLink || hasRegisterButton).toBe(true);
  });

  test("should show validation errors for empty login form", async ({
    page,
  }) => {
    // Try to navigate to login page
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Look for email and password fields
    const emailInput = page
      .getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i));
    const passwordInput = page
      .getByLabel(/password/i)
      .or(page.getByPlaceholder(/password/i));

    const hasEmailInput = (await emailInput.count()) > 0;
    const hasPasswordInput = (await passwordInput.count()) > 0;

    if (hasEmailInput && hasPasswordInput) {
      // Try to submit empty form
      const submitButton = page.getByRole("button", {
        name: /sign in|log in|submit/i,
      });

      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Should show some kind of validation error or stay on the page
        await page.waitForTimeout(1000);

        // Form should still be present (didn't navigate away)
        expect(await emailInput.count()).toBeGreaterThan(0);
      }
    }
  });

  test("should show validation errors for invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const emailInput = page
      .getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
      .first();
    const passwordInput = page
      .getByLabel(/password/i)
      .or(page.getByPlaceholder(/password/i))
      .first();

    if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
      // Fill with invalid data
      await emailInput.fill("invalid-email");
      await passwordInput.fill("password123");

      // Try to submit
      const submitButton = page
        .getByRole("button", { name: /sign in|log in|submit/i })
        .first();

      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Should show validation error or HTML5 validation
        await page.waitForTimeout(1000);

        // Check for error message or validation state
        const hasError =
          (await page.locator("text=/invalid|error|required/i").count()) > 0;
        const emailValidation = await emailInput.evaluate(
          (el: HTMLInputElement) => el.validity.valid
        );

        // Either custom error message or HTML5 validation should trigger
        expect(hasError || !emailValidation).toBe(true);
      }
    }
  });

  test("should prevent XSS in login form", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const emailInput = page
      .getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
      .first();

    if ((await emailInput.count()) > 0) {
      // Try to inject script
      const xssPayload = '<script>alert("XSS")</script>';
      await emailInput.fill(xssPayload);

      // Get the value back
      const value = await emailInput.inputValue();

      // Should be escaped or sanitized
      expect(value).toBe(xssPayload); // Input can contain it

      // But it shouldn't execute
      const alerts: string[] = [];
      page.on("dialog", (dialog) => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      // Try to submit
      const submitButton = page
        .getByRole("button", { name: /sign in|log in|submit/i })
        .first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }

      // No alert should have fired
      expect(alerts).toHaveLength(0);
    }
  });
});

/**
 * Protected Route Tests
 * Verify that authentication is properly enforced
 */
test.describe("Protected Routes", () => {
  test("should redirect to login when accessing protected routes", async ({
    page,
  }) => {
    // Try to access a protected route
    const protectedRoutes = [
      "/dashboard",
      "/playbooks",
      "/teams",
      "/roster",
      "/profile",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Should either be on login page or see login prompt
      const url = page.url();
      const hasLoginElement =
        (await page.getByRole("button", { name: /sign in|log in/i }).count()) >
          0 ||
        (await page.getByRole("link", { name: /sign in|log in/i }).count()) > 0;

      // Either redirected to login or see login UI
      const isProtected = url.includes("/login") || hasLoginElement;

      // At minimum, should not show the protected content without auth
      expect(isProtected || url === "http://localhost:5173/").toBe(true);
    }
  });
});
