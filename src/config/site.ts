export type SiteConfig = Readonly<{
  name: string;
  description: string;
}>;

export const siteConfig = {
  name: "Youth Ministry",
  description: "Youth ministry website.",
} satisfies SiteConfig;
