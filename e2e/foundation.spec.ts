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
      name: "Events worth showing up for",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Upcoming events" }),
  ).toBeVisible();

  const unavailableState = page.getByRole("heading", {
    level: 3,
    name: "Events are temporarily unavailable",
  });

  if (await unavailableState.count()) {
    await expect(unavailableState).toBeVisible();
    await expect(page.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/events",
    );
  } else {
    await expect(
      page.getByRole("heading", { level: 2, name: "Past events" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", { level: 2, name: "Upcoming events" })
        .locator("xpath=ancestor::section")
        .getByRole("article")
        .or(page.getByRole("heading", { name: "The next event is on the way" }))
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

test("an invalid article slug returns a useful mobile not-found page", async ({
  page,
}) => {
  await page.setViewportSize({ height: 844, width: 390 });
  const response = await page.goto("/articles/not_a_public_slug");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Article not found" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Browse all articles" });
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
    page.getByRole("heading", { level: 1, name: "Event not found" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Browse all events" });
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
    page.getByRole("heading", { level: 1, name: "Sermon not found" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Browse all sermons" });
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
    page.getByRole("heading", { level: 1, name: "Story not found" }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Browse all stories" });
  await expect(returnAction).toHaveAttribute("href", "/stories");
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
      name: "Article category not found",
    }),
  ).toBeVisible();
  const returnAction = page.getByRole("link", { name: "Browse all articles" });
  await expect(returnAction).toHaveAttribute("href", "/articles");
  expect((await returnAction.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
