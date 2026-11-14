import { expect, test } from "@playwright/test";

test("Vietnamese landing page works across mobile and desktop with CMS content", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Cùng lớn lên trong đức tin.",
  );
  await expect(page.locator("main > section")).toHaveCount(8);
  for (const link of await page
    .getByRole("link", { name: "Nhắn tin qua Facebook" })
    .all()) {
    await expect(link).toHaveAttribute(
      "href",
      "https://www.facebook.com/jerusalemyouth20",
    );
  }
  await page.getByRole("button", { name: "Ảnh tiếp theo" }).click();
  await expect(
    page.getByRole("button", { name: "Xem ảnh 2: Đồng hành" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Ảnh trước" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Xem ảnh 1: Thờ phượng" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Ảnh trước" })).toBeFocused();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const img of await page.locator("main img:visible").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          img.evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    await page.getByRole("heading", { level: 1 }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`landing-${width}.png`),
      fullPage: true,
      animations: "disabled",
      style: "nextjs-portal { display: none !important; }",
    });
  }
  await page
    .getByRole("link", { name: "Lần đầu tham gia", exact: true })
    .click();
  await expect(page).toHaveURL(/#lan-dau$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("welcome, first image and Facebook invitation work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3100/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const gallery = page.getByRole("region", {
    name: "Khoảnh khắc tại Jerusalem Youth",
  });
  await expect(gallery.getByRole("img")).toBeVisible();
  await expect(gallery.getByRole("button")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Nhắn tin qua Facebook" }).first(),
  ).toBeVisible();
  await context.close();
});
