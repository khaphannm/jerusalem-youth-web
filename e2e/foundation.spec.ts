import { expect, test } from "@playwright/test";

test("the accessible homepage and application shell load", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Upcoming events" }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the homepage is usable without horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");

  const primaryAction = page
    .locator("main > section")
    .first()
    .getByRole("link");

  await expect(primaryAction).toBeVisible();
  await expect(primaryAction).toHaveCSS("background-color", "rgb(54, 87, 245)");
  expect((await primaryAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the About page presents ministry identity and a clear next step", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/about");

  await expect(
    page.getByRole("heading", { level: 1, name: /^About / }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Why we gather" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "What shapes our community",
    }),
  ).toBeVisible();

  const nextAction = page
    .locator("main > section")
    .last()
    .getByRole("link");
  await expect(nextAction).toBeVisible();
  await expect(nextAction).toHaveAttribute("href", /^(?:\/|https?:\/\/)/);
  expect((await nextAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
