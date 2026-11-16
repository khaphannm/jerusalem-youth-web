import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ContactPage, { generateMetadata } from "@/app/contact/page";
import type { MediaAsset, SiteSettings, SocialLinks } from "@/lib/cms/domain";

const { loadContactPageDataMock, loadContactSiteSettingsMock } = vi.hoisted(
  () => ({
    loadContactPageDataMock: vi.fn(),
    loadContactSiteSettingsMock: vi.fn(),
  }),
);

vi.mock("@/features/contact/data", () => ({
  loadContactPageData: loadContactPageDataMock,
  loadContactSiteSettings: loadContactSiteSettingsMock,
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
  organizationContact: {
    email: "hello@example.test",
    phone: "+84 123 456 789",
    address: "123 Community Street\nHo Chi Minh City",
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

describe("ContactPage", () => {
  beforeEach(() => {
    loadContactPageDataMock.mockReset();
    loadContactSiteSettingsMock.mockReset();
  });

  it("renders approved organization contact details and official channels with accessible links", async () => {
    loadContactPageDataMock.mockResolvedValue({ siteSettings, socialLinks });

    render(await ContactPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Liên hệ Jerusalem Youth",
      }),
    ).toBeInTheDocument();

    const channels = screen.getByRole("region", {
      name: "Các kênh liên hệ chính thức",
    });
    expect(
      within(channels).getByRole("link", {
        name: "Gửi email cho Jerusalem Youth qua hello@example.test",
      }),
    ).toHaveAttribute("href", "mailto:hello@example.test");
    expect(
      within(channels).getByRole("link", {
        name: "Gọi Jerusalem Youth theo số +84 123 456 789",
      }),
    ).toHaveAttribute("href", "tel:+84 123 456 789");
    expect(
      within(channels).getByText(
        /123 Community Street\s+Ho Chi Minh City/,
      ),
    ).toBeInTheDocument();

    const communityChannels = screen.getByRole("navigation", {
      name: "Kết nối qua kênh chính thức",
    });
    expect(
      within(communityChannels).getByRole("link", {
        name: "Mở Instagram",
      }),
    ).toHaveAttribute("href", socialLinks.links[0].url);
    expect(
      within(communityChannels).getByRole("link", { name: "Mở YouTube" }),
    ).toHaveAttribute("href", socialLinks.links[1].url);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders only the approved fields that are available", async () => {
    loadContactPageDataMock.mockResolvedValue({
      siteSettings: {
        ...siteSettings,
        organizationContact: {
          email: "hello@example.test",
          phone: null,
          address: null,
        },
      },
      socialLinks: null,
    });

    render(await ContactPage());

    expect(
      screen.getByRole("link", {
        name: "Gửi email cho Jerusalem Youth qua hello@example.test",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Điện thoại" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Địa chỉ" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Các kênh cộng đồng đang được cập nhật\./),
    ).toBeInTheDocument();
  });

  it("remains useful when optional CMS data is unavailable", async () => {
    loadContactPageDataMock.mockResolvedValue({
      siteSettings: null,
      socialLinks: null,
    });

    render(await ContactPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Liên hệ Youth Ministry",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Thông tin liên hệ đang được cập nhật",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Xem cách tham gia" }),
    ).toHaveAttribute("href", "/join");
  });

  it("builds social metadata from approved Site Settings", async () => {
    loadContactSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      openGraph: {
        images: [{ url: socialImage.url }],
        siteName: "Jerusalem Youth",
        title: "Liên hệ Jerusalem Youth",
        type: "website",
      },
      title: "Liên hệ",
      twitter: {
        card: "summary_large_image",
        images: [socialImage.url],
        title: "Liên hệ Jerusalem Youth",
      },
    });
  });
});
