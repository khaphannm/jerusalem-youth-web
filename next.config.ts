import type { NextConfig } from "next";

import { validateEnvironment } from "./src/config/env";
import { resolveSiteUrl } from "./src/config/site-url";
import { snapshotDirectory } from "./src/lib/cms/snapshot/format.ts";
import { loadSnapshotFromDisk } from "./src/lib/cms/snapshot/load.ts";
import { resolveCmsSource } from "./src/lib/cms/source.ts";

validateEnvironment(process.env);
resolveSiteUrl(process.env.SITE_URL, process.env.NODE_ENV);

const snapshotMode = resolveCmsSource(process.env) === "snapshot";

if (snapshotMode) {
  // Fail the build here, before any page can render fallbacks over a missing
  // or invalid snapshot and look like a successful empty site.
  const snapshot = loadSnapshotFromDisk();

  console.info(
    `Content snapshot ${snapshot.id} captured ${snapshot.capturedAt}.`,
  );
}

const nextConfig: NextConfig = snapshotMode
  ? { outputFileTracingIncludes: { "/*": [`./${snapshotDirectory}/**/*`] } }
  : {};

export default nextConfig;
