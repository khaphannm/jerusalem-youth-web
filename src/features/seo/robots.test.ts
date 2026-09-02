import { describe, expect, it } from "vitest";

import { buildRobots } from "@/features/seo/robots";

const siteUrl = new URL("https://youth.example.org");

describe("buildRobots", () => {
  it("allows the public site and advertises its sitemap in production", () => {
    expect(buildRobots(siteUrl, "production")).toEqual({
      host: "https://youth.example.org",
      rules: {
        allow: "/",
        disallow: "/api/",
        userAgent: "*",
      },
      sitemap: "https://youth.example.org/sitemap.xml",
    });
  });

  it.each(["development", "test", "preview"])(
    "blocks all crawling in %s",
    (environment) => {
      expect(buildRobots(siteUrl, environment)).toEqual({
        rules: { disallow: "/", userAgent: "*" },
      });
    },
  );
});
