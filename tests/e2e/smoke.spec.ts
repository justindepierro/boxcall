import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
  "/playbook",
  "/practice-plans",
  "/game-plans",
  "/boxcall",
] as const;

test.describe("smoke", () => {
  test("login page renders and invalid login shows an error", async ({
    page,
  }) => {
    await page.goto("/login");

    // Welcome step
    await expect(page.getByText("Welcome to BoxCall")).toBeVisible();

    // Transition to login form
    await page.getByRole("button", { name: "Sign In to Your Account" }).click();

    await page.getByPlaceholder("Enter your email").fill("invalid@example.com");
    await page
      .getByPlaceholder("Enter your password")
      .fill("not-a-real-password");

    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(
      page.getByText(/invalid email or password|supabase not configured/i)
    ).toBeVisible();
  });

  for (const route of PROTECTED_ROUTES) {
    test(`unauthenticated visit to ${route} redirects to login with returnUrl`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login(\?|$)/);
      expect(page.url()).toContain("/login?returnUrl=");
      expect(page.url()).toContain(encodeURIComponent(route));

      await expect(page.getByText("Welcome to BoxCall")).toBeVisible();
    });
  }

  test("legacy /team-bulletin resolves to dashboard then redirects to login", async ({
    page,
  }) => {
    await page.goto("/team-bulletin");

    await expect(page).toHaveURL(/\/login(\?|$)/);
    expect(page.url()).toContain("/login?returnUrl=");
    expect(page.url()).toContain(encodeURIComponent("/dashboard"));

    await expect(page.getByText("Welcome to BoxCall")).toBeVisible();
  });
});
