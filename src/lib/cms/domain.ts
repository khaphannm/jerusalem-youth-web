export type RichTextText = Readonly<{
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}>;

export type RichTextLink = Readonly<{
  type: "link";
  url: string;
  children: readonly RichTextText[];
}>;

export type RichTextInline = RichTextText | RichTextLink;

export type RichTextListItem = Readonly<{
  type: "list-item";
  children: readonly RichTextInline[];
}>;

export type RichTextList = Readonly<{
  type: "list";
  format: "ordered" | "unordered";
  children: readonly (RichTextListItem | RichTextList)[];
}>;

export type MediaVariant = Readonly<{
  height: number;
  url: string;
  width: number;
}>;

export type MediaAsset = Readonly<{
  id: string;
  name: string;
  url: string;
  alternativeText: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeInKilobytes: number;
  variants: readonly MediaVariant[];
}>;

export type RichTextBlock =
  | Readonly<{
      type: "paragraph" | "quote" | "code";
      children: readonly RichTextInline[];
    }>
  | Readonly<{
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: readonly RichTextInline[];
    }>
  | RichTextList
  | Readonly<{
      type: "image";
      image: MediaAsset;
      caption: string | null;
    }>;

export type RichText = readonly RichTextBlock[];

export type Seo = Readonly<{
  metaTitle: string | null;
  metaDescription: string | null;
  canonical: string | null;
  socialImage: MediaAsset | null;
  noIndex: boolean;
}>;

export type Author = Readonly<{
  id: string;
  displayName: string;
  slug: string;
  avatar: MediaAsset | null;
  bio: string | null;
}>;

export type Category = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
}>;

export type SermonSeries = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: MediaAsset | null;
}>;

export type Article = Readonly<{
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: RichText;
  featuredImage: MediaAsset;
  author: Author;
  category: Category;
  tags: readonly string[];
  bibleReferences: readonly string[];
  featured: boolean;
  seo: Seo | null;
  publishedAt: string;
}>;

export type Event = Readonly<{
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: RichText;
  banner: MediaAsset;
  startDateTime: string;
  endDateTime: string | null;
  locationName: string;
  address: string | null;
  mapUrl: string | null;
  registrationUrl: string | null;
  registrationDeadline: string | null;
  contactName: string | null;
  contactLink: string | null;
  gallery: readonly MediaAsset[];
  featured: boolean;
  seo: Seo | null;
  publishedAt: string;
}>;

export type Sermon = Readonly<{
  id: string;
  title: string;
  slug: string;
  speaker: string;
  date: string;
  summary: string;
  videoUrl: string;
  series: SermonSeries | null;
  biblePassage: string | null;
  audioUrl: string | null;
  thumbnail: MediaAsset | null;
  notesUrl: string | null;
  seo: Seo | null;
  publishedAt: string;
}>;

export type Story = Readonly<{
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: RichText;
  featuredImage: MediaAsset;
  personDisplayName: string | null;
  videoUrl: string | null;
  featured: boolean;
  seo: Seo | null;
  publishedAt: string;
}>;

export type ResourceSource =
  | Readonly<{ kind: "file"; asset: MediaAsset }>
  | Readonly<{ kind: "external"; url: string }>;

export type Resource = Readonly<{
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  source: ResourceSource;
  author: Author | null;
  thumbnail: MediaAsset | null;
  seo: Seo | null;
  publishedAt: string;
}>;

export type NavigationItem = Readonly<{
  label: string;
  url: string;
  openInNewTab: boolean;
}>;

export type Navigation = Readonly<{
  primaryItems: readonly NavigationItem[];
  utilityItems: readonly NavigationItem[];
  footerItems: readonly NavigationItem[];
}>;

export type SocialLink = Readonly<{
  platform: string;
  url: string;
  displayOrder: number;
}>;

export type SocialLinks = Readonly<{
  links: readonly SocialLink[];
}>;

export type Contact = Readonly<{
  email: string | null;
  phone: string | null;
  address: string | null;
}>;

export type CallToAction = Readonly<{
  label: string;
  url: string;
}>;

export type MinistryValue = Readonly<{
  description: string;
  title: string;
}>;

export type AboutPage = Readonly<{
  id: string;
  vision: string;
  mission: string;
  values: readonly MinistryValue[];
  callToAction: CallToAction;
  publishedAt: string;
}>;

export type HeroSlide = Readonly<{
  image: MediaAsset;
  label: string;
  caption: string | null;
}>;

export type SiteSettings = Readonly<{
  heroSlides?: readonly HeroSlide[];
  siteName: string;
  siteDescription: string;
  defaultSeo: Seo | null;
  defaultSocialImage: MediaAsset | null;
  organizationContact: Contact | null;
  primaryCallToAction: CallToAction | null;
  footerContent: RichText | null;
}>;

export type Pagination = Readonly<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}>;

export type CollectionResult<T> = Readonly<{
  items: readonly T[];
  pagination: Pagination;
}>;

export type CollectionOptions = Readonly<{
  page?: number;
  pageSize?: number;
}>;

export type UpcomingEventOptions = Readonly<{
  featured?: boolean;
  from: string;
  pageSize?: number;
}>;
