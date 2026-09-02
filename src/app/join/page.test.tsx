import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import JoinPage, { generateMetadata } from "@/app/join/page";
import type { MediaAsset, SiteSettings, SocialLinks } from "@/lib/cms/domain";

const { loadJoinPageDataMock, loadJoinSiteSettingsMock } = vi.hoisted(() => ({
  loadJoinPageDataMock: vi.fn(),
  loadJoinSiteSettingsMock: vi.fn(),
}));

vi.mock("@/features/join/data", () => ({
  loadJoinPageData: loadJoinPageDataMock,
  loadJoinSiteSettings: loadJoinSiteSettingsMock,
}));

const socialImage = {
  id: "social-image",
  name: "community.jpg",
  url: "https://media.example.test/community.jpg",
  alternativeText: "Young people gathering in community",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: null,
  defaultSocialImage: socialImage,
  organizationContact: null,
  primaryCallToAction: {
    label: "Join the community",
    url: "https://signup.example.test/community",
  },
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

describe("JoinPage", () => {
  beforeEach(() => {
    loadJoinPageDataMock.mockReset();
    loadJoinSiteSettingsMock.mockReset();
  });

  it("renders clear next steps and approved community destinations without collecting data", async () => {
    loadJoinPageDataMock.mockResolvedValue({ siteSettings, socialLinks });

    render(await JoinPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Find your next step with Jerusalem Youth",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Join the community" }),
    ).toHaveAttribute("href", siteSettings.primaryCallToAction.url);
    expect(
      screen.getByRole("link", { name: "See upcoming events" }),
    ).toHaveAttribute("href", "/events");

    const steps = screen.getByRole("region", { name: "Start where you are" });
    expect(
      within(steps).getByRole("heading", { name: "Find a gathering" }),
    ).toBeInTheDocument();
    expect(
      within(steps).getByRole("link", { name: "Browse events" }),
    ).toHaveAttribute("href", "/events");
    expect(
      within(steps).getByRole("link", { name: "Read community stories" }),
    ).toHaveAttribute("href", "/stories");
    expect(
      within(steps).getByRole("link", { name: "Explore resources" }),
    ).toHaveAttribute("href", "/resources");

    const channels = screen.getByRole("navigation", {
      name: "Connect without another form",
    });
    expect(
      within(channels).getByRole("link", { name: "Connect on Instagram" }),
    ).toHaveAttribute("href", socialLinks.links[0].url);
    expect(
      within(channels).getByRole("link", { name: "Connect on YouTube" }),
    ).toHaveAttribute("href", socialLinks.links[1].url);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("uses safe internal fallbacks when configured links are unavailable or self-referential", async () => {
    loadJoinPageDataMock.mockResolvedValue({
      siteSettings: {
        ...siteSettings,
        primaryCallToAction: { label: "Join us", url: "/join" },
      },
      socialLinks: null,
    });

    render(await JoinPage());

    expect(
      screen.getByRole("link", { name: "Find a gathering" }),
    ).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: "Learn about us" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(
      screen.getByText(/Our official community links are being updated\./),
    ).toBeInTheDocument();
  });

  it("remains useful when all optional CMS data is unavailable", async () => {
    loadJoinPageDataMock.mockResolvedValue({
      siteSettings: null,
      socialLinks: null,
    });

    render(await JoinPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Find your next step with Youth Ministry",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Find a gathering" }),
    ).toHaveAttribute("href", "/events");
  });

  it("builds social metadata from approved Site Settings", async () => {
    loadJoinSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      openGraph: {
        images: [{ url: socialImage.url }],
        siteName: "Jerusalem Youth",
        title: "Join Jerusalem Youth",
        type: "website",
      },
      title: "Join Us",
      twitter: {
        card: "summary_large_image",
        images: [socialImage.url],
        title: "Join Jerusalem Youth",
      },
    });
  });
});
