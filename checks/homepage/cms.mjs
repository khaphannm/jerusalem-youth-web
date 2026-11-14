// Isolated read-only CMS fixture. Never connects to the ministry's database.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const publishedAt = "2026-11-01T00:00:00.000Z";
const document = { documentId: "fixture", publishedAt };
const body = [
  {
    type: "paragraph",
    children: [{ type: "text", text: "Nội dung kiểm thử." }],
  },
];
const image = (file, alt) => ({
  documentId: file,
  name: file,
  url: `/media/${file}.webp`,
  alternativeText: alt,
  mime: "image/webp",
  width: 1536,
  height: 1024,
  size: 200,
});
const slides = [
  ["review-worship-gathering", "Thờ phượng"],
  ["review-community-gathering", "Đồng hành"],
  ["review-care-packages", "Sẻ chia"],
].map(([file, label]) => ({
  label,
  image: image(file, `Minh họa kiểm thử: ${label}`),
  caption: "Minh họa mẫu — chỉ dùng để kiểm thử.",
}));
const event = {
  ...document,
  title: "Buổi gặp gỡ kiểm thử",
  slug: "gap-go",
  summary: "Cùng kết nối và học Lời Chúa.",
  description: body,
  banner: slides[0].image,
  startDateTime: "2099-11-15T18:00:00+07:00",
  locationName: "Địa điểm kiểm thử",
  gallery: [],
  featured: true,
};
const category = { documentId: "category", name: "Suy ngẫm", slug: "suy-ngam" };
const navigation = ["About", "Events", "Stories", "Join Us"].map(
  (label, i) => ({
    label,
    url: ["/about", "/events", "/stories", "/join"][i],
    openInNewTab: false,
  }),
);
const singles = {
  "/api/site-setting": {
    ...document,
    siteName: "Jerusalem Youth",
    siteDescription: "Cùng lớn lên trong đức tin.",
    heroSlides: slides,
    primaryCta: { label: "Old action", url: "/join" },
  },
  "/api/about-page": {
    ...document,
    mission: "Cùng học Lời Chúa và khích lệ nhau trong cuộc sống.",
    vision: "Cùng lớn lên trong đức tin.",
    values: [{ title: "Đồng hành", description: "Cùng nhau trưởng thành." }],
    primaryCta: { label: "Tham gia", url: "/join" },
  },
  "/api/navigation": {
    ...document,
    primaryItems: navigation,
    footerItems: navigation,
    utilityItems: [],
  },
  "/api/social-links": {
    ...document,
    links: [
      {
        platform: "Facebook",
        url: "https://www.facebook.com/jerusalemyouth20",
        displayOrder: 0,
      },
    ],
  },
};
const collections = {
  "/api/events": [event],
  "/api/stories": [
    {
      ...document,
      title: "Một hành trình đồng hành",
      slug: "dong-hanh",
      summary: "Câu chuyện mẫu dành cho kiểm thử giao diện.",
      body,
      featuredImage: slides[1].image,
      featured: true,
    },
  ],
  "/api/articles": [
    {
      ...document,
      title: "Đức tin trong đời sống",
      slug: "duc-tin",
      excerpt: "Dành thời gian suy ngẫm mỗi ngày.",
      body,
      featuredImage: slides[2].image,
      author: {
        documentId: "author",
        displayName: "Nhóm kiểm thử",
        slug: "nhom",
      },
      category,
      tags: [],
      bibleReferences: [],
      featured: false,
    },
  ],
  "/api/sermons": [
    {
      ...document,
      title: "Cùng lớn lên",
      slug: "lon-len",
      speaker: "Nhóm kiểm thử",
      date: "2026-11-01",
      summary: "Nội dung mẫu dành cho kiểm thử.",
      videoURL: "https://example.org/video",
    },
  ],
};
createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost:1439");
  if (url.pathname.startsWith("/media/")) {
    const file = url.pathname.slice(7);
    if (!/^review-[a-z-]+\.webp$/.test(file)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const bytes = await readFile(
        new URL(`../../cms/seed/assets/${file}`, import.meta.url),
      );
      response.writeHead(200, { "Content-Type": "image/webp" }).end(bytes);
    } catch {
      response.writeHead(404).end();
    }
    return;
  }
  response.setHeader("Content-Type", "application/json");
  if (singles[url.pathname]) {
    response.end(JSON.stringify({ data: singles[url.pathname] }));
    return;
  }
  const data = collections[url.pathname] ?? [];
  response.end(
    JSON.stringify({
      data,
      meta: {
        pagination: {
          page: 1,
          pageSize: 25,
          pageCount: data.length ? 1 : 0,
          total: data.length,
        },
      },
    }),
  );
}).listen(1439, "127.0.0.1");
