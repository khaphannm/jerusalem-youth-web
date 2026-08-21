import type { NextConfig } from "next";

import { validateEnvironment } from "./src/config/env";

validateEnvironment(process.env);

const nextConfig: NextConfig = {};

export default nextConfig;
