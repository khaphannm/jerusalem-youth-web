import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/layout/footer";
import type {
  Navigation,
  SiteSettings,
  SocialLinks,
} from "@/lib/cms/domain";

const { navigationMock, siteSettingsMock, socialLinksMock } = vi.hoisted(() => ({
  navigationMock: vi.fn(),
  siteSettingsMock: vi.fn(),
  socialLinksMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    navigation: navigationMock,
    siteSettings: siteSettingsMock,
    socialLinks: socialLinksMock,
  }),
}));

const navigation = {
  primaryItems: [],
  utilityItems: [],
  footerItems: [
    { label: "Contact", url: "/contact", openInNewTab: false },
    {
      label: "Privacy",
      url: "https://legal.example.test/privacy",
      openInNewTab: true,
    },
  ],
} satisfies Navigation;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith and serving together.",
  defaultSeo: null,
  defaultSocialImage: null,
  organizationContact: {
    email: "hello@example.test",
    phone: "+84 123 456 789",
    address: "123 Community Street",
  },
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

const socialLinks = {
  links: [
    {
      platform: "Instagram",
      url: "https://instagram.example.test/youth",
      displayOrder: 1,
    },
    {
      platform: "YouTube",
      url: "https://youtube.example.test/youth",
      displayOrder: 2,
    },
  ],
} satisfies SocialLinks;

describe("Footer", () => {
  beforeEach(() => {
    navigationMock.mockReset();
    siteSettingsMock.mockReset();
    socialLinksMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders CMS-driven navigation, contact, social, and copyright content", async () => {
    navigationMock.mockResolvedValue(navigation);
    siteSettingsMock.mockResolvedValue(siteSettings);
    socialLinksMock.mockResolvedValue(socialLinks);

    render(await Footer());

    const footer = screen.getByRole("contentinfo");
    expect(
      within(footer).getByRole("link", { name: "Jerusalem Youth" }),
    ).toHaveAttribute("href", "/");
    expect(
      within(footer).getByText(
        "A community growing in faith and serving together.",
      ),
    ).toBeInTheDocument();

    const footerNavigation = within(footer).getByRole("navigation", {
      name: "Explore",
    });
    expect(
      within(footerNavigation).getByRole("link", { name: "Contact" }),
    ).toHaveAttribute("href", "/contact");
    expect(
      within(footerNavigation).getByRole("link", { name: "Privacy" }),
    ).toMatchObject({
      rel: "noopener noreferrer",
      target: "_blank",
    });

    expect(
      within(footer).getByRole("link", { name: "hello@example.test" }),
    ).toHaveAttribute("href", "mailto:hello@example.test");
    expect(
      within(footer).getByRole("link", { name: "+84 123 456 789" }),
    ).toHaveAttribute("href", "tel:+84 123 456 789");
    expect(within(footer).getByText("123 Community Street")).toBeInTheDocument();

    const socialNavigation = within(footer).getByRole("navigation", {
      name: "Follow",
    });
    expect(
      within(socialNavigation).getByRole("link", { name: "Instagram" }),
    ).toHaveAttribute("href", "https://instagram.example.test/youth");
    expect(
      within(socialNavigation).getByRole("link", { name: "YouTube" }),
    ).toHaveAttribute("href", "https://youtube.example.test/youth");
    expect(
      within(footer).getByText(
        `© ${new Date().getUTCFullYear()} Jerusalem Youth.`,
      ),
    ).toBeInTheDocument();
  });

  it("preserves available sections when one CMS source fails", async () => {
    navigationMock.mockRejectedValue(new Error("Navigation offline"));
    siteSettingsMock.mockResolvedValue(null);
    socialLinksMock.mockResolvedValue(socialLinks);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(await Footer());

    expect(
      screen.getByRole("link", { name: "Youth Ministry" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.queryByRole("navigation", { name: "Explore" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Follow" }),
    ).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith(
      "Footer navigation could not be loaded: Navigation offline",
    );
  });
});
