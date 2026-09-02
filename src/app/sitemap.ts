import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/site-url";
import { loadSitemapData } from "@/features/seo/sitemap-data";
import { buildSitemap } from "@/features/seo/sitemap";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await loadSitemapData();

  return buildSitemap(data, getSiteUrl());
}
