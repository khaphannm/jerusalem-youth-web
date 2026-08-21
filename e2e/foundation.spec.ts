import { expect, test } from "@playwright/test";

test("the accessible application shell loads", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Modern Editorial UI foundation",
    }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the foundation is usable without horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");

  const primaryAction = page.getByRole("button", { name: "Primary action" });

  await expect(primaryAction).toBeVisible();
  await expect(primaryAction).toHaveCSS("background-color", "rgb(54, 87, 245)");
  expect((await primaryAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
