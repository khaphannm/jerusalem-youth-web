export type RichTextBlock = Readonly<Record<string, unknown>>;
export type RichText = readonly RichTextBlock[];

export type MediaAsset = Readonly<{
  id: string;
  name: string;
  url: string;
  alternativeText: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeInKilobytes: number;
}>;

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

export type SiteSettings = Readonly<{
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
