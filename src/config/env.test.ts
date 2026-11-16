import { describe, expect, it } from "vitest";

import { environmentDefinition, validateEnvironment } from "@/config/env";

const requiredEnvironment = {
  server: ["SERVER_REQUIRED"],
  public: ["NEXT_PUBLIC_REQUIRED"],
} as const;

describe("validateEnvironment", () => {
  it("requires the server-only CMS configuration", () => {
    expect(environmentDefinition).toEqual({
      server: ["CMS_BASE_URL", "CMS_REVALIDATION_SECRET", "SITE_URL"],
      public: [],
    });
  });

  it("needs only the site URL for a snapshot deployment", () => {
    expect(() =>
      validateEnvironment({ CMS_SOURCE: "snapshot", SITE_URL: "https://x.test" }),
    ).not.toThrow();
    expect(() => validateEnvironment({ CMS_SOURCE: "snapshot" })).toThrow(
      "Missing required environment variable: SITE_URL.",
    );
    expect(() =>
      validateEnvironment({ CMS_SOURCE: "live", SITE_URL: "https://x.test" }),
    ).toThrow(/CMS_BASE_URL, CMS_REVALIDATION_SECRET/);
    expect(() => validateEnvironment({ CMS_SOURCE: "static" })).toThrow(
      'CMS_SOURCE must be "live" or "snapshot".',
    );
  });

  it("accepts an environment that supplies every required value", () => {
    expect(() =>
      validateEnvironment(
        {
          SERVER_REQUIRED: "server-value",
          NEXT_PUBLIC_REQUIRED: "public-value",
        },
        requiredEnvironment,
      ),
    ).not.toThrow();
  });

  it("reports every missing or blank required variable by name", () => {
    expect(() =>
      validateEnvironment(
        {
          NEXT_PUBLIC_REQUIRED: "   ",
        },
        requiredEnvironment,
      ),
    ).toThrowError(
      "Missing required environment variables: SERVER_REQUIRED, NEXT_PUBLIC_REQUIRED. See .env.example.",
    );
  });
});
