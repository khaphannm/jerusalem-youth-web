import { describe, expect, it } from "vitest";

import { canonicalPath } from "@/features/seo/canonical";

describe("canonicalPath", () => {
  it("uses a clean route for the first listing page", () => {
    expect(canonicalPath("/articles", 1)).toBe("/articles");
  });

  it("preserves independently indexable pagination", () => {
    expect(canonicalPath("/articles", 3)).toBe("/articles?page=3");
  });
});
