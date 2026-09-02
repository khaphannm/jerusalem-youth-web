import type { NextConfig } from "next";

import { validateEnvironment } from "./src/config/env";
import { resolveSiteUrl } from "./src/config/site-url";

validateEnvironment(process.env);
resolveSiteUrl(process.env.SITE_URL, process.env.NODE_ENV);

const nextConfig: NextConfig = {};

export default nextConfig;
