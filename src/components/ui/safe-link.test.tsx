import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  resolveSafeDestination,
  SafeLink,
} from "@/components/ui/safe-link";

describe("SafeLink", () => {
  it("classifies supported internal and external destinations", () => {
    expect(resolveSafeDestination(" /events ")).toEqual({
      href: "/events",
      internal: true,
    });
    expect(resolveSafeDestination("https://example.test/community")).toEqual({
      href: "https://example.test/community",
      internal: false,
    });
    expect(resolveSafeDestination("mailto:hello@example.test")).toEqual({
      href: "mailto:hello@example.test",
      internal: false,
    });
    expect(resolveSafeDestination("tel:+84123456789")).toEqual({
      href: "tel:+84123456789",
      internal: false,
    });
    expect(resolveSafeDestination("#main-content")).toEqual({
      href: "#main-content",
      internal: false,
    });
  });

  it("rejects empty, malformed, credentialed, and unsupported destinations", () => {
    expect(resolveSafeDestination(null)).toBeNull();
    expect(resolveSafeDestination("   ")).toBeNull();
    expect(resolveSafeDestination("//example.test/path")).toBeNull();
    expect(resolveSafeDestination("not a URL")).toBeNull();
    expect(resolveSafeDestination("javascript:alert(1)")).toBeNull();
    expect(resolveSafeDestination("data:text/html,unsafe")).toBeNull();
    expect(
      resolveSafeDestination("https://user:secret@example.test/private"),
    ).toBeNull();
  });

  it("keeps external links in the current tab by default", () => {
    render(
      <SafeLink href="https://example.test/community">
        Community channel
      </SafeLink>,
    );

    const link = screen.getByRole("link", { name: "Community channel" });
    expect(link).toHaveAttribute("href", "https://example.test/community");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("adds safe relationship attributes whenever a new tab is requested", () => {
    render(
      <SafeLink
        href="https://example.test/community"
        openInNewTab
        rel="external opener noopener"
      >
        Community channel
      </SafeLink>,
    );

    expect(
      screen.getByRole("link", { name: "Community channel" }),
    ).toMatchObject({
      rel: "external noopener noreferrer",
      target: "_blank",
    });
  });

  it("omits an invalid destination without leaving an interactive control", () => {
    render(<SafeLink href="javascript:alert(1)">Unsafe action</SafeLink>);

    expect(
      screen.queryByRole("link", { name: "Unsafe action" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Unsafe action")).not.toBeInTheDocument();
  });
});
