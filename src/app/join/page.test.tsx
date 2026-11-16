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
        name: "Tìm bước tiếp theo cùng Jerusalem Youth",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Join the community" }),
    ).toHaveAttribute("href", siteSettings.primaryCallToAction.url);
    expect(
      screen.getByRole("link", { name: "Xem sự kiện sắp tới" }),
    ).toHaveAttribute("href", "/events");

    const steps = screen.getByRole("region", { name: "Bắt đầu từ nơi bạn đang đứng" });
    expect(
      within(steps).getByRole("heading", { name: "Tìm một buổi gặp gỡ" }),
    ).toBeInTheDocument();
    expect(
      within(steps).getByRole("link", { name: "Xem sự kiện" }),
    ).toHaveAttribute("href", "/events");
    expect(
      within(steps).getByRole("link", { name: "Đọc câu chuyện cộng đồng" }),
    ).toHaveAttribute("href", "/stories");
    expect(
      within(steps).getByRole("link", { name: "Khám phá tài liệu" }),
    ).toHaveAttribute("href", "/resources");

    const channels = screen.getByRole("navigation", {
      name: "Kết nối không cần điền biểu mẫu",
    });
    expect(
      within(channels).getByRole("link", { name: "Kết nối qua Instagram" }),
    ).toHaveAttribute("href", socialLinks.links[0].url);
    expect(
      within(channels).getByRole("link", { name: "Kết nối qua YouTube" }),
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
      screen.getByRole("link", { name: "Tìm một buổi gặp gỡ" }),
    ).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: "Tìm hiểu về chúng mình" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(
      screen.getByText(/Các kênh cộng đồng chính thức đang được cập nhật\./),
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
        name: "Tìm bước tiếp theo cùng Youth Ministry",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tìm một buổi gặp gỡ" }),
    ).toHaveAttribute("href", "/events");
  });

  it("builds social metadata from approved Site Settings", async () => {
    loadJoinSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      openGraph: {
        images: [{ url: socialImage.url }],
        siteName: "Jerusalem Youth",
        title: "Tham gia Jerusalem Youth",
        type: "website",
      },
      title: "Tham gia",
      twitter: {
        card: "summary_large_image",
        images: [socialImage.url],
        title: "Tham gia Jerusalem Youth",
      },
    });
  });
});
