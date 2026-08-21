import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "out/**",
    "coverage/**",
    "cms/.strapi/**",
    "cms/.tmp/**",
    "cms/build/**",
    "cms/dist/**",
    "cms/types/generated/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
