import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/config/site-url";

describe("resolveSiteUrl", () => {
  it("accepts and normalizes development and production origins", () => {
    expect(resolveSiteUrl("http://localhost:3000", "development").href).toBe(
      "http://localhost:3000/",
    );
    expect(resolveSiteUrl("https://youth.example.org/", "production").href).toBe(
      "https://youth.example.org/",
    );
  });

  it.each([
    [undefined, "a web origin is required"],
    ["   ", "a web origin is required"],
    ["youth.example.org", "absolute HTTP(S) URL"],
    ["ftp://youth.example.org", "HTTP(S) URL"],
    ["https://editor:secret@youth.example.org", "credentials are not allowed"],
    ["https://youth.example.org/ministry", "without a path"],
    ["https://youth.example.org/?preview=true", "without a path"],
    ["https://youth.example.org/#welcome", "without a path"],
  ])("rejects unsafe or malformed values", (value, message) => {
    expect(() => resolveSiteUrl(value, "development")).toThrowError(message);
  });

  it.each([
    "http://youth.example.org",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "https://[::1]:3000",
  ])("rejects a non-public production origin: %s", (value) => {
    expect(() => resolveSiteUrl(value, "production")).toThrowError(
      /production must use (HTTPS|a public hostname)/,
    );
  });
});
