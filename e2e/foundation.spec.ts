import { expect, test } from "@playwright/test";

test("the sitemap and robots routes expose safe crawler policy", async ({
  request,
}) => {
  const sitemapResponse = await request.get("/sitemap.xml");
  const sitemap = await sitemapResponse.text();

  expect(sitemapResponse.ok()).toBe(true);
  expect(sitemap).toContain(`${process.env.SITE_URL}/about`);
  expect(sitemap).not.toContain("/search");
  expect(sitemap).not.toContain("/api/");

  const robotsResponse = await request.get("/robots.txt");
  const robots = await robotsResponse.text();

  expect(robotsResponse.ok()).toBe(true);
  expect(robots).toContain("User-Agent: *");
  expect(robots).toContain(process.env.CI ? "Allow: /" : "Disallow: /");
});

test("the accessible homepage and application shell load", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Buổi gặp gỡ sắp tới" }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    process.env.SITE_URL ?? "",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /.+/,
  );
  const structuredDataTypes = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "{}")["@type"]),
    );

  expect(structuredDataTypes).toContain("Organization");
  expect(structuredDataTypes).not.toContain("Article");
  expect(structuredDataTypes).not.toContain("Event");

  const skipLink = page.getByRole("link", { name: "Đến nội dung chính" });
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
    .getByRole("link", { name: "Nhắn tin qua Facebook" });

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
    page.getByRole("heading", { level: 1, name: /^Giới thiệu / }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Vì sao chúng mình gặp gỡ",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Điều định hình cộng đồng chúng mình",
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

test("the article listing remains useful when CMS content is empty or unavailable", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/articles");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Articles for everyday faith",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Explore the articles" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: /^(?:New articles are coming|Articles are temporarily unavailable)$/,
    }),
  ).toBeVisible();

  const retryAction = page.getByRole("link", { name: "Try again" });
  if (await retryAction.count()) {
    await expect(retryAction).toHaveAttribute("href", "/articles");
    expect((await retryAction.boundingBox())?.height).toBeGreaterThanOrEqual(
      44,
    );
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the event listing separates upcoming and past events on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/events");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Những buổi gặp gỡ đáng để có mặt",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Sự kiện sắp tới" }),
  ).toBeVisible();

  const unavailableState = page.getByRole("heading", {
    level: 3,
    name: "Tạm thời chưa xem được sự kiện",
  });

  if (await unavailableState.count()) {
    await expect(unavailableState).toBeVisible();
    await expect(page.getByRole("link", { name: "Thử lại" })).toHaveAttribute(
      "href",
      "/events",
    );
  } else {
    await expect(
      page.getByRole("heading", { level: 2, name: "Sự kiện đã qua" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", { level: 2, name: "Sự kiện sắp tới" })
        .locator("xpath=ancestor::section")
        .getByRole("article")
        .or(page.getByRole("heading", { name: "Sự kiện tiếp theo sắp được công bố" }))
        .first(),
    ).toBeVisible();
  }

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the sermon listing remains useful when CMS content is empty or unavailable", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/sermons");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Messages for growing faith",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Explore the sermons" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: /^(?:New sermons are coming|Sermons are temporarily unavailable)$/,
    }),
  ).toBeVisible();

  const retryAction = page.getByRole("link", { name: "Try again" });
  if (await retryAction.count()) {
    await expect(retryAction).toHaveAttribute("href", "/sermons");
    expect((await retryAction.boundingBox())?.height).toBeGreaterThanOrEqual(
      44,
    );
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the stories listing remains useful when CMS content is empty or unavailable", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/stories");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Stories of faith and belonging",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Explore the stories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: /^(?:Community stories are coming|Stories are temporarily unavailable)$/,
    }),
  ).toBeVisible();

  const retryAction = page.getByRole("link", { name: "Try again" });
  if (await retryAction.count()) {
    await expect(retryAction).toHaveAttribute("href", "/stories");
    expect((await retryAction.boundingBox())?.height).toBeGreaterThanOrEqual(
      44,
    );
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the media page remains useful when published media is empty or unavailable", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/media");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Moments from our community",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Explore the media" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: /^(?:Media moments are coming|Media is temporarily unavailable)$/,
    }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the resources listing remains useful when content is empty or unavailable", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/resources");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Resources for everyday faith",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Explore the resources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: /^(?:New resources are coming|Resources are temporarily unavailable)$/,
    }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the Join page presents mobile-first next steps without collecting data", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/join");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /^Tìm bước tiếp theo cùng /,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Bắt đầu từ nơi bạn đang đứng" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Kết nối không cần điền biểu mẫu",
    }),
  ).toBeVisible();

  const primaryAction = page
    .locator("main > section")
    .first()
    .getByRole("link")
    .first();
  await expect(primaryAction).toBeVisible();
  expect((await primaryAction.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  await expect(page.getByRole("form")).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the Contact page exposes accessible official channels without collecting data", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/contact");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /^Liên hệ /,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Các kênh liên hệ chính thức",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Kết nối qua kênh chính thức",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Thông tin liên hệ đang được cập nhật",
    }),
  ).toBeVisible();
  await expect(page.getByRole("form")).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the site search handles empty, short, and submitted mobile queries", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/search");

  await expect(
    page.getByRole("heading", { level: 1, name: "Tìm kiếm trên trang" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: "Bắt đầu tìm kiếm" }),
  ).toBeVisible();

  await page.goto("/search?q=a");
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: "Cần ít nhất hai ký tự để tìm",
    }),
  ).toBeVisible();

  const searchInput = page.getByRole("searchbox", {
    name: "Bạn đang tìm gì?",
  });
  await searchInput.fill("faith");
  await page.getByRole("button", { name: "Tìm kiếm" }).click();
  await expect(page).toHaveURL(/\/search\?q=faith$/);
  await expect(
    page.getByRole("heading", {
      level: 3,
      name: /^(?:Tạm thời chưa tìm kiếm được|Không có kết quả cho “faith”)$/,
    }),
  ).toBeVisible();
  expect((await searchInput.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an invalid article slug returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto("/articles/not_a_public_slug");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Không tìm thấy bài viết" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Xem tất cả bài viết" });
  await expect(returnAction).toHaveAttribute("href", "/articles");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an invalid event slug returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto("/events/not_a_public_slug");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Không tìm thấy sự kiện" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Xem tất cả sự kiện" });
  await expect(returnAction).toHaveAttribute("href", "/events");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an invalid sermon slug returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto("/sermons/not_a_public_slug");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Không tìm thấy bài giảng" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Xem tất cả bài giảng" });
  await expect(returnAction).toHaveAttribute("href", "/sermons");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an invalid story slug returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto("/stories/not_a_public_slug");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Không tìm thấy câu chuyện" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Xem tất cả câu chuyện" });
  await expect(returnAction).toHaveAttribute("href", "/stories");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an invalid resource slug returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto("/resources/not_a_public_slug");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Không tìm thấy tài liệu" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Xem tất cả tài liệu" });
  await expect(returnAction).toHaveAttribute("href", "/resources");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an invalid article category returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto(
    "/articles/category/not_a_public_category",
  );

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Không tìm thấy chuyên mục",
    }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Xem tất cả bài viết" });
  await expect(returnAction).toHaveAttribute("href", "/articles");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
