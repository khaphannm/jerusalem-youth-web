import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/site-url";
import { buildRobots } from "@/features/seo/robots";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(getSiteUrl());
}
