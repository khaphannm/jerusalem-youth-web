import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import type { NavigationItem } from "@/lib/cms/domain";

const { navigationMock } = vi.hoisted(() => ({
  navigationMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({ navigation: navigationMock }),
}));

const navigationItems = [
  { label: "About", url: "/about", openInNewTab: false },
  {
    label: "Partner",
    url: "https://partner.example.test",
    openInNewTab: true,
  },
] satisfies readonly NavigationItem[];

describe("Header", () => {
  beforeEach(() => {
    navigationMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders CMS-driven desktop and mobile navigation", async () => {
    navigationMock.mockResolvedValue({
      primaryItems: navigationItems,
      utilityItems: [],
      footerItems: [],
    });

    render(await Header());

    expect(screen.getByRole("link", { name: "Youth Ministry" })).toHaveAttribute(
      "href",
      "/",
    );

    const desktopNavigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(
      within(desktopNavigation).getByRole("link", { name: "About" }),
    ).toHaveAttribute("href", "/about");
    expect(
      within(desktopNavigation).getByRole("link", { name: "Partner" }),
    ).toMatchObject({
      rel: "noopener noreferrer",
      target: "_blank",
    });
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps a usable brand link when CMS navigation is unavailable", async () => {
    navigationMock.mockRejectedValue(new Error("CMS offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(await Header());

    expect(screen.getByRole("link", { name: "Youth Ministry" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).not.toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith(
      "Header navigation could not be loaded: CMS offline",
    );
  });
});

describe("MobileNavigation", () => {
  it("exposes menu state and supports Escape and link activation", () => {
    render(<MobileNavigation items={navigationItems} />);

    const menuButton = screen.getByRole("button", { name: "Menu" });
    const panelId = menuButton.getAttribute("aria-controls");

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId ?? "")).toHaveAttribute("hidden");

    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(document.getElementById(panelId ?? "")).not.toHaveAttribute("hidden");

    const aboutLink = screen.getByRole("link", { name: "About" });
    aboutLink.focus();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(menuButton).toHaveFocus();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(panelId ?? "")).toHaveAttribute("hidden");

    fireEvent.click(menuButton);
    const reopenedAboutLink = screen.getByRole("link", { name: "About" });
    reopenedAboutLink.addEventListener("click", (event) =>
      event.preventDefault(),
    );
    fireEvent.click(reopenedAboutLink);

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
