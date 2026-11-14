import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home, { generateMetadata } from "@/app/page";
import { defaultHomePage } from "@/features/home/copy";
import type { HomePageData } from "@/features/home/data";
import type {
  Article,
  Event,
  MediaAsset,
  Sermon,
  SiteSettings,
  Story,
} from "@/lib/cms/domain";

const { loadHomePageDataMock, loadHomeSiteSettingsMock } = vi.hoisted(() => ({
  loadHomePageDataMock: vi.fn(),
  loadHomeSiteSettingsMock: vi.fn(),
}));

vi.mock("@/features/home/data", () => ({
  loadHomePageData: loadHomePageDataMock,
  loadHomeSiteSettings: loadHomeSiteSettingsMock,
}));

const media = {
  id: "image-1",
  name: "community.jpg",
  url: "https://media.example.test/community.jpg",
  alternativeText: "Young people gathering together",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 200,
  variants: [],
} satisfies MediaAsset;

const seo = {
  metaTitle: null,
  metaDescription: null,
  canonical: null,
  socialImage: null,
  noIndex: false,
};

const featuredEvent = {
  id: "event-1",
  title: "Friday Youth Night",
  slug: "friday-youth-night",
  summary: "Worship, teaching, and time together.",
  description: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Event description" }],
    },
  ],
  banner: media,
  startDateTime: "2026-09-04T11:00:00.000Z",
  endDateTime: null,
  locationName: "Community Hall",
  address: null,
  mapUrl: null,
  registrationUrl: null,
  registrationDeadline: null,
  contactName: null,
  contactLink: null,
  gallery: [],
  featured: true,
  seo,
  publishedAt: "2026-08-20T00:00:00.000Z",
} satisfies Event;

const upcomingEvent = {
  ...featuredEvent,
  id: "event-2",
  title: "Serve Saturday",
  slug: "serve-saturday",
  featured: false,
} satisfies Event;

const latestArticle = {
  id: "article-1",
  title: "Faith in everyday moments",
  slug: "faith-in-everyday-moments",
  excerpt: "Small choices can shape a life of faith.",
  body: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Article body" }],
    },
  ],
  featuredImage: media,
  author: {
    id: "author-1",
    displayName: "Youth Team",
    slug: "youth-team",
    avatar: null,
    bio: null,
  },
  category: {
    id: "category-1",
    name: "Devotional",
    slug: "devotional",
    description: null,
  },
  tags: [],
  bibleReferences: [],
  featured: false,
  seo,
  publishedAt: "2026-08-21T00:00:00.000Z",
} satisfies Article;

const latestSermon = {
  id: "sermon-1",
  title: "Hope that holds",
  slug: "hope-that-holds",
  speaker: "Ministry Team",
  date: "2026-08-16",
  summary: "Discover a hope that remains steady.",
  videoUrl: "https://video.example.test/watch/hope",
  series: null,
  biblePassage: null,
  audioUrl: null,
  thumbnail: null,
  notesUrl: null,
  seo,
  publishedAt: "2026-08-17T00:00:00.000Z",
} satisfies Sermon;

const story = {
  id: "story-1",
  title: "Finding a place to belong",
  slug: "finding-a-place-to-belong",
  summary: "A story about friendship and growing in faith.",
  body: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Story body" }],
    },
  ],
  featuredImage: media,
  personDisplayName: "Jordan",
  videoUrl: null,
  featured: true,
  seo,
  publishedAt: "2026-08-18T00:00:00.000Z",
} satisfies Story;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith and serving together.",
  defaultSeo: {
    metaTitle: "Jerusalem Youth Ministry",
    metaDescription: "Grow in faith and community with Jerusalem Youth.",
    canonical: "https://youth.example.test/",
    socialImage: media,
    noIndex: false,
  },
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: { label: "Plan your visit", url: "/join" },
  footerContent: null,
} satisfies SiteSettings;

const fullPageData = {
  aboutPage: null,
  homePage: null,
  featuredEvent,
  latestArticle,
  latestSermon,
  siteSettings,
  stories: [story],
  upcomingEvents: [upcomingEvent],
} satisfies HomePageData;

describe("Home", () => {
  beforeEach(() => {
    loadHomePageDataMock.mockReset();
    loadHomeSiteSettingsMock.mockReset();
  });

  it("adds the CMS gallery without replacing the welcome or downstream sections", async () => {
    loadHomePageDataMock.mockResolvedValue({
      ...fullPageData,
      siteSettings: {
        ...siteSettings,
        heroSlides: [
          { image: media, label: "Community", caption: "Gather together" },
        ],
      },
    });

    render(await Home());

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const gallery = screen.getByRole("region", {
      name: "Khoảnh khắc tại Jerusalem Youth",
    });
    expect(within(gallery).getByRole("img")).toHaveAttribute(
      "fetchpriority",
      "high",
    );
    expect(within(gallery).queryByRole("button")).not.toBeInTheDocument();
    for (const action of screen.getAllByRole("link", {
      name: "Nhắn tin qua Facebook",
    })) {
      expect(action).toHaveAttribute(
        "href",
        "https://www.facebook.com/jerusalemyouth20",
      );
    }
    expect(
      screen.getByRole("heading", { name: "Buổi gặp gỡ sắp tới" }),
    ).toBeInTheDocument();
  });

  it("renders the CMS-driven homepage hierarchy and primary actions", async () => {
    loadHomePageDataMock.mockResolvedValue(fullPageData);

    render(await Home());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cùng lớn lên trong đức tin.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("lang", "vi");
    expect(
      screen.getAllByRole("link", { name: "Nhắn tin qua Facebook" })[0],
    ).toHaveAttribute("href", "https://www.facebook.com/jerusalemyouth20");
    expect(
      screen.getByRole("heading", { level: 2, name: "Buổi gặp gỡ sắp tới" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Friday Youth Night" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Sắp diễn ra")).toHaveLength(2);

    const upcomingSection = screen.getByRole("region", {
      name: "Buổi gặp gỡ sắp tới",
    });
    expect(
      within(upcomingSection).getByRole("heading", {
        level: 3,
        name: "Serve Saturday",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Faith in everyday moments",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Hope that holds" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Finding a place to belong",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Tìm hiểu cách tham gia/ }),
    ).toHaveAttribute("href", "/join");
  });

  it("renders landing copy and the invitation link published in the CMS", async () => {
    loadHomePageDataMock.mockResolvedValue({
      ...fullPageData,
      featuredEvent: null,
      upcomingEvents: [],
      homePage: {
        ...defaultHomePage,
        heroHeadline: "Lớn lên cùng nhau.",
        callToAction: { label: "Kết nối với chúng mình", url: "/join" },
        community: {
          eyebrow: null,
          title: "Nhịp sống của nhóm",
          description: "Ba điều chúng mình cùng làm mỗi tuần.",
        },
        communityThemes: [{ title: "Phục vụ", description: "Cùng phục vụ." }],
        gatheringEmptyMessage: "Lịch mới sẽ sớm được cập nhật.",
      },
    } satisfies HomePageData);

    render(await Home());

    expect(
      screen.getByRole("heading", { level: 1, name: "Lớn lên cùng nhau." }),
    ).toBeInTheDocument();
    for (const action of screen.getAllByRole("link", {
      name: "Kết nối với chúng mình",
    })) {
      expect(action).toHaveAttribute("href", "/join");
    }
    const community = screen.getByRole("region", { name: "Nhịp sống của nhóm" });
    expect(within(community).getAllByRole("listitem")).toHaveLength(1);
    expect(
      within(community).getByRole("heading", { level: 3, name: "Phục vụ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lịch mới sẽ sớm được cập nhật."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Nhắn tin qua Facebook" }),
    ).not.toBeInTheDocument();
  });

  it("renders useful empty states when homepage content is unavailable", async () => {
    loadHomePageDataMock.mockResolvedValue({
      aboutPage: null,
      homePage: null,
      featuredEvent: null,
      latestArticle: null,
      latestSermon: null,
      siteSettings: null,
      stories: [],
      upcomingEvents: [],
    } satisfies HomePageData);

    render(await Home());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cùng lớn lên trong đức tin.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thời gian cho buổi gặp gỡ tiếp theo/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", {
        name: "Mỗi hành trình đều có một câu chuyện.",
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Khám phá tài liệu" }),
    ).toHaveAttribute("href", "/resources");
  });

  it("builds canonical and social metadata from validated site settings", async () => {
    loadHomeSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      alternates: { canonical: "https://youth.example.test/" },
      description: "Grow in faith and community with Jerusalem Youth.",
      openGraph: {
        title: "Jerusalem Youth Ministry",
        type: "website",
        url: "https://youth.example.test/",
        images: [
          {
            url: "https://media.example.test/community.jpg",
            width: 1_600,
            height: 900,
          },
        ],
      },
      title: { absolute: "Jerusalem Youth Ministry" },
      twitter: { card: "summary_large_image" },
    });
  });
});
