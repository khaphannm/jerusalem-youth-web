import type { MetadataRoute } from "next";

export function buildRobots(
  siteUrl: URL,
  environment: string | undefined = process.env.NODE_ENV,
): MetadataRoute.Robots {
  if (environment !== "production") {
    return {
      rules: {
        disallow: "/",
        userAgent: "*",
      },
    };
  }

  return {
    host: siteUrl.origin,
    rules: {
      allow: "/",
      disallow: "/api/",
      userAgent: "*",
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
